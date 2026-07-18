import { describe, expect, it, vi } from "vitest";
import { honestyGateCheck } from "@/src/logic/honesty-gate";
import {
  ParentReportGenerationError,
  type ParentReportGenerator,
} from "@/src/logic/generate-parent-report";
import { calculateMasteryDecision } from "@/src/logic/mastery";
import { tuesdayScenario } from "@/src/logic/tuesday-scenario";
import { createParentReportHandler } from "./route";

const validContext = {
  studentName: tuesdayScenario.student.name,
  subject: tuesdayScenario.student.subject,
  nextFocus: tuesdayScenario.session.currentFocus,
  evidence: tuesdayScenario.evidence,
  mastery: calculateMasteryDecision(tuesdayScenario.evidence),
};

const honestyCheck = honestyGateCheck(tuesdayScenario.parentReport, validContext);

function post(body: string, contentLength?: number) {
  return new Request("http://localhost/api/parent-report", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(contentLength ? { "content-length": String(contentLength) } : {}),
    },
    body,
  });
}

describe("POST /api/parent-report", () => {
  it("returns an evidence-grounded report from the injected generator", async () => {
    if (!honestyCheck.passed) throw new Error("Synthetic report must pass the gate.");
    const generate = vi.fn<ParentReportGenerator>().mockResolvedValue({
      report: tuesdayScenario.parentReport,
      model: "gpt-5.6-sol",
      honestyCheck,
    });
    const response = await createParentReportHandler({ generate })(
      post(JSON.stringify(validContext)),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      report: tuesdayScenario.parentReport,
      model: "gpt-5.6-sol",
      honestyCheck,
    });
    expect(generate).toHaveBeenCalledWith(validContext);
  });

  it("rejects declared request bodies above 32 KB without reading them", async () => {
    const generate = vi.fn<ParentReportGenerator>();
    const response = await createParentReportHandler({ generate })(post("{}", 32 * 1024 + 1));

    expect(response.status).toBe(413);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).error.code).toBe("request_too_large");
    expect(generate).not.toHaveBeenCalled();
  });

  it("recomputes stale mastery from the submitted evidence", async () => {
    if (!honestyCheck.passed) throw new Error("Synthetic report must pass the gate.");
    const generate = vi.fn<ParentReportGenerator>().mockResolvedValue({
      report: tuesdayScenario.parentReport,
      model: "gpt-5.6-sol",
      honestyCheck,
    });
    const staleContext = {
      ...validContext,
      mastery: { ...validContext.mastery, score: 100, status: "Secure" as const },
    };

    await createParentReportHandler({ generate })(post(JSON.stringify(staleContext)));

    expect(generate).toHaveBeenCalledWith(validContext);
  });

  it("rejects malformed JSON and invalid evidence before generation", async () => {
    const generate = vi.fn<ParentReportGenerator>();
    const malformed = await createParentReportHandler({ generate })(post("{"));
    const invalid = await createParentReportHandler({ generate })(
      post(JSON.stringify({ ...validContext, studentName: "" })),
    );

    expect(malformed.status).toBe(400);
    expect((await malformed.json()).error.code).toBe("invalid_json");
    expect(invalid.status).toBe(422);
    expect((await invalid.json()).error.fields.studentName).toContain("at least 2 characters");
    expect(generate).not.toHaveBeenCalled();
  });

  it.each([
    ["missing_api_key", 503],
    ["generation_refused", 422],
    ["honesty_gate_failed", 422],
    ["provider_failure", 502],
  ] as const)("maps %s to an actionable response", async (code, status) => {
    const generate = vi
      .fn<ParentReportGenerator>()
      .mockRejectedValue(new ParentReportGenerationError(code, "Internal detail"));
    const response = await createParentReportHandler({ generate })(
      post(JSON.stringify(validContext)),
    );
    const body = await response.json();

    expect(response.status).toBe(status);
    expect(body.error.code).toBe(code);
    if (code !== "honesty_gate_failed") {
      expect(body.error.message).not.toContain("Internal detail");
    }
  });
});
