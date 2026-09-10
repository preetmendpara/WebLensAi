/**
 * Pre-generated sample report (spec §34).
 *
 * Exists only as a reliability fallback for live demonstration when the
 * venue network, a target site or an AI provider is unavailable. It is
 * reached solely via an explicit ?demo=1 and is always labelled as demo
 * data in the UI — normal analysis never falls back to it silently.
 *
 * The numbers below are a real WebLens run, not invented figures.
 */
export const DEMO_REPORT = {
  id: "demo",
  url: "https://demo.weblens.dev/",
  analyzedAt: "2026-09-10T09:24:00.000Z",
  httpStatus: 200,
  overallScore: 74,
  categories: {
    seo: 76,
    accessibility: 58,
    structure: 78,
    links: 88,
    performance: 76,
  },
  previous: { overallScore: 61, analyzedAt: "2026-09-03T11:02:00.000Z" },
  statistics: {
    accessibility: { images: 14, imagesMissingAlt: 3, formFields: 2, unlabelledFields: 1 },
    links: { internal: 22, external: 6, total: 28, malformed: 0, empty: 0 },
    performance: { scripts: 9, stylesheets: 3, images: 14, domNodes: 842, htmlKb: 61 },
  },
  issues: [
    {
      id: "a11y.img.alt",
      category: "accessibility",
      severity: "high",
      weight: 22,
      title: "Images missing alternative text",
      description:
        "3 of 14 images have no alt attribute. Screen reader users hear the file name instead of a description, or nothing at all.",
      location: "<img>",
      evidence: '<img src="/campus.jpg">\n<img src="/lab-2.jpg">\n<img src="/team.png">',
      recommendation:
        "Add a descriptive alt to every meaningful image, and an empty alt to purely decorative ones.",
      fixable: true,
    },
    {
      id: "a11y.input.label",
      category: "accessibility",
      severity: "high",
      weight: 20,
      title: "Form fields without labels",
      description:
        "1 form field has no associated label, so assistive technology cannot announce what should be entered.",
      location: "<input>",
      evidence: '<input type="search" name="q" placeholder="Search">',
      recommendation:
        "Associate each field with a label element, or give it an aria-label.",
      fixable: true,
    },
    {
      id: "seo.description.missing",
      category: "seo",
      severity: "high",
      weight: 18,
      title: "No meta description",
      description:
        "Without a meta description, search engines generate their own snippet from page text, which is often less compelling than a written one.",
      location: "<head>",
      recommendation:
        "Add a meta description summarising the page in 150–160 characters.",
      fixable: true,
    },
    {
      id: "perf.img.lazy",
      category: "performance",
      severity: "medium",
      weight: 12,
      title: "Images are not lazy-loaded",
      description:
        "11 of 14 images have no loading attribute, so images far below the fold are fetched during initial load.",
      location: "<img>",
      recommendation:
        "Add loading=lazy to images below the fold. Leave the hero image eager.",
      fixable: true,
    },
    {
      id: "structure.heading.skip",
      category: "structure",
      severity: "medium",
      weight: 12,
      title: "Heading levels are skipped",
      description:
        "The outline jumps a level 2 times. Assistive technology uses heading order to build a navigable table of contents.",
      location: "headings",
      evidence: "H1 → H3, H3 → H5",
      recommendation:
        "Step heading levels one at a time. Style with CSS if a smaller heading is wanted visually.",
    },
    {
      id: "links.noopener",
      category: "links",
      severity: "medium",
      weight: 12,
      title: "New-tab links without rel=noopener",
      description:
        "2 links open in a new tab without rel=noopener. The opened page gets scripting access back to this one via window.opener.",
      location: "<a target=_blank>",
      recommendation: "Add rel=noopener noreferrer to links using target=_blank.",
      fixable: true,
    },
    {
      id: "seo.og.missing",
      category: "seo",
      severity: "low",
      weight: 5,
      title: "No Open Graph tags",
      description:
        "Links shared to social platforms and chat apps will show no title, description or preview image.",
      location: "<head>",
      recommendation: "Add og:title, og:description, og:image and og:url meta tags.",
      fixable: true,
    },
  ],
  ai: {
    provider: "groq",
    cached: true,
    summary:
      "The site has a solid structural foundation and clean link hygiene, but accessibility is the weakest area and is dragging the overall score down. Three images carry no alternative text and the search field has no label, which together make the page difficult to use with a screen reader. The SEO gaps are smaller but cheap to close — a meta description alone would lift discoverability.",
    priorities: [
      {
        issueId: "a11y.img.alt",
        reason:
          "It is the single largest score penalty and affects real users immediately.",
      },
      {
        issueId: "a11y.input.label",
        reason:
          "An unlabelled search field makes the site's primary navigation unusable by screen reader.",
      },
      {
        issueId: "seo.description.missing",
        reason: "One line of markup that changes how every search result renders.",
      },
    ],
    explanations: {
      "a11y.img.alt":
        "A screen reader encountering an image without alt text announces the file name, so a user hears \"campus dot jpg\" instead of what the photograph shows. Where the image carries meaning that the surrounding text does not repeat, that meaning is simply lost.",
      "a11y.input.label":
        "Placeholder text disappears the moment a user starts typing and is not reliably announced by assistive technology. Without a label, the field is announced only as \"edit text\", giving no indication that it searches the site.",
      "seo.description.missing":
        "Search engines fall back to scraping a snippet from the page body, which frequently produces a fragment of navigation or boilerplate. Writing the description yourself controls the first impression in results.",
      "perf.img.lazy":
        "Every image is requested during the initial page load, including ones several screens down. On a phone connection that competes for bandwidth with the content actually on screen.",
    },
    codeFixes: [
      {
        issueId: "a11y.img.alt",
        language: "html",
        before: '<img src="/campus.jpg">',
        after: '<img src="/campus.jpg" alt="Students working in the computer laboratory">',
        note: "Describe what the image shows, not that it is an image.",
      },
      {
        issueId: "a11y.input.label",
        language: "html",
        before: '<input type="search" name="q" placeholder="Search">',
        after:
          '<label for="site-search" class="sr-only">Search this site</label>\n<input id="site-search" type="search" name="q" placeholder="Search">',
        note: "A visually hidden label keeps the design while restoring the announcement.",
      },
      {
        issueId: "seo.description.missing",
        language: "html",
        before: "<head>\n  <title>Department of Computer Science</title>\n</head>",
        after:
          '<head>\n  <title>Department of Computer Science</title>\n  <meta name="description" content="Undergraduate and postgraduate computer science programmes, research groups and admissions information.">\n</head>',
        note: "Aim for 150–160 characters so it is not truncated in results.",
      },
      {
        issueId: "links.noopener",
        language: "html",
        before: '<a href="https://partner.example" target="_blank">Partner site</a>',
        after:
          '<a href="https://partner.example" target="_blank" rel="noopener noreferrer">Partner site</a>',
        note: "noopener severs the opened page's scripting access to this one.",
      },
    ],
    roadmap: [
      {
        step: 1,
        title: "Add alternative text to the three unlabelled images",
        priority: "high",
        effort: "quick",
        detail: "Largest single penalty and roughly ten minutes of work.",
      },
      {
        step: 2,
        title: "Label the site search field",
        priority: "high",
        effort: "quick",
        detail: "A visually hidden label preserves the current design.",
      },
      {
        step: 3,
        title: "Write a meta description",
        priority: "medium",
        effort: "quick",
        detail: "Controls how the page appears in search results.",
      },
      {
        step: 4,
        title: "Correct the heading hierarchy",
        priority: "medium",
        effort: "moderate",
        detail: "Demote the skipped levels so the outline steps one at a time.",
      },
      {
        step: 5,
        title: "Lazy-load images below the fold",
        priority: "low",
        effort: "quick",
        detail: "Leave the hero image eager so the first paint is unaffected.",
      },
    ],
  },
};

export const DEMO_HISTORY = [
  {
    id: "demo",
    url: "https://demo.weblens.dev/",
    overallScore: 74,
    createdAt: "2026-09-10T09:24:00.000Z",
    issues: { total: 7, critical: 0, high: 3 },
    hasAi: true,
  },
  {
    id: "demo-prev",
    url: "https://demo.weblens.dev/",
    overallScore: 61,
    createdAt: "2026-09-03T11:02:00.000Z",
    issues: { total: 12, critical: 1, high: 4 },
    hasAi: true,
  },
];
