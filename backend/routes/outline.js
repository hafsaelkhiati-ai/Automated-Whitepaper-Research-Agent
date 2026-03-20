/**
 * Route: /api/outline
 * Step 4 — Outline Generation via Claude API
 * 
 * Structures H1/H2/H3 sections with descriptions and word counts,
 * mapped to reader journey: problem → solution → evidence → CTA
 */

import express from "express";
import { generateOutline } from "../services/claude.js";
import { logger } from "../utils/logger.js";

export const outlineRouter = express.Router();

outlineRouter.post("/", async (req, res) => {
  const { topic, targetAudience, targetWordCount, sources, researchSummary } = req.body;

  if (!topic || !sources?.length) {
    return res.status(400).json({ error: "Missing required fields: topic, sources" });
  }

  logger.info(`Outline generation started: "${topic}"`);

  try {
    const outline = await generateOutline({
      topic,
      targetAudience,
      targetWordCount: targetWordCount || 3000,
      sources,
      researchSummary,
    });

    logger.info(`Outline complete: ${outline.sections?.length} sections`);

    res.json({ success: true, outline });
  } catch (err) {
    logger.error("Outline error:", err);
    res.status(500).json({ error: "Outline generation failed", message: err.message });
  }
});
