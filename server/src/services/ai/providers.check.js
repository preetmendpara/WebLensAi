/**
 * Live provider check: `npm run check:ai` in server/.
 *
 * Hits each configured provider with the real WebLens prompt and verifies the
 * answer is *complete* — every section present, populated, and referring only
 * to findings that exist. A 200 response proves nothing on its own; a model
 * that returns valid JSON with an empty roadmap is still a broken tier.
 *
 * Unlike failover.test.js this spends real quota, so it is not part of
 * `npm test`.
 */
import "dotenv/config";
import { buildChain } from "./chain.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

const payload = {
  url: "https://demo.weblens.dev/",
  overallScore: 74,
  categories: { seo: 76, accessibility: 58, structure: 78, links: 88, performance: 76 },
  statistics: {
    accessibility: { images: 14, imagesMissingAlt: 3, formFields: 2, unlabelledFields: 1 },
    links: { internal: 22, external: 6, total: 28 },
    performance: { scripts: 9, stylesheets: 3, images: 14, domNodes: 842 },
  },
  issues: [
    {
      id: "a11y.img.alt",
      category: "accessibility",
      severity: "high",
      title: "Images missing alternative text",
      location: "<img>",
      evidence: '<img src="/campus.jpg">',
    },
    {
      id: "a11y.input.label",
      category: "accessibility",
      severity: "high",
      title: "Form fields without labels",
      location: "<input>",
      evidence: '<input type="search" name="q" placeholder="Search">',
    },
    {
      id: "seo.description.missing",
      category: "seo",
      severity: "high",
      title: "No meta description",
      location: "<head>",
    },
    {
      id: "structure.heading.skip",
      category: "structure",
      severity: "medium",
      title: "Heading levels are skipped",
      location: "headings",
    },
  ],
};

const known = new Set(payload.issues.map((i) => i.id));

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no JSON in response");
    return JSON.parse(match[0]);
  }
}

/** What "a complete answer" means for a WebLens report. */
function grade(insight) {
  const problems = [];

  const summaryWords = String(insight.summary ?? "").trim().split(/\s+/).filter(Boolean);
  if (summaryWords.length < 20) problems.push(`summary too short (${summaryWords.length} words)`);

  const priorities = insight.priorities ?? [];
  if (priorities.length < 2) problems.push(`only ${priorities.length} priorities`);
  if (priorities.some((p) => !p.reason?.trim())) problems.push("a priority has no reason");

  const explanations = Object.entries(insight.explanations ?? {});
  if (explanations.length < 2) problems.push(`only ${explanations.length} explanations`);
  if (explanations.some(([, v]) => String(v).trim().split(/\s+/).length < 10)) {
    problems.push("an explanation is a stub");
  }

  const fixes = insight.codeFixes ?? [];
  if (fixes.length < 1) problems.push("no code fixes");
  if (fixes.some((f) => !f.before?.trim() || !f.after?.trim())) {
    problems.push("a code fix is missing before/after");
  }
  if (fixes.some((f) => f.before?.trim() === f.after?.trim())) {
    problems.push("a code fix does not change anything");
  }

  const roadmap = insight.roadmap ?? [];
  if (roadmap.length < 3) problems.push(`only ${roadmap.length} roadmap steps`);
  if (roadmap.some((s) => !s.title?.trim() || !s.priority)) {
    problems.push("a roadmap step is incomplete");
  }

  // Hallucination check: everything must point at a real finding.
  const ids = [
    ...priorities.map((p) => p.issueId),
    ...explanations.map(([id]) => id),
    ...fixes.map((f) => f.issueId),
  ];
  const invented = ids.filter((id) => !known.has(id));
  if (invented.length) problems.push(`invented issue ids: ${invented.join(", ")}`);

  return {
    problems,
    counts: {
      summaryWords: summaryWords.length,
      priorities: priorities.length,
      explanations: explanations.length,
      codeFixes: fixes.length,
      roadmap: roadmap.length,
    },
  };
}

const user = buildUserPrompt(payload);
let failures = 0;

for (const provider of buildChain()) {
  process.stdout.write(`\n${provider.name.padEnd(7)} ${provider.model}\n`);

  if (!provider.key) {
    console.log("        SKIPPED — no API key configured");
    failures++;
    continue;
  }

  const started = Date.now();
  try {
    const text = await provider.generate({ system: SYSTEM_PROMPT, user });
    const ms = Date.now() - started;
    const insight = parseJson(text);
    const { problems, counts } = grade(insight);

    console.log(
      `        ${ms} ms · summary ${counts.summaryWords}w · ` +
        `${counts.priorities} priorities · ${counts.explanations} explanations · ` +
        `${counts.codeFixes} fixes · ${counts.roadmap} roadmap`,
    );

    if (problems.length) {
      failures++;
      console.log(`        INCOMPLETE — ${problems.join("; ")}`);
    } else {
      console.log("        COMPLETE");
      console.log(`        "${insight.summary.slice(0, 110)}…"`);
    }
  } catch (err) {
    failures++;
    console.log(`        FAILED — ${err.message.slice(0, 160)}`);
  }
}

console.log(
  failures === 0
    ? "\nAll three providers return complete answers.\n"
    : `\n${failures} of 3 providers unusable.\n`,
);
