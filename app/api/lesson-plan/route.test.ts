import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LessonPlanGenerationError,
  type LessonPlanGenerator,
} from "@/src/logic/generate-lesson-plan";
import { tuesdayScenario } from "@/src/logic/tuesday-scenario";
import { createLessonPlanHandler } from "./route";

const validContext = {
  subject: tuesdayScenario.student.subject,
  studentLevel: tuesdayScenario.student.level,
  lastSessionTopic: tuesdayScenario.session.lastTopic,
  sessionGoal: tuesdayScenario.session.currentFocus,
  strugglingWith: tuesdayScenario.session.currentStruggle,
};

function post(body: string, contentLength?: number) {
  return new Request("http://localhost/api/lesson-plan", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(contentLength ? { "content-length": String(contentLength) } : {}),
    },
    body,
  });
}

describe("POST /api/lesson-plan", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns an explicitly labeled mock response when the API key is absent", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await createLessonPlanHandler()(post(JSON.stringify(validContext)));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("mock");
    expect(body.model).toBe("gpt-5.6");
    expect(body.plan.totalMinutes).toBe(45);
  });

  it("returns a structured plan from the injected generator", async () => {
    const generate = vi.fn<LessonPlanGenerator>().mockResolvedValue({
      plan: tuesdayScenario.lessonPlan,
      model: "gpt-5.6-sol",
      source: "live",
    });
    const response = await createLessonPlanHandler({ generate })(
      post(JSON.stringify(validContext)),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      plan: tuesdayScenario.lessonPlan,
      model: "gpt-5.6-sol",
      source: "live",
    });
    expect(generate).toHaveBeenCalledWith(validContext);
  });

  it("rejects declared request bodies above 32 KB without reading them", async () => {
    const generate = vi.fn<LessonPlanGenerator>();
    const response = await createLessonPlanHandler({ generate })(post("{}", 32 * 1024 + 1));

    expect(response.status).toBe(413);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).error.code).toBe("request_too_large");
    expect(generate).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before generation", async () => {
    const generate = vi.fn<LessonPlanGenerator>();
    const response = await createLessonPlanHandler({ generate })(post("{"));

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_json");
    expect(generate).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid tutoring context", async () => {
    const generate = vi.fn<LessonPlanGenerator>();
    const response = await createLessonPlanHandler({ generate })(
      post(JSON.stringify({ ...validContext, subject: "" })),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("invalid_context");
    expect(body.error.fields.subject).toContain("at least 2 characters");
    expect(generate).not.toHaveBeenCalled();
  });

  it.each([
    ["generation_refused", 422],
    ["provider_failure", 502],
  ] as const)("maps %s to an actionable response", async (code, status) => {
    const generate = vi
      .fn<LessonPlanGenerator>()
      .mockRejectedValue(new LessonPlanGenerationError(code, "Internal detail"));
    const response = await createLessonPlanHandler({ generate })(
      post(JSON.stringify(validContext)),
    );
    const body = await response.json();

    expect(response.status).toBe(status);
    expect(body.error.code).toBe(code);
    expect(body.error.message).not.toContain("Internal detail");
  });
});
