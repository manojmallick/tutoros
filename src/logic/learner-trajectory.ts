import { z } from "zod";
import { honestyGateCheck } from "./honesty-gate";
import {
  calculateMasteryDecision,
  MasteryDecisionSchema,
  SessionEvidenceSchema,
} from "./mastery";
import {
  deriveNextSessionBrief,
  NextSessionBriefSchema,
} from "./next-session-brief";
import { ParentReportDraftSchema } from "./parent-report";

const boundedText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const LearnerTrajectorySessionSchema = z.object({
  sessionId: z.string().trim().min(1).max(80),
  label: boundedText("Session label", 80),
  evidence: SessionEvidenceSchema,
});

export const LearnerTrajectoryInputSchema = z
  .array(LearnerTrajectorySessionSchema)
  .length(3, "A learner trajectory requires exactly three sessions.")
  .superRefine((sessions, context) => {
    for (let index = 1; index < sessions.length; index += 1) {
      if (sessions[index - 1].evidence.reviewedOn >= sessions[index].evidence.reviewedOn) {
        context.addIssue({
          code: "custom",
          message: "Trajectory sessions must use unique dates in chronological order.",
          path: [index, "evidence", "reviewedOn"],
        });
      }
    }
  });

export const LearnerTrajectoryPointSchema = z.object({
  sessionId: z.string(),
  label: z.string(),
  reviewedOn: z.string(),
  decision: MasteryDecisionSchema,
  independentSuccessCount: z.number().int().nonnegative(),
  supportUsedCount: z.number().int().nonnegative(),
  attemptCount: z.number().int().positive(),
});

export const LearnerTrajectorySchema = z.object({
  points: z.array(LearnerTrajectoryPointSchema).length(3),
  direction: z.enum([
    "Recent transfer gap",
    "Building independence",
    "Ready to extend",
    "Mixed evidence",
  ]),
  rationale: z.string().min(2),
});

export type LearnerTrajectorySession = z.infer<typeof LearnerTrajectorySessionSchema>;
export type LearnerTrajectory = z.infer<typeof LearnerTrajectorySchema>;

export function deriveLearnerTrajectory(input: LearnerTrajectorySession[]): LearnerTrajectory {
  const sessions = LearnerTrajectoryInputSchema.parse(input);
  const points = sessions.map((session) => ({
    sessionId: session.sessionId,
    label: session.label,
    reviewedOn: session.evidence.reviewedOn,
    decision: calculateMasteryDecision(session.evidence),
    independentSuccessCount: session.evidence.attempts.filter(
      (attempt) => attempt.outcome === "correct" && attempt.support === "independent",
    ).length,
    supportUsedCount: session.evidence.attempts.filter(
      (attempt) => attempt.support !== "independent",
    ).length,
    attemptCount: session.evidence.attempts.length,
  }));
  const [first, second, latest] = points;
  let direction: LearnerTrajectory["direction"];
  let rationale: string;

  if (latest.decision.signals.independentMiss) {
    direction = "Recent transfer gap";
    rationale = `Independent success appeared across the three sessions, but ${latest.label} ended with an independent miss. The latest evidence keeps the topic in a ${latest.decision.intervalDays}-day review cycle.`;
  } else if (
    latest.decision.status === "Secure" &&
    latest.decision.score > second.decision.score
  ) {
    direction = "Ready to extend";
    rationale = `The evidence score rose from ${first.decision.score}% to ${latest.decision.score}% and the latest session is Secure without a decline or independent-miss signal.`;
  } else if (
    first.decision.score <= second.decision.score &&
    second.decision.score <= latest.decision.score &&
    first.independentSuccessCount <= second.independentSuccessCount &&
    second.independentSuccessCount <= latest.independentSuccessCount
  ) {
    direction = "Building independence";
    rationale = `Scores and independent successes held or increased across all three sessions; the latest ${latest.decision.status} decision remains the governing next step.`;
  } else {
    direction = "Mixed evidence";
    rationale = `The three sessions do not form a single upward or downward line. The latest ${latest.decision.status} decision and its ${latest.decision.intervalDays}-day review interval remain the governing evidence.`;
  }

  return LearnerTrajectorySchema.parse({ points, direction, rationale });
}

export const TutorSignOffInputSchema = z.object({
  tutorLabel: boundedText("Tutor label", 80),
  signedAt: z.string().datetime(),
  studentName: boundedText("Student name", 80),
  subject: boundedText("Subject", 80),
  studentLevel: boundedText("Student level", 80),
  nextFocus: boundedText("Next focus", 240),
  evidence: SessionEvidenceSchema,
  nextSessionBrief: NextSessionBriefSchema,
  parentReport: ParentReportDraftSchema,
});

export const TutorSignOffSchema = z.object({
  status: z.literal("Signed off"),
  tutorLabel: z.string(),
  signedAt: z.string().datetime(),
  reviewedAttemptCount: z.number().int().positive(),
  nextSessionSourceAttemptIds: z.array(z.string()).min(1),
  reportSourceAttemptIds: z.array(z.string()).min(1),
  statement: z.string().min(2),
});

export type TutorSignOffInput = z.infer<typeof TutorSignOffInputSchema>;
export type TutorSignOff = z.infer<typeof TutorSignOffSchema>;
export type TutorSignOffErrorCode = "STALE_NEXT_SESSION_BRIEF" | "HONESTY_GATE_FAILED";

export class TutorSignOffError extends Error {
  constructor(
    public readonly code: TutorSignOffErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TutorSignOffError";
  }
}

export function createTutorSignOff(input: TutorSignOffInput): TutorSignOff {
  const context = TutorSignOffInputSchema.parse(input);
  const expectedBrief = deriveNextSessionBrief({
    studentName: context.studentName,
    subject: context.subject,
    studentLevel: context.studentLevel,
    nextFocus: context.nextFocus,
    evidence: context.evidence,
  });

  if (JSON.stringify(context.nextSessionBrief) !== JSON.stringify(expectedBrief)) {
    throw new TutorSignOffError(
      "STALE_NEXT_SESSION_BRIEF",
      "Update mastery before sign-off so the next-session brief matches the current evidence.",
    );
  }

  const honestyCheck = honestyGateCheck(context.parentReport, {
    studentName: context.studentName,
    subject: context.subject,
    nextFocus: context.nextFocus,
    evidence: context.evidence,
    mastery: expectedBrief.decision,
  });

  if (!honestyCheck.passed) {
    throw new TutorSignOffError("HONESTY_GATE_FAILED", honestyCheck.reason);
  }

  return TutorSignOffSchema.parse({
    status: "Signed off",
    tutorLabel: context.tutorLabel,
    signedAt: context.signedAt,
    reviewedAttemptCount: context.evidence.attempts.length,
    nextSessionSourceAttemptIds: expectedBrief.evidenceSources.map(
      (source) => source.attemptId,
    ),
    reportSourceAttemptIds: honestyCheck.evidenceReferences.map(
      (reference) => reference.attemptId,
    ),
    statement:
      "Tutor reviewed the current evidence, mastery decision, next-session provenance, and parent wording.",
  });
}
