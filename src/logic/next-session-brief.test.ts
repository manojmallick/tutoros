import { describe, expect, it } from "vitest";
import { z } from "zod";
import { deriveNextSessionBrief, type NextSessionBriefInput } from "./next-session-brief";
import { tuesdayScenario } from "./tuesday-scenario";

const input: NextSessionBriefInput = {
  studentName: tuesdayScenario.student.name,
  subject: tuesdayScenario.student.subject,
  studentLevel: tuesdayScenario.student.level,
  nextFocus: tuesdayScenario.session.currentFocus,
  evidence: tuesdayScenario.evidence,
};

describe("next-session brief", () => {
  it("closes Maya's evidence loop with a three-day retrieval brief", () => {
    const brief = deriveNextSessionBrief(input);

    expect(brief.scheduledFor).toBe("2026-07-17");
    expect(brief.decision.status).toBe("Needs reinforcement");
    expect(brief.openingReview.minutes).toBe(5);
    expect(brief.openingReview.activity).toContain("visual model");
    expect(brief.supportPlan.label).toBe("Model → prompt → independent");
    expect(brief.nextFocus).toContain("Build independent accuracy");
  });

  it("targets the latest difficult attempt and preserves a breakthrough source", () => {
    const brief = deriveNextSessionBrief(input);

    expect(brief.openingReview.sourceAttemptIds).toEqual(["practice-4", "practice-3"]);
    expect(brief.evidenceSources).toEqual([
      {
        attemptId: "practice-4",
        observation: "Added denominators directly after the visual model was removed.",
        role: "Review target",
      },
      {
        attemptId: "practice-3",
        observation: "Found 12 as a common denominator independently.",
        role: "Breakthrough",
      },
    ]);
  });

  it("creates a developing progression for supported success", () => {
    const brief = deriveNextSessionBrief({
      ...input,
      evidence: {
        ...input.evidence,
        attempts: [
          {
            ...input.evidence.attempts[0],
            id: "modeled-success",
            outcome: "correct",
            support: "modeled",
          },
        ],
      },
    });

    expect(brief.decision.status).toBe("Developing");
    expect(brief.scheduledFor).toBe("2026-07-21");
    expect(brief.supportPlan.label).toBe("Prompt → independent → stretch");
    expect(brief.nextFocus).toContain("Strengthen independent transfer");
  });

  it("creates a fourteen-day transfer brief for secure evidence", () => {
    const secureEvidence = {
      ...input.evidence,
      attempts: input.evidence.attempts.map((attempt) => ({
        ...attempt,
        outcome: "correct" as const,
        support: "independent" as const,
      })),
    };
    const brief = deriveNextSessionBrief({ ...input, evidence: secureEvidence });

    expect(brief.decision.status).toBe("Secure");
    expect(brief.scheduledFor).toBe("2026-07-28");
    expect(brief.supportPlan.label).toBe("Independent retrieval → transfer → stretch");
    expect(brief.evidenceSources[0].attemptId).toBe("practice-4");
    expect(brief.nextFocus).toContain("unfamiliar and stretch contexts");
  });

  it("produces valid context for the existing lesson-plan endpoint", () => {
    const brief = deriveNextSessionBrief(input);

    expect(brief.lessonPlanContext).toEqual({
      subject: "Mathematics",
      studentLevel: "Year 8",
      lastSessionTopic: "Unlike denominators",
      sessionGoal: "Build independent accuracy in Adding fractions with unlike denominators",
      strugglingWith: "Added denominators directly after the visual model was removed.",
    });
  });

  it("rejects invalid evidence before deriving recommendations", () => {
    expect(() =>
      deriveNextSessionBrief({
        ...input,
        evidence: { ...input.evidence, attempts: [] },
      }),
    ).toThrow(z.ZodError);
  });
});
