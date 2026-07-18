import { describe, expect, it } from "vitest";
import { runEvidenceIntegrityBenchmark } from "@/src/logic";
import packageJson from "@/package.json";
import { createHealthHandler, HealthResponseSchema } from "./route";

const now = () => new Date("2026-07-18T12:00:00.000Z");

describe("GET /api/health", () => {
  it("reports the real benchmark and credential-free readiness without a key", async () => {
    const response = await createHealthHandler({
      runBenchmark: () => runEvidenceIntegrityBenchmark(now()),
      now,
      environment: () => ({ siteUrl: "https://tutoros.example.dev" }),
    })();
    const body = HealthResponseSchema.parse(await response.json());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.version).toBe(packageJson.version);
    expect(body.checks.evidenceBenchmark).toMatchObject({
      passed: true,
      passedCount: 12,
      totalCount: 12,
    });
    expect(body.checks.credentialFreeDemo).toBe("ready");
    expect(body.checks.liveGeneration).toBe("optional_not_configured");
  });

  it("reports configuration state without revealing the server key", async () => {
    const response = await createHealthHandler({
      runBenchmark: () => runEvidenceIntegrityBenchmark(now()),
      now,
      environment: () => ({
        siteUrl: "https://tutoros.example.dev",
        openAiApiKey: "server-secret-value",
      }),
    })();
    const bodyText = await response.text();

    expect(bodyText).toContain('"liveGeneration":"configured"');
    expect(bodyText).not.toContain("server-secret-value");
  });

  it("returns 503 when the integrity benchmark is degraded", async () => {
    const benchmark = runEvidenceIntegrityBenchmark(now());
    const response = await createHealthHandler({
      runBenchmark: () => ({ ...benchmark, passed: false, passedCount: 11 }),
      now,
      environment: () => ({ siteUrl: "https://tutoros.example.dev" }),
    })();

    expect(response.status).toBe(503);
    expect((await response.json()).status).toBe("degraded");
  });
});
