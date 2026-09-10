import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 3_000_000;
const TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 3;

export class FetchError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/** Private, loopback, link-local and CGNAT ranges — never fetchable. */
function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const v = ip.toLowerCase();
  return (
    v === "::1" || v === "::" ||
    v.startsWith("fc") || v.startsWith("fd") ||   // unique local
    v.startsWith("fe80") ||                        // link local
    v.startsWith("::ffff:")                        // v4-mapped: re-check as v4
  );
}

/**
 * Validate a user-supplied URL and resolve its host, rejecting anything
 * that points inside our own network. Runs before every fetch and again
 * after each redirect — a public host can redirect to 127.0.0.1.
 */
export async function assertPublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchError("INVALID_URL", "That does not look like a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new FetchError("INVALID_URL", "Only http and https addresses can be analyzed.");
  }
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    throw new FetchError("INVALID_URL", "That does not look like a valid domain.");
  }

  let records;
  try {
    records = await dns.lookup(url.hostname, { all: true });
  } catch {
    throw new FetchError("DNS", "We couldn't find that domain. Check the address and try again.");
  }

  for (const { address } of records) {
    const ip = address.startsWith("::ffff:") ? address.slice(7) : address;
    if (isPrivateIp(ip)) {
      throw new FetchError("BLOCKED", "That address points to a private network and can't be analyzed.");
    }
  }
  return url;
}

/**
 * Fetch a page with manual redirect handling so every hop is re-validated,
 * plus a hard byte cap so a huge response can't exhaust memory.
 */
export async function safeFetch(rawUrl) {
  let current = rawUrl;
  const started = Date.now();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "WebLensAI/1.0 (+website quality analyzer)",
          accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new FetchError("TIMEOUT", "That website took too long to respond.");
      }
      throw new FetchError("UNREACHABLE", "We couldn't reach this website. It may be offline or blocking automated requests.");
    }
    clearTimeout(timer);

    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = new URL(res.headers.get("location"), url).href;
      continue;
    }

    if (res.status === 403 || res.status === 401 || res.status === 429) {
      throw new FetchError("BLOCKED", "This website is blocking automated requests, so it can't be analyzed.");
    }
    if (!res.ok) {
      throw new FetchError("HTTP_ERROR", `The website responded with an error (HTTP ${res.status}).`);
    }

    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) {
      throw new FetchError("NOT_HTML", "That address doesn't return an HTML page.");
    }

    // Stream with a byte ceiling rather than trusting content-length.
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) {
        reader.cancel();
        throw new FetchError("TOO_LARGE", "That page is too large to analyze.");
      }
      chunks.push(value);
    }

    return {
      html: new TextDecoder("utf-8").decode(Buffer.concat(chunks)),
      finalUrl: url.href,
      status: res.status,
      bytes: size,
      elapsedMs: Date.now() - started,
      headers: Object.fromEntries(res.headers.entries()),
    };
  }

  throw new FetchError("TOO_MANY_REDIRECTS", "That website redirected too many times.");
}
