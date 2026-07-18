import type { LearnerTrajectory } from "@/src/logic";

type LearnerTrajectoryPanelProps = {
  trajectory: LearnerTrajectory;
  isCurrent: boolean;
};

export function LearnerTrajectoryPanel({ trajectory, isCurrent }: LearnerTrajectoryPanelProps) {
  return (
    <article className="panel trajectory-panel" id="learner-trajectory" aria-live="polite">
      <header className="panel-header">
        <div><span className="panel-index">05</span><h3>Three-session learner trajectory</h3></div>
        <span className={`status ${isCurrent ? "status-ready" : "status-watch"}`}>
          {isCurrent ? "Current" : "Refresh needed"}
        </span>
      </header>

      <div className="trajectory-body">
        <div className="trajectory-summary">
          <span className="mini-label">Direction</span>
          <strong>{trajectory.direction}</strong>
          <p>{trajectory.rationale}</p>
          {!isCurrent ? <small>Update mastery to bring the third session back in sync.</small> : null}
        </div>

        <ol className="trajectory-points">
          {trajectory.points.map((point, index) => (
            <li key={point.sessionId}>
              <div className="trajectory-marker" aria-hidden="true">
                <span>{index + 1}</span>
              </div>
              <div className="trajectory-point-heading">
                <div>
                  <span>{point.reviewedOn}</span>
                  <strong>{point.label}</strong>
                </div>
                <b>{point.decision.score}%</b>
              </div>
              <div className="trajectory-status-row">
                <span>{point.decision.status}</span>
                <span>{point.decision.intervalDays}-day review</span>
              </div>
              <dl>
                <div><dt>Independent success</dt><dd>{point.independentSuccessCount}/{point.attemptCount}</dd></div>
                <div><dt>Support used</dt><dd>{point.supportUsedCount}/{point.attemptCount}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}
