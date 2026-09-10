/**
 * Animations must never be the reason content is missing or wrong.
 *
 * Two failure modes, both real:
 *
 *  1. A GSAP `.from()` hides an element until the tween runs. If the tab
 *     is backgrounded at load, requestAnimationFrame never fires and the
 *     content stays blank permanently.
 *  2. Where rAF is throttled rather than stopped — a background tab, a
 *     loaded machine, an embedded webview — a counting animation crawls.
 *     A score tweening toward 82 that is still reading 8 after several
 *     seconds is worse than no animation: it looks like a real score.
 *
 * So every animated block declares its finished state as a function, and
 * we guarantee that state gets applied: immediately when motion is off or
 * the page is hidden, and otherwise on a wall-clock deadline regardless
 * of how many frames actually rendered.
 *
 * Pass `deadlineMs: 0` for animations that are legitimately allowed to
 * start late — a scroll reveal may not fire for minutes. Those must stay
 * safe by never hiding their content in the first place.
 */

const DEFAULT_DEADLINE_MS = 2600;

export function runAnimation({
  reduced,
  applyFinalState,
  animate,
  deadlineMs = DEFAULT_DEADLINE_MS,
}) {
  // No motion wanted, or nobody is watching: show the result now.
  if (reduced || document.visibilityState === "hidden") {
    applyFinalState();
    return () => {};
  }

  const cleanup = animate();

  if (deadlineMs === 0) return cleanup ?? (() => {});

  // setTimeout keeps running when rAF is throttled, so this fires even
  // when the tween itself has barely advanced. Applying the end state a
  // second time is a no-op if the animation already finished normally.
  const deadline = setTimeout(() => {
    cleanup?.();
    applyFinalState();
  }, deadlineMs);

  return () => {
    clearTimeout(deadline);
    cleanup?.();
  };
}
