/**
 * Route: /api/research
 * Step 2 — Deep Research via Perplexity API
 * 
 * Pulls 15–25 verified sources: academic papers, trade publications,
 * industry reports, competitor whitepapers.
 */

import express from "express";
import { perplexityResearch } from "../services/perplexity.js";
import { validateSources } from "../services/sourceValidator.js";
import { logger } from "../utils/logger.js";

export const researchRouter = express.Router();

researchRouter.post("/", async (req, res) => {
  const { topic, targetAudience, targetWordCount, seedKeywords } = req.body;

  // ── Input validation ───────────────────────────────────────────────────────
  if (!topic || !targetAudience || !seedKeywords?.length) {
    return res.status(400).json({
      error: "Missing required fields: topic, targetAudience, seedKeywords",
    });
  }

  logger.info(`Research started: "${topic}"`);

  try {
    // Step 1: Pull raw sources from Perplexity
    const rawSources = await perplexityResearch({
      topic,
      targetAudience,
      targetWordCount: targetWordCount || 3000,
      seedKeywords,
    });

    // Step 2: Validate sources (check URL, date, remove stale >5yr unless foundational)
    const validatedSources = await validateSources(rawSources);

    logger.info(`Research complete: ${validatedSources.length} validated sources`);

    res.json({
      success: true,
      topic,
      sourcesCount: validatedSources.length,
      sources: validatedSources,
      researchSummary: rawSources.researchSummary || "",
    });
  } catch (err) {
    logger.error("Research error:", err);
    res.status(500).json({ error: "Research failed", message: err.message });
  }
});
