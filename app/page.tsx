import {
  calculateMasteryDecision,
  deriveNextSessionBrief,
  honestyGateCheck,
  runEvidenceIntegrityBenchmark,
  tuesdayScenario,
  workflowStages,
} from "@/src/logic";
import { DemoWorkspace } from "@/app/components/demo-workspace";
import { EvidenceBenchmark } from "@/app/components/evidence-benchmark";

export default function Home() {
  const scenario = tuesdayScenario;
  const mastery = calculateMasteryDecision(scenario.evidence);
  const nextSessionBrief = deriveNextSessionBrief({
    studentName: scenario.student.name,
    subject: scenario.student.subject,
    studentLevel: scenario.student.level,
    nextFocus: scenario.session.currentFocus,
    evidence: scenario.evidence,
  });
  const honestyCheck = honestyGateCheck(scenario.parentReport, {
    studentName: scenario.student.name,
    subject: scenario.student.subject,
    nextFocus: scenario.session.currentFocus,
    evidence: scenario.evidence,
    mastery,
  });
  const benchmark = runEvidenceIntegrityBenchmark();

  if (!honestyCheck.passed) {
    throw new Error(`Synthetic parent report failed the Honesty Gate: ${honestyCheck.reason}`);
  }

  if (!benchmark.passed) {
    throw new Error(
      `Evidence Integrity Benchmark failed: ${benchmark.passedCount}/${benchmark.totalCount} passed.`,
    );
  }

  return (
    <main>
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="TutorOS home">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>TutorOS</span>
        </a>
        <div className="nav-actions">
          <span className="demo-chip"><span aria-hidden="true" /> Synthetic demo</span>
          <a className="nav-link" href="#demo-path">Start 90-second demo</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Built by a tutor, for the work after every lesson</p>
          <h1>What happened today should shape what happens next.</h1>
          <p className="hero-intro">
            TutorOS turns real session evidence into a focused lesson plan, a clear mastery
            decision, and a parent update that actually says something.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#demo-path">Start 90-second demo</a>
            <a className="text-link" href="#benchmark">See the 12/12 benchmark <span>→</span></a>
          </div>
          <div className="trust-row" aria-label="Product principles">
            <span>No login</span>
            <span>No real student data</span>
            <span>Evidence before praise</span>
          </div>
        </div>

        <aside className="brief-card artifact-card" aria-label="Evidence-grounded parent update">
          <div className="brief-topline">
            <span>The final artifact</span>
            <span className="live-dot">Honesty Gate passed</span>
          </div>
          <div className="student-row">
            <span className="avatar">{scenario.student.initials}</span>
            <div>
              <strong>{scenario.student.name}</strong>
              <span>{scenario.student.level} · {scenario.student.subject}</span>
            </div>
          </div>
          <blockquote>{scenario.parentReport.text}</blockquote>
          <div className="artifact-proof">
            <span aria-hidden="true">✓</span>
            <p>Cites Attempt 3&apos;s breakthrough and Attempt 4&apos;s recorded difficulty.</p>
          </div>
          <div className="brief-footer">
            <div><span>Mastery</span><strong>{mastery.score}%</strong></div>
            <div><span>Review</span><strong>In {mastery.intervalDays} days</strong></div>
            <div><span>Sources</span><strong>{scenario.parentReport.referencedAttemptIds.length} attempts</strong></div>
          </div>
        </aside>
      </section>

      <section className="process-section" id="how-it-works" aria-labelledby="process-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">One connected workflow</p>
            <h2 id="process-heading">From context to an honest update.</h2>
          </div>
          <p>Each output is connected to what the tutor actually observed—not an isolated AI generation.</p>
        </div>
        <ol className="process-grid">
          {workflowStages.map((stage) => (
            <li key={stage.id}>
              <span className="step-number">{stage.number}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <EvidenceBenchmark report={benchmark} />

      <section className="workspace-section" id="workspace" aria-labelledby="workspace-heading">
        <div className="workspace-heading">
          <div>
            <div className="workspace-kicker">
              <span className="avatar avatar-small">{scenario.student.initials}</span>
              <div><span>Tuesday workspace</span><strong>{scenario.student.name} · {scenario.student.subject}</strong></div>
            </div>
            <h2 id="workspace-heading">A tutoring session, made visible.</h2>
          </div>
          <span className="synthetic-notice">Synthetic student data</span>
        </div>

        <DemoWorkspace
          studentName={scenario.student.name}
          subject={scenario.student.subject}
          studentLevel={scenario.student.level}
          nextFocus={scenario.session.currentFocus}
          initialContext={{
            subject: scenario.student.subject,
            studentLevel: scenario.student.level,
            lastSessionTopic: scenario.session.lastTopic,
            sessionGoal: scenario.session.currentFocus,
            strugglingWith: scenario.session.currentStruggle,
          }}
          initialPlan={scenario.lessonPlan}
          initialEvidence={scenario.evidence}
          initialDecision={mastery}
          initialReport={scenario.parentReport}
          initialHonestyCheck={honestyCheck}
          initialNextSessionBrief={nextSessionBrief}
        />
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true">T</span><span>TutorOS</span></a>
        <p>A runnable foundation for tutoring that follows the evidence.</p>
        <span>v0.7.0 · Evidence Integrity Benchmark</span>
      </footer>
    </main>
  );
}
