import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Minimal HTML tokenizer. A full highlighter (prism/shiki) is ~40kB for
 * markup we already control — this covers tags, attributes and strings,
 * which is every fix WebLens emits.
 * ponytail: swap for shiki only if we start showing JS/CSS fixes.
 */
function highlight(code) {
  const parts = [];
  const re = /(&lt;\/?[\w-]+)|([\w-]+)(?==)|("[^"]*")|(&gt;)/g;
  const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let last = 0, m;
  while ((m = re.exec(escaped))) {
    if (m.index > last) parts.push({ t: escaped.slice(last, m.index) });
    const cls = m[1] || m[4] ? "text-accent" : m[2] ? "text-high" : "text-success";
    parts.push({ t: m[0], cls });
    last = m.index + m[0].length;
  }
  parts.push({ t: escaped.slice(last) });
  return parts;
}

export function CodeBlock({ code, label, tone = "neutral", copyable = true }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="overflow-hidden rounded-md border border-line">
      {label && (
        <div
          className={cn(
            "flex items-center justify-between border-b border-line px-3 py-2",
            tone === "after" ? "bg-success-soft" : "bg-surface",
          )}
        >
          <span
            className={cn(
              "font-mono text-meta font-medium uppercase",
              tone === "after" ? "text-success" : "text-ink-faint",
            )}
          >
            {label}
          </span>
          {copyable && (
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-meta uppercase text-ink-faint transition-colors hover:text-ink"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      {/* Horizontal scroll on mobile rather than wrapping (§29). */}
      <pre className="overflow-x-auto bg-sunken px-3 py-3">
        <code className="font-mono text-[13px] leading-relaxed text-ink">
          {highlight(code).map((p, i) =>
            p.cls ? (
              <span key={i} className={p.cls} dangerouslySetInnerHTML={{ __html: p.t }} />
            ) : (
              <span key={i} dangerouslySetInnerHTML={{ __html: p.t }} />
            ),
          )}
        </code>
      </pre>
    </div>
  );
}
