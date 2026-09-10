/**
 * Deterministic scoring.
 *
 * Each category starts at 100 and loses each issue's `weight`, floored at
 * 0. The overall score is the weighted mean. No AI input, no randomness —
 * the same HTML always produces the same number, and every point lost can
 * be traced to a named issue.
 */

export const CATEGORY_WEIGHTS = {
  seo: 0.25,
  accessibility: 0.25,
  structure: 0.2,
  links: 0.15,
  performance: 0.15,
};

export const CATEGORY_LABELS = {
  seo: "SEO",
  accessibility: "Accessibility",
  structure: "Structure",
  links: "Links",
  performance: "Performance",
};

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

export function scoreCategory(issues) {
  const penalty = issues.reduce((sum, i) => sum + (i.weight ?? 0), 0);
  return clamp(100 - penalty);
}

export function calculateScores(issues) {
  const categories = {};
  for (const key of Object.keys(CATEGORY_WEIGHTS)) {
    categories[key] = scoreCategory(issues.filter((i) => i.category === key));
  }

  const overall = clamp(
    Object.entries(CATEGORY_WEIGHTS).reduce(
      (sum, [key, weight]) => sum + categories[key] * weight,
      0,
    ),
  );

  return { overall, categories };
}

/** Ordering used everywhere issues are listed. */
export const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

export function sortIssues(issues) {
  return [...issues].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      (b.weight ?? 0) - (a.weight ?? 0),
  );
}

export function countBySeverity(issues) {
  return issues.reduce(
    (acc, i) => ({ ...acc, [i.severity]: (acc[i.severity] ?? 0) + 1 }),
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}
