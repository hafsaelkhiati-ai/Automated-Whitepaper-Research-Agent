/**
 * Route: /api/notion
 * Step 7 — Save to Notion Database
 * 
 * Saves the complete brief, outline, draft, and citations
 * to a Notion database page for collaborative editing.
 * 
 * SETUP: Share your Notion database with your integration,
 * then set NOTION_API_KEY and NOTION_DATABASE_ID in .env
 */

import express from "express";
import { saveToNotion } from "../services/notion.js";
import { logger } from "../utils/logger.js";

export const notionRouter = express.Router();

notionRouter.post("/save", async (req, res) => {
  const { topic, targetAudience, targetWordCount, sources, outline, draft } = req.body;

  if (!topic || !outline || !draft) {
    return res.status(400).json({
      error: "Missing required fields: topic, outline, draft",
    });
  }

  logger.info(`Saving to Notion: "${topic}"`);

  try {
    const notionPage = await saveToNotion({
      topic,
      targetAudience,
      targetWordCount,
      sources,
      outline,
      draft,
    });

    logger.info(`Saved to Notion: ${notionPage.url}`);

    res.json({
      success: true,
      notionUrl: notionPage.url,
      pageId: notionPage.id,
      message: "Whitepaper brief saved to Notion successfully",
    });
  } catch (err) {
    logger.error("Notion save error:", err);
    res.status(500).json({ error: "Notion save failed", message: err.message });
  }
});
