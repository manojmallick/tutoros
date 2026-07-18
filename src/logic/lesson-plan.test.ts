import { describe, expect, it } from "vitest";
import {
  buildLessonPlanInput,
  LESSON_PLAN_MODEL,
  LessonPlanRequestSchema,
  LessonPlanSchema,
} from "./lesson-plan";
import { tuesdayScenario } from "./tuesday-scenario";

const validContext = {
  subject: tuesdayScenario.student.subject,
  studentLevel: tuesdayScenario.student.level,
  lastSessionTopic: tuesdayScenario.session.lastTopic,
  sessionGoal: tuesdayScenario.session.currentFocus,
  strugglingWith: tuesdayScenario.session.currentStruggle,
};

describe("lesson-plan contracts", () => {
  it("accepts the synthetic context and complete 45-minute plan", () => {
    expect(LessonPlanRequestSchema.parse(validContext)).toEqual(validContext);
    expect(LessonPlanSchema.parse(tuesdayScenario.lessonPlan)).toEqual(
      tuesdayScenario.lessonPlan,
    );
  });

  it("requires exactly four increasing-difficulty practice problems", () => {
    expect(
      tuesdayScenario.lessonPlan.practice.problems.map((problem) => problem.difficulty),
    ).toEqual(["supported", "guided", "independent", "stretch"]);

    const incomplete = {
      ...tuesdayScenario.lessonPlan,
      practice: {
        ...tuesdayScenario.lessonPlan.practice,
        problems: tuesdayScenario.lessonPlan.practice.problems.slice(0, 3),
      },
    };
    expect(LessonPlanSchema.safeParse(incomplete).success).toBe(false);
  });

  it("bounds tutor-provided context before it reaches the model", () => {
    const oversized = {
      ...validContext,
      strugglingWith: "x".repeat(401),
    };
    expect(LessonPlanRequestSchema.safeParse(oversized).success).toBe(false);
  });

  it("uses the required model and serializes context as data", () => {
    expect(LESSON_PLAN_MODEL).toBe("gpt-5.6");
    expect(buildLessonPlanInput(validContext)).toContain(JSON.stringify(validContext, null, 2));
  });
});
