import { describe, expect, it } from "vitest";
import { securityHeaders } from "./security-headers";

describe("deployment security headers", () => {
  it("sets every deployment-candidate browser protection", () => {
    const headers = Object.fromEntries(
      securityHeaders.map((header) => [header.key, header.value]),
    );

    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).toContain("fonts.googleapis.com");
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });
});
