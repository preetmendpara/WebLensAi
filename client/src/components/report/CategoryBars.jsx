import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { runAnimation } from "@/animations/runAnimation";
import { CATEGORY_LABELS, CATEGORY_WEIGHTS, scoreTone } from "@/lib/format";
import { cn } from "@/lib/cn";

const TONE_BG = {
  success: "bg-success",
  low: "bg-low",
  medium: "bg-medium",
  high: "bg-high",
  critical: "bg-critical",
};

/**
 * Horizontal bars rather than five more rings (§22). Each row states its
 * weighting, so the overall number stays traceable to its inputs.
 */
export function CategoryBars({ categories, delay = 0.4 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const bars = el.querySelectorAll("[data-bar]");
    const numbers = el.querySelectorAll("[data-value]");

    return runAnimation({
      reduced,
      applyFinalState: () => {
        bars.forEach((b) => (b.style.transform = `scaleX(${b.dataset.bar / 100})`));
        numbers.forEach((n) => (n.textContent = n.dataset.value));
      },
      animate: () => {
        const ctx = gsap.context(() => {
          gsap.to(bars, {
            scaleX: (i, node) => node.dataset.bar / 100,
            duration: 0.9,
            delay,
            stagger: 0.08,
            ease: "power2.out",
          });

          numbers.forEach((node, i) => {
            const obj = { n: 0 };
            gsap.to(obj, {
              n: Number(node.dataset.value),
              duration: 0.9,
              delay: delay + i * 0.08,
              ease: "power2.out",
              onUpdate: () => (node.textContent = String(Math.round(obj.n))),
            });
          });
        }, el);

        return () => ctx.revert();
      },
    });
  }, [categories, delay, reduced]);

  return (
    <div ref={ref} className="space-y-5">
      {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
        const score = categories[key] ?? 0;
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-ink">{label}</span>
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-meta text-ink-faint">
                  {CATEGORY_WEIGHTS[key]}% weight
                </span>
                <span
                  data-value={score}
                  className="tnum w-8 text-right text-sm font-medium text-ink"
                >
                  0
                </span>
              </span>
            </div>

            <div className="mt-2 h-1 overflow-hidden rounded-full bg-sunken">
              <div
                data-bar={score}
                style={{ transform: "scaleX(0)", transformOrigin: "left" }}
                className={cn("h-full w-full rounded-full", TONE_BG[scoreTone(score)])}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
