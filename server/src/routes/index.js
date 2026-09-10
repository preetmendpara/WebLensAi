import { Router } from "express";
import {
  runAnalysis,
  getHistory,
  getReport,
  getIssues,
  enhanceWithAi,
} from "../controllers/analysisController.js";
import { dbEnabled } from "../services/db.js";

export const router = Router();

router.get("/health", (_req, res) =>
  res.json({ ok: true, database: dbEnabled ? "connected" : "not configured" }),
);

router.post("/analyze", runAnalysis);
router.get("/analyses", getHistory);
router.get("/analyses/:id", getReport);
router.get("/analyses/:id/issues", getIssues);
router.post("/analyses/:id/ai", enhanceWithAi);
