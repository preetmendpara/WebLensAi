/**
 * SEO checks. Every issue carries `weight` — the score penalty in points
 * out of 100 for its category. Deterministic and explainable (spec §13).
 */
export function checkSeo($, ctx) {
  const issues = [];
  const add = (i) => issues.push({ category: "seo", ...i });

  const title = $("head title").first().text().trim();
  if (!title) {
    add({
      id: "seo.title.missing",
      severity: "critical",
      weight: 25,
      title: "Page has no title",
      description:
        "The <title> element is missing. Search engines use it as the headline in results and browsers use it as the tab label.",
      location: "<head>",
      recommendation:
        "Add a unique <title> of roughly 50–60 characters describing this page.",
      fixable: true,
    });
  } else if (title.length < 25 || title.length > 65) {
    add({
      id: "seo.title.length",
      severity: "medium",
      weight: 8,
      title: title.length < 25 ? "Title is too short" : "Title is too long",
      description: `The title is ${title.length} characters. Search results typically display 50–60 characters before truncating.`,
      location: "<title>",
      evidence: title,
      recommendation:
        "Rewrite the title to 50–60 characters, leading with the most distinctive words.",
    });
  }

  const desc = $('meta[name="description"]').attr("content")?.trim();
  if (!desc) {
    add({
      id: "seo.description.missing",
      severity: "high",
      weight: 18,
      title: "No meta description",
      description:
        "Without a meta description, search engines generate their own snippet from page text, which is often less compelling than a written one.",
      location: "<head>",
      recommendation:
        "Add a meta description summarising the page in 150–160 characters.",
      fixable: true,
    });
  } else if (desc.length < 70 || desc.length > 165) {
    add({
      id: "seo.description.length",
      severity: "low",
      weight: 5,
      title: "Meta description length is off",
      description: `The description is ${desc.length} characters. The useful range is roughly 150–160.`,
      location: "meta[name=description]",
      evidence: desc.slice(0, 120),
      recommendation: "Adjust the description to 150–160 characters.",
    });
  }

  if (!$('meta[name="viewport"]').length) {
    add({
      id: "seo.viewport.missing",
      severity: "critical",
      weight: 20,
      title: "No viewport meta tag",
      description:
        "Mobile browsers render the page at desktop width and zoom out, making text unreadable. This also affects mobile search ranking.",
      location: "<head>",
      recommendation:
        "Add a viewport meta tag with width=device-width and initial-scale=1.",
      fixable: true,
    });
  }

  if (!$('link[rel="canonical"]').length) {
    add({
      id: "seo.canonical.missing",
      severity: "low",
      weight: 6,
      title: "No canonical URL",
      description:
        "A canonical link tells search engines which URL is authoritative when the same content is reachable at several addresses.",
      location: "<head>",
      recommendation: `Add a canonical link pointing at ${ctx.finalUrl}`,
      fixable: true,
    });
  }

  if (!$("html").attr("lang")) {
    add({
      id: "seo.lang.missing",
      severity: "medium",
      weight: 8,
      title: "Document language not declared",
      description:
        "The <html> element has no lang attribute. Search engines use it for regional targeting and screen readers use it to choose pronunciation.",
      location: "<html>",
      recommendation: "Add a lang attribute to the html element.",
      fixable: true,
    });
  }

  const og = $('meta[property^="og:"]').length;
  if (og === 0) {
    add({
      id: "seo.og.missing",
      severity: "low",
      weight: 5,
      title: "No Open Graph tags",
      description:
        "Links shared to social platforms and chat apps will show no title, description or preview image.",
      location: "<head>",
      recommendation:
        "Add og:title, og:description, og:image and og:url meta tags.",
      fixable: true,
    });
  }

  return {
    issues,
    stats: {
      title,
      titleLength: title.length,
      descriptionLength: desc?.length ?? 0,
      openGraphTags: og,
    },
  };
}
