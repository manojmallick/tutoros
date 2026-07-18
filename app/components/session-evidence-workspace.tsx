"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  calculateMasteryDecision,
  SessionEvidenceSchema,
  type AttemptOutcome,
  type MasteryDecision,
  type SessionEvidence,
  type SupportLevel,
} from "@/src/logic";

type SessionEvidenceWorkspaceProps = {
  initialEvidence: SessionEvidence;
  initialDecision: MasteryDecision;
};

const outcomeLabels: Record<AttemptOutcome, string> = {
  correct: "Correct",
  partial: "Partly correct",
  incorrect: "Incorrect",
};

const supportLabels: Record<SupportLevel, string> = {
  independent: "Independent",
  prompted: "Prompted",
  modeled: "Modeled",
};

export function SessionEvidenceWorkspace({
  initialEvidence,
  initialDecision,
}: SessionEvidenceWorkspaceProps) {
  const [evidence, setEvidence] = useState(initialEvidence);
  const [decision, setDecision] = useState(initialDecision);
  const [message, setMessage] = useState("Synthetic evidence is preloaded. Edit it, then update the decision.");
  const [hasError, setHasError] = useState(false);

  const updateAttempt = (
    index: number,
    field: "outcome" | "support" | "observation",
    value: string,
  ) => {
    setEvidence((current) => ({
      ...current,
      attempts: current.attempts.map((attempt, attemptIndex) =>
        attemptIndex === index ? { ...attempt, [field]: value } : attempt,
      ),
    }));
    setHasError(false);
    setMessage("Evidence changed. Update the mastery decision when the session log is ready.");
  };

  const updateDecision = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = SessionEvidenceSchema.safeParse(evidence);

    if (!result.success) {
      setHasError(true);
      setMessage(result.error.issues[0]?.message ?? "Complete every evidence field.");
      return;
    }

    setDecision(calculateMasteryDecision(result.data));
    setHasError(false);
    setMessage("Mastery decision updated from the recorded evidence.");
  };

  return (
    <>
      <article className="panel evidence-panel">
        <header className="panel-header">
          <div><span className="panel-index">03</span><h3>Session evidence</h3></div>
          <span className="status status-neutral">Editable log</span>
        </header>
        <form className="evidence-form" onSubmit={updateDecision} noValidate>
          <div className="evidence-meta">
            <label>
              Topic
              <input
                value={evidence.topic}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setEvidence((current) => ({ ...current, topic: event.target.value }));
                  setMessage("Evidence changed. Update the mastery decision when the session log is ready.");
                }}
              />
            </label>
            <label>
              Reviewed on
              <input
                type="date"
                value={evidence.reviewedOn}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setEvidence((current) => ({ ...current, reviewedOn: event.target.value }));
                  setMessage("Evidence changed. Update the mastery decision when the session log is ready.");
                }}
              />
            </label>
          </div>

          <div className="attempt-list">
            {evidence.attempts.map((attempt, index) => (
              <fieldset className="attempt-card" key={attempt.id}>
                <legend>Attempt {index + 1}</legend>
                <p>{attempt.prompt}</p>
                <div className="attempt-controls">
                  <label>
                    Outcome
                    <select
                      aria-label={`Attempt ${index + 1} outcome`}
                      value={attempt.outcome}
                      onChange={(event) => updateAttempt(index, "outcome", event.target.value)}
                    >
                      {Object.entries(outcomeLabels).map(([value, label]) => (
                        <option value={value} key={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Support
                    <select
                      aria-label={`Attempt ${index + 1} support`}
                      value={attempt.support}
                      onChange={(event) => updateAttempt(index, "support", event.target.value)}
                    >
                      {Object.entries(supportLabels).map(([value, label]) => (
                        <option value={value} key={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Observation
                  <textarea
                    aria-label={`Attempt ${index + 1} observation`}
                    value={attempt.observation}
                    onChange={(event) => updateAttempt(index, "observation", event.target.value)}
                    rows={2}
                    maxLength={400}
                  />
                </label>
              </fieldset>
            ))}
          </div>

          <button className="generate-button" type="submit">
            <span aria-hidden="true">↻</span> Update mastery decision
          </button>
          <p className={`evidence-message${hasError ? " error" : ""}`} role={hasError ? "alert" : "status"}>
            {message}
          </p>
        </form>
      </article>

      <article className="panel mastery-panel" aria-live="polite">
        <header className="panel-header">
          <div><span className="panel-index">04</span><h3>Mastery decision</h3></div>
          <span className={`status ${decision.status === "Secure" ? "status-ready" : "status-watch"}`}>
            {decision.status === "Secure" ? "Secure" : "Review"}
          </span>
        </header>
        <div className="mastery-score">
          <div className="score-ring" style={{ "--score": `${decision.score * 3.6}deg` } as React.CSSProperties}>
            <span><strong>{decision.score}%</strong><small>evidence</small></span>
          </div>
          <div className="mastery-copy">
            <span className="mini-label">{decision.topic}</span>
            <strong>{decision.status}</strong>
            <p>{decision.reason}</p>
          </div>
        </div>
        <div className="review-callout">
          <span>↻</span>
          <div>
            <strong>Review on {decision.nextReviewDate}</strong>
            <p>{decision.intervalDays}-day interval · transparent TutorOS heuristic</p>
          </div>
        </div>
      </article>
    </>
  );
}
