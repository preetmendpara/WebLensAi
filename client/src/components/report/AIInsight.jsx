import { motion } from "motion/react";
import { EASE } from "@/animations/motionPresets";
import { useMotionSafe } from "@/animations/useMotionSafe";

/**
 * The AI section. Distinguished by a tinted ground and a plain label —
 * no robot, no sparkle storm, no "AI MAGIC" (§25).
 */
export function AIInsight({ ai, unavailable }) {
  const motionSafe = useMotionSafe();

  if (unavailable) {
    return (
      <div className="rounded-lg border border-line bg-surface px-5 py-4">
        <p className="font-mono text-meta uppercase text-ink-faint">AI insight</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Technical analysis completed. AI insights are temporarily unavailable —
          every finding below still comes from the rule engine.
        </p>
      </div>
    );
  }

  if (!ai?.summary) return null;

  return (
    <motion.section
      initial={motionSafe ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-lg border border-line bg-accent-soft/60 px-6 py-6"
      aria-labelledby="ai-insight-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="ai-insight-heading"
          className="font-mono text-meta uppercase text-accent"
        >
          AI insight
        </h2>
        {ai.provider && (
          <span className="font-mono text-meta uppercase text-ink-faint">
            {ai.provider}
            {ai.cached ? " · cached" : ""}
          </span>
        )}
      </div>

      <p className="mt-3 text-[17px] leading-relaxed text-ink">{ai.summary}</p>

      {ai.priorities?.length > 0 && (
        <div className="mt-6 border-t border-accent/15 pt-5">
          <p className="font-mono text-meta uppercase text-ink-faint">
            Where to start
          </p>
          <ol className="mt-3 space-y-2">
            {ai.priorities.map((p, i) => (
              <li key={p.issueId} className="flex gap-3 text-sm text-ink">
                <span className="tnum font-mono text-meta text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{p.reason}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </motion.section>
  );
}
