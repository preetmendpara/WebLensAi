import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getHistory } from "@/services/api";
import { DEMO_HISTORY } from "@/demo/report";
import { displayUrl, formatDate, scoreTone } from "@/lib/format";

const TONE_TEXT = {
  success: "text-success",
  low: "text-low",
  medium: "text-medium",
  high: "text-high",
  critical: "text-critical",
};

export default function History() {
  const [params] = useSearchParams();
  const isDemo = params.get("demo") === "1";

  const [rows, setRows] = useState(isDemo ? DEMO_HISTORY : null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemo) return;
    let live = true;
    getHistory()
      .then(({ analyses }) => live && setRows(analyses))
      .catch((err) => live && setError(err.message));
    return () => {
      live = false;
    };
  }, [isDemo]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-meta uppercase text-ink-faint">History</p>
          <h1 className="mt-3 text-display font-medium tracking-tight text-ink">
            Previous analyses
          </h1>
        </div>
        <Link to="/analyze">
          <Button variant="secondary">New analysis</Button>
        </Link>
      </header>

      {error && (
        <p role="alert" className="mt-10 text-sm text-critical">
          {error}
        </p>
      )}

      {!rows && !error && (
        <div className="mt-12 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {rows?.length === 0 && (
        <EmptyState
          className="mt-12"
          title="No analyses yet"
          description="Enter a website URL to generate your first WebLens report."
          action={
            <Link to="/analyze">
              <Button>Analyze a website</Button>
            </Link>
          }
        />
      )}

      {rows?.length > 0 && (
        <div className="mt-12">
          {/* Column headers on wide screens; each row stands alone on mobile (§29). */}
          <div className="hidden grid-cols-[1fr_5rem_7rem_7rem] gap-4 border-b border-line pb-2 sm:grid">
            {["Website", "Score", "Issues", "Date"].map((h) => (
              <span key={h} className="font-mono text-meta uppercase text-ink-faint">
                {h}
              </span>
            ))}
          </div>

          <ul>
            {rows.map((row, i) => (
              <li
                key={row.id}
                className="reveal-item border-b border-line"
                style={{ "--i": i }}
              >
                <Link
                  to={`/report/${row.id}${isDemo ? "?demo=1" : ""}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-surface sm:grid-cols-[1fr_5rem_7rem_7rem] sm:px-2"
                >
                  <span className="truncate font-mono text-sm text-ink" title={row.url}>
                    {displayUrl(row.url)}
                  </span>

                  <span
                    className={`tnum text-right text-[15px] font-medium sm:text-left ${TONE_TEXT[scoreTone(row.overallScore)]}`}
                  >
                    {row.overallScore}
                  </span>

                  <span className="col-span-2 font-mono text-meta uppercase text-ink-faint sm:col-span-1">
                    {row.issues.total} issue{row.issues.total === 1 ? "" : "s"}
                    {row.issues.critical > 0 && ` · ${row.issues.critical} critical`}
                  </span>

                  <span className="col-span-2 font-mono text-meta uppercase text-ink-faint sm:col-span-1">
                    {formatDate(row.createdAt)}
                    {row.hasAi && " · AI"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
