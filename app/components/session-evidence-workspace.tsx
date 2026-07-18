"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  calculateMasteryDecision,
  ParentReportGenerationSchema,
  SessionEvidenceSchema,
  type AttemptOutcome,
  type MasteryDecision,
  type HonestyGateResult,
  type ParentReportDraft,
  type SessionEvidence,
  type SupportLevel,
} from "@/src/logic";

type SessionEvidenceWorkspaceProps = {
  studentName: string;
  subject: string;
  nextFocus: string;
  initialEvidence: SessionEvidence;
  initialDecision: MasteryDecision;
  initialReport: ParentReportDraft;
  initialHonestyCheck: HonestyGateResult;
};

type RequestState = "idle" | "loading" | "success" | "error";
type CopyState = "idle" | "success" | "error";

type ApiErrorPayload = {
  error?: { message?: string };
};

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null && "error" in value;
}

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
  studentName,
  subject,
  nextFocus,
  initialEvidence,
  initialDecision,
  initialReport,
  initialHonestyCheck,
}: SessionEvidenceWorkspaceProps) {
  const [evidence, setEvidence] = useState(initialEvidence);
  const [decision, setDecision] = useState(initialDecision);
  const [report, setReport] = useState(initialReport);
  const [honestyCheck, setHonestyCheck] = useState(initialHonestyCheck);
  const [reportCheckCurrent, setReportCheckCurrent] = useState(true);
  const [reportState, setReportState] = useState<RequestState>("idle");
  const [reportMessage, setReportMessage] = useState(
    "A safe sample is ready. Generate again after changing the session evidence.",
  );
  const [reportModel, setReportModel] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [message, setMessage] = useState("Synthetic evidence is preloaded. Edit it, then update the decision.");
  const [hasError, setHasError] = useState(false);

  const markEvidenceChanged = () => {
    setHasError(false);
    setMessage("Evidence changed. Update the mastery decision when the session log is ready.");
    setReportState("idle");
    setReportCheckCurrent(false);
    setReportMessage("The current report reflects earlier evidence. Generate a new update when ready.");
    setCopyState("idle");
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report.text);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }
  };

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
    markEvidenceChanged();
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

  const generateReport = async () => {
    const result = SessionEvidenceSchema.safeParse(evidence);

    if (!result.success) {
      setHasError(true);
      setMessage(result.error.issues[0]?.message ?? "Complete every evidence field.");
      setReportState("error");
      setReportMessage("Fix the session evidence before generating a parent update.");
      return;
    }

    const currentDecision = calculateMasteryDecision(result.data);
    setDecision(currentDecision);
    setReportState("loading");
    setReportMessage("GPT-5.6 is drafting an update and the Honesty Gate will check it…");

    try {
      const response = await fetch("/api/parent-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          studentName,
          subject,
          nextFocus,
          evidence: result.data,
          mastery: currentDecision,
        }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          isApiErrorPayload(payload)
            ? payload.error?.message ?? "Unable to generate a parent update."
            : "Unable to generate a parent update.",
        );
      }

      const generation = ParentReportGenerationSchema.safeParse(payload);
      if (!generation.success) {
        throw new Error("The generated report was incomplete. Your last safe report is unchanged.");
      }

      setReport(generation.data.report);
      setHonestyCheck(generation.data.honestyCheck);
      setReportCheckCurrent(true);
      setReportModel(generation.data.model);
      setReportState("success");
      setReportMessage("New report generated and cleared by the Honesty Gate. Review before sending.");
    } catch (error) {
      setReportState("error");
      setReportMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate a parent update. Your last safe report is unchanged.",
      );
    }
  };

  return (
    <>
      <article className="panel evidence-panel" id="session-evidence">
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
                  markEvidenceChanged();
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
                  markEvidenceChanged();
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

      <article className="panel mastery-panel" id="mastery-decision" aria-live="polite">
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

      <article className="panel report-panel" id="parent-report-panel">
        <header className="panel-header">
          <div><span className="panel-index">05</span><h3>Parent update</h3></div>
          <span className={`status ${reportCheckCurrent ? "status-honest" : "status-watch"}`}>
            Honesty Gate {reportCheckCurrent ? "passed" : "review"}
          </span>
        </header>
        <div className="report-body">
          <label className="report-label" htmlFor="parent-report">Editable report</label>
          <textarea
            className="report-editor"
            id="parent-report"
            value={report.text}
            onChange={(event) => {
              setReport((current) => ({ ...current, text: event.target.value }));
              setReportCheckCurrent(false);
              setCopyState("idle");
              setReportMessage("Report edited. Review the wording before sending.");
            }}
            rows={5}
            maxLength={900}
          />
          <div className="report-actions">
            <button
              className="generate-button"
              type="button"
              onClick={generateReport}
              disabled={reportState === "loading"}
            >
              <span aria-hidden="true">{reportState === "loading" ? "···" : "✦"}</span>
              {reportState === "loading" ? "Checking with GPT-5.6" : "Generate parent update"}
            </button>
            <button className="copy-button" type="button" onClick={copyReport}>
              <span aria-hidden="true">⧉</span> Copy parent update
            </button>
            <span>{reportModel ? `Model: ${reportModel}` : "Safe synthetic sample"}</span>
          </div>
          <span className="live-action-note">Optional live GPT-5.6 action · the preloaded report remains available without it</span>
          <p className={`copy-message ${copyState}`} role="status">
            {copyState === "success"
              ? "Parent update copied."
              : copyState === "error"
                ? "Copy was blocked by the browser. Select the editable report to copy it manually."
                : ""}
          </p>
          <p className={`generation-message ${reportState}`} role={reportState === "error" ? "alert" : "status"}>
            {reportMessage}
          </p>
          <div className={`honesty-gate${reportCheckCurrent ? "" : " review"}`}>
            <span className="proof-icon" aria-hidden="true">✓</span>
            <div>
              <strong>Honesty Gate: {reportCheckCurrent ? "passed" : "review needed"}</strong>
              <p>
                {reportCheckCurrent
                  ? honestyCheck.reason
                  : "This wording or its source evidence changed after the last check. Generate again to re-run the gate."}
              </p>
              <ul aria-label="Evidence used by the report">
                {honestyCheck.evidenceReferences.map((reference) => (
                  <li key={reference.attemptId}>
                    <span>{reference.attemptId.replace("practice-", "Attempt ")}</span>
                    {reference.observation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
