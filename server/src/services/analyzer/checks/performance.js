/**
 * Performance *signals*, not measurements. We never fetched sub-resources
 * or ran the page, so nothing here is presented as a timing metric
 * so nothing here is presented as a measurement the system did not take.
 */
export function checkPerformance($, ctx) {
  const issues = [];
  const add = (i) => issues.push({ category: "performance", ...i });

  const scripts = $("script[src]");
  const inlineScripts = $("script:not([src])");
  const styles = $('link[rel="stylesheet"]');
  const images = $("img");
  const domNodes = $("*").length;
  const htmlKb = Math.round(ctx.bytes / 1024);

  const blocking = scripts.filter(
    (_, el) => !$(el).attr("defer") && !$(el).attr("async") && !$(el).parents("body").length,
  );
  if (blocking.length) {
    add({
      id: "perf.script.blocking",
      severity: "high",
      weight: 20,
      title: "Render-blocking scripts in the head",
      description: `${blocking.length} script${blocking.length > 1 ? "s are" : " is"} loaded in <head> without defer or async. The browser must download and execute them before it can paint anything.`,
      location: "<head><script>",
      evidence: blocking
        .slice(0, 3)
        .map((_, el) => $(el).attr("src"))
        .get()
        .join("\n"),
      recommendation: "Add defer to these script tags, or move them to the end of body.",
      fixable: true,
    });
  }

  if (scripts.length > 15) {
    add({
      id: "perf.script.count",
      severity: "medium",
      weight: 12,
      title: "High number of script files",
      description: `The page requests ${scripts.length} separate scripts. Each one is a round trip before the page becomes interactive.`,
      location: "<script src>",
      recommendation: "Bundle scripts together and remove any that are unused.",
    });
  }

  if (styles.length > 6) {
    add({
      id: "perf.style.count",
      severity: "medium",
      weight: 10,
      title: "Many stylesheet requests",
      description: `${styles.length} stylesheets are linked. Every one blocks the first paint until it has downloaded.`,
      location: "<link rel=stylesheet>",
      recommendation: "Combine stylesheets, and inline the critical rules if practical.",
    });
  }

  const lazyable = images.filter((_, el) => !$(el).attr("loading"));
  if (images.length > 8 && lazyable.length > 4) {
    add({
      id: "perf.img.lazy",
      severity: "medium",
      weight: 12,
      title: "Images are not lazy-loaded",
      description: `${lazyable.length} of ${images.length} images have no loading attribute, so images far below the fold are fetched during initial load.`,
      location: "<img>",
      recommendation:
        'Add loading="lazy" to images below the fold. Leave the hero image eager.',
      fixable: true,
    });
  }

  const unsized = images.filter(
    (_, el) => !($(el).attr("width") && $(el).attr("height")),
  );
  if (unsized.length > 2) {
    add({
      id: "perf.img.dimensions",
      severity: "medium",
      weight: 10,
      title: "Images without width and height",
      description: `${unsized.length} images declare no dimensions. The browser cannot reserve space for them, so content jumps as they load.`,
      location: "<img>",
      recommendation:
        "Set width and height attributes so the layout is stable before images arrive.",
      fixable: true,
    });
  }

  if (domNodes > 1500) {
    add({
      id: "perf.dom.size",
      severity: "medium",
      weight: 12,
      title: "Very large DOM",
      description: `The document contains ${domNodes.toLocaleString()} elements. Large trees slow down style recalculation and increase memory use, particularly on phones.`,
      location: "document",
      recommendation:
        "Simplify nesting, and paginate or virtualise long repeating lists.",
    });
  }

  if (htmlKb > 250) {
    add({
      id: "perf.html.size",
      severity: "low",
      weight: 8,
      title: "Large HTML document",
      description: `The HTML itself is ${htmlKb} KB before any images, scripts or styles are counted.`,
      location: "document",
      recommendation: "Move inline data and large embedded content out of the HTML.",
    });
  }

  if (inlineScripts.length > 10) {
    add({
      id: "perf.script.inline",
      severity: "low",
      weight: 6,
      title: "Many inline scripts",
      description: `${inlineScripts.length} inline script blocks were found. They cannot be cached between page loads.`,
      location: "<script>",
      recommendation: "Consolidate inline scripts into cacheable external files.",
    });
  }

  return {
    issues,
    stats: {
      scripts: scripts.length,
      inlineScripts: inlineScripts.length,
      stylesheets: styles.length,
      images: images.length,
      domNodes,
      htmlKb,
      responseMs: ctx.elapsedMs,
    },
  };
}
