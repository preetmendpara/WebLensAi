import { cn } from "@/lib/cn";

/** Severity vocabulary — the single source for issue colouring. */
export const SEVERITY = {
  critical: { label: "Critical", cls: "text-critical bg-critical-soft border-critical/20" },
  high: { label: "High", cls: "text-high bg-high-soft border-high/20" },
  medium: { label: "Medium", cls: "text-medium bg-medium-soft border-medium/20" },
  low: { label: "Low", cls: "text-low bg-low-soft border-low/20" },
  success: { label: "Pass", cls: "text-success bg-success-soft border-success/20" },
};

export function Badge({ severity, children, className }) {
  const tone = SEVERITY[severity] ?? SEVERITY.low;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5",
        "font-mono text-meta font-medium uppercase",
        tone.cls,
        className,
      )}
    >
      {children ?? tone.label}
    </span>
  );
}
