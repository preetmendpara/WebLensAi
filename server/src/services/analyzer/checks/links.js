/**
 * Link analysis. Structural only — we do not fetch every link, so we
 * never claim a link is "broken".
 */
export function checkLinks($, ctx) {
  const issues = [];
  const add = (i) => issues.push({ category: "links", ...i });

  const base = new URL(ctx.finalUrl);
  let internal = 0;
  let external = 0;
  const malformed = [];
  const empty = [];
  const insecureExternal = [];
  const unsafeTargets = [];

  $("a").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");

    if (href === undefined || href.trim() === "") {
      empty.push($.html(el).slice(0, 90));
      return;
    }
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    let url;
    try {
      url = new URL(href, base);
    } catch {
      malformed.push(href.slice(0, 90));
      return;
    }

    if (url.hostname === base.hostname) {
      internal++;
    } else {
      external++;
      if (url.protocol === "http:" && base.protocol === "https:") {
        insecureExternal.push(url.href);
      }
      if ($el.attr("target") === "_blank") {
        const rel = ($el.attr("rel") ?? "").toLowerCase();
        if (!rel.includes("noopener")) unsafeTargets.push(url.href);
      }
    }
  });

  if (empty.length) {
    add({
      id: "links.empty",
      severity: "high",
      weight: 20,
      title: "Links with no destination",
      description: `${empty.length} anchor element${empty.length > 1 ? "s have" : " has"} a missing or empty href. Keyboard users can focus them but nothing happens.`,
      location: "<a>",
      evidence: empty.slice(0, 3).join("\n"),
      recommendation:
        "Give each anchor a real href, or use a <button> if it triggers an action rather than navigation.",
      fixable: true,
    });
  }

  if (malformed.length) {
    add({
      id: "links.malformed",
      severity: "medium",
      weight: 14,
      title: "Malformed link addresses",
      description: `${malformed.length} link${malformed.length > 1 ? "s could" : " could"} not be parsed as a valid URL.`,
      location: "<a href>",
      evidence: malformed.slice(0, 3).join("\n"),
      recommendation: "Correct the href values so they form valid URLs.",
    });
  }

  if (unsafeTargets.length) {
    add({
      id: "links.noopener",
      severity: "medium",
      weight: 12,
      title: "New-tab links without rel=noopener",
      description: `${unsafeTargets.length} link${unsafeTargets.length > 1 ? "s open" : " opens"} in a new tab without rel="noopener". The opened page gets scripting access back to this one via window.opener.`,
      location: "<a target=_blank>",
      evidence: unsafeTargets.slice(0, 3).join("\n"),
      recommendation: 'Add rel="noopener noreferrer" to links using target="_blank".',
      fixable: true,
    });
  }

  if (insecureExternal.length) {
    add({
      id: "links.insecure",
      severity: "low",
      weight: 8,
      title: "Links to insecure http addresses",
      description: `${insecureExternal.length} link${insecureExternal.length > 1 ? "s point" : " points"} to http:// from an https:// page.`,
      location: "<a href>",
      evidence: insecureExternal.slice(0, 3).join("\n"),
      recommendation: "Update these links to https where the destination supports it.",
    });
  }

  if (internal + external === 0) {
    add({
      id: "links.none",
      severity: "medium",
      weight: 15,
      title: "Page has no links",
      description:
        "No navigable links were found, so this page is a dead end for both visitors and search engine crawlers.",
      location: "<body>",
      recommendation: "Add navigation to related pages.",
    });
  }

  return {
    issues,
    stats: {
      internal,
      external,
      total: internal + external,
      malformed: malformed.length,
      empty: empty.length,
    },
  };
}
