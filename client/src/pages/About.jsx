import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/animations/useReveal";
import { CATEGORY_LABELS, CATEGORY_WEIGHTS } from "@/lib/format";

const CATEGORY_DETAIL = {
  seo: "Title, meta description, viewport, canonical URL, document language and Open Graph tags.",
  accessibility:
    "Image alternative text, form field labels, accessible button names and descriptive link text.",
  structure:
    "H1 presence, heading hierarchy, landmark elements and the balance of semantic to generic markup.",
  links:
    "Internal and external links, empty or malformed hrefs, and new-tab links missing rel=noopener.",
  performance:
    "Render-blocking scripts, request counts, image loading attributes, and DOM size.",
};

function Section({ children }) {
  const ref = useReveal({ selector: "[data-reveal]", stagger: 0.06, y: 16 });
  return <section ref={ref}>{children}</section>;
}

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-meta uppercase text-ink-faint">How it works</p>
      <h1 className="mt-4 text-display font-medium tracking-tight text-ink">
        A measuring instrument, with a writer attached.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-muted">
        WebLens is not a chatbot pointed at your website. It is a deterministic
        analysis engine whose findings are then explained by a language model.
        That separation is the whole design.
      </p>

      <Section>
        <div className="mt-20">
          <h2 data-reveal className="text-title font-medium tracking-tight text-ink">
            What actually happens
          </h2>

          <ol data-reveal className="mt-8 space-y-6">
            {[
              ["Fetch", "The URL is validated, resolved, and checked against private network ranges before anything is requested. Redirects are re-validated at every hop."],
              ["Parse", "The returned HTML is parsed into a document tree. The page is not rendered and no scripts are executed."],
              ["Check", "Around thirty fixed checks run across five categories. Each produces a finding with a severity, a location and a fixed point penalty."],
              ["Score", "Each category starts at 100 and loses its findings' penalties. The overall score is the weighted average."],
              ["Explain", "The findings — not the HTML — are sent to a language model in a single request, which writes the summary, priorities, explanations, fixes and roadmap."],
            ].map(([title, body], i) => (
              <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="tnum font-mono text-title font-medium text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15px] font-medium text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <div className="mt-20">
          <h2 data-reveal className="text-title font-medium tracking-tight text-ink">
            How the score is built
          </h2>
          <div data-reveal className="mt-8 divide-y divide-line border-y border-line">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="grid grid-cols-[1fr_4rem] gap-4 py-4">
                <div>
                  <p className="text-[15px] font-medium text-ink">{label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {CATEGORY_DETAIL[key]}
                  </p>
                </div>
                <span className="tnum text-right font-mono text-sm text-ink-muted">
                  {CATEGORY_WEIGHTS[key]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mt-20">
          <h2 data-reveal className="text-title font-medium tracking-tight text-ink">
            What WebLens does not do
          </h2>
          <ul data-reveal className="mt-8 space-y-4">
            {[
              "It does not render the page or execute JavaScript, so content added by client-side scripts is not analyzed.",
              "It does not measure load time, Core Web Vitals or bandwidth. Performance findings are structural signals, and are labelled as such.",
              "It does not crawl your site. One URL is fetched per analysis.",
              "It does not modify anything. Suggested fixes are text for you to copy.",
              "The AI never sets or adjusts a score. It only explains findings that the rule engine produced.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-line-strong" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <div className="mt-20">
          <h2 data-reveal className="text-title font-medium tracking-tight text-ink">
            If the AI is unavailable
          </h2>
          <p data-reveal className="mt-4 text-sm leading-relaxed text-ink-muted">
            Three providers are configured in a fixed order. If one is rate
            limited or fails, the request moves to the next immediately — you are
            never asked to retry. If all three are unreachable, the technical
            report is still produced and clearly marked as being without AI
            insight. The analysis has never depended on a model being available.
          </p>
        </div>
      </Section>

      <div className="mt-20 flex flex-wrap gap-3 border-t border-line pt-10">
        <Link to="/analyze">
          <Button>
            Analyze a website
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </Link>
        <Link to="/report/demo?demo=1">
          <Button variant="secondary">View a sample report</Button>
        </Link>
      </div>
    </main>
  );
}
