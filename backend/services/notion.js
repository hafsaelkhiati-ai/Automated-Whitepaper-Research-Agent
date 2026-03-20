/**
 * Service: Notion API
 * 
 * Saves the complete whitepaper brief to a Notion database page.
 * Creates structured blocks: metadata, research brief, outline, draft, citations.
 * 
 * SETUP STEPS:
 * 1. Go to https://www.notion.so/my-integrations → Create new integration
 * 2. Copy the "Internal Integration Token" → paste as NOTION_API_KEY in .env
 * 3. Open your Notion database → Share → Invite your integration
 * 4. Copy the database ID from the URL:
 *    https://notion.so/workspace/DATABASE_ID_HERE?v=...
 *    Paste as NOTION_DATABASE_ID in .env
 * 
 * Docs: https://developers.notion.com/
 */

import { Client } from "@notionhq/client";
import { logger } from "../utils/logger.js";

// ← API key and DB ID set in backend/.env
const notion = new Client({
  auth: process.env.NOTION_API_KEY, // ← Set NOTION_API_KEY in .env
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID; // ← Set NOTION_DATABASE_ID in .env

export async function saveToNotion({ topic, targetAudience, targetWordCount, sources, outline, draft }) {
  if (!DATABASE_ID) throw new Error("NOTION_DATABASE_ID is not set in environment variables");

  logger.info("Creating Notion page...");

  // ── Create the page ──────────────────────────────────────────────────────
  const page = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      // These property names must match your Notion database columns exactly
      // ← Adjust property names to match your Notion DB schema
      Name: {
        title: [{ text: { content: outline.title || topic } }],
      },
      Status: {
        select: { name: "Research Complete" },
      },
      Topic: {
        rich_text: [{ text: { content: topic } }],
      },
      Audience: {
        rich_text: [{ text: { content: targetAudience || "" } }],
      },
      "Word Count Target": {
        number: targetWordCount || 3000,
      },
      "Sources Count": {
        number: sources?.length || 0,
      },
      "Created By": {
        rich_text: [{ text: { content: "AGENT 05" } }],
      },
    },
    children: buildPageBlocks({ outline, draft, sources }),
  });

  logger.info(`Notion page created: ${page.id}`);

  return {
    id: page.id,
    url: page.url,
  };
}

// ── Build Notion block content ───────────────────────────────────────────────
function buildPageBlocks({ outline, draft, sources }) {
  const blocks = [];

  // Executive Summary
  blocks.push(heading2("📋 Executive Summary"));
  blocks.push(paragraph(draft.executiveSummary || ""));
  blocks.push(divider());

  // Introduction
  blocks.push(heading2("📖 Introduction"));
  blocks.push(paragraph(draft.introduction || ""));
  blocks.push(divider());

  // Core Argument
  if (outline.keyArgument) {
    blocks.push(heading2("💡 Core Argument"));
    blocks.push(callout(outline.keyArgument));
    blocks.push(divider());
  }

  // Outline
  blocks.push(heading2("📑 Whitepaper Outline"));
  for (const section of (outline.sections || [])) {
    blocks.push(heading3(section.title));
    blocks.push(paragraph(`${section.description} (Est. ${section.suggestedWordCount} words)`));
    if (section.keyPoints?.length) {
      for (const point of section.keyPoints) {
        blocks.push(bulletPoint(point));
      }
    }
  }
  blocks.push(divider());

  // Sources
  blocks.push(heading2(`🔍 Research Sources (${sources.length})`));
  for (const source of sources.slice(0, 25)) {
    blocks.push(bulletPoint(`[${source.type?.toUpperCase()}] **${source.title}** — ${source.publisher} (${source.pubYear || source.publicationDate}) — ${source.url}`));
  }

  return blocks;
}

// ── Notion block helpers ─────────────────────────────────────────────────────
const heading2 = (text) => ({
  object: "block", type: "heading_2",
  heading_2: { rich_text: [{ type: "text", text: { content: text } }] },
});

const heading3 = (text) => ({
  object: "block", type: "heading_3",
  heading_3: { rich_text: [{ type: "text", text: { content: text } }] },
});

const paragraph = (text) => ({
  object: "block", type: "paragraph",
  paragraph: { rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }] },
});

const bulletPoint = (text) => ({
  object: "block", type: "bulleted_list_item",
  bulleted_list_item: { rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }] },
});

const callout = (text) => ({
  object: "block", type: "callout",
  callout: {
    rich_text: [{ type: "text", text: { content: text } }],
    icon: { emoji: "💡" },
  },
});

const divider = () => ({ object: "block", type: "divider", divider: {} });
