import { z } from "zod";
import { LessonPlanRequestSchema } from "./lesson-plan";
import {
  calculateMasteryDecision,
  MasteryDecisionSchema,
  SessionEvidenceSchema,
  type MasteryStatus,
  type SessionAttempt,
} from "./mastery";

const boundedText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const NextSessionBriefInputSchema = z.object({
  studentName: boundedText("Student name", 80),
  subject: boundedText("Subject", 80),
  studentLevel: boundedText("Student level", 80),
  nextFocus: boundedText("Next focus", 240),
  evidence: SessionEvidenceSchema,
});

const evidenceSourceSchema = z.object({
  attemptId: z.string().min(1),
  observation: z.string().min(2),
  role: z.enum(["Review target", "Breakthrough"]),
});

export const NextSessionBriefSchema = z.object({
  studentName: z.string(),
  scheduledFor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Scheduled date must use YYYY-MM-DD."),
  topic: z.string(),
  decision: MasteryDecisionSchema,
  rationale: z.string(),
  openingReview: z.object({
    minutes: z.literal(5),
    title: z.string(),
    activity: z.string(),
    successSignal: z.string(),
    sourceAttemptIds: z.array(z.string()).min(1),
  }),
  supportPlan: z.object({
    label: z.enum([
      "Model → prompt → independent",
      "Prompt → independent → stretch",
      "Independent retrieval → transfer → stretch",
    ]),
    rationale: z.string(),
    sourceAttemptIds: z.array(z.string()).min(1),
  }),
  nextFocus: z.string(),
  masteryCheck: z.object({
    question: z.string(),
    lookFor: z.string(),
  }),
  evidenceSources: z.array(evidenceSourceSchema).min(1),
  lessonPlanContext: LessonPlanRequestSchema,
});

export type NextSessionBriefInput = z.infer<typeof NextSessionBriefInputSchema>;
export type NextSessionBrief = z.infer<typeof NextSessionBriefSchema>;

const lastMatchingAttempt = (
  attempts: SessionAttempt[],
  matches: (attempt: SessionAttempt) => boolean,
) => attempts.findLast(matches);

function supportPlanFor(status: MasteryStatus) {
  if (status === "Needs reinforcement") {
    return {
      label: "Model → prompt → independent" as const,
      rationale: "Restore the visual model, fade to one prompt, then check the same idea independently.",
    };
  }

  if (status === "Developing") {
    return {
      label: "Prompt → independent → stretch" as const,
      rationale: "Start with one optional prompt, remove it quickly, then test transfer in a new context.",
    };
  }

  return {
    label: "Independent retrieval → transfer → stretch" as const,
    rationale: "Begin from memory, confirm transfer, then increase complexity without re-teaching first.",
  };
}

export function deriveNextSessionBrief(input: NextSessionBriefInput): NextSessionBrief {
  const context = NextSessionBriefInputSchema.parse(input);
  const decision = calculateMasteryDecision(context.evidence);
  const attempts = context.evidence.attempts;
  const difficultAttempt = lastMatchingAttempt(
    attempts,
    (attempt) => attempt.outcome === "partial" || attempt.outcome === "incorrect",
  );
  const reviewTarget = difficultAttempt ?? attempts.at(-1)!;
  const breakthrough =
    lastMatchingAttempt(
      attempts,
      (attempt) => attempt.outcome === "correct" && attempt.support === "independent",
    ) ?? lastMatchingAttempt(attempts, (attempt) => attempt.outcome === "correct");
  const supportPlan = supportPlanFor(decision.status);
  const sourceAttemptIds = [reviewTarget.id];
  const evidenceSources: NextSessionBrief["evidenceSources"] = [
    {
      attemptId: reviewTarget.id,
      observation: reviewTarget.observation,
      role: "Review target",
    },
  ];

  if (breakthrough && breakthrough.id !== reviewTarget.id) {
    sourceAttemptIds.push(breakthrough.id);
    evidenceSources.push({
      attemptId: breakthrough.id,
      observation: breakthrough.observation,
      role: "Breakthrough",
    });
  }

  const openingActivity =
    decision.status === "Needs reinforcement"
      ? `Rework “${reviewTarget.prompt}” with a visual model, then remove the model for one fresh example.`
      : decision.status === "Developing"
        ? `Solve a fresh version of “${reviewTarget.prompt}” with one optional prompt, then repeat independently.`
        : `Retrieve the method behind “${reviewTarget.prompt}” from memory, then apply it to a new context.`;
  const nextFocus =
    decision.status === "Needs reinforcement"
      ? `Build independent accuracy in ${context.nextFocus}`
      : decision.status === "Developing"
        ? `Strengthen independent transfer of ${context.nextFocus}`
        : `Apply ${context.nextFocus} in unfamiliar and stretch contexts`;
  const masteryQuestion =
    decision.status === "Secure"
      ? `Solve a new ${context.evidence.topic.toLowerCase()} problem in an unfamiliar context and justify the method.`
      : `Solve one new ${context.evidence.topic.toLowerCase()} problem independently and explain each step.`;

  return NextSessionBriefSchema.parse({
    studentName: context.studentName,
    scheduledFor: decision.nextReviewDate,
    topic: context.evidence.topic,
    decision,
    rationale: decision.reason,
    openingReview: {
      minutes: 5,
      title: `Retrieve ${context.evidence.topic}`,
      activity: openingActivity,
      successSignal:
        decision.status === "Secure"
          ? `${context.studentName} transfers the method without a prompt and checks the result.`
          : `${context.studentName} completes the fresh example without repeating the recorded difficulty.`,
      sourceAttemptIds,
    },
    supportPlan: {
      ...supportPlan,
      sourceAttemptIds,
    },
    nextFocus,
    masteryCheck: {
      question: masteryQuestion,
      lookFor:
        decision.status === "Secure"
          ? "Independent transfer, a clear explanation, and a reasonableness check."
          : "Independent completion without the support used at the start of the session.",
    },
    evidenceSources,
    lessonPlanContext: {
      subject: context.subject,
      studentLevel: context.studentLevel,
      lastSessionTopic: context.evidence.topic,
      sessionGoal: nextFocus,
      strugglingWith:
        decision.status === "Secure"
          ? `Confirm transfer beyond this successful evidence: ${reviewTarget.observation}`
          : reviewTarget.observation,
    },
  });
}
