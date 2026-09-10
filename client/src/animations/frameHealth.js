import { useSyncExternalStore } from "react";

/**
 * Is this environment actually rendering frames?
 *
 * Motion (like GSAP) animates from `opacity: 0`. Where requestAnimationFrame
 * is throttled — a background tab, an embedded webview, a loaded machine —
 * those tweens crawl or stall and the content never becomes visible. The
 * GSAP paths are guarded by a wall-clock deadline in runAnimation.js; this is
 * the equivalent signal for declarative Motion components, which have no
 * imperative handle to force-complete.
 *
 * The probe runs once at startup and counts frames over a short window.
 * Until it finishes we assume frames are fine, so a healthy environment
 * never skips its entrance animation. If the probe comes back unhealthy the
 * value flips to false, and components switch to rendering their final state
 * directly — content appearing without an animation, never the reverse.
 */

const PROBE_MS = 500;
const MIN_FRAMES = 8; // ~16fps. Well below smooth, but proof frames are real.

let healthy = true;
const listeners = new Set();

function publish(value) {
  if (value === healthy) return;
  healthy = value;
  for (const listener of listeners) listener();
}

export function probeFrameHealth() {
  if (typeof window === "undefined") return;

  let frames = 0;
  let rafId;
  const tick = () => {
    frames++;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  setTimeout(() => {
    cancelAnimationFrame(rafId);
    // A hidden page legitimately renders no frames; that is not ill health,
    // and visibility is handled separately where it matters.
    if (document.visibilityState === "visible") publish(frames >= MIN_FRAMES);
  }, PROBE_MS);
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useFrameHealth() {
  return useSyncExternalStore(
    subscribe,
    () => healthy,
    () => true,
  );
}
