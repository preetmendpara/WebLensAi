import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "./useReducedMotion";

/** How long to watch, and the minimum frames we expect in that window. */
const WATCHDOG_MS = 900;
const MIN_FRAMES = 12; // ~13fps — far below smooth, but proof of life.

/**
 * Smooth page scrolling (DESIGN_SYSTEM §14), mounted once at the app root.
 *
 * Lenis takes over scrolling: it cancels the browser's native wheel and
 * keyboard scrolling and re-drives the page from a requestAnimationFrame
 * loop. That is fine while frames are flowing, and a trap when they are
 * not — in a throttled context (a background tab, an embedded webview, a
 * loaded machine) the loop stalls and the page becomes genuinely
 * unscrollable by any input. An accessibility analyzer must not ship a
 * scroll hijack that can strand a user.
 *
 * So smooth scrolling is treated as a progressive enhancement: it is
 * disabled outright under prefers-reduced-motion, never started while the
 * page is hidden, and torn down automatically if the frame loop does not
 * prove itself within the first second. Native scrolling always works.
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || document.visibilityState === "hidden") return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    let frames = 0;
    let rafId;
    const raf = (time) => {
      frames++;
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const watchdog = setTimeout(() => {
      if (frames < MIN_FRAMES) {
        // The loop is not running usefully. Hand scrolling back to the
        // browser rather than leaving the page stuck.
        cancelAnimationFrame(rafId);
        lenis.destroy();
      }
    }, WATCHDOG_MS);

    return () => {
      clearTimeout(watchdog);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduced]);
}
