/** Accessibility checks — detectable from markup only. No claims we cannot back. */
export function checkAccessibility($) {
  const issues = [];
  const add = (i) => issues.push({ category: "accessibility", ...i });

  const images = $("img");
  const noAlt = images.filter((_, el) => $(el).attr("alt") === undefined);
  if (noAlt.length) {
    add({
      id: "a11y.img.alt",
      severity: "high",
      weight: 22,
      title: "Images missing alternative text",
      description: `${noAlt.length} of ${images.length} images have no alt attribute. Screen reader users hear the file name instead of a description, or nothing at all.`,
      location: "<img>",
      evidence: noAlt
        .slice(0, 3)
        .map((_, el) => $.html(el))
        .get()
        .join("\n"),
      recommendation:
        "Add a descriptive alt to every meaningful image, and an empty alt to purely decorative ones.",
      fixable: true,
    });
  }

  const inputs = $(
    "input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea",
  );
  const unlabelled = inputs.filter((_, el) => {
    const $el = $(el);
    const id = $el.attr("id");
    const described =
      $el.attr("aria-label") || $el.attr("aria-labelledby") || $el.attr("title");
    const labelled = id && $(`label[for="${id}"]`).length;
    return !(described || labelled || $el.parents("label").length);
  });
  if (unlabelled.length) {
    add({
      id: "a11y.input.label",
      severity: "high",
      weight: 20,
      title: "Form fields without labels",
      description: `${unlabelled.length} form field${unlabelled.length > 1 ? "s have" : " has"} no associated label, so assistive technology cannot announce what should be entered.`,
      location: "<input> / <select> / <textarea>",
      evidence: unlabelled
        .slice(0, 3)
        .map((_, el) => $.html(el))
        .get()
        .join("\n"),
      recommendation:
        "Associate each field with a label element, or give it an aria-label.",
      fixable: true,
    });
  }

  const namelessButtons = $("button").filter((_, el) => {
    const $el = $(el);
    return !$el.text().trim() && !$el.attr("aria-label") && !$el.attr("title");
  });
  if (namelessButtons.length) {
    add({
      id: "a11y.button.name",
      severity: "high",
      weight: 16,
      title: "Buttons with no accessible name",
      description: `${namelessButtons.length} button${namelessButtons.length > 1 ? "s have" : " has"} no text and no aria-label, typically icon-only buttons. They are announced only as "button".`,
      location: "<button>",
      evidence: namelessButtons
        .slice(0, 3)
        .map((_, el) => $.html(el))
        .get()
        .join("\n"),
      recommendation: "Add an aria-label describing what the button does.",
      fixable: true,
    });
  }

  const vague = ["click here", "here", "read more", "more", "link", "this"];
  const vagueLinks = $("a[href]").filter((_, el) =>
    vague.includes($(el).text().trim().toLowerCase()),
  );
  if (vagueLinks.length) {
    add({
      id: "a11y.link.text",
      severity: "medium",
      weight: 10,
      title: "Links with non-descriptive text",
      description: `${vagueLinks.length} link${vagueLinks.length > 1 ? "s use" : " uses"} generic wording such as "click here". Screen reader users often navigate by listing links out of context.`,
      location: "<a>",
      recommendation:
        "Rewrite link text so it describes the destination on its own.",
      fixable: true,
    });
  }

  if (!$("html").attr("lang")) {
    add({
      id: "a11y.lang",
      severity: "medium",
      weight: 10,
      title: "No language attribute for screen readers",
      description:
        "Without a lang attribute, screen readers may read the page using another language's pronunciation rules.",
      location: "<html>",
      recommendation: "Set the lang attribute on the html element.",
      fixable: true,
    });
  }

  return {
    issues,
    stats: {
      images: images.length,
      imagesMissingAlt: noAlt.length,
      formFields: inputs.length,
      unlabelledFields: unlabelled.length,
      iconButtonsUnnamed: namelessButtons.length,
    },
  };
}
