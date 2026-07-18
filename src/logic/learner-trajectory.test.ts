import { describe, expect, it } from "vitest";
import {
  createTutorSignOff,
  deriveLearnerTrajectory,
  TutorSignOffError,
} from "./learner-trajectory";
import { deriveNextSessionBrief } from "./next-session-brief";
import { mayaPriorSessions, tuesdayScenario } from "./tuesday-scenario";

const briefInput = {
  studentName: tuesdayScenario.student.name,
  subject: tuesdayScenario.student.subject,
  studentLevel: tuesdayScenario.student.level,
  nextFocus: tuesdayScenario.session.currentFocus,
  evidence: tuesdayScenario.evidence,
};
const currentSession = {
  sessionId: "session-3",
  label: "Tuesday · Transfer check",
  evidence: tuesdayScenario.evidence,
};

function validSignOffInput() {
  return {
    tutorLabel: "Tutor review",
    signedAt: "2026-07-18T12:00:00.000Z",
    ...briefInput,
    nextSessionBrief: deriveNextSessionBrief(briefInput),
    parentReport: tuesdayScenario.parentReport,
  };
}

describe("three-session learner trajectory", () => {
  it("derives all three points from production mastery decisions", () => {
    const trajectory = deriveLearnerTrajectory([...mayaPriorSessions, currentSession]);

    expect(trajectory.points).toHaveLength(3);
    expect(trajectory.points.map((point) => point.decision.score)).toEqual([45, 63, 60]);
    expect(trajectory.points.map((point) => point.decision.status)).toEqual([
      "Needs reinforcement",
      "Developing",
      "Needs reinforcement",
    ]);
    expect(trajectory.points[2].independentSuccessCount).toBe(1);
    expect(trajectory.points[2].supportUsedCount).toBe(2);
  });

  it("honestly identifies the latest independent transfer gap", () => {
    const trajectory = deriveLearnerTrajectory([...mayaPriorSessions, currentSession]);

    expect(trajectory.direction).toBe("Recent transfer gap");
    expect(trajectory.rationale).toContain("independent miss");
    expect(trajectory.rationale).toContain("3-day review cycle");
  });

  it("recomputes only the editable third trajectory point", () => {
    const initial = deriveLearnerTrajectory([...mayaPriorSessions, currentSession]);
    const secureEvidence = {
      ...currentSession.evidence,
      attempts: currentSession.evidence.attempts.map((attempt) => ({
        ...attempt,
        outcome: "correct" as const,
        support: "independent" as const,
      })),
    };
    const updated = deriveLearnerTrajectory([
      ...mayaPriorSessions,
      { ...currentSession, evidence: secureEvidence },
    ]);

    expect(updated.points.slice(0, 2)).toEqual(initial.points.slice(0, 2));
    expect(updated.points[2].decision.status).toBe("Secure");
    expect(updated.points[2].decision.score).toBe(100);
    expect(updated.direction).toBe("Ready to extend");
  });

  it("requires exactly three chronological sessions", () => {
    expect(() => deriveLearnerTrajectory(mayaPriorSessions)).toThrow(
      "exactly three sessions",
    );
    expect(() =>
      deriveLearnerTrajectory([
        currentSession,
        ...mayaPriorSessions,
      ]),
    ).toThrow("chronological order");
  });
});

describe("tutor sign-off", () => {
  it("signs the current evidence, next-session brief, and honest report", () => {
    const signOff = createTutorSignOff(validSignOffInput());

    expect(signOff.status).toBe("Signed off");
    expect(signOff.reviewedAttemptCount).toBe(4);
    expect(signOff.nextSessionSourceAttemptIds).toEqual(["practice-4", "practice-3"]);
    expect(signOff.reportSourceAttemptIds).toEqual(["practice-3", "practice-4"]);
  });

  it("rejects a stale next-session brief after evidence changes", () => {
    const input = validSignOffInput();
    const changedEvidence = {
      ...input.evidence,
      attempts: input.evidence.attempts.map((attempt, index) =>
        index === 3 ? { ...attempt, outcome: "correct" as const } : attempt,
      ),
    };

    try {
      createTutorSignOff({ ...input, evidence: changedEvidence });
      throw new Error("Expected stale evidence to block sign-off.");
    } catch (error) {
      expect(error).toBeInstanceOf(TutorSignOffError);
      expect((error as TutorSignOffError).code).toBe("STALE_NEXT_SESSION_BRIEF");
    }
  });

  it("rejects parent wording that fails the Honesty Gate", () => {
    const input = validSignOffInput();

    try {
      createTutorSignOff({
        ...input,
        parentReport: {
          ...input.parentReport,
          text: "Maya did great today and should keep up the good work. We reviewed fractions and will return to unlike denominators next lesson for another useful round of practice together.",
        },
      });
      throw new Error("Expected dishonest wording to block sign-off.");
    } catch (error) {
      expect(error).toBeInstanceOf(TutorSignOffError);
      expect((error as TutorSignOffError).code).toBe("HONESTY_GATE_FAILED");
    }
  });
});
