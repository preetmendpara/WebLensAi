import { useReveal } from "@/animations/useReveal";
import { cn } from "@/lib/cn";

const PRIORITY_TONE = {
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
};

/** Numbered plan, styled like an engineering report rather than a card grid. */
export function Roadmap({ steps }) {
  const ref = useReveal({ selector: "[data-step]", stagger: 0.06 });

  if (!steps?.length) return null;

  return (
    <div ref={ref} className="divide-y divide-line border-y border-line">
      {steps.map((step, i) => (
        <div
          key={step.issueId ?? step.step ?? i}
          data-step
          className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 py-5 sm:grid-cols-[3rem_1fr_9rem]"
        >
          <span className="tnum font-mono text-title font-medium text-ink-faint">
            {String(step.step ?? i + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <p className="text-[15px] font-medium text-ink">{step.title}</p>
            {step.detail && (
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {step.detail}
              </p>
            )}
          </div>

          {/* Fixed-width column, each label on its own line and never wrapped —
              "HIGH PRIORITY" breaking across two lines read as two labels. */}
          <div className="col-start-2 flex items-baseline gap-3 sm:col-start-3 sm:flex-col sm:items-end sm:gap-1">
            <span
              className={cn(
                "whitespace-nowrap font-mono text-meta uppercase",
                PRIORITY_TONE[step.priority] ?? "text-ink-faint",
              )}
            >
              {step.priority} priority
            </span>
            {step.effort && (
              <span className="whitespace-nowrap font-mono text-meta uppercase text-ink-faint">
                {step.effort}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
