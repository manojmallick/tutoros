import { describe, expect, it } from "vitest";
import {
  evidenceIntegrityBenchmarkCases,
  formatEvidenceBenchmarkReport,
  runEvidenceIntegrityBenchmark,
  summarizeEvidenceBenchmarkResults,
} from "./evidence-integrity-benchmark";

describe("Evidence Integrity Benchmark", () => {
  it("passes all 12 named production-logic cases", () => {
    const report = runEvidenceIntegrityBenchmark(new Date("2026-07-18T12:00:00.000Z"));

    if (process.env.TUTOROS_BENCHMARK_REPORT === "1") {
      console.log(`\n${formatEvidenceBenchmarkReport(report)}\n`);
    }

    expect(evidenceIntegrityBenchmarkCases).toHaveLength(12);
    expect(report.totalCount).toBe(12);
    expect(report.passedCount).toBe(12);
    expect(report.passed).toBe(true);
    expect(report.categories).toEqual([
      { category: "Mastery scheduling", passedCount: 4, totalCount: 4 },
      { category: "Report integrity", passedCount: 4, totalCount: 4 },
      { category: "Closed-loop provenance", passedCount: 4, totalCount: 4 },
    ]);
  });

  it("derives totals and failure state from case results", () => {
    const passingReport = runEvidenceIntegrityBenchmark(new Date("2026-07-18T12:00:00.000Z"));
    const resultsWithFailure = passingReport.results.map((result, index) =>
      index === 0 ? { ...result, passed: false, observed: "Deliberate regression" } : result,
    );
    const summary = summarizeEvidenceBenchmarkResults(
      resultsWithFailure,
      new Date("2026-07-18T12:00:00.000Z"),
    );

    expect(summary.passed).toBe(false);
    expect(summary.passedCount).toBe(11);
    expect(summary.categories[0]).toEqual({
      category: "Mastery scheduling",
      passedCount: 3,
      totalCount: 4,
    });
  });
});
