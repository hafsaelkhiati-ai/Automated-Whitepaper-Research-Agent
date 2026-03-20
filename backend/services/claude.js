/**
 * Service: Claude API (Anthropic)
 * 
 * Two functions:
 *   generateOutline() — Structured H1/H2/H3 outline with word counts
 *   generateDraft()   — Executive summary (150w) + Introduction (400w)
 * 
 * API Key location: backend/.env → ANTHROPIC_API_KEY
 * Docs: https://docs.anthropic.com/
 */

import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../utils/logger.js";

// ── Initialise Anthropic client ──────────────────────────────────────────────
// API key is read from ANTHROPIC_API_KEY env variable automatically
// ← Set ANTHROPIC_API_KEY in backend/.env
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // ← Set in .env
});

// ────────────────────────────────────────────────────────────────────────────
// generateOutline
// ────────────────────────────────────────────────────────────────────────────
export async function generateOutline({ topic, targetAudience, targetWordCount, sources, researchSummary }) {
  logger.info("Generating outline with Claude...");

  const sourceSummaries = sources
    .slice(0, 20) // Use top 20 sources to keep prompt concise
    .map((s, i) => `[${i + 1}] ${s.title} (${s.publisher}, ${s.publicationDate}): ${s.keyFindings}`)
    .join("\n");

  const prompt = `You are a senior B2B content strategist and technical writer with 15+ years of whitepaper experience.

Topic: ${topic}
Target audience: ${targetAudience}
Target word count: ${targetWordCount} words

Research summary:
${researchSummary}

Available sources:
${sourceSummaries}

Create a comprehensive whitepaper outline structured around the reader journey:
Problem Recognition → Current Landscape → Solution Framework → Evidence & Case Studies → Implementation → CTA

Return ONLY a JSON object with this structure:
{
  "title": "Compelling whitepaper title (avoid generic phrasing)",
  "subtitle": "Clarifying subtitle with audience benefit",
  "readerJourney": "1-paragraph description of the intended reader transformation",
  "sections": [
    {
      "level": "H1",
      "title": "Section title",
      "description": "What this section covers and its purpose in the argument",
      "suggestedWordCount": 300,
      "keyPoints": ["point 1", "point 2", "point 3"],
      "suggestedSources": [1, 3, 7],
      "subsections": [
        {
          "level": "H2",
          "title": "Subsection title",
          "description": "Subsection focus",
          "suggestedWordCount": 150,
          "keyPoints": ["point 1"],
          "subsections": []
        }
      ]
    }
  ],
  "totalEstimatedWordCount": 3000,
  "keyArgument": "The single core argument this whitepaper makes in one sentence"
}`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",   // Best model for structural reasoning
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0]?.text;
  if (!content) throw new Error("Empty response from Claude outline generation");

  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
}

// ────────────────────────────────────────────────────────────────────────────
// generateDraft
// ────────────────────────────────────────────────────────────────────────────
export async function generateDraft({ topic, targetAudience, outline, sources }) {
  logger.info("Generating draft with Claude...");

  const topSources = sources
    .slice(0, 10)
    .map((s) => `- ${s.title} (${s.publisher}): ${s.keyFindings}`)
    .join("\n");

  const outlineStr = outline.sections
    .map((s) => `${s.title}: ${s.description}`)
    .join("\n");

  const prompt = `You are a senior B2B technical writer. Write the opening sections of a whitepaper.

Whitepaper title: "${outline.title}"
Subtitle: "${outline.subtitle}"
Topic: ${topic}
Target audience: ${targetAudience}
Core argument: ${outline.keyArgument}

Outline structure:
${outlineStr}

Key research findings:
${topSources}

Write the following — return as JSON:
{
  "executiveSummary": "Exactly 150 words. Covers: the core problem, the key insight, what the whitepaper delivers, and the single most compelling statistic or finding. Written for a senior executive who may read only this section. Professional, authoritative, no jargon.",
  "introduction": "Exactly 400 words. Opens with a compelling hook (statistic, scenario, or provocative question). Establishes the problem context. Previews the whitepaper structure. Ends with a clear statement of what the reader will gain. Written in clear B2B prose — no marketing fluff."
}

Both sections must flow naturally into each other and match the tone of a premium technical whitepaper.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",   // ← Using Opus for highest quality drafts
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0]?.text;
  if (!content) throw new Error("Empty response from Claude draft generation");

  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
}
