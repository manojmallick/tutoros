import type {
  EvidenceReference,
  HonestyGateResult,
  ParentReportDraft,
  ParentReportRequest,
} from "./parent-report";

const genericPraisePatterns = [
  /\b(did|worked) (great|amazing|wonderful)\b/i,
  /\bkeep up the good work\b/i,
  /^\s*(great|nice|good) (job|session)!?\s*$/i,
];

const softenedStrugglePatterns = [
  /\bon track\b/i,
  /\b(has|have) (fully )?mastered\b/i,
  /\bno concerns?\b/i,
];

const honestDifficultyPatterns = [
  /\b(struggl|difficult|hard|support|prompt|not yet|still|incorrect|mistake|became harder)\w*\b/i,
];

export type HonestyGateFailure = {
  passed: false;
  reason: string;
  evidenceReferences: EvidenceReference[];
};

export type HonestyGateCheck = HonestyGateResult | HonestyGateFailure;

export function honestyGateCheck(
  draft: ParentReportDraft,
  context: ParentReportRequest,
): HonestyGateCheck {
  const attemptById = new Map(
    context.evidence.attempts.map((attempt) => [attempt.id, attempt]),
  );
  const uniqueIds = [...new Set(draft.referencedAttemptIds)];
  const evidenceReferences = uniqueIds.flatMap((attemptId) => {
    const attempt = attemptById.get(attemptId);
    return attempt ? [{ attemptId, observation: attempt.observation }] : [];
  });

  if (evidenceReferences.length !== uniqueIds.length) {
    return {
      passed: false,
      reason: "The report cited evidence that is not present in this session.",
      evidenceReferences,
    };
  }

  if (genericPraisePatterns.some((pattern) => pattern.test(draft.text))) {
    return {
      passed: false,
      reason: "The report uses generic praise instead of a specific session detail.",
      evidenceReferences,
    };
  }

  if (context.mastery.status !== "Secure") {
    if (softenedStrugglePatterns.some((pattern) => pattern.test(draft.text))) {
      return {
        passed: false,
        reason: "The report softens a non-secure mastery decision into misleading reassurance.",
        evidenceReferences,
      };
    }

    const referencesDifficulty = uniqueIds.some((attemptId) => {
      const attempt = attemptById.get(attemptId);
      return attempt?.outcome === "partial" || attempt?.outcome === "incorrect";
    });

    if (!referencesDifficulty || !honestDifficultyPatterns.some((pattern) => pattern.test(draft.text))) {
      return {
        passed: false,
        reason: "A non-secure report must cite and plainly acknowledge a difficult attempt.",
        evidenceReferences,
      };
    }
  }

  return {
    passed: true,
    reason: "Passed — this report cites recorded session evidence and preserves the mastery decision.",
    evidenceReferences,
  };
}
