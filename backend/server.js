/**
 * AGENT 05 — Automated Whitepaper Research Agent
 * Backend Express Server
 * 
 * SETUP: Copy .env.example → .env and fill in your API keys
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { researchRouter } from "./routes/research.js";
import { outlineRouter } from "./routes/outline.js";
import { draftRouter } from "./routes/draft.js";
import { notionRouter } from "./routes/notion.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // ← Change port in .env if needed

// ── Security & Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // ← Set FRONTEND_URL in .env
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// Rate limiting — 30 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many requests. Please wait before trying again." },
});
app.use("/api/", limiter);

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/research", researchRouter);
app.use("/api/outline", outlineRouter);
app.use("/api/draft", draftRouter);
app.use("/api/notion", notionRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ── Error Handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

app.listen(PORT, () => {
  logger.info(`AGENT 05 backend running on port ${PORT}`);
});

export default app;
