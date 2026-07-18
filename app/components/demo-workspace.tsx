"use client";

import { useState } from "react";
import { LessonPlanWorkspace } from "@/app/components/lesson-plan-workspace";
import { SessionEvidenceWorkspace } from "@/app/components/session-evidence-workspace";
import type {
  HonestyGateResult,
  LessonPlan,
  LessonPlanRequest,
  MasteryDecision,
  NextSessionBrief,
  ParentReportDraft,
  SessionEvidence,
} from "@/src/logic";

type DemoWorkspaceProps = {
  studentName: string;
  subject: string;
  studentLevel: string;
  nextFocus: string;
  initialContext: LessonPlanRequest;
  initialPlan: LessonPlan;
  initialEvidence: SessionEvidence;
  initialDecision: MasteryDecision;
  initialReport: ParentReportDraft;
  initialHonestyCheck: HonestyGateResult;
  initialNextSessionBrief: NextSessionBrief;
};

const demoSteps = [
  { href: "#lesson-plan", number: "1", label: "Inspect plan" },
  { href: "#session-evidence", number: "2", label: "Edit evidence" },
  { href: "#mastery-decision", number: "3", label: "See decision" },
  { href: "#next-session-brief", number: "4", label: "Open next" },
  { href: "#parent-report-panel", number: "5", label: "Copy update" },
];

export function DemoWorkspace(props: DemoWorkspaceProps) {
  const [resetVersion, setResetVersion] = useState(0);
  const [resetMessage, setResetMessage] = useState(
    "Preloaded sample works without credentials. Spark buttons are optional live GPT-5.6 actions.",
  );

  const resetDemo = () => {
    setResetVersion((current) => current + 1);
    setResetMessage("Demo reset to Maya’s original Tuesday session.");
  };

  return (
    <>
      <aside className="demo-toolbar" id="demo-path" aria-labelledby="demo-path-title">
        <div className="demo-toolbar-heading">
          <div>
            <span className="eyebrow">90-second judge path</span>
            <strong id="demo-path-title">Follow the evidence from plan to parent update.</strong>
          </div>
          <button className="reset-button" type="button" onClick={resetDemo}>
            <span aria-hidden="true">↺</span> Reset demo
          </button>
        </div>
        <ol className="demo-steps">
          {demoSteps.map((step) => (
            <li key={step.href}>
              <a href={step.href}><span>{step.number}</span>{step.label}</a>
            </li>
          ))}
        </ol>
        <p className="demo-toolbar-message" role="status">{resetMessage}</p>
      </aside>

      <div className="workspace-grid">
        <LessonPlanWorkspace
          key={`plan-${resetVersion}`}
          initialContext={props.initialContext}
          initialPlan={props.initialPlan}
        />

        <SessionEvidenceWorkspace
          key={`outcome-${resetVersion}`}
          studentName={props.studentName}
          subject={props.subject}
          studentLevel={props.studentLevel}
          nextFocus={props.nextFocus}
          initialEvidence={props.initialEvidence}
          initialDecision={props.initialDecision}
          initialReport={props.initialReport}
          initialHonestyCheck={props.initialHonestyCheck}
          initialNextSessionBrief={props.initialNextSessionBrief}
        />
      </div>
    </>
  );
}
