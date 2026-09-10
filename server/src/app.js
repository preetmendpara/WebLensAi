import express from "express";
import cors from "cors";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "64kb" }));
app.use("/api", router);

// Nothing raw ever reaches the user (spec §31).
app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({
    error: { code: "INTERNAL", message: "Something went wrong. Please try again." },
  });
});
