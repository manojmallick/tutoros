"use client";

import { useState } from "react";
import {
  GenerationSourceSchema,
  LessonPlanSchema,
  type GenerationSource,
  type LessonPlan,
  type NextSessionBrief,
} from "@/src/logic";

type NextSessionBriefPanelProps = {
  brief: NextSessionBrief;
  isCurrent: boolean;
};

type GenerationState = "idle" | "loading" | "success" | "error";

type ApiErrorPayload = {
  error?: { message?: string };
};

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null && "error" in value;
}

export function NextSessionBriefPanel({ brief, isCurrent }: NextSessionBriefPanelProps) {
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [source, setSource] = useState<GenerationSource | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [message, setMessage] = useState(
    "The next teaching move is ready without a model call.",
  );

  const generateNextPlan = async () => {
    setGenerationState("loading");
    setMessage("GPT-5.6 is expanding this evidence-derived brief into a 45-minute plan…");

    try {
      const response = await fetch("/api/lesson-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(brief.lessonPlanContext),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          isApiErrorPayload(payload)
            ? payload.error?.message ?? "Unable to generate the next lesson."
            : "Unable to generate the next lesson.",
        );
      }

      const parsedPlan = LessonPlanSchema.safeParse(
        typeof payload === "object" && payload !== null && "plan" in payload
          ? payload.plan
          : undefined,
      );

      if (!parsedPlan.success) {
        throw new Error("The next lesson was incomplete. The deterministic brief is unchanged.");
      }

      setPlan(parsedPlan.data);
      setModel(
        typeof payload === "object" &&
          payload !== null &&
          "model" in payload &&
          typeof payload.model === "string"
          ? payload.model
          : "gpt-5.6",
      );
      const parsedSource = GenerationSourceSchema.safeParse(
        typeof payload === "object" && payload !== null && "source" in payload
          ? payload.source
          : undefined,
      );
      setSource(parsedSource.success ? parsedSource.data : "live");
      setGenerationState("success");
      setMessage(
        parsedSource.success && parsedSource.data === "mock"
          ? "Mock GPT-5.6 response created locally from the evidence-derived context."
          : "Live GPT-5.6 lesson generated from the evidence-derived context. Review before teaching.",
      );
    } catch (error) {
      setGenerationState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate the next lesson. The deterministic brief is unchanged.",
      );
    }
  };

  return (
    <article className="panel next-session-panel" id="next-session-brief">
      <header className="panel-header">
        <div><span className="panel-index">06</span><h3>Next session brief</h3></div>
        <span className={`status ${isCurrent ? "status-ready" : "status-watch"}`}>
          {isCurrent ? "Closed loop" : "Refresh needed"}
        </span>
      </header>

      <div className="next-session-body">
        <div className="next-session-summary">
          <div>
            <span className="mini-label">Scheduled review</span>
            <strong>{brief.scheduledFor}</strong>
          </div>
          <div>
            <span className="mini-label">Support progression</span>
            <strong>{brief.supportPlan.label}</strong>
          </div>
          <div>
            <span className="mini-label">Target</span>
            <strong>{brief.topic}</strong>
          </div>
        </div>

        <div className="next-session-grid">
          <section>
            <span className="next-session-number">5 min</span>
            <div>
              <strong>{brief.openingReview.title}</strong>
              <p>{brief.openingReview.activity}</p>
              <small>Look for: {brief.openingReview.successSignal}</small>
            </div>
          </section>
          <section>
            <span className="next-session-number">Move</span>
            <div>
              <strong>{brief.nextFocus}</strong>
              <p>{brief.supportPlan.rationale}</p>
              <small>Why now: {brief.rationale}</small>
            </div>
          </section>
          <section>
            <span className="next-session-number">Check</span>
            <div>
              <strong>Independent transfer</strong>
              <p>{brief.masteryCheck.question}</p>
              <small>Look for: {brief.masteryCheck.lookFor}</small>
            </div>
          </section>
        </div>

        <div className="next-session-sources">
          <strong>Evidence carried forward</strong>
          <ul>
            {brief.evidenceSources.map((source) => (
              <li key={`${source.role}-${source.attemptId}`}>
                <span>{source.role} · {source.attemptId.replace("practice-", "Attempt ")}</span>
                {source.observation}
              </li>
            ))}
          </ul>
        </div>

        <div className="next-plan-action">
          <button
            className="generate-button"
            type="button"
            onClick={generateNextPlan}
            disabled={!isCurrent || generationState === "loading"}
          >
            <span aria-hidden="true">{generationState === "loading" ? "···" : "✦"}</span>
            {generationState === "loading" ? "Generating next lesson" : "Generate next lesson with GPT-5.6"}
          </button>
          <span className="live-action-note">
            Local mock without a key · live GPT-5.6 when configured · deterministic decisions stay unchanged
          </span>
          {!isCurrent ? <p className="stale-note">Update mastery before generating from edited evidence.</p> : null}
          <p className={`generation-message ${generationState}`} role={generationState === "error" ? "alert" : "status"}>
            {message}
          </p>
        </div>

        {plan && isCurrent ? (
          <div className={`next-plan-preview${source === "mock" ? " mock-response" : ""}`}>
            <div>
              <span className="mini-label">
                {source === "mock" ? "Mock GPT-5.6 response" : "Generated next lesson"}
              </span>
              <strong>
                {source === "mock" ? `Schema target: ${model} · no API call` : model ? `Model: ${model}` : "GPT-5.6"}
              </strong>
            </div>
            <ol>
              <li><span>5 min</span><strong>{plan.warmup.title}</strong><p>{plan.warmup.activity}</p></li>
              <li><span>20 min</span><strong>{plan.coreTeaching.title}</strong><p>{plan.coreTeaching.explanation}</p></li>
              <li><span>15 min</span><strong>{plan.practice.title}</strong><p>{plan.practice.problems.length} calibrated problems</p></li>
              <li><span>5 min</span><strong>{plan.masteryCheck.title}</strong><p>{plan.masteryCheck.question}</p></li>
            </ol>
          </div>
        ) : null}
      </div>
    </article>
  );
}
