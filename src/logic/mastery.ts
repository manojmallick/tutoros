import { z } from "zod";

export const AttemptOutcomeSchema = z.enum(["correct", "partial", "incorrect"]);
export const SupportLevelSchema = z.enum(["independent", "prompted", "modeled"]);

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseUtcDate(value: string) {
  if (!isoDatePattern.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export const SessionAttemptSchema = z.object({
  id: z.string().trim().min(1),
  prompt: z.string().trim().min(2).max(500),
  outcome: AttemptOutcomeSchema,
  support: SupportLevelSchema,
  observation: z.string().trim().min(2).max(400),
});

export const SessionEvidenceSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  reviewedOn: z
    .string()
    .refine((value) => parseUtcDate(value) !== null, "Use a real date in YYYY-MM-DD format."),
  attempts: z.array(SessionAttemptSchema).min(1).max(12),
});

export type AttemptOutcome = z.infer<typeof AttemptOutcomeSchema>;
export type SupportLevel = z.infer<typeof SupportLevelSchema>;
export type SessionAttempt = z.infer<typeof SessionAttemptSchema>;
export type SessionEvidence = z.infer<typeof SessionEvidenceSchema>;

export type MasteryStatus = "Needs reinforcement" | "Developing" | "Secure";

export const MasteryDecisionSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  score: z.number().int().min(0).max(100),
  status: z.enum(["Needs reinforcement", "Developing", "Secure"]),
  intervalDays: z.union([z.literal(3), z.literal(7), z.literal(14)]),
  nextReviewDate: z.string().refine(
    (value) => parseUtcDate(value) !== null,
    "Use a real next-review date in YYYY-MM-DD format.",
  ),
  reason: z.string().trim().min(2).max(500),
  signals: z.object({
    declining: z.boolean(),
    independentMiss: z.boolean(),
  }),
});

export type MasteryDecision = z.infer<typeof MasteryDecisionSchema>;

const outcomeWeights: Record<AttemptOutcome, number> = {
  correct: 1,
  partial: 0.5,
  incorrect: 0,
};

const supportWeights: Record<SupportLevel, number> = {
  independent: 1,
  prompted: 0.8,
  modeled: 0.6,
};

export function classifyMasteryScore(
  score: number,
  signals: MasteryDecision["signals"] = { declining: false, independentMiss: false },
): Pick<MasteryDecision, "status" | "intervalDays"> {
  if (score < 50 || signals.declining || signals.independentMiss) {
    return { status: "Needs reinforcement", intervalDays: 3 };
  }

  if (score < 80) return { status: "Developing", intervalDays: 7 };

  return { status: "Secure", intervalDays: 14 };
}

export function addUtcDays(reviewedOn: string, intervalDays: number) {
  const date = parseUtcDate(reviewedOn);
  if (!date) throw new Error("reviewedOn must be a real date in YYYY-MM-DD format.");

  date.setUTCDate(date.getUTCDate() + intervalDays);
  return date.toISOString().slice(0, 10);
}

function attemptScore(attempt: SessionAttempt) {
  return outcomeWeights[attempt.outcome] * supportWeights[attempt.support];
}

function explainDecision(
  score: number,
  status: MasteryStatus,
  intervalDays: 3 | 7 | 14,
  signals: MasteryDecision["signals"],
) {
  if (signals.declining) {
    return `Recent attempts declined, so this topic returns in ${intervalDays} days even though the overall evidence score is ${score}%.`;
  }

  if (signals.independentMiss) {
    return `An independent attempt was incorrect, so this topic returns in ${intervalDays} days instead of relying on the ${score}% average alone.`;
  }

  if (status === "Needs reinforcement") {
    return `The evidence score is ${score}%, so this topic returns in ${intervalDays} days for supported retrieval.`;
  }

  if (status === "Developing") {
    return `The evidence score is ${score}% with no decline signal, so this topic returns in ${intervalDays} days.`;
  }

  return `The evidence score is ${score}% with no decline or independent-miss signal, so this topic returns in ${intervalDays} days.`;
}

export function calculateMasteryDecision(input: SessionEvidence): MasteryDecision {
  const evidence = SessionEvidenceSchema.parse(input);
  const scores = evidence.attempts.map(attemptScore);
  const score = Math.round(
    (scores.reduce((total, current) => total + current, 0) / scores.length) * 100,
  );
  const signals = {
    declining:
      scores.length >= 3 &&
      scores.at(-3)! > scores.at(-2)! &&
      scores.at(-2)! > scores.at(-1)!,
    independentMiss: evidence.attempts.some(
      (attempt) => attempt.support === "independent" && attempt.outcome === "incorrect",
    ),
  };
  const { status, intervalDays } = classifyMasteryScore(score, signals);

  return {
    topic: evidence.topic,
    score,
    status,
    intervalDays,
    nextReviewDate: addUtcDays(evidence.reviewedOn, intervalDays),
    reason: explainDecision(score, status, intervalDays, signals),
    signals,
  };
}
