import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CATEGORY_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import { EASE } from "@/animations/motionPresets";

const SEVERITY_RAIL = {
  critical: "bg-critical",
  high: "bg-high",
  medium: "bg-medium",
  low: "bg-low",
};

/**
 * One finding. Collapsed it shows severity, category and title; expanded
 * it adds evidence, the AI explanation and any suggested fix.
 */
export function IssueCard({ issue, explanation, fix }) {
  const [open, setOpen] = useState(false);
  const bodyId = `issue-body-${issue.id}`;

  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-canvas">
      {/* Severity reads as a rail, not a coloured card (§23). */}
      <span
        className={cn("absolute inset-y-0 left-0 w-0.5", SEVERITY_RAIL[issue.severity])}
        aria-hidden
      />

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge severity={issue.severity} />
            <span className="font-mono text-meta uppercase text-ink-faint">
              {CATEGORY_LABELS[issue.category]}
            </span>
            {explanation && (
              <span className="inline-flex items-center gap-1 font-mono text-meta uppercase text-ink-faint">
                <Sparkle className="size-3" aria-hidden />
                Explained
              </span>
            )}
          </div>

          <p className="mt-2 text-[15px] font-medium text-ink">{issue.title}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {issue.description}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-line px-5 py-5">
              <div className="grid gap-1 sm:grid-cols-[7rem_1fr]">
                <span className="font-mono text-meta uppercase text-ink-faint">
                  Location
                </span>
                <code className="font-mono text-[13px] text-ink">{issue.location}</code>
              </div>

              {issue.evidence && (
                <div>
                  <p className="font-mono text-meta uppercase text-ink-faint">
                    Found on this page
                  </p>
                  <div className="mt-2">
                    <CodeBlock code={issue.evidence} copyable={false} />
                  </div>
                </div>
              )}

              {explanation && (
                <div className="border-l-2 border-line-strong pl-4">
                  <p className="font-mono text-meta uppercase text-ink-faint">
                    Why this matters
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">{explanation}</p>
                </div>
              )}

              <div>
                <p className="font-mono text-meta uppercase text-ink-faint">
                  Recommendation
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">
                  {issue.recommendation}
                </p>
              </div>

              {fix && (
                <div className="space-y-3">
                  <p className="font-mono text-meta uppercase text-ink-faint">
                    Suggested fix
                  </p>
                  <CodeBlock code={fix.before} label="Before" copyable={false} />
                  <CodeBlock code={fix.after} label="Suggested" tone="after" />
                  {fix.note && (
                    <p className="text-sm text-ink-muted">{fix.note}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
