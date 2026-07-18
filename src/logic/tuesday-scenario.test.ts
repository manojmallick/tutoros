import { describe, expect, it } from "vitest";
import { tuesdayScenario, workflowStages } from "./tuesday-scenario";

describe("Tuesday tutoring scenario", () => {
  it("is explicitly synthetic and safe to show without a login", () => {
    expect(tuesdayScenario.isSynthetic).toBe(true);
    expect(tuesdayScenario.student.name).toBe("Maya");
  });

  it("contains the complete four-stage TutorOS evidence chain", () => {
    expect(workflowStages.map((stage) => stage.id)).toEqual([
      "plan",
      "evidence",
      "mastery",
      "report",
    ]);
  });

  it("grounds the parent report in a recorded session observation", () => {
    expect(tuesdayScenario.parentReport).toContain("common denominator without a prompt");
    expect(tuesdayScenario.evidence[0].observation).toContain(
      "common denominator independently",
    );
  });

  it("keeps the lesson plan within the promised session length", () => {
    const plannedMinutes = tuesdayScenario.lessonPlan.reduce(
      (total, item) => total + Number.parseInt(item.duration, 10),
      0,
    );

    expect(plannedMinutes).toBe(tuesdayScenario.session.durationMinutes);
  });
});
