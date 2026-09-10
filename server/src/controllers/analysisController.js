import { analyze, toAiPayload, STAGES } from "../services/analyzer/index.js";
import { generateInsights, findingsHash } from "../services/ai/index.js";
import {
  saveAnalysis,
  listAnalyses,
  getAnalysis,
  findCachedInsight,
  saveInsight,
} from "../services/db.js";
import { FetchError } from "../utils/safeFetch.js";

const AI_STAGE = "Generating AI insights";
export const ALL_STAGES = [...STAGES, AI_STAGE];

/** Shape a stored row back into the response the client renders. */
function present({ row, issues, ai, previous }) {
  return {
    id: row.id,
    url: row.url,
    analyzedAt: row.created_at,
    httpStatus: row.http_status,
    overallScore: row.overall_score,
    categories: {
      seo: row.seo_score,
      accessibility: row.accessibility_score,
      structure: row.structure_score,
      links: row.links_score,
      performance: row.performance_score,
    },
    statistics: row.statistics,
    issues: issues.map((i) => ({
      id: i.rule_id,
      category: i.category,
      severity: i.severity,
      weight: i.weight,
      title: i.title,
      description: i.description,
      location: i.location,
      evidence: i.evidence,
      recommendation: i.recommendation,
      fixable: i.fixable,
    })),
    previous: previous
      ? { overallScore: previous.overall_score, analyzedAt: previous.created_at }
      : null,
    ai: ai
      ? {
          summary: ai.summary,
          priorities: ai.priorities,
          explanations: ai.explanations,
          codeFixes: ai.code_fixes,
          roadmap: ai.roadmap,
          provider: ai.provider,
          generatedAt: ai.created_at,
        }
      : null,
  };
}

/**
 * POST /api/analyze — streams real stage events over SSE, then the report.
 *
 * Server-Sent Events rather than a plain JSON response so the progress UI
 * reflects work that is actually happening rather than a timer.
 */
export async function runAnalysis(req, res) {
  const { url } = req.body ?? {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: { code: "INVALID_URL", message: "Enter a website address to analyze." } });
  }

  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  });

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const result = await analyze(url, (stage) => send("stage", { stage }));

    const analysisId = await saveAnalysis(result);
    const payload = toAiPayload(result);
    const hash = findingsHash(payload);

    // Deterministic report goes out first: if AI stalls, the user already
    // has everything the rule engine found.
    send("report", { ...result, id: analysisId });

    send("stage", { stage: AI_STAGE });

    const cached = analysisId ? await findCachedInsight(hash) : null;
    if (cached) {
      if (analysisId && cached.analysis_id !== analysisId) {
        await saveInsight(analysisId, hash, {
          insight: {
            summary: cached.summary,
            priorities: cached.priorities,
            explanations: cached.explanations,
            codeFixes: cached.code_fixes,
            roadmap: cached.roadmap,
          },
          provider: cached.provider,
          model: cached.model,
        });
      }
      send("ai", {
        summary: cached.summary,
        priorities: cached.priorities,
        explanations: cached.explanations,
        codeFixes: cached.code_fixes,
        roadmap: cached.roadmap,
        provider: cached.provider,
        cached: true,
      });
    } else {
      const generated = await generateInsights(payload);
      if (generated) {
        if (analysisId) await saveInsight(analysisId, hash, generated);
        send("ai", { ...generated.insight, provider: generated.provider, cached: false });
      } else {
        send("ai_unavailable", {
          message:
            "Technical analysis completed. AI insights are temporarily unavailable.",
        });
      }
    }

    send("done", { id: analysisId });
  } catch (err) {
    const known = err instanceof FetchError;
    if (!known) console.error("[analyze] unexpected:", err);
    send("error", {
      code: known ? err.code : "INTERNAL",
      message: known
        ? err.message
        : "Something went wrong while analyzing that website. Please try again.",
    });
  } finally {
    res.end();
  }
}

export async function getHistory(_req, res) {
  res.json({ analyses: await listAnalyses() });
}

export async function getReport(req, res) {
  const record = await getAnalysis(req.params.id);
  if (!record) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "That report could not be found." },
    });
  }
  res.json(present(record));
}

export async function getIssues(req, res) {
  const record = await getAnalysis(req.params.id);
  if (!record) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "That report could not be found." },
    });
  }
  res.json({ issues: present(record).issues });
}

/** POST /api/analyses/:id/ai — generate insights for a stored report. */
export async function enhanceWithAi(req, res) {
  const record = await getAnalysis(req.params.id);
  if (!record) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "That report could not be found." },
    });
  }

  const report = present(record);
  if (report.ai) return res.json({ ai: report.ai, cached: true });

  const payload = {
    url: report.url,
    overallScore: report.overallScore,
    categories: report.categories,
    statistics: report.statistics,
    issues: report.issues.map((i) => ({
      id: i.id,
      category: i.category,
      severity: i.severity,
      title: i.title,
      location: i.location,
      evidence: i.evidence?.slice(0, 300),
    })),
  };

  const hash = findingsHash(payload);
  const cached = await findCachedInsight(hash);
  if (cached) {
    return res.json({
      ai: {
        summary: cached.summary,
        priorities: cached.priorities,
        explanations: cached.explanations,
        codeFixes: cached.code_fixes,
        roadmap: cached.roadmap,
        provider: cached.provider,
      },
      cached: true,
    });
  }

  const generated = await generateInsights(payload);
  if (!generated) {
    return res.status(503).json({
      error: {
        code: "AI_UNAVAILABLE",
        message: "AI insights are temporarily unavailable. Your technical analysis is still available.",
      },
    });
  }

  await saveInsight(report.id, hash, generated);
  res.json({ ai: { ...generated.insight, provider: generated.provider }, cached: false });
}
