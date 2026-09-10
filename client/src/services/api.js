/**
 * API client. The browser never holds a key or a provider name — every
 * secret stays behind these endpoints.
 */

async function json(path, options) {
  const res = await fetch(`/api${path}`, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error?.message ?? "Something went wrong. Please try again.");
  }
  return body;
}

export const getHistory = () => json("/analyses");
export const getReport = (id) => json(`/analyses/${id}`);

export const requestAi = (id) =>
  json(`/analyses/${id}/ai`, { method: "POST" });

/**
 * Start an analysis and receive real server stages as they happen.
 * Parses the SSE stream by hand — EventSource cannot issue a POST.
 */
export async function streamAnalysis(url, handlers, signal) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error("We couldn't start the analysis. Please try again.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const event = frame.match(/^event: (.+)$/m)?.[1];
      const data = frame.match(/^data: (.+)$/m)?.[1];
      if (!event || !data) continue;
      handlers[event]?.(JSON.parse(data));
    }
  }
}
