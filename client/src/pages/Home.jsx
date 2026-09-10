import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { HeroReport } from "@/components/home/HeroReport";
import { useReveal } from "@/animations/useReveal";
import { normalizeUrl } from "@/lib/format";

const RULE_ENGINE = [
  "Title, description, canonical, viewport",
  "Alt text, labels, accessible names",
  "Heading hierarchy and landmarks",
  "Internal, external and malformed links",
  "Scripts, stylesheets, DOM size",
];

const AI_ENGINE = [
  "Plain-language explanation of impact",
  "Which issues to fix first, and why",
  "Suggested code fixes you can copy",
  "A prioritised improvement roadmap",
  "An executive summary of the report",
];

function Section({ children, className = "" }) {
  const ref = useReveal({ selector: "[data-reveal]", stagger: 0.08, y: 18 });
  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const target = normalizeUrl(url);
    navigate(target ? `/analyze?url=${encodeURIComponent(target)}` : "/analyze");
  };

  return (
    <main>
      {/* ================= Hero ======================================== */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 lg:pt-28">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          <div>
            <p className="font-mono text-meta uppercase text-ink-faint">
              Website quality analyzer
            </p>

            {/* Three words, three lines — the product loop as typography. */}
            <h1 className="mt-6 text-hero font-medium text-ink">
              Analyze.
              <br />
              Understand.
              <br />
              <span className="text-ink-faint">Improve.</span>
            </h1>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-muted">
              An intelligent website quality analyzer that combines deterministic
              web analysis with generative AI to help you understand and improve
              your website.
            </p>

            <form onSubmit={submit} className="mt-10 flex max-w-md flex-col gap-2 sm:flex-row">
              <label htmlFor="hero-url" className="sr-only">
                Website URL
              </label>
              <Input
                id="hero-url"
                mono
                inputMode="url"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button type="submit" size="lg" className="shrink-0">
                Analyze a website
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </form>

            <Link
              to="/about"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              See how it works
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <HeroReport />
        </div>
      </section>

      {/* ================= Two engines ================================= */}
      <Section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div data-reveal className="max-w-2xl">
            <p className="font-mono text-meta uppercase text-ink-faint">
              How WebLens works
            </p>
            <h2 className="mt-4 text-display font-medium tracking-tight text-ink">
              Two engines. One report.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              The rule engine measures. The AI engine explains. Keeping them
              separate is what makes the score reproducible and the advice
              specific.
            </p>
          </div>

          <div data-reveal className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
            <div className="bg-canvas p-8">
              <p className="font-mono text-meta uppercase text-ink-faint">
                Rule engine
              </p>
              <p className="mt-3 text-title font-medium tracking-tight text-ink">
                Deterministic
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Fetches the page, parses the HTML, and applies fixed checks. The
                same page always produces the same score.
              </p>
              <ul className="mt-6 space-y-2.5">
                {RULE_ENGINE.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-ink">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-line-strong" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-canvas p-8">
              <p className="font-mono text-meta uppercase text-accent">AI engine</p>
              <p className="mt-3 text-title font-medium tracking-tight text-ink">
                Interpretive
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Receives the findings — never the raw HTML — and turns them into
                something you can act on. It never touches the score.
              </p>
              <ul className="mt-6 space-y-2.5">
                {AI_ENGINE.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-ink">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent/40" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p data-reveal className="mt-6 font-mono text-meta uppercase text-ink-faint">
            Rule engine → findings → AI engine → final report
          </p>
        </div>
      </Section>

      {/* ================= Before / after ============================== */}
      <Section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div data-reveal>
              <p className="font-mono text-meta uppercase text-ink-faint">
                Suggested fixes
              </p>
              <h2 className="mt-4 text-display font-medium tracking-tight text-ink">
                Not just what is wrong.
                <br />
                What to write instead.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-muted">
                Where a finding can be corrected in markup, WebLens shows the
                exact replacement. Copy it, apply it, run the analysis again and
                watch the score move.
              </p>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-faint">
                Suggestions are never applied to your site. WebLens only reads
                the HTML your server already makes public.
              </p>
            </div>

            <div data-reveal className="space-y-3">
              <CodeBlock code={'<img src="/campus.jpg">'} label="Before" copyable={false} />
              <CodeBlock
                code={'<img\n  src="/campus.jpg"\n  alt="Students working in the computer laboratory"\n/>'}
                label="Suggested fix"
                tone="after"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ================= The loop ==================================== */}
      <Section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div data-reveal className="max-w-2xl">
            <p className="font-mono text-meta uppercase text-ink-faint">
              The improvement loop
            </p>
            <h2 className="mt-4 text-display font-medium tracking-tight text-ink">
              A report you can act on twice.
            </h2>
          </div>

          <ol data-reveal className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {["Analyze", "Detect", "Explain", "Fix", "Re-analyze", "Improve"].map(
              (step, i) => (
                <li key={step} className="bg-canvas px-5 py-6">
                  <span className="tnum font-mono text-meta text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-sm font-medium text-ink">{step}</p>
                </li>
              ),
            )}
          </ol>

          <p data-reveal className="mt-8 max-w-xl text-sm leading-relaxed text-ink-muted">
            Analyse the same site again and the report shows the previous score
            beside the current one, so an improvement is a number rather than a
            feeling.
          </p>
        </div>
      </Section>

      {/* ================= Trust ======================================= */}
      <Section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div data-reveal className="grid gap-10 sm:grid-cols-3">
            {[
              {
                title: "Honest about method",
                body: "WebLens inspects the HTML your server returns. It does not render the page or run a load test, and it never reports a measurement it did not take.",
              },
              {
                title: "Explainable scoring",
                body: "Every category starts at 100 and loses a fixed number of points per issue. Any score can be traced back to the findings that produced it.",
              },
              {
                title: "Works without AI",
                body: "If every AI provider is unreachable, the technical report is still produced in full. The analysis has never depended on a model.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-[15px] font-medium text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================= Final CTA =================================== */}
      <Section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-28 text-center">
          <h2 data-reveal className="text-display font-medium tracking-tight text-ink">
            Find out what your site is missing.
          </h2>
          <p data-reveal className="mx-auto mt-4 max-w-md text-lg text-ink-muted">
            One URL. Around fifteen seconds. No account needed.
          </p>
          <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/analyze">
              <Button size="lg">
                Analyze a website
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Link>
            <Link to="/report/demo?demo=1">
              <Button size="lg" variant="secondary">
                View a sample report
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
