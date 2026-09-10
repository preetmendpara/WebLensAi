import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { runAnimation } from "./runAnimation";

/**
 * GSAP-driven numeric count-up (§13 — the score earns its animation
 * because watching it climb is how the user reads "this was measured").
 * Writes textContent directly: no React re-render per frame.
 */
export function useCountUp(value, { duration = 1.4, delay = 0 } = {}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return runAnimation({
      reduced,
      applyFinalState: () => {
        el.textContent = String(Math.round(value));
      },
      animate: () => {
        const obj = { n: 0 };
        const tween = gsap.to(obj, {
          n: value,
          duration,
          delay,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(obj.n));
          },
        });
        return () => tween.kill();
      },
    });
  }, [value, duration, delay, reduced]);

  return ref;
}
