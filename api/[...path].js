/**
 * Vercel entry point for the API.
 *
 * A catch-all so that every request under /api reaches the Express app with
 * its original path intact — `/api/analyze` arrives as `/api/analyze`, which
 * is what the router already expects. A plain `api/index.js` would only be
 * routed for `/api` itself.
 *
 * The app is imported unchanged; nothing here is Vercel-specific beyond the
 * default export the platform looks for.
 */
import { app } from "../server/src/app.js";

export default app;
