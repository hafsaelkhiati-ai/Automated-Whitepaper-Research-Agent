/**
 * Route: /api/draft
 * Step 5 — Executive Summary + Introduction Draft via Claude API
 * 
 * Writes a 150-word executive summary and 400-word introduction
 * based on the structured outline and validated research.
 */

import express from "express";
import { generateDraft } from "../services/claude.js";
import { formatCitations } from "../services/citations.js";
import { logger } from "../utils/logger.js";

export const draftRouter = express.Router();

draftRouter.post("/", async (req, res) => {
  const { topic, targetAudience, outline, sources, citationStyle } = req.body;

  if (!topic || !outline || !sources?.length) {
    return res.status(400).json({
      error: "Missing required fields: topic, outline, sources",
    });
  }

  logger.info(`Draft generation started: "${topic}"`);

  try {
    // Generate executive summary + intro
    const draft = await generateDraft({
      topic,
      targetAudience,
      outline,
      sources,
    });

    // Format citations in requested style (APA default, Harvard optional)
    const citations = await formatCitations(
      sources,
      citationStyle || "APA"
    );

    logger.info("Draft complete");

    res.json({
      success: true,
      draft: {
        executiveSummary: draft.executiveSummary,
        introduction: draft.introduction,
        citations,
      },
    });
  } catch (err) {
    logger.error("Draft error:", err);
    res.status(500).json({ error: "Draft generation failed", message: err.message });
  }
});
