import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Underline slides between tabs via a shared layoutId — the one place a
 * layout animation genuinely clarifies state (§31).
 */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div role="tablist" className={cn("flex gap-1 border-b border-line", className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative px-3 py-2 text-sm transition-colors",
              active ? "text-ink" : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span className="tnum ml-1.5 font-mono text-meta text-ink-faint">
                {tab.count}
              </span>
            )}
            {active && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-0 -bottom-px h-px bg-ink"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
