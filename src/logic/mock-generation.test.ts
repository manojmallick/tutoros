import { describe, expect, it } from "vitest";
import { honestyGateCheck } from "./honesty-gate";
import { LessonPlanSchema } from "./lesson-plan";
import { calculateMasteryDecision } from "./mastery";
import { createMockLessonPlan, createMockParentReport } from "./mock-generation";
import { tuesdayScenario } from "./tuesday-scenario";

describe("credential-free GPT-5.6 mock fixtures", () => {
  it("creates a schema-valid 45-minute lesson plan from submitted context", () => {
    const plan = createMockLessonPlan({
      subject: tuesdayScenario.student.subject,
      studentLevel: tuesdayScenario.student.level,
      lastSessionTopic: tuesdayScenario.session.lastTopic,
      sessionGoal: tuesdayScenario.session.currentFocus,
      strugglingWith: tuesdayScenario.session.currentStruggle,
    });

    expect(LessonPlanSchema.safeParse(plan).success).toBe(true);
    expect(plan.practice.problems.map((problem) => problem.difficulty)).toEqual([
      "supported",
      "guided",
      "independent",
      "stretch",
    ]);
  });

  it("creates an evidence-grounded report that still passes the Honesty Gate", () => {
    const context = {
      studentName: tuesdayScenario.student.name,
      subject: tuesdayScenario.student.subject,
      nextFocus: tuesdayScenario.session.currentFocus,
      evidence: tuesdayScenario.evidence,
      mastery: calculateMasteryDecision(tuesdayScenario.evidence),
    };
    const report = createMockParentReport(context);
    const honestyCheck = honestyGateCheck(report, context);

    expect(honestyCheck.passed).toBe(true);
    expect(report.referencedAttemptIds).toEqual(["practice-3", "practice-4"]);
    expect(report.text).toContain(tuesdayScenario.student.name);
    expect(report.text).toContain(context.mastery.nextReviewDate);
  });
});
