/**
 * Self-check for the rule engine. No framework: `npm test` in server/.
 * Runs the checks against fixture HTML so scoring stays honest.
 */
import assert from "node:assert/strict";
import * as cheerio from "cheerio";
import { checkSeo } from "./checks/seo.js";
import { checkAccessibility } from "./checks/accessibility.js";
import { checkStructure } from "./checks/structure.js";
import { checkLinks } from "./checks/links.js";
import { checkPerformance } from "./checks/performance.js";
import { calculateScores, sortIssues } from "./score.js";

const ctx = { finalUrl: "https://example.com/", bytes: 4096, elapsedMs: 120 };

const BAD = `<html><body>
  <div><img src="/a.jpg"><img src="/b.jpg"></div>
  <h3>Skipped straight to h3</h3>
  <input type="text" name="q">
  <button><svg></svg></button>
  <a href="">dead</a>
  <a href="http://other.com" target="_blank">click here</a>
</body></html>`;

const GOOD = `<!doctype html><html lang="en"><head>
  <title>Example Domain — a reference page for documentation</title>
  <meta name="description" content="A carefully written description of this page that lands comfortably inside the range search engines display without truncating it.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="Example">
</head><body>
  <header><nav><a href="/about">About the project</a></nav></header>
  <main><h1>Example</h1><h2>Details</h2>
    <img src="/a.jpg" alt="A description" width="80" height="60" loading="lazy">
    <label for="q">Search</label><input id="q" type="text">
  </main>
  <footer><a href="/contact">Contact us</a></footer>
</body></html>`;

const run = (html) => {
  const $ = cheerio.load(html);
  return sortIssues([
    ...checkSeo($, ctx).issues,
    ...checkAccessibility($).issues,
    ...checkStructure($).issues,
    ...checkLinks($, ctx).issues,
    ...checkPerformance($, ctx).issues,
  ]);
};

// --- A broken page is detected across every category ------------------
const bad = run(BAD);
const badIds = bad.map((i) => i.id);
for (const id of [
  "seo.title.missing",
  "seo.viewport.missing",
  "a11y.img.alt",
  "a11y.input.label",
  "a11y.button.name",
  "a11y.link.text",
  "structure.h1.missing",
  "links.empty",
  "links.noopener",
]) {
  assert.ok(badIds.includes(id), `expected issue ${id}, got ${badIds.join(", ")}`);
}

// --- A clean page produces no critical or high findings ---------------
const good = run(GOOD);
const serious = good.filter((i) => i.severity === "critical" || i.severity === "high");
assert.equal(serious.length, 0, `clean page raised ${serious.map((i) => i.id).join(", ")}`);

// --- Scoring behaves: bounded, ordered, weighted ----------------------
const badScore = calculateScores(bad);
const goodScore = calculateScores(good);

assert.ok(goodScore.overall > badScore.overall, "clean page must outscore broken page");
assert.ok(goodScore.overall >= 90, `clean page scored only ${goodScore.overall}`);
assert.ok(badScore.overall <= 55, `broken page scored ${badScore.overall}, too generous`);

// The broken fixture is tiny, so it has no *performance* faults to find.
// Scoring it 100 there is correct: we only report what we actually detect.
assert.equal(badScore.categories.performance, 100);
assert.ok(badScore.categories.seo < 30, "broken SEO must score low");
assert.ok(badScore.categories.accessibility < 30, "broken a11y must score low");

for (const [key, value] of Object.entries(badScore.categories)) {
  assert.ok(value >= 0 && value <= 100, `${key} out of range: ${value}`);
}

// Overall is genuinely the weighted mean, not an average.
const manual = Math.round(
  goodScore.categories.seo * 0.25 +
    goodScore.categories.accessibility * 0.25 +
    goodScore.categories.structure * 0.2 +
    goodScore.categories.links * 0.15 +
    goodScore.categories.performance * 0.15,
);
assert.equal(goodScore.overall, manual, "overall must equal the documented weighting");

// Severity ordering: criticals first.
const ranks = bad.map((i) => ["critical", "high", "medium", "low"].indexOf(i.severity));
assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), "issues must be severity-sorted");

console.log(
  `analyzer ok — broken page ${badScore.overall}/100 (${bad.length} issues), ` +
    `clean page ${goodScore.overall}/100 (${good.length} issues)`,
);
