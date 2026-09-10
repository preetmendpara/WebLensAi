/** Document structure and semantics. */
export function checkStructure($) {
  const issues = [];
  const add = (i) => issues.push({ category: "structure", ...i });

  const h1 = $("h1");
  if (h1.length === 0) {
    add({
      id: "structure.h1.missing",
      severity: "high",
      weight: 22,
      title: "No H1 heading",
      description:
        "The page has no top-level heading, so neither users skimming with a screen reader nor search engines can identify its main subject.",
      location: "<body>",
      recommendation: "Add exactly one H1 stating what the page is about.",
      fixable: true,
    });
  } else if (h1.length > 1) {
    add({
      id: "structure.h1.multiple",
      severity: "medium",
      weight: 10,
      title: "Multiple H1 headings",
      description: `The page has ${h1.length} H1 elements. A single H1 keeps the document outline unambiguous.`,
      location: "<h1>",
      evidence: h1
        .slice(0, 3)
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" | "),
      recommendation: "Keep one H1 and demote the others to H2.",
    });
  }

  // Heading hierarchy: flag jumps of more than one level (h2 -> h4).
  const levels = $("h1,h2,h3,h4,h5,h6")
    .map((_, el) => Number(el.tagName[1]))
    .get();
  const skips = [];
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      skips.push(`H${levels[i - 1]} → H${levels[i]}`);
    }
  }
  if (skips.length) {
    add({
      id: "structure.heading.skip",
      severity: "medium",
      weight: 12,
      title: "Heading levels are skipped",
      description: `The outline jumps a level ${skips.length} time${skips.length > 1 ? "s" : ""}. Assistive technology uses heading order to build a navigable table of contents.`,
      location: "headings",
      evidence: skips.slice(0, 4).join(", "),
      recommendation:
        "Step heading levels one at a time. Style with CSS if a smaller heading is wanted visually.",
    });
  }

  const landmarks = ["main", "header", "footer", "nav"].filter(
    (tag) => $(tag).length > 0,
  );
  if (!$("main").length) {
    add({
      id: "structure.main.missing",
      severity: "medium",
      weight: 12,
      title: "No main landmark",
      description:
        "There is no <main> element, so screen reader users cannot skip straight to the primary content.",
      location: "<body>",
      recommendation: "Wrap the primary content in a <main> element.",
      fixable: true,
    });
  }

  const semanticCount = $(
    "main,header,footer,nav,article,section,aside,figure",
  ).length;
  const divCount = $("div").length;
  if (divCount > 40 && semanticCount < 4) {
    add({
      id: "structure.semantics",
      severity: "low",
      weight: 8,
      title: "Markup relies heavily on generic containers",
      description: `The page uses ${divCount} div elements against only ${semanticCount} semantic ones. Semantic elements give the document a machine-readable structure.`,
      location: "<body>",
      recommendation:
        "Replace layout divs with header, nav, main, section, article and footer where they apply.",
    });
  }

  if (!$("!doctype").length && !$.html().trim().toLowerCase().startsWith("<!doctype")) {
    add({
      id: "structure.doctype",
      severity: "low",
      weight: 6,
      title: "Missing doctype declaration",
      description:
        "Without <!doctype html>, browsers fall back to quirks mode, which changes how CSS box sizing behaves.",
      location: "document",
      recommendation: "Start the document with <!doctype html>.",
      fixable: true,
    });
  }

  return {
    issues,
    stats: {
      h1Count: h1.length,
      headings: levels.length,
      headingSkips: skips.length,
      landmarks,
      divCount,
      semanticCount,
    },
  };
}
