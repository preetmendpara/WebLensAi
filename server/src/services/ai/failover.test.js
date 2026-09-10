/**
 * Failover self-check for the provider chain. `npm run test:ai` in server/.
 *
 * Uses stub providers rather than the real APIs: the behaviour under test is
 * "does the chain keep walking", which must be verifiable without network,
 * without spending quota, and without depending on which provider happens to
 * be healthy today.
 */
import assert from "node:assert/strict";
import { buildChain, runChain } from "./chain.js";

const payload = {
  url: "https://example.com",
  overallScore: 88,
  categories: { seo: 63, accessibility: 100, structure: 88, links: 100, performance: 100 },
  statistics: {},
  issues: [
    { id: "seo.description.missing", category: "seo", severity: "high", title: "No meta description" },
  ],
};

const good = (name) => ({
  name,
  model: `${name}-model`,
  key: "present",
  generate: async () =>
    JSON.stringify({
      summary: `written by ${name}`,
      priorities: [{ issueId: "seo.description.missing", reason: "cheap win" }],
      explanations: { "seo.description.missing": "explains it" },
      codeFixes: [],
      roadmap: [{ step: 1, title: "Add one", priority: "high", effort: "quick" }],
    }),
});

const failing = (name, status) => ({
  name,
  model: `${name}-model`,
  key: "present",
  generate: async () => {
    const err = new Error(`HTTP ${status}`);
    err.retryable = status === 429 || status >= 500;
    throw err;
  },
});

const keyless = (name) => ({ name, model: "x", key: undefined, generate: async () => "{}" });

// --- Healthy primary is used, and the rest are never called ------------
let result = await runChain([good("groq"), good("gemini"), good("openai")], payload);
assert.equal(result.provider, "groq");
assert.equal(result.insight.summary, "written by groq");

// --- Rate limit on the primary moves to the fallback immediately -------
result = await runChain([failing("groq", 429), good("gemini"), good("openai")], payload);
assert.equal(result.provider, "gemini", "a 429 must fall through, not surface to the user");

// --- A hard 4xx also moves on: it says nothing about the next provider
// (a retired model or a revoked key is specific to one provider) --------
result = await runChain([failing("groq", 401), good("gemini")], payload);
assert.equal(result.provider, "gemini");

// --- Two down, third serves -------------------------------------------
result = await runChain(
  [failing("groq", 429), failing("gemini", 503), good("openai")],
  payload,
);
assert.equal(result.provider, "openai", "must reach the final fallback");

// --- A provider with no key configured is skipped, not treated as down -
result = await runChain([keyless("groq"), good("gemini")], payload);
assert.equal(result.provider, "gemini");

// --- All exhausted: null, so the caller serves the report without AI ---
result = await runChain(
  [failing("groq", 429), failing("gemini", 500), failing("openai", 429)],
  payload,
);
assert.equal(result, null, "an exhausted chain must return null, never throw");

// --- Hallucinated issue ids are dropped before they can be displayed ---
const liar = {
  name: "liar",
  model: "m",
  key: "present",
  generate: async () =>
    JSON.stringify({
      summary: "ok",
      priorities: [
        { issueId: "seo.description.missing", reason: "real" },
        { issueId: "totally.invented.issue", reason: "not in the findings" },
      ],
      explanations: { "another.invention": "should be dropped" },
      codeFixes: [{ issueId: "invented.again", before: "a", after: "b" }],
      roadmap: [],
    }),
};
result = await runChain([liar], payload);
assert.equal(result.insight.priorities.length, 1, "invented priorities must be dropped");
assert.deepEqual(result.insight.explanations, {}, "invented explanations must be dropped");
assert.equal(result.insight.codeFixes.length, 0, "invented code fixes must be dropped");

// --- The roadmap cannot exceed, contradict or invent the findings ------
// This is the failure the report actually shipped with: two LOW findings
// produced a five-step plan whose first two steps were marked HIGH.
const padder = {
  name: "padder",
  model: "m",
  key: "present",
  generate: async () =>
    JSON.stringify({
      summary: "ok",
      priorities: [],
      explanations: {},
      codeFixes: [],
      roadmap: [
        { step: 1, issueId: "seo.description.missing", title: "Add a description", priority: "high", effort: "quick" },
        { step: 2, issueId: "not.a.real.issue", title: "Run an SEO crawl", priority: "high", effort: "quick" },
        { step: 3, issueId: "also.invented", title: "Add Twitter Card tags", priority: "medium", effort: "moderate" },
      ],
    }),
};

const lowOnly = {
  ...payload,
  issues: [
    { id: "seo.description.missing", category: "seo", severity: "low", title: "No meta description" },
  ],
};

result = await runChain([padder], lowOnly);
assert.equal(result.insight.roadmap.length, 1, "roadmap must not exceed the findings");
assert.equal(result.insight.roadmap[0].issueId, "seo.description.missing");
assert.equal(
  result.insight.roadmap[0].priority,
  "low",
  "priority must come from the finding's severity, not the model",
);

// Ordering follows the engine's severity ranking, not the model's numbering.
const mixed = {
  ...payload,
  issues: [
    { id: "low.one", category: "seo", severity: "low", title: "Low" },
    { id: "high.one", category: "seo", severity: "high", title: "High" },
    { id: "medium.one", category: "seo", severity: "medium", title: "Medium" },
  ],
};
const shuffler = {
  name: "shuffler",
  model: "m",
  key: "present",
  generate: async () =>
    JSON.stringify({
      summary: "ok",
      priorities: [],
      explanations: {},
      codeFixes: [],
      roadmap: [
        { step: 1, issueId: "low.one", title: "Low", effort: "quick" },
        { step: 2, issueId: "medium.one", title: "Medium", effort: "quick" },
        { step: 3, issueId: "high.one", title: "High", effort: "quick" },
      ],
    }),
};
result = await runChain([shuffler], mixed);
assert.deepEqual(
  result.insight.roadmap.map((s) => s.issueId),
  ["high.one", "medium.one", "low.one"],
  "roadmap must be ordered by severity",
);
assert.deepEqual(
  result.insight.roadmap.map((s) => s.step),
  [1, 2, 3],
  "step numbers must be renumbered after sorting",
);

// --- The real chain is configured in the documented order --------------
assert.deepEqual(
  buildChain().map((p) => p.name),
  ["gemini", "groq", "openai"],
  "provider order must stay gemini -> groq -> openai",
);

console.log("ai failover ok — chain walks on 429/4xx/5xx, skips keyless, sanitises output");
