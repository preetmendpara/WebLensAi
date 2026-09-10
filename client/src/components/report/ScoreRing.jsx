import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useCountUp } from "@/animations/useCountUp";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { runAnimation } from "@/animations/runAnimation";
import { scoreTone } from "@/lib/format";
import { cn } from "@/lib/cn";

const TONE_STROKE = {
  success: "stroke-success",
  low: "stroke-low",
  medium: "stroke-medium",
  high: "stroke-high",
  critical: "stroke-critical",
};

/**
 * The overall score. A thin ring, not a glowing gauge (§22) — the number
 * is the hero and the arc is a quiet second reading of it.
 */
export function ScoreRing({ score, size = 168, delay = 0.15 }) {
  const numberRef = useCountUp(score, { delay });
  const arcRef = useRef(null);
  const reduced = useReducedMotion();

  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(score);

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;

    const target = circumference * (1 - score / 100);

    return runAnimation({
      reduced,
      applyFinalState: () => {
        el.style.strokeDashoffset = String(target);
      },
      animate: () => {
        // The arc sweeps in step with the counter, so the two read as one event.
        const tween = gsap.fromTo(
          el,
          { strokeDashoffset: circumference },
          { strokeDashoffset: target, duration: 1.4, delay, ease: "power2.out" },
        );
        return () => tween.kill();
      },
    });
  }, [score, circumference, delay, reduced]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line"
        />
        <circle
          ref={arcRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className={cn("transition-none", TONE_STROKE[tone])}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          ref={numberRef}
          className="tnum text-[3.25rem] font-medium leading-none tracking-tight text-ink"
        >
          0
        </span>
        <span className="mt-1 font-mono text-meta uppercase text-ink-faint">
          out of 100
        </span>
      </div>

      <span className="sr-only">Overall score {score} out of 100</span>
    </div>
  );
}
