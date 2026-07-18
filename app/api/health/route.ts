import packageJson from "@/package.json";
import { noStoreJson } from "@/lib/http/api-response";
import { validateDeploymentReadiness } from "@/lib/deployment/readiness";
import {
  runEvidenceIntegrityBenchmark,
  type EvidenceBenchmarkReport,
} from "@/src/logic";
import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  service: z.literal("TutorOS"),
  version: z.string(),
  checkedAt: z.string().datetime(),
  checks: z.object({
    credentialFreeDemo: z.literal("ready"),
    evidenceBenchmark: z.object({
      passed: z.boolean(),
      passedCount: z.number().int(),
      totalCount: z.number().int(),
      version: z.string(),
    }),
    canonicalUrl: z.enum(["configured", "needs_configuration"]),
    liveGeneration: z.enum(["configured", "optional_not_configured"]),
  }),
});

type HealthDependencies = {
  runBenchmark: () => EvidenceBenchmarkReport;
  now: () => Date;
  environment: () => { siteUrl?: string; openAiApiKey?: string };
};

const defaultDependencies: HealthDependencies = {
  runBenchmark: runEvidenceIntegrityBenchmark,
  now: () => new Date(),
  environment: () => ({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    openAiApiKey: process.env.OPENAI_API_KEY,
  }),
};

export function createHealthHandler(
  dependencies: HealthDependencies = defaultDependencies,
) {
  return async function healthHandler() {
    try {
      const benchmark = dependencies.runBenchmark();
      const deployment = validateDeploymentReadiness(dependencies.environment());
      const body = HealthResponseSchema.parse({
        status: benchmark.passed ? "ok" : "degraded",
        service: "TutorOS",
        version: packageJson.version,
        checkedAt: dependencies.now().toISOString(),
        checks: {
          credentialFreeDemo: "ready",
          evidenceBenchmark: {
            passed: benchmark.passed,
            passedCount: benchmark.passedCount,
            totalCount: benchmark.totalCount,
            version: benchmark.benchmarkVersion,
          },
          canonicalUrl: deployment.ready ? "configured" : "needs_configuration",
          liveGeneration: deployment.liveGeneration,
        },
      });

      return noStoreJson(body, { status: benchmark.passed ? 200 : 503 });
    } catch {
      return noStoreJson(
        {
          status: "degraded",
          service: "TutorOS",
          version: packageJson.version,
          checkedAt: dependencies.now().toISOString(),
          checks: {
            credentialFreeDemo: "ready",
            evidenceBenchmark: {
              passed: false,
              passedCount: 0,
              totalCount: 12,
              version: "unknown",
            },
            canonicalUrl: "needs_configuration",
            liveGeneration: "optional_not_configured",
          },
        },
        { status: 503 },
      );
    }
  };
}

export const GET = createHealthHandler();
