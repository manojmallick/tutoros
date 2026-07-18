import { tuesdayScenario, workflowStages } from "@/src/logic";
import { LessonPlanWorkspace } from "@/app/components/lesson-plan-workspace";

export default function Home() {
  const scenario = tuesdayScenario;

  return (
    <main>
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="TutorOS home">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>TutorOS</span>
        </a>
        <div className="nav-actions">
          <span className="demo-chip"><span aria-hidden="true" /> Synthetic demo</span>
          <a className="nav-link" href="#workspace">Open workspace</a>
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
            <a className="button button-primary" href="#workspace">Explore Maya&apos;s Tuesday</a>
            <a className="text-link" href="#how-it-works">See the evidence chain <span>→</span></a>
          </div>
          <div className="trust-row" aria-label="Product principles">
            <span>No login</span>
            <span>No real student data</span>
            <span>Evidence before praise</span>
          </div>
        </div>

        <aside className="brief-card" aria-label="Next session brief">
          <div className="brief-topline">
            <span>Next session brief</span>
            <span className="live-dot">Ready</span>
          </div>
          <div className="student-row">
            <span className="avatar">{scenario.student.initials}</span>
            <div>
              <strong>{scenario.student.name}</strong>
              <span>{scenario.student.level} · {scenario.student.subject}</span>
            </div>
          </div>
          <div className="focus-block">
            <span className="mini-label">Focus</span>
            <strong>{scenario.session.currentFocus}</strong>
            <p>{scenario.session.currentStruggle}</p>
          </div>
          <div className="brief-footer">
            <div><span>Session</span><strong>{scenario.session.durationMinutes} min</strong></div>
            <div><span>Review</span><strong>In 3 days</strong></div>
            <div><span>Evidence</span><strong>{scenario.evidence.length} moments</strong></div>
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

        <div className="workspace-grid">
          <LessonPlanWorkspace
            initialContext={{
              subject: scenario.student.subject,
              studentLevel: scenario.student.level,
              lastSessionTopic: scenario.session.lastTopic,
              sessionGoal: scenario.session.currentFocus,
              strugglingWith: scenario.session.currentStruggle,
            }}
            initialPlan={scenario.lessonPlan}
          />

          <article className="panel evidence-panel">
            <header className="panel-header">
              <div><span className="panel-index">03</span><h3>Session evidence</h3></div>
              <span className="status status-neutral">Observed</span>
            </header>
            <div className="evidence-list">
              {scenario.evidence.map((item) => (
                <div className={`evidence-item ${item.tone}`} key={item.label}>
                  <span className="evidence-icon" aria-hidden="true">{item.tone === "positive" ? "✓" : "!"}</span>
                  <div><strong>{item.label}</strong><p>{item.observation}</p></div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel mastery-panel">
            <header className="panel-header">
              <div><span className="panel-index">04</span><h3>Mastery decision</h3></div>
              <span className="status status-watch">Review</span>
            </header>
            <div className="mastery-score">
              <div className="score-ring" style={{ "--score": `${scenario.mastery.score * 3.6}deg` } as React.CSSProperties}>
                <span><strong>{scenario.mastery.score}%</strong><small>confidence</small></span>
              </div>
              <div className="mastery-copy">
                <span className="mini-label">{scenario.mastery.topic}</span>
                <strong>{scenario.mastery.status}</strong>
                <p>{scenario.mastery.reason}</p>
              </div>
            </div>
            <div className="review-callout"><span>↻</span><div><strong>{scenario.mastery.nextReview}</strong><p>Bring this topic into the opening warm-up.</p></div></div>
          </article>

          <article className="panel report-panel">
            <header className="panel-header">
              <div><span className="panel-index">05</span><h3>Parent update</h3></div>
              <span className="status status-honest">Evidence grounded</span>
            </header>
            <div className="report-body">
              <span className="quote-mark" aria-hidden="true">“</span>
              <blockquote>{scenario.parentReport}</blockquote>
              <div className="report-proof">
                <span className="proof-icon" aria-hidden="true">✓</span>
                <div><strong>Grounded in {scenario.evidence.length} session observations</strong><span>No generic praise. No softened struggle.</span></div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true">T</span><span>TutorOS</span></a>
        <p>A runnable foundation for tutoring that follows the evidence.</p>
        <span>v0.2.0 · GPT-5.6 lesson planning</span>
      </footer>
    </main>
  );
}
