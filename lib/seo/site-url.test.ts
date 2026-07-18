import { describe, expect, it } from "vitest";
import { LOCAL_SITE_URL, resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl", () => {
  it("uses a truthful localhost fallback instead of example.com", () => {
    expect(resolveSiteUrl(undefined)).toBe(LOCAL_SITE_URL);
  });

  it("normalizes a configured deployment URL", () => {
    expect(resolveSiteUrl("  https://tutoros.example.dev/  ")).toBe(
      "https://tutoros.example.dev",
    );
  });

  it("preserves a configured path", () => {
    expect(resolveSiteUrl("https://example.dev/tutoros/")).toBe(
      "https://example.dev/tutoros",
    );
  });

  it.each(["not-a-url", "ftp://example.dev"])(
    "falls back safely for invalid configuration: %s",
    (configuredUrl) => {
      expect(resolveSiteUrl(configuredUrl)).toBe(LOCAL_SITE_URL);
    },
  );
});
