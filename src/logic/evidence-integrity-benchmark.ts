import { z } from "zod";
import { honestyGateCheck } from "./honesty-gate";
import { calculateMasteryDecision, classifyMasteryScore, type SessionEvidence } from "./mastery";
import { deriveNextSessionBrief, NextSessionBriefSchema } from "./next-session-brief";
import type { ParentReportDraft, ParentReportRequest } from "./parent-report";
import { tuesdayScenario } from "./tuesday-scenario";

export const EVIDENCE_BENCHMARK_VERSION = "1.0.0";
export const EVIDENCE_BENCHMARK_FIXTURE_SET = "2026-07-18";

export const EvidenceBenchmarkCategorySchema = z.enum([
  "Mastery scheduling",
  "Report integrity",
  "Closed-loop provenance",
]);

export type EvidenceBenchmarkCategory = z.infer<typeof EvidenceBenchmarkCategorySchema>;

export const EvidenceBenchmarkResultSchema = z.object({
  id: z.string().min(1),
  category: EvidenceBenchmarkCategorySchema,
  name: z.string().min(1),
  expected: z.string().min(1),
  observed: z.string().min(1),
  passed: z.boolean(),
});

export type EvidenceBenchmarkResult = z.infer<typeof EvidenceBenchmarkResultSchema>;

export const EvidenceBenchmarkReportSchema = z.object({
  benchmarkVersion: z.string().min(1),
  fixtureSet: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  executedAt: z.string().datetime(),
  passed: z.boolean(),
  passedCount: z.number().int().nonnegative(),
  totalCount: z.number().int().positive(),
  categories: z.array(
    z.object({
      category: EvidenceBenchmarkCategorySchema,
      passedCount: z.number().int().nonnegative(),
      totalCount: z.number().int().positive(),
    }),
  ),
  results: z.array(EvidenceBenchmarkResultSchema).min(1),
});

export type EvidenceBenchmarkReport = z.infer<typeof EvidenceBenchmarkReportSchema>;

type BenchmarkObservation = {
  passed: boolean;
  observed: string;
};

type EvidenceBenchmarkCase = Omit<EvidenceBenchmarkResult, "observed" | "passed"> & {
  evaluate: () => BenchmarkObservation;
};

const baseAttempt = tuesdayScenario.evidence.attempts[0];
const baseEvidence: SessionEvidence = {
  topic: "Unlike denominators",
  reviewedOn: "2026-07-14",
  attempts: [baseAttempt],
};
const mastery = calculateMasteryDecision(tuesdayScenario.evidence);
const reportContext: ParentReportRequest = {
  studentName: tuesdayScenario.student.name,
  subject: tuesdayScenario.student.subject,
  nextFocus: tuesdayScenario.session.currentFocus,
  evidence: tuesdayScenario.evidence,
  mastery,
};
const groundedReport = tuesdayScenario.parentReport;
const briefInput = {
  studentName: tuesdayScenario.student.name,
  subject: tuesdayScenario.student.subject,
  studentLevel: tuesdayScenario.student.level,
  nextFocus: tuesdayScenario.session.currentFocus,
  evidence: tuesdayScenario.evidence,
};

function checkReport(draft: Partial<ParentReportDraft>) {
  return honestyGateCheck({ ...groundedReport, ...draft }, reportContext);
}

export const evidenceIntegrityBenchmarkCases: readonly EvidenceBenchmarkCase[] = [
  {
    id: "mastery-secure-boundary",
    category: "Mastery scheduling",
    name: "Secure starts at the 80% boundary",
    expected: "80% → Secure, review in 14 days",
    evaluate: () => {
      const result = classifyMasteryScore(80);
      return {
        passed: result.status === "Secure" && result.intervalDays === 14,
        observed: `80% → ${result.status}, review in ${result.intervalDays} days`,
      };
    },
  },
  {
    id: "mastery-decline-override",
    category: "Mastery scheduling",
    name: "Declining attempts override the average",
    expected: "Decline signal → Needs reinforcement, review in 3 days",
    evaluate: () => {
      const decision = calculateMasteryDecision({
        ...baseEvidence,
        attempts: [
          { ...baseAttempt, id: "decline-1", outcome: "correct", support: "independent" },
          { ...baseAttempt, id: "decline-2", outcome: "partial", support: "independent" },
          { ...baseAttempt, id: "decline-3", outcome: "incorrect", support: "prompted" },
        ],
      });
      return {
        passed:
          decision.signals.declining &&
          decision.status === "Needs reinforcement" &&
          decision.intervalDays === 3,
        observed: `Decline ${decision.signals.declining ? "detected" : "missed"} → ${decision.status}, review in ${decision.intervalDays} days`,
      };
    },
  },
  {
    id: "mastery-independent-miss",
    category: "Mastery scheduling",
    name: "A strong average cannot hide an independent miss",
    expected: "83% with independent miss → Needs reinforcement, review in 3 days",
    evaluate: () => {
      const decision = calculateMasteryDecision({
        ...baseEvidence,
        attempts: [
          ...Array.from({ length: 5 }, (_, index) => ({
            ...baseAttempt,
            id: `strong-${index + 1}`,
            outcome: "correct" as const,
            support: "independent" as const,
          })),
          {
            ...baseAttempt,
            id: "independent-miss",
            outcome: "incorrect",
            support: "independent",
          },
        ],
      });
      return {
        passed:
          decision.score === 83 &&
          decision.signals.independentMiss &&
          decision.status === "Needs reinforcement" &&
          decision.intervalDays === 3,
        observed: `${decision.score}% with independent miss ${decision.signals.independentMiss ? "detected" : "missed"} → ${decision.status}, review in ${decision.intervalDays} days`,
      };
    },
  },
  {
    id: "mastery-invalid-evidence",
    category: "Mastery scheduling",
    name: "Invalid session evidence is rejected",
    expected: "Impossible date and empty observation → rejected before scoring",
    evaluate: () => {
      try {
        calculateMasteryDecision({
          ...baseEvidence,
          reviewedOn: "2026-02-30",
          attempts: [{ ...baseAttempt, observation: "" }],
        });
        return { passed: false, observed: "Invalid evidence was scored" };
      } catch (error) {
        const rejected = error instanceof z.ZodError;
        return {
          passed: rejected,
          observed: rejected ? "Invalid evidence rejected by schema" : "Unexpected error type",
        };
      }
    },
  },
  {
    id: "report-invented-citation",
    category: "Report integrity",
    name: "Invented evidence citations are blocked",
    expected: "Unknown attempt ID → Honesty Gate blocked",
    evaluate: () => {
      const result = checkReport({ referencedAttemptIds: ["invented-attempt"] });
      return {
        passed: !result.passed && result.reason.includes("not present"),
        observed: `${result.passed ? "Passed" : "Blocked"}: ${result.reason}`,
      };
    },
  },
  {
    id: "report-generic-praise",
    category: "Report integrity",
    name: "Generic praise cannot replace evidence",
    expected: "Generic praise → Honesty Gate blocked",
    evaluate: () => {
      const result = checkReport({
        text: "Maya did great today and should keep up the good work. We reviewed fractions together and will return to unlike denominators during the next lesson for another round of practice.",
      });
      return {
        passed: !result.passed && result.reason.includes("generic praise"),
        observed: `${result.passed ? "Passed" : "Blocked"}: ${result.reason}`,
      };
    },
  },
  {
    id: "report-softened-status",
    category: "Report integrity",
    name: "Non-secure mastery cannot be softened",
    expected: "“On track” for non-secure evidence → Honesty Gate blocked",
    evaluate: () => {
      const result = checkReport({
        text: "Maya is on track. She needed support on the final independent fraction attempt, so we will practise choosing a common denominator again when the topic returns in three days.",
      });
      return {
        passed: !result.passed && result.reason.includes("misleading reassurance"),
        observed: `${result.passed ? "Passed" : "Blocked"}: ${result.reason}`,
      };
    },
  },
  {
    id: "report-missing-difficulty",
    category: "Report integrity",
    name: "A difficult attempt must be acknowledged",
    expected: "Non-secure report without difficult source → Honesty Gate blocked",
    evaluate: () => {
      const result = checkReport({ referencedAttemptIds: ["practice-3"] });
      return {
        passed: !result.passed && result.reason.includes("difficult attempt"),
        observed: `${result.passed ? "Passed" : "Blocked"}: ${result.reason}`,
      };
    },
  },
  {
    id: "brief-source-provenance",
    category: "Closed-loop provenance",
    name: "The latest difficulty becomes the review target",
    expected: "Attempt 4 target + Attempt 3 breakthrough → carried forward verbatim",
    evaluate: () => {
      const brief = deriveNextSessionBrief(briefInput);
      const roles = brief.evidenceSources.map(
        (source) => `${source.role}: ${source.attemptId}`,
      );
      const observationsMatch = brief.evidenceSources.every((source) =>
        briefInput.evidence.attempts.some(
          (attempt) => attempt.id === source.attemptId && attempt.observation === source.observation,
        ),
      );
      return {
        passed:
          observationsMatch &&
          roles[0] === "Review target: practice-4" &&
          roles[1] === "Breakthrough: practice-3",
        observed: `${roles.join("; ")}; observations ${observationsMatch ? "match" : "changed"}`,
      };
    },
  },
  {
    id: "brief-support-differentiation",
    category: "Closed-loop provenance",
    name: "Supported success receives a developing progression",
    expected: "Modeled success → Developing; Prompt → independent → stretch",
    evaluate: () => {
      const brief = deriveNextSessionBrief({
        ...briefInput,
        evidence: {
          ...briefInput.evidence,
          attempts: [
            {
              ...baseAttempt,
              id: "modeled-success",
              outcome: "correct",
              support: "modeled",
            },
          ],
        },
      });
      return {
        passed:
          brief.decision.status === "Developing" &&
          brief.supportPlan.label === "Prompt → independent → stretch",
        observed: `${brief.decision.status}; ${brief.supportPlan.label}`,
      };
    },
  },
  {
    id: "brief-secure-fallback",
    category: "Closed-loop provenance",
    name: "Secure evidence still keeps a traceable retrieval source",
    expected: "All independent correct → Secure; latest attempt retained; 14-day review",
    evaluate: () => {
      const evidence = {
        ...briefInput.evidence,
        attempts: briefInput.evidence.attempts.map((attempt) => ({
          ...attempt,
          outcome: "correct" as const,
          support: "independent" as const,
        })),
      };
      const brief = deriveNextSessionBrief({ ...briefInput, evidence });
      return {
        passed:
          brief.decision.status === "Secure" &&
          brief.decision.intervalDays === 14 &&
          brief.evidenceSources[0]?.attemptId === "practice-4",
        observed: `${brief.decision.status}; ${brief.decision.intervalDays}-day review; source ${brief.evidenceSources[0]?.attemptId ?? "missing"}`,
      };
    },
  },
  {
    id: "brief-validated-context",
    category: "Closed-loop provenance",
    name: "The next lesson receives validated evidence-derived context",
    expected: "Brief schema valid; API context cites Attempt 4 observation",
    evaluate: () => {
      const brief = deriveNextSessionBrief(briefInput);
      const schemaValid = NextSessionBriefSchema.safeParse(brief).success;
      const sourceObservation = briefInput.evidence.attempts.find(
        (attempt) => attempt.id === "practice-4",
      )?.observation;
      const contextGrounded = brief.lessonPlanContext.strugglingWith === sourceObservation;
      return {
        passed: schemaValid && contextGrounded,
        observed: `Schema ${schemaValid ? "valid" : "invalid"}; lesson context ${contextGrounded ? "grounded in Attempt 4" : "lost provenance"}`,
      };
    },
  },
];

export function summarizeEvidenceBenchmarkResults(
  results: EvidenceBenchmarkResult[],
  executedAt = new Date(),
): EvidenceBenchmarkReport {
  const categories = EvidenceBenchmarkCategorySchema.options.map((category) => {
    const categoryResults = results.filter((result) => result.category === category);
    return {
      category,
      passedCount: categoryResults.filter((result) => result.passed).length,
      totalCount: categoryResults.length,
    };
  });
  const passedCount = results.filter((result) => result.passed).length;

  return EvidenceBenchmarkReportSchema.parse({
    benchmarkVersion: EVIDENCE_BENCHMARK_VERSION,
    fixtureSet: EVIDENCE_BENCHMARK_FIXTURE_SET,
    executedAt: executedAt.toISOString(),
    passed: passedCount === results.length,
    passedCount,
    totalCount: results.length,
    categories,
    results,
  });
}

export function runEvidenceIntegrityBenchmark(executedAt = new Date()): EvidenceBenchmarkReport {
  const results = evidenceIntegrityBenchmarkCases.map((benchmarkCase) => {
    try {
      const observation = benchmarkCase.evaluate();
      return EvidenceBenchmarkResultSchema.parse({
        id: benchmarkCase.id,
        category: benchmarkCase.category,
        name: benchmarkCase.name,
        expected: benchmarkCase.expected,
        ...observation,
      });
    } catch (error) {
      return EvidenceBenchmarkResultSchema.parse({
        id: benchmarkCase.id,
        category: benchmarkCase.category,
        name: benchmarkCase.name,
        expected: benchmarkCase.expected,
        observed: error instanceof Error ? `Threw ${error.name}: ${error.message}` : "Threw an unknown error",
        passed: false,
      });
    }
  });

  return summarizeEvidenceBenchmarkResults(results, executedAt);
}

export function formatEvidenceBenchmarkReport(report: EvidenceBenchmarkReport) {
  const categoryLines = report.categories.map(
    (category) => `  ${category.passedCount}/${category.totalCount} ${category.category}`,
  );
  const caseLines = report.results.map(
    (result) => `  ${result.passed ? "PASS" : "FAIL"} ${result.id} — ${result.observed}`,
  );

  return [
    `TutorOS Evidence Integrity Benchmark v${report.benchmarkVersion}`,
    `${report.passedCount}/${report.totalCount} cases passed`,
    ...categoryLines,
    ...caseLines,
  ].join("\n");
}
