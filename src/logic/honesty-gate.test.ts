import { describe, expect, it } from "vitest";
import { honestyGateCheck } from "./honesty-gate";
import { calculateMasteryDecision } from "./mastery";
import type { ParentReportDraft, ParentReportRequest } from "./parent-report";
import { tuesdayScenario } from "./tuesday-scenario";

const context: ParentReportRequest = {
  studentName: tuesdayScenario.student.name,
  subject: tuesdayScenario.student.subject,
  nextFocus: tuesdayScenario.session.currentFocus,
  evidence: tuesdayScenario.evidence,
  mastery: calculateMasteryDecision(tuesdayScenario.evidence),
};

const groundedDraft = tuesdayScenario.parentReport;

function check(draft: Partial<ParentReportDraft>) {
  return honestyGateCheck({ ...groundedDraft, ...draft }, context);
}

describe("Honesty Gate", () => {
  it("passes a specific report and returns traceable evidence", () => {
    const result = check({});

    expect(result.passed).toBe(true);
    expect(result.reason).toContain("preserves the mastery decision");
    expect(result.evidenceReferences).toEqual([
      {
        attemptId: "practice-3",
        observation: "Found 12 as a common denominator independently.",
      },
      {
        attemptId: "practice-4",
        observation: "Added denominators directly after the visual model was removed.",
      },
    ]);
  });

  it("blocks unknown evidence references", () => {
    const result = check({ referencedAttemptIds: ["invented-attempt"] });

    expect(result.passed).toBe(false);
    expect(result.reason).toContain("not present");
  });

  it("blocks generic praise", () => {
    const result = check({
      text: "Maya did great today and should keep up the good work. We reviewed fractions together and will return to unlike denominators during the next lesson for another round of practice.",
    });

    expect(result.passed).toBe(false);
    expect(result.reason).toContain("generic praise");
  });

  it.each(["Maya is on track", "Maya has mastered the topic", "There are no concerns"])(
    "blocks softened struggle language: %s",
    (softening) => {
      const result = check({
        text: `${softening}. Maya needed support on the final independent attempt with unlike denominators. We will practise choosing a common denominator again when the topic returns in three days.`,
      });

      expect(result.passed).toBe(false);
      expect(result.reason).toContain("misleading reassurance");
    },
  );

  it("requires a difficult attempt and an honest acknowledgement for non-secure mastery", () => {
    const missingAttempt = check({ referencedAttemptIds: ["practice-3"] });
    const missingWords = check({
      text: "Maya independently found 12 as a common denominator on the third problem. The final attempt showed another useful data point from the session. We will revisit unlike denominators in three days.",
    });

    expect(missingAttempt.passed).toBe(false);
    expect(missingWords.passed).toBe(false);
  });

  it("allows a secure report without a difficult attempt", () => {
    const secureEvidence = {
      ...context.evidence,
      attempts: context.evidence.attempts.map((attempt) => ({
        ...attempt,
        outcome: "correct" as const,
        support: "independent" as const,
      })),
    };
    const secureContext = {
      ...context,
      evidence: secureEvidence,
      mastery: calculateMasteryDecision(secureEvidence),
    };
    const result = honestyGateCheck(
      {
        text: "Maya independently found common denominators across all four problems and explained each conversion clearly. She has mastered today’s goal in this session. Next, we will apply the same method to mixed numbers when the topic returns in fourteen days.",
        referencedAttemptIds: ["practice-3"],
      },
      secureContext,
    );

    expect(result.passed).toBe(true);
  });
});
