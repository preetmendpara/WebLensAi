import { useSyncExternalStore } from "react";

const query = () => window.matchMedia("(prefers-reduced-motion: reduce)");

const subscribe = (onChange) => {
  const mq = query();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/**
 * Live reduced-motion preference. Reacts to OS changes mid-session
 * rather than reading once at mount.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => query().matches,
    () => false, // SSR/no-window: assume motion allowed
  );
}
