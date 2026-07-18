import { describe, expect, it } from "vitest";
import {
  formatDeploymentReadiness,
  validateDeploymentReadiness,
} from "./readiness";

describe("deployment readiness", () => {
  it("accepts a production HTTPS URL without requiring live generation", () => {
    const result = validateDeploymentReadiness({
      siteUrl: "https://tutoros.example.dev/",
    });

    expect(result.ready).toBe(true);
    expect(result.canonicalUrl).toBe("https://tutoros.example.dev");
    expect(result.credentialFreeDemo).toBe("ready");
    expect(result.liveGeneration).toBe("optional_not_configured");
    expect(result.warnings).toHaveLength(1);
  });

  it.each([
    undefined,
    "http://tutoros.example.dev",
    "https://localhost:3000",
    "not-a-url",
    "https://user:password@tutoros.example.dev",
  ])("rejects a non-production canonical URL: %s", (siteUrl) => {
    const result = validateDeploymentReadiness({ siteUrl });

    expect(result.ready).toBe(false);
    expect(result.canonicalUrl).toBeNull();
    expect(result.errors[0]).toContain("non-local HTTPS URL");
  });

  it("reports optional live generation when a server key is configured", () => {
    const result = validateDeploymentReadiness({
      siteUrl: "https://tutoros.example.dev",
      openAiApiKey: "configured-server-secret",
    });

    expect(result.liveGeneration).toBe("configured");
    expect(result.warnings).toEqual([]);
    expect(formatDeploymentReadiness(result)).not.toContain("configured-server-secret");
  });
});

it("validates the deployment candidate environment", () => {
    const checkingCurrentEnvironment = process.env.TUTOROS_DEPLOYMENT_CHECK === "1";
    const result = validateDeploymentReadiness({
      siteUrl: checkingCurrentEnvironment
        ? process.env.NEXT_PUBLIC_SITE_URL
        : "https://tutoros.example.dev",
      openAiApiKey: checkingCurrentEnvironment ? process.env.OPENAI_API_KEY : undefined,
    });

    if (checkingCurrentEnvironment) {
      console.log(`\n${formatDeploymentReadiness(result)}\n`);
    }
    expect(result.ready, result.errors.join("\n")).toBe(true);
});
