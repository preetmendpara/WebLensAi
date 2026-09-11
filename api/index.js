import { app } from "../server/src/app.js";

/**
 * Vercel entry point for the API.
 *
 * Every `/api/*` request is rewritten to this one function by `vercel.json`,
 * which carries the original path along in a `__path` query parameter. A
 * rewrite replaces the request path with the destination, so without that
 * parameter Express would see `/api/index` for every request and match
 * nothing but the 404 handler.
 *
 * Filesystem catch-all routing (`api/[...path].js`) was tried first and
 * matched only a single segment: `/api/analyses` reached the function while
 * `/api/analyses/:id` returned a platform 404. Reconstructing the path here
 * is explicit and behaves identically at any depth.
 */
export default function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.searchParams.get("__path");

  if (path !== null) {
    url.searchParams.delete("__path");
    const query = url.searchParams.toString();
    req.url = `/api/${path}${query ? `?${query}` : ""}`;
  }

  return app(req, res);
}
