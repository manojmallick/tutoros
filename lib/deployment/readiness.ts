import { z } from "zod";

export const DeploymentReadinessSchema = z.object({
  ready: z.boolean(),
  canonicalUrl: z.string().url().nullable(),
  credentialFreeDemo: z.literal("ready"),
  liveGeneration: z.enum(["configured", "optional_not_configured"]),
  benchmarkCommand: z.literal("pnpm benchmark"),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type DeploymentReadiness = z.infer<typeof DeploymentReadinessSchema>;

type DeploymentEnvironment = {
  siteUrl?: string;
  openAiApiKey?: string;
};

function productionCanonicalUrl(value?: string) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

    if (
      url.protocol !== "https:" ||
      localHostnames.has(url.hostname) ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function validateDeploymentReadiness(
  environment: DeploymentEnvironment,
): DeploymentReadiness {
  const canonicalUrl = productionCanonicalUrl(environment.siteUrl);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!canonicalUrl) {
    errors.push(
      "NEXT_PUBLIC_SITE_URL must be the final non-local HTTPS URL before production deployment.",
    );
  }

  const liveGeneration = environment.openAiApiKey?.trim()
    ? "configured"
    : "optional_not_configured";

  if (liveGeneration === "optional_not_configured") {
    warnings.push(
      "OPENAI_API_KEY is not configured; live generation stays disabled and highlighted local mock responses remain available.",
    );
  }

  return DeploymentReadinessSchema.parse({
    ready: errors.length === 0,
    canonicalUrl,
    credentialFreeDemo: "ready",
    liveGeneration,
    benchmarkCommand: "pnpm benchmark",
    errors,
    warnings,
  });
}

export function formatDeploymentReadiness(result: DeploymentReadiness) {
  return [
    `TutorOS deployment candidate: ${result.ready ? "READY" : "NOT READY"}`,
    `Canonical URL: ${result.canonicalUrl ?? "missing or invalid"}`,
    `Credential-free demo: ${result.credentialFreeDemo}`,
    `Live GPT-5.6 generation: ${result.liveGeneration}`,
    `Benchmark gate: ${result.benchmarkCommand}`,
    ...result.warnings.map((warning) => `Warning: ${warning}`),
    ...result.errors.map((error) => `Error: ${error}`),
  ].join("\n");
}
