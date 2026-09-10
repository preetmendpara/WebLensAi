import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight">WebLens</span>
              <span className="font-mono text-meta uppercase text-ink-faint">AI</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              A deterministic website analysis engine, enhanced by generative AI.
            </p>
          </div>

          <nav className="flex gap-12 text-sm" aria-label="Footer">
            <div className="space-y-2">
              <p className="font-mono text-meta uppercase text-ink-faint">Product</p>
              <Link to="/analyze" className="block text-ink-muted hover:text-ink">Analyzer</Link>
              <Link to="/history" className="block text-ink-muted hover:text-ink">History</Link>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-meta uppercase text-ink-faint">Learn</p>
              <Link to="/about" className="block text-ink-muted hover:text-ink">How it works</Link>
            </div>
          </nav>
        </div>

        <p className="mt-12 border-t border-line pt-6 font-mono text-meta text-ink-faint">
          Analysis is performed on publicly served HTML. Suggested fixes are
          recommendations and are never applied to your site.
        </p>
      </div>
    </footer>
  );
}
