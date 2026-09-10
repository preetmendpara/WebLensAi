import { groq, gemini, openai } from "./providers.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

/** Failover order, primary first (spec §15). */
export const buildChain = () => [groq, gemini, openai];

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Some models wrap JSON in prose or a fenced block despite instructions.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("model did not return JSON");
    return JSON.parse(match[0]);
  }
}

/** A finding's severity decides its priority. The model never gets a vote. */
const PRIORITY_FOR_SEVERITY = {
  critical: "high",
  high: "high",
  medium: "medium",
  low: "low",
};

/**
 * Drop anything the model invented, and overrule anything it contradicted.
 * The rule engine owns both the set of findings and their severity; a
 * hallucinated task or an inflated priority must never reach the report,
 * where it would be indistinguishable from a measured one.
 *
 * Prompting alone does not hold this line — models pad a two-issue report
 * into a five-step plan and call a low-severity finding urgent — so the
 * constraint is enforced here, where it cannot drift.
 */
function sanitize(insight, payload) {
  const severityById = new Map(payload.issues.map((i) => [i.id, i.severity]));
  const known = (id) => severityById.has(id);
  const keep = (item) => known(item?.issueId);

  // Roadmap: one step per real finding, ordered by the engine's own severity
  // ranking, with the model's wording kept only where it maps to a finding.
  const rank = { critical: 0, high: 1, medium: 2, low: 3 };
  const byId = new Map(
    (insight.roadmap ?? []).filter(keep).map((step) => [step.issueId, step]),
  );

  const roadmap = payload.issues
    .filter((issue) => byId.has(issue.id))
    .sort((a, b) => rank[a.severity] - rank[b.severity])
    .map((issue, index) => {
      const step = byId.get(issue.id);
      return {
        step: index + 1,
        issueId: issue.id,
        title: step.title ?? issue.title,
        detail: step.detail ?? "",
        effort: ["quick", "moderate", "involved"].includes(step.effort)
          ? step.effort
          : "moderate",
        // Derived, never taken from the model.
        priority: PRIORITY_FOR_SEVERITY[issue.severity],
      };
    });

  return {
    summary: String(insight.summary ?? "").slice(0, 1200),
    priorities: (insight.priorities ?? []).filter(keep).slice(0, 4),
    explanations: Object.fromEntries(
      Object.entries(insight.explanations ?? {}).filter(([id]) => known(id)),
    ),
    codeFixes: (insight.codeFixes ?? []).filter(keep).slice(0, 5),
    roadmap,
  };
}

/**
 * Walk the chain until one provider answers.
 *
 * Every failure moves to the next provider immediately — the user is never
 * asked to retry. That includes hard 4xx responses: a retired model name, a
 * revoked key or an exhausted credit balance is specific to the provider
 * that raised it and says nothing about the next one.
 *
 * Returns null when every provider is exhausted, so the caller can serve the
 * deterministic report alone. AI is an enhancement, never a dependency.
 */
export async function runChain(providers, payload) {
  const user = buildUserPrompt(payload);
  const attempts = [];

  for (const provider of providers) {
    if (!provider.key) {
      attempts.push({ provider: provider.name, error: "no api key configured" });
      continue;
    }

    const startedAt = Date.now();
    try {
      const text = await provider.generate({ system: SYSTEM_PROMPT, user });
      return {
        insight: sanitize(parseJson(text), payload),
        provider: provider.name,
        model: provider.model,
        elapsedMs: Date.now() - startedAt,
        attempts,
      };
    } catch (err) {
      attempts.push({ provider: provider.name, error: err.message });
      console.warn(`[ai] ${provider.name} failed: ${err.message} — trying next provider`);
    }
  }

  console.error("[ai] all providers exhausted", attempts);
  return null;
}
