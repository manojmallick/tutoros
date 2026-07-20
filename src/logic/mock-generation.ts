import {
  LessonPlanSchema,
  type LessonPlan,
  type LessonPlanRequest,
} from "./lesson-plan";
import {
  ParentReportDraftSchema,
  type ParentReportDraft,
  type ParentReportRequest,
} from "./parent-report";

function clip(value: string, max: number) {
  const text = value.trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function createMockLessonPlan(context: LessonPlanRequest): LessonPlan {
  const goal = clip(context.sessionGoal, 180);
  const struggle = clip(context.strugglingWith, 220);
  const previousTopic = clip(context.lastSessionTopic, 180);

  return LessonPlanSchema.parse({
    warmup: {
      minutes: 5,
      title: "Retrieve the previous method",
      activity: `Ask the learner to explain one example from “${previousTopic}” and solve a short variation without notes.`,
      successSignal: "The learner names the method, completes the variation, and explains one decision.",
    },
    coreTeaching: {
      minutes: 20,
      title: "Make the difficult step visible",
      explanation: `Model one clear route toward “${goal}”. Pause at the current difficulty—${struggle}—and ask the learner to explain what changes at that step.`,
      concreteExample: `Use one worked ${clip(context.subject, 60)} example, compare a common error with a correct solution, then fade the explanation into a single prompt.`,
    },
    practice: {
      minutes: 15,
      title: "Fade support toward transfer",
      problems: [
        {
          prompt: `Solve a first example for “${goal}” with the worked model still visible.`,
          difficulty: "supported",
          successSignal: "The learner follows the model and identifies the key step aloud.",
        },
        {
          prompt: `Solve a parallel example for “${goal}” with one optional tutor prompt.`,
          difficulty: "guided",
          successSignal: "The learner chooses the next step after no more than one prompt.",
        },
        {
          prompt: `Solve a fresh example for “${goal}” independently and justify each step.`,
          difficulty: "independent",
          successSignal: "The learner completes the method without the worked model or a prompt.",
        },
        {
          prompt: `Apply “${goal}” in an unfamiliar ${clip(context.subject, 60)} context and check whether the answer is reasonable.`,
          difficulty: "stretch",
          successSignal: "The learner transfers the method, explains the choice, and checks the result.",
        },
      ],
    },
    masteryCheck: {
      minutes: 5,
      title: "Explain and transfer",
      question: `Complete one new task involving “${goal}” without support, then explain why the method works.`,
      lookFor: "Independent completion, a clear explanation, and a check that catches the known difficulty.",
    },
    totalMinutes: 45,
  });
}

export function createMockParentReport(context: ParentReportRequest): ParentReportDraft {
  const attempts = context.evidence.attempts;
  const breakthrough =
    attempts.findLast(
      (attempt) => attempt.outcome === "correct" && attempt.support === "independent",
    ) ?? attempts.findLast((attempt) => attempt.outcome === "correct");
  const difficulty = attempts.findLast(
    (attempt) => attempt.outcome === "partial" || attempt.outcome === "incorrect",
  );
  const lead = breakthrough ?? attempts.at(-1)!;
  const opening = breakthrough
    ? `${context.studentName} showed a specific step forward in ${context.subject}: ${clip(lead.observation, 160)}.`
    : `${context.studentName}’s ${context.subject} session evidence records this moment: ${clip(lead.observation, 160)}.`;
  const difficultySentence = difficulty
    ? `The difficult point is still visible in the session evidence: ${clip(difficulty.observation, 160)}.`
    : "The recorded attempts do not include an incorrect or partly correct result from this session.";
  const nextStep = `Next session will focus on ${clip(context.nextFocus, 120)}, with review scheduled for ${context.mastery.nextReviewDate}.`;
  const referencedAttemptIds = [...new Set([lead.id, difficulty?.id].filter(Boolean))] as string[];

  return ParentReportDraftSchema.parse({
    text: `${opening} ${difficultySentence} ${nextStep}`,
    referencedAttemptIds,
  });
}
