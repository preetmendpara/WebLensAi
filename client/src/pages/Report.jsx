import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight, RotateCw, TrendingUp } from "lucide-react";
import { ScoreRing } from "@/components/report/ScoreRing";
import { CategoryBars } from "@/components/report/CategoryBars";
import { IssueCard } from "@/components/report/IssueCard";
import { AIInsight } from "@/components/report/AIInsight";
import { Roadmap } from "@/components/report/Roadmap";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getReport, requestAi } from "@/services/api";
import { DEMO_REPORT } from "@/demo/report";
import { displayUrl, formatDateTime, SEVERITY_ORDER } from "@/lib/format";
import { useReveal } from "@/animations/useReveal";
import { useMotionSafe } from "@/animations/useMotionSafe";

function Section({ label, title, children, className = "" }) {
  const ref = useReveal({ selector: "[data-reveal]", stagger: 0.05, y: 16 });
  return (
    <section ref={ref} className={`mt-20 ${className}`}>
      <div data-reveal>
        <p className="font-mono text-meta uppercase text-ink-faint">{label}</p>
        {title && (
          <h2 className="mt-2 text-title font-medium tracking-tight text-ink">
            {title}
          </h2>
        )}
      </div>
      <div data-reveal className="mt-6">
        {children}
      </div>
    </section>
  );
}

export default function Report() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const isDemo = params.get("demo") === "1";

  const [report, setReport] = useState(isDemo ? DEMO_REPORT : null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [aiPending, setAiPending] = useState(false);
  const motionSafe = useMotionSafe();

  useEffect(() => {
    if (isDemo) return;
    let live = true;

    setLoading(true);
    getReport(id)
      .then((data) => live && setReport(data))
      .catch((err) => live && setError(err.message))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, [id, isDemo]);

  // A stored report may predate its AI pass (analysis saved, providers down).
  // Ask once on open rather than making the user hunt for a button.
  //
  // The ref is what makes it *once*: this effect depends on `report`, and it
  // also updates `report`, so a plain flag would re-enter and retry forever
  // the moment a request failed.
  const aiRequested = useRef(null);

  useEffect(() => {
    if (isDemo || !report || report.ai) return;
    if (aiRequested.current === report.id) return;

    aiRequested.current = report.id;
    setAiPending(true);
    requestAi(report.id)
      .then(({ ai }) => setReport((r) => ({ ...r, ai })))
      .catch(() => setReport((r) => ({ ...r, aiUnavailable: true })))
      .finally(() => setAiPending(false));
  }, [report, isDemo]);

  const counts = useMemo(() => {
    const base = { all: report?.issues.length ?? 0 };
    for (const s of SEVERITY_ORDER) {
      base[s] = report?.issues.filter((i) => i.severity === s).length ?? 0;
    }
    return base;
  }, [report]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? (report?.issues ?? [])
        : (report?.issues ?? []).filter((i) => i.severity === filter),
    [report, filter],
  );

  const fixes = useMemo(
    () => new Map((report?.ai?.codeFixes ?? []).map((f) => [f.issueId, f])),
    [report],
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-6 h-10 w-96 max-w-full" />
        <Skeleton className="mt-12 h-44 w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24">
        <EmptyState
          title="Report not found"
          description={error ?? "This analysis may have been removed."}
          action={
            <Link to="/analyze">
              <Button>Run a new analysis</Button>
            </Link>
          }
        />
      </main>
    );
  }

  const delta = report.previous
    ? report.overallScore - report.previous.overallScore
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {isDemo && (
        <p className="mb-8 rounded-md border border-medium/25 bg-medium-soft px-3 py-2 font-mono text-meta uppercase text-medium">
          Demo report · pre-generated sample data
        </p>
      )}

      {/* --- Identity + score ------------------------------------------- */}
      <header className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="font-mono text-meta uppercase text-ink-faint">
            Analysis report
          </p>
          <h1
            className="mt-3 truncate text-display font-medium tracking-tight text-ink"
            title={report.url}
          >
            {displayUrl(report.url)}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-meta uppercase text-ink-faint">
            <span>{formatDateTime(report.analyzedAt)}</span>
            {report.httpStatus && <span>HTTP {report.httpStatus}</span>}
            <a
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-muted hover:text-ink"
            >
              Visit site
              <ArrowUpRight className="size-3" aria-hidden />
            </a>
          </div>

          {delta !== null && (
            <motion.div
              initial={motionSafe ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="mt-5 inline-flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2"
            >
              <TrendingUp
                className={`size-4 ${delta >= 0 ? "text-success" : "text-critical"}`}
                aria-hidden
              />
              <span className="text-sm text-ink-muted">
                Previous run scored{" "}
                <span className="tnum font-medium text-ink">
                  {report.previous.overallScore}
                </span>
              </span>
              <span
                className={`tnum font-mono text-sm font-medium ${delta >= 0 ? "text-success" : "text-critical"}`}
              >
                {delta >= 0 ? "+" : ""}
                {delta}
              </span>
            </motion.div>
          )}
        </div>

        <div className="justify-self-start sm:justify-self-end">
          <ScoreRing score={report.overallScore} />
        </div>
      </header>

      {/* --- Category breakdown ----------------------------------------- */}
      <Section label="Category scores" title="How the score breaks down">
        <CategoryBars categories={report.categories} />
        <p className="mt-6 text-sm leading-relaxed text-ink-muted">
          Each category starts at 100 and loses points for every issue found.
          The overall score is the weighted average shown above — nothing here
          is estimated or generated.
        </p>
      </Section>

      {/* --- AI ---------------------------------------------------------- */}
      <div className="mt-20">
        {aiPending && !report.ai ? (
          <div className="rounded-lg border border-line bg-surface px-5 py-4">
            <p className="font-mono text-meta uppercase text-ink-faint">
              AI insight
            </p>
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        ) : (
          <AIInsight ai={report.ai} unavailable={report.aiUnavailable} />
        )}
      </div>

      {/* --- Issues ------------------------------------------------------ */}
      <Section label="Findings" title={`${report.issues.length} issues detected`}>
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "all", label: "All", count: counts.all },
            ...SEVERITY_ORDER.filter((s) => counts[s] > 0).map((s) => ({
              value: s,
              label: s[0].toUpperCase() + s.slice(1),
              count: counts[s],
            })),
          ]}
        />

        {/* CSS stagger, not a JS one: see tokens.css. The key includes the
            filter so switching tabs replays the entrance. */}
        <div className="mt-6 space-y-3">
          {visible.map((issue, i) => (
            <div
              key={`${filter}-${issue.id}`}
              className="reveal-item"
              style={{ "--i": i }}
            >
              <IssueCard
                issue={issue}
                explanation={report.ai?.explanations?.[issue.id]}
                fix={fixes.get(issue.id)}
              />
            </div>
          ))}
        </div>

        {visible.length === 0 && (
          <EmptyState
            className="mt-6"
            title="Nothing at this severity"
            description="Every issue found sits at a different severity level."
          />
        )}
      </Section>

      {/* --- Roadmap ----------------------------------------------------- */}
      {report.ai?.roadmap?.length > 0 && (
        <Section label="Improvement plan" title="What to do, in order">
          <Roadmap steps={report.ai.roadmap} />
        </Section>
      )}

      {/* --- Re-analyze loop --------------------------------------------- */}
      <section className="mt-20 flex flex-col items-start gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-title font-medium tracking-tight text-ink">
            Made some changes?
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Run it again to see the score move.
          </p>
        </div>
        <Link to={`/analyze?url=${encodeURIComponent(report.url)}`}>
          <Button variant="secondary">
            <RotateCw className="size-4" aria-hidden />
            Re-analyze this site
          </Button>
        </Link>
      </section>
    </main>
  );
}
