import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy and data handling — TutorOS",
  description: "How the public TutorOS deployment candidate handles synthetic demo data and optional AI generation.",
};

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <nav className="site-nav" aria-label="Privacy navigation">
        <Link className="brand" href="/" aria-label="TutorOS home">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>TutorOS</span>
        </Link>
        <Link className="nav-link" href="/">Return to demo</Link>
      </nav>

      <article className="policy-article">
        <p className="eyebrow">Deployment candidate · public demo</p>
        <h1>Privacy and data handling</h1>
        <p className="policy-intro">
          TutorOS is presented with synthetic learner data so the complete evidence workflow can
          be evaluated without exposing a real student.
        </p>

        <section>
          <h2>Use synthetic data only</h2>
          <p>
            The preloaded Maya scenario is fictional. Do not enter names, contact details,
            school records, health information, or any other personal data about a real student
            or minor into this public deployment candidate.
          </p>
        </section>

        <section>
          <h2>No TutorOS persistence</h2>
          <p>
            This version has no account, database, analytics tracker, or application storage.
            Edits remain in the current browser session and reset when the demo is reloaded.
          </p>
        </section>

        <section>
          <h2>Optional OpenAI generation</h2>
          <p>
            The credential-free sample, mastery decisions, trajectory, benchmark, next-session
            brief, Honesty Gate, and tutor sign-off run without a model call. If a spark-marked
            generation action is selected, the tutoring context entered for that action is sent
            from the TutorOS server to OpenAI to produce the requested plan or parent-report draft.
          </p>
        </section>

        <section>
          <h2>Human review remains required</h2>
          <p>
            Generated drafts are not automatically sent anywhere. The tutor can edit the wording,
            must pass the Honesty Gate, and must sign off the current evidence packet before the
            parent update can be copied.
          </p>
        </section>

        <div className="policy-callout">
          <strong>Deployment status</strong>
          <p>
            v0.9.0 is a deployment candidate. Operators should configure the canonical HTTPS URL,
            verify <code>/api/health</code>, and review this notice before publishing.
          </p>
        </div>
      </article>
    </main>
  );
}
