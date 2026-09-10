import crypto from "node:crypto";
import { buildChain, runChain } from "./chain.js";

export { buildChain } from "./chain.js";

/**
 * Bump whenever the prompt or the shape of a generated report changes.
 * Cached rows were written by the previous version and would otherwise be
 * served forever — a stale generation is invisible until someone notices
 * the report is in the old format.
 */
const INSIGHT_VERSION = 3;

/**
 * Stable cache key. Derived from the *findings*, not the URL — a site that
 * genuinely changed produces different findings and regenerates, while a
 * re-analysis of an unchanged site costs nothing (spec §16).
 */
export function findingsHash(payload) {
  const stable = JSON.stringify({
    v: INSIGHT_VERSION,
    url: payload.url,
    scores: payload.categories,
    issues: payload.issues.map((i) => i.id).sort(),
  });
  return crypto.createHash("sha256").update(stable).digest("hex");
}

/** One consolidated AI request per analysis, with automatic provider failover. */
export function generateInsights(payload) {
  return runChain(buildChain(), payload);
}
