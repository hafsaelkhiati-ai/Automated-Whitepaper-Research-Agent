/**
 * Component: PipelineStatus
 * Visual 7-step progress tracker
 */

export default function PipelineStatus({ steps, currentStep, status }) {
  return (
    <div className="pipeline-track">
      {steps.map((step) => {
        const isDone = step.id < currentStep || status === "complete";
        const isActive = step.id === currentStep && status === "running";
        const isError = step.id === currentStep && status === "error";

        return (
          <div
            key={step.id}
            className={`pipeline-step ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isError ? "error" : ""}`}
          >
            <div className="step-circle">
              {isDone ? "✓" : isError ? "✕" : step.icon}
            </div>
            <span className="step-label">{step.label}</span>
            {step.id < steps.length && <div className={`step-connector ${isDone ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}
