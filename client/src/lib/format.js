export const CATEGORY_LABELS = {
  seo: "SEO",
  accessibility: "Accessibility",
  structure: "Structure",
  links: "Links",
  performance: "Performance",
};

/** Documented weighting, shown in the UI so the score stays explainable. */
export const CATEGORY_WEIGHTS = {
  seo: 25,
  accessibility: 25,
  structure: 20,
  links: 15,
  performance: 15,
};

export const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

/** Strip the protocol for display; the full URL stays in the title attribute. */
export function displayUrl(url) {
  try {
    const u = new URL(url);
    return (u.host + u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Score bands — the one place colour is applied to a number.
 * Tuned so a genuinely good score reads as good: 85+ is green, and the
 * blue "low" band covers merely acceptable rather than strong results.
 */
export function scoreTone(score) {
  if (score >= 85) return "success";
  if (score >= 70) return "low";
  if (score >= 50) return "medium";
  if (score >= 30) return "high";
  return "critical";
}

/** Accept "example.com" as readily as a full URL. */
export function normalizeUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
