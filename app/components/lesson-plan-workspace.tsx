"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  LessonPlanSchema,
  type LessonPlan,
  type LessonPlanRequest,
} from "@/src/logic";

type LessonPlanWorkspaceProps = {
  initialContext: LessonPlanRequest;
  initialPlan: LessonPlan;
};

type GenerationState = "idle" | "loading" | "success" | "error";

type ApiErrorPayload = {
  error?: {
    message?: string;
    fields?: Record<string, string>;
  };
};

const contextFields: Array<{
  name: keyof LessonPlanRequest;
  label: string;
  multiline?: boolean;
}> = [
  { name: "subject", label: "Subject" },
  { name: "studentLevel", label: "Student level" },
  { name: "lastSessionTopic", label: "Last session", multiline: true },
  { name: "sessionGoal", label: "Today’s goal", multiline: true },
  { name: "strugglingWith", label: "Current struggle", multiline: true },
];

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null && "error" in value;
}

export function LessonPlanWorkspace({
  initialContext,
  initialPlan,
}: LessonPlanWorkspaceProps) {
  const [context, setContext] = useState(initialContext);
  const [plan, setPlan] = useState(initialPlan);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [message, setMessage] = useState("A complete sample plan is ready to edit.");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [model, setModel] = useState<string | null>(null);

  const handleContextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = event.target.name as keyof LessonPlanRequest;
    setContext((current) => ({ ...current, [name]: event.target.value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const generate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGenerationState("loading");
    setMessage("GPT-5.6 is shaping a 45-minute plan from this context…");
    setFieldErrors({});

    try {
      const response = await fetch("/api/lesson-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(context),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        if (isApiErrorPayload(payload)) {
          setFieldErrors(payload.error?.fields ?? {});
          throw new Error(payload.error?.message ?? "Unable to generate a lesson plan.");
        }
        throw new Error("Unable to generate a lesson plan.");
      }

      const result = LessonPlanSchema.safeParse(
        typeof payload === "object" && payload !== null && "plan" in payload
          ? payload.plan
          : undefined,
      );

      if (!result.success) {
        throw new Error("The generated plan was incomplete. Please try again.");
      }

      setPlan(result.data);
      setModel(
        typeof payload === "object" &&
          payload !== null &&
          "model" in payload &&
          typeof payload.model === "string"
          ? payload.model
          : "gpt-5.6",
      );
      setGenerationState("success");
      setMessage("New plan generated. Review and edit every section before the session.");
    } catch (error) {
      setGenerationState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate a lesson plan. Your context is still here—try again.",
      );
    }
  };

  const updatePlan = <Section extends keyof LessonPlan>(
    section: Section,
    value: LessonPlan[Section],
  ) => setPlan((current) => ({ ...current, [section]: value }));

  return (
    <>
      <article className="panel context-panel" id="session-context">
        <header className="panel-header">
          <div><span className="panel-index">01</span><h3>Session context</h3></div>
          <span className="status status-neutral">Editable input</span>
        </header>
        <form className="context-form" onSubmit={generate} noValidate>
          {contextFields.map((field) => {
            const id = `context-${field.name}`;
            const error = fieldErrors[field.name];
            const sharedProps = {
              id,
              name: field.name,
              value: context[field.name],
              onChange: handleContextChange,
              "aria-invalid": Boolean(error),
              "aria-describedby": error ? `${id}-error` : undefined,
              maxLength:
                field.name === "subject" || field.name === "studentLevel"
                  ? 80
                  : field.name === "strugglingWith"
                    ? 400
                    : 240,
            };

            return (
              <div className="context-field" key={field.name}>
                <label htmlFor={id}>{field.label}</label>
                {field.multiline ? (
                  <textarea {...sharedProps} rows={2} />
                ) : (
                  <input {...sharedProps} type="text" />
                )}
                {error ? <span className="field-error" id={`${id}-error`}>{error}</span> : null}
              </div>
            );
          })}
          <button className="generate-button" type="submit" disabled={generationState === "loading"}>
            <span aria-hidden="true">{generationState === "loading" ? "···" : "✦"}</span>
            {generationState === "loading" ? "Generating with GPT-5.6" : "Generate with GPT-5.6"}
          </button>
          <span className="live-action-note">Optional live GPT-5.6 action · requires a server API key</span>
          <p className={`generation-message ${generationState}`} aria-live="polite">
            {message}
          </p>
        </form>
      </article>

      <article className="panel plan-panel" id="lesson-plan">
        <header className="panel-header">
          <div><span className="panel-index">02</span><h3>Lesson plan</h3></div>
          <span className={`status ${model ? "status-ready" : "status-neutral"}`}>
            {model ? "GPT-5.6 generated" : "Sample plan"}
          </span>
        </header>
        <div className="plan-toolbar">
          <span>45 minutes · 4-part plan</span>
          <span>{model ? `Model: ${model}` : "Every section is editable"}</span>
        </div>
        <div className="editable-plan">
          <section className="plan-section">
            <div className="plan-section-heading"><span>5 min</span><strong>{plan.warmup.title}</strong></div>
            <label htmlFor="plan-warmup">Warm-up activity</label>
            <textarea
              id="plan-warmup"
              value={plan.warmup.activity}
              onChange={(event) => updatePlan("warmup", { ...plan.warmup, activity: event.target.value })}
              rows={2}
            />
            <p><b>Look for:</b> {plan.warmup.successSignal}</p>
          </section>

          <section className="plan-section">
            <div className="plan-section-heading"><span>20 min</span><strong>{plan.coreTeaching.title}</strong></div>
            <label htmlFor="plan-core">Core explanation</label>
            <textarea
              id="plan-core"
              value={plan.coreTeaching.explanation}
              onChange={(event) => updatePlan("coreTeaching", { ...plan.coreTeaching, explanation: event.target.value })}
              rows={3}
            />
            <label htmlFor="plan-example">Concrete example</label>
            <textarea
              id="plan-example"
              value={plan.coreTeaching.concreteExample}
              onChange={(event) => updatePlan("coreTeaching", { ...plan.coreTeaching, concreteExample: event.target.value })}
              rows={2}
            />
          </section>

          <section className="plan-section">
            <div className="plan-section-heading"><span>15 min</span><strong>{plan.practice.title}</strong></div>
            <div className="practice-problems">
              {plan.practice.problems.map((problem, index) => (
                <div className="practice-problem" key={`${problem.difficulty}-${index}`}>
                  <span>{index + 1}</span>
                  <div>
                    <label htmlFor={`practice-${index}`}>{problem.difficulty}</label>
                    <textarea
                      id={`practice-${index}`}
                      value={problem.prompt}
                      onChange={(event) => {
                        const problems = plan.practice.problems.map((item, problemIndex) =>
                          problemIndex === index ? { ...item, prompt: event.target.value } : item,
                        ) as LessonPlan["practice"]["problems"];
                        updatePlan("practice", { ...plan.practice, problems });
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="plan-section mastery-check-section">
            <div className="plan-section-heading"><span>5 min</span><strong>{plan.masteryCheck.title}</strong></div>
            <label htmlFor="plan-mastery">Mastery question</label>
            <textarea
              id="plan-mastery"
              value={plan.masteryCheck.question}
              onChange={(event) => updatePlan("masteryCheck", { ...plan.masteryCheck, question: event.target.value })}
              rows={2}
            />
            <p><b>Evidence of understanding:</b> {plan.masteryCheck.lookFor}</p>
          </section>
        </div>
      </article>
    </>
  );
}
