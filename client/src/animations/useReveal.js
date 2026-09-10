import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const DURATION = 0.6;

/**
 * Scroll-reveal for a section's direct children. Transform + opacity
 * only, short distance, quick stagger — reveal, not choreography (§15).
 *
 * Two safeguards, because a reveal that fails leaves content invisible:
 *
 *  - `immediateRender: false` keeps the targets visible until the trigger
 *    actually fires, so a section that is never scrolled to is never
 *    hidden.
 *  - Once the trigger fires, a wall-clock timer force-completes the tween.
 *    setTimeout keeps time even where requestAnimationFrame is throttled
 *    (background tab, embedded webview, loaded machine), so the section
 *    cannot be left stranded part-way through fading in.
 */
export function useReveal({ selector = ":scope > *", stagger = 0.07, y = 14 } = {}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const targets = el.querySelectorAll(selector);
    if (!targets.length) return;

    let safety;

    const ctx = gsap.context(() => {
      const tween = gsap.from(targets, {
        opacity: 0,
        y,
        duration: DURATION,
        ease: "power2.out",
        stagger,
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            const total = (DURATION + stagger * targets.length) * 1000 + 600;
            safety = setTimeout(() => tween.progress(1), total);
          },
        },
      });
    }, el);

    return () => {
      clearTimeout(safety);
      ctx.revert();
    };
  }, [selector, stagger, y, reduced]);

  return ref;
}
