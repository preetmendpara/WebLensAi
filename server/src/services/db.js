import { createClient } from "@supabase/supabase-js";

/**
 * Supabase access, service-role. Only this module touches the database;
 * controllers speak in domain objects.
 *
 * Every function degrades to a no-op or null when Supabase is unreachable
 * — losing history must never take down an analysis (spec §31).
 */

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

export const dbEnabled = Boolean(url && key);

const supabase = dbEnabled
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;

const CACHE_TTL_HOURS = 24;

/** Persist an analysis plus its issues. Returns the new id, or null. */
export async function saveAnalysis(result) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      url: result.url,
      requested_url: result.requestedUrl,
      http_status: result.httpStatus,
      overall_score: result.overallScore,
      seo_score: result.categories.seo,
      accessibility_score: result.categories.accessibility,
      structure_score: result.categories.structure,
      links_score: result.categories.links,
      performance_score: result.categories.performance,
      statistics: result.statistics,
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[db] saveAnalysis failed:", error.message);
    return null;
  }

  if (result.issues.length) {
    const { error: issueError } = await supabase.from("issues").insert(
      result.issues.map((i) => ({
        analysis_id: data.id,
        rule_id: i.id,
        category: i.category,
        severity: i.severity,
        weight: i.weight ?? 0,
        title: i.title,
        description: i.description,
        location: i.location,
        evidence: i.evidence,
        recommendation: i.recommendation,
        fixable: Boolean(i.fixable),
      })),
    );
    if (issueError) console.error("[db] saveIssues failed:", issueError.message);
  }

  return data.id;
}

export async function listAnalyses(limit = 50) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("analyses")
    .select("id, url, overall_score, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[db] listAnalyses failed:", error.message);
    return [];
  }

  // One extra query gets issue counts for the whole page of results.
  const ids = data.map((a) => a.id);
  const counts = new Map();
  if (ids.length) {
    const { data: rows } = await supabase
      .from("issues")
      .select("analysis_id, severity")
      .in("analysis_id", ids);
    for (const row of rows ?? []) {
      const entry = counts.get(row.analysis_id) ?? { total: 0, critical: 0, high: 0 };
      entry.total++;
      if (row.severity === "critical") entry.critical++;
      if (row.severity === "high") entry.high++;
      counts.set(row.analysis_id, entry);
    }
  }

  const withAi = new Set();
  if (ids.length) {
    const { data: ai } = await supabase
      .from("ai_insights")
      .select("analysis_id")
      .in("analysis_id", ids);
    for (const row of ai ?? []) withAi.add(row.analysis_id);
  }

  return data.map((a) => ({
    id: a.id,
    url: a.url,
    overallScore: a.overall_score,
    createdAt: a.created_at,
    issues: counts.get(a.id) ?? { total: 0, critical: 0, high: 0 },
    hasAi: withAi.has(a.id),
  }));
}

export async function getAnalysis(id) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .eq("analysis_id", id);

  const { data: ai } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("analysis_id", id)
    .maybeSingle();

  // The score of the previous run of the same URL, for the delta banner.
  const { data: prev } = await supabase
    .from("analyses")
    .select("overall_score, created_at")
    .eq("url", data.url)
    .lt("created_at", data.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { row: data, issues: issues ?? [], ai, previous: prev ?? null };
}

/** Look for a usable cached generation for these exact findings. */
export async function findCachedInsight(hash) {
  if (!supabase) return null;
  const since = new Date(Date.now() - CACHE_TTL_HOURS * 3600_000).toISOString();

  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("findings_hash", hash)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export async function saveInsight(analysisId, hash, generated) {
  if (!supabase) return null;
  const { insight, provider, model } = generated;

  const { data, error } = await supabase
    .from("ai_insights")
    .upsert(
      {
        analysis_id: analysisId,
        findings_hash: hash,
        provider,
        model,
        summary: insight.summary,
        priorities: insight.priorities,
        explanations: insight.explanations,
        code_fixes: insight.codeFixes,
        roadmap: insight.roadmap,
      },
      { onConflict: "analysis_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("[db] saveInsight failed:", error.message);
    return null;
  }
  return data;
}
