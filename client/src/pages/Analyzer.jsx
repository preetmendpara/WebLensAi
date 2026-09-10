import { useCallback, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AnalysisProgress } from "@/components/analyzer/AnalysisProgress";
import { streamAnalysis } from "@/services/api";
import { normalizeUrl } from "@/lib/format";
import { EASE } from "@/animations/motionPresets";
import { useMotionSafe } from "@/animations/useMotionSafe";

const EXAMPLES = ["example.com", "wikipedia.org", "news.ycombinator.com"];

export default function Analyzer() {
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get("url") ?? "");
  const [stage, setStage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const motionSafe = useMotionSafe();

  const running = stage !== null;

  const start = useCallback(
    async (raw) => {
      const url = normalizeUrl(raw);
      if (!url) return;

      setError(null);
      setStage("Fetching website");

      const controller = new AbortController();
      abortRef.current = controller;

      let reportId = null;

      try {
        await streamAnalysis(
          url,
          {
            stage: ({ stage }) => setStage(stage),
            report: (report) => {
              reportId = report.id;
            },
            error: ({ message }) => {
              setError(message);
              setStage(null);
            },
            done: ({ id }) => {
              // The report is already persisted; navigate to its permalink
              // so it is shareable and survives a refresh.
              if (id ?? reportId) navigate(`/report/${id ?? reportId}`);
              else setError("The analysis finished but could not be saved.");
            },
          },
          controller.signal,
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setStage(null);
        }
      }
    },
    [navigate],
  );

  const onSubmit = (e) => {
    e.preventDefault();
    start(value);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col justify-center px-6 py-20">
      <AnimatePresence mode="wait">
        {running ? (
          <AnalysisProgress key="progress" current={stage} url={normalizeUrl(value)} />
        ) : (
          <motion.div
            key="form"
            initial={motionSafe ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <h1 className="text-display font-medium tracking-tight text-ink">
              Analyze any website.
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-ink-muted">
              Enter a public URL. WebLens inspects the page it serves, scores it
              across five categories, and explains what to fix first.
            </p>

            <form onSubmit={onSubmit} className="mt-10">
              <label htmlFor="url" className="sr-only">
                Website URL
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="url"
                  name="url"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  mono
                  placeholder="https://example.com"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  aria-describedby={error ? "url-error" : undefined}
                  aria-invalid={error ? true : undefined}
                />
                <Button type="submit" size="lg" disabled={!value.trim()}>
                  Analyze
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            </form>

            <AnimatePresence>
              {error && (
                <motion.p
                  id="url-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-start gap-2 text-sm text-critical"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="font-mono text-meta uppercase text-ink-faint">
                Try
              </span>
              {EXAMPLES.map((site) => (
                <button
                  key={site}
                  onClick={() => {
                    setValue(site);
                    start(site);
                  }}
                  className="rounded-sm border border-line px-2 py-1 font-mono text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  {site}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
