import type { EvidenceBenchmarkReport } from "@/src/logic";

type EvidenceBenchmarkProps = {
  report: EvidenceBenchmarkReport;
};

function formatExecutionTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function EvidenceBenchmark({ report }: EvidenceBenchmarkProps) {
  return (
    <section className="benchmark-section" id="benchmark" aria-labelledby="benchmark-heading">
      <div className="benchmark-heading">
        <div>
          <p className="eyebrow">Fresh regression proof</p>
          <h2 id="benchmark-heading">
            {report.passedCount}/{report.totalCount} evidence integrity checks passed.
          </h2>
        </div>
        <div className="benchmark-score" aria-label={`${report.passedCount} of ${report.totalCount} checks passed`}>
          <strong>{report.passedCount}/{report.totalCount}</strong>
          <span>Measured, not claimed</span>
        </div>
      </div>

      <p className="benchmark-intro">
        Twelve synthetic adversarial fixtures run against the same mastery, Honesty Gate, and
        next-session functions used by the demo. No model call or API key is involved. This is a
        product regression benchmark—not a claim of validated learning efficacy.
      </p>

      <div className="benchmark-categories">
        {report.categories.map((category) => (
          <div key={category.category}>
            <span>{category.category}</span>
            <strong>{category.passedCount}/{category.totalCount}</strong>
          </div>
        ))}
      </div>

      <div className="benchmark-cases">
        {report.categories.map((category) => (
          <details key={category.category} open>
            <summary>
              <span>{category.category}</span>
              <strong>{category.passedCount}/{category.totalCount} passed</strong>
            </summary>
            <ol>
              {report.results
                .filter((result) => result.category === category.category)
                .map((result) => (
                  <li key={result.id}>
                    <span className={`benchmark-check ${result.passed ? "passed" : "failed"}`} aria-hidden="true">
                      {result.passed ? "✓" : "!"}
                    </span>
                    <div>
                      <strong>{result.name}</strong>
                      <p><b>Expected:</b> {result.expected}</p>
                      <p><b>Observed:</b> {result.observed}</p>
                    </div>
                  </li>
                ))}
            </ol>
          </details>
        ))}
      </div>

      <div className="benchmark-meta">
        <span>Benchmark v{report.benchmarkVersion}</span>
        <span>Fixture set {report.fixtureSet}</span>
        <span>Executed {formatExecutionTime(report.executedAt)} UTC</span>
        <code>pnpm benchmark</code>
      </div>
    </section>
  );
}
