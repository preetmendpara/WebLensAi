import express from "express";
import cors from "cors";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors({ origin: true }));

const parseJson = express.json({ limit: "64kb" });

/**
 * Parse the JSON body — but only if nothing already has.
 *
 * Serverless platforms commonly read the request body themselves before
 * invoking the app. express.json() would then wait on a stream that has
 * already ended, and because that wait has no timeout the request hangs
 * until the platform kills it. A POST with a body never responds, while a
 * POST without one is fine, which makes it look like a routing fault.
 */
app.use((req, res, next) => {
  if (req.body === undefined) return parseJson(req, res, next);

  // Already read, but possibly still raw.
  if (Buffer.isBuffer(req.body)) req.body = req.body.toString("utf8");
  if (typeof req.body === "string") {
    try {
      req.body = req.body ? JSON.parse(req.body) : {};
    } catch {
      return res.status(400).json({
        error: { code: "INVALID_JSON", message: "That request could not be read." },
      });
    }
  }
  return next();
});

app.use("/api", router);

// Nothing raw ever reaches the user.
app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({
    error: { code: "INTERNAL", message: "Something went wrong. Please try again." },
  });
});
