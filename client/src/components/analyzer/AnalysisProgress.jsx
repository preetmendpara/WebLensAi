import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { EASE } from "@/animations/motionPresets";
import { useMotionSafe } from "@/animations/useMotionSafe";

/**
 * Every row here corresponds to a stage the server actually reported.
 * There is no timer and no interpolated percentage — if the backend is
 * slow on one stage, the UI simply sits on it (spec §11).
 */
export const STAGES = [
  "Fetching website",
  "Analyzing HTML",
  "Checking SEO",
  "Checking accessibility",
  "Analyzing links",
  "Evaluating structure",
  "Calculating score",
  "Generating AI insights",
];

export function AnalysisProgress({ current, url }) {
  const index = STAGES.indexOf(current);
  const motionSafe = useMotionSafe();

  return (
    <motion.div
      initial={motionSafe ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="mx-auto w-full max-w-md"
    >
      <p className="truncate font-mono text-sm text-ink-muted" title={url}>
        {url}
      </p>

      <div
        className="mt-8 space-y-px"
        role="status"
        aria-live="polite"
        aria-label={`Analysis stage: ${current}`}
      >
        {STAGES.map((stage, i) => {
          const done = i < index;
          const active = i === index;

          return (
            <div
              key={stage}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-300",
                active && "bg-surface",
              )}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {done ? (
                  <Check className="size-3.5 text-success" aria-hidden />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin text-accent" aria-hidden />
                ) : (
                  <span className="size-1.5 rounded-full bg-line-strong" aria-hidden />
                )}
              </span>

              <span
                className={cn(
                  "text-sm transition-colors duration-300",
                  done && "text-ink-muted",
                  active && "font-medium text-ink",
                  !done && !active && "text-ink-faint",
                )}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress reflects completed stages only — nothing is estimated. */}
      <div className="mt-8 h-px overflow-hidden bg-line">
        <motion.div
          className="h-full bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.max(index, 0) / (STAGES.length - 1) }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>
    </motion.div>
  );
}
