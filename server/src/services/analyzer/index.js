import * as cheerio from "cheerio";
import { safeFetch } from "../../utils/safeFetch.js";
import { checkSeo } from "./checks/seo.js";
import { checkAccessibility } from "./checks/accessibility.js";
import { checkStructure } from "./checks/structure.js";
import { checkLinks } from "./checks/links.js";
import { checkPerformance } from "./checks/performance.js";
import { calculateScores, sortIssues, countBySeverity } from "./score.js";

/** Stage names, surfaced verbatim to the client's progress UI. */
export const STAGES = [
  "Fetching website",
  "Analyzing HTML",
  "Checking SEO",
  "Checking accessibility",
  "Analyzing links",
  "Evaluating structure",
  "Calculating score",
];

/**
 * Run the full deterministic analysis. `onStage` is called with each real
 * stage as it starts — the client never invents progress.
 */
export async function analyze(rawUrl, onStage = () => {}) {
  onStage(STAGES[0]);
  const page = await safeFetch(rawUrl);

  onStage(STAGES[1]);
  const $ = cheerio.load(page.html);
  const ctx = { finalUrl: page.finalUrl, bytes: page.bytes, elapsedMs: page.elapsedMs };

  onStage(STAGES[2]);
  const seo = checkSeo($, ctx);

  onStage(STAGES[3]);
  const accessibility = checkAccessibility($);

  onStage(STAGES[4]);
  const links = checkLinks($, ctx);

  onStage(STAGES[5]);
  const structure = checkStructure($);
  const performance = checkPerformance($, ctx);

  onStage(STAGES[6]);
  const issues = sortIssues([
    ...seo.issues,
    ...accessibility.issues,
    ...structure.issues,
    ...links.issues,
    ...performance.issues,
  ]);

  const { overall, categories } = calculateScores(issues);

  return {
    url: page.finalUrl,
    requestedUrl: rawUrl,
    httpStatus: page.status,
    analyzedAt: new Date().toISOString(),
    overallScore: overall,
    categories,
    issues,
    severityCounts: countBySeverity(issues),
    statistics: {
      seo: seo.stats,
      accessibility: accessibility.stats,
      structure: structure.stats,
      links: links.stats,
      performance: performance.stats,
    },
  };
}

/**
 * Compact payload for the AI layer. Deliberately excludes raw HTML — the
 * model reasons over findings, not markup.
 */
export function toAiPayload(result) {
  return {
    url: result.url,
    overallScore: result.overallScore,
    categories: result.categories,
    statistics: result.statistics,
    issues: result.issues.map((i) => ({
      id: i.id,
      category: i.category,
      severity: i.severity,
      title: i.title,
      location: i.location,
      evidence: i.evidence?.slice(0, 300),
    })),
  };
}
