import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { runAnimation } from "@/animations/runAnimation";

const ROWS = [
  { label: "SEO", score: 86 },
  { label: "Accessibility", score: 74 },
  { label: "Structure", score: 91 },
  { label: "Links", score: 88 },
  { label: "Performance", score: 78 },
];

const TONE = {
  86: "bg-success",
  74: "bg-medium",
  91: "bg-success",
  88: "bg-success",
  78: "bg-low",
};

/**
 * The hero visual is the product itself — a miniature report — rather
 * than an abstract AI illustration (§18). One entrance sequence on mount,
 * then it holds still. Nothing floats or loops.
 */
export function HeroReport() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const bars = el.querySelectorAll("[data-bar]");
    const values = el.querySelectorAll("[data-value]");
    const overall = el.querySelector("[data-overall]");

    const applyFinalState = () => {
      bars.forEach((b) => (b.style.transform = `scaleX(${b.dataset.bar / 100})`));
      values.forEach((v) => (v.textContent = v.dataset.value));
      overall.textContent = "82";
    };

    return runAnimation({
      reduced,
      applyFinalState,
      animate: () => {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

          tl.from(el, { opacity: 0, y: 20, duration: 0.7 }).from(
            "[data-row]",
            { opacity: 0, y: 10, stagger: 0.07, duration: 0.5 },
            "-=0.35",
          );

          const overallObj = { n: 0 };
          tl.to(
            overallObj,
            {
              n: 82,
              duration: 1.2,
              onUpdate: () => (overall.textContent = String(Math.round(overallObj.n))),
            },
            0.35,
          );

          tl.to(
            bars,
            { scaleX: (i, b) => b.dataset.bar / 100, duration: 0.8, stagger: 0.07 },
            0.5,
          );

          values.forEach((node, i) => {
            const obj = { n: 0 };
            tl.to(
              obj,
              {
                n: Number(node.dataset.value),
                duration: 0.8,
                onUpdate: () => (node.textContent = String(Math.round(obj.n))),
              },
              0.5 + i * 0.07,
            );
          });
        }, el);

        return () => ctx.revert();
      },
    });
  }, [reduced]);

  return (
    <div
      ref={root}
      className="rounded-lg border border-line bg-canvas shadow-raised"
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="font-mono text-meta uppercase text-ink-faint">
          Website health
        </span>
        <span className="font-mono text-meta text-ink-faint">example.com</span>
      </div>

      <div className="flex items-baseline gap-3 px-5 pt-6">
        <span
          data-overall
          className="tnum text-[3.5rem] font-medium leading-none tracking-tight text-ink"
        >
          0
        </span>
        <span className="font-mono text-meta uppercase text-ink-faint">/ 100</span>
      </div>

      <div className="space-y-4 px-5 pb-6 pt-8">
        {ROWS.map((row) => (
          <div key={row.label} data-row>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-muted">{row.label}</span>
              <span
                data-value={row.score}
                className="tnum text-sm font-medium text-ink"
              >
                0
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-sunken">
              <div
                data-bar={row.score}
                style={{ transform: "scaleX(0)", transformOrigin: "left" }}
                className={`h-full w-full rounded-full ${TONE[row.score]}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-5 py-3">
        <span className="font-mono text-meta uppercase text-ink-faint">
          7 issues · 3 with suggested fixes
        </span>
      </div>
    </div>
  );
}
