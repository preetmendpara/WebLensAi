import { useFrameHealth } from "./frameHealth";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Whether a declarative Motion entrance animation is safe to run here.
 *
 * Pass the result to `initial`: `initial={safe ? "initial" : false}` renders
 * the final state immediately when animating would risk leaving content
 * stuck at `opacity: 0`.
 */
export function useMotionSafe() {
  const reduced = useReducedMotion();
  const framesHealthy = useFrameHealth();
  return !reduced && framesHealthy;
}
