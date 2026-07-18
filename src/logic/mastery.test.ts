import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  addUtcDays,
  calculateMasteryDecision,
  classifyMasteryScore,
  type SessionEvidence,
} from "./mastery";

const baseEvidence: SessionEvidence = {
  topic: "Unlike denominators",
  reviewedOn: "2026-07-14",
  attempts: [
    {
      id: "attempt-1",
      prompt: "Solve 1/3 + 1/6",
      outcome: "correct",
      support: "prompted",
      observation: "Used a shared multiples list.",
    },
  ],
};

describe("mastery scheduler", () => {
  it("rejects zero attempts instead of dividing by zero", () => {
    expect(() =>
      calculateMasteryDecision({ ...baseEvidence, attempts: [] }),
    ).toThrow(z.ZodError);
  });

  it.each([
    [49, "Needs reinforcement", 3],
    [50, "Developing", 7],
    [79, "Developing", 7],
    [80, "Secure", 14],
  ] as const)("classifies the %i%% boundary", (score, status, intervalDays) => {
    expect(classifyMasteryScore(score)).toEqual({ status, intervalDays });
  });

  it("forces an earlier review when the last three attempts decline", () => {
    const decision = calculateMasteryDecision({
      ...baseEvidence,
      attempts: [
        { ...baseEvidence.attempts[0], id: "1", support: "independent" },
        { ...baseEvidence.attempts[0], id: "2", outcome: "partial", support: "independent" },
        { ...baseEvidence.attempts[0], id: "3", outcome: "incorrect", support: "prompted" },
      ],
    });

    expect(decision.signals.declining).toBe(true);
    expect(decision.intervalDays).toBe(3);
    expect(decision.reason).toContain("Recent attempts declined");
  });

  it("does not let an independent miss hide behind a strong repeated-attempt average", () => {
    const decision = calculateMasteryDecision({
      ...baseEvidence,
      attempts: [
        ...Array.from({ length: 5 }, (_, index) => ({
          ...baseEvidence.attempts[0],
          id: `correct-${index}`,
          support: "independent" as const,
        })),
        {
          ...baseEvidence.attempts[0],
          id: "independent-miss",
          outcome: "incorrect",
          support: "independent",
        },
      ],
    });

    expect(decision.score).toBe(83);
    expect(decision.status).toBe("Needs reinforcement");
    expect(decision.intervalDays).toBe(3);
    expect(decision.reason).toContain("independent attempt was incorrect");
  });

  it("rejects invalid dates and incomplete observations", () => {
    expect(() =>
      calculateMasteryDecision({ ...baseEvidence, reviewedOn: "2026-02-30" }),
    ).toThrow(z.ZodError);
    expect(() =>
      calculateMasteryDecision({
        ...baseEvidence,
        attempts: [{ ...baseEvidence.attempts[0], observation: "" }],
      }),
    ).toThrow(z.ZodError);
  });

  it("rolls review dates across month and year boundaries in UTC", () => {
    expect(addUtcDays("2026-12-29", 3)).toBe("2027-01-01");
    expect(addUtcDays("2028-02-28", 3)).toBe("2028-03-02");
  });
});
