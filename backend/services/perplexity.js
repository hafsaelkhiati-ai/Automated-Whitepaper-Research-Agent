/**
 * Service: Perplexity API
 * 
 * Calls Perplexity's sonar-pro model for real-time web research.
 * Returns structured sources with titles, URLs, dates, and summaries.
 * 
 * API Key location: backend/.env → PERPLEXITY_API_KEY
 * Docs: https://docs.perplexity.ai/
 */

import { logger } from "../utils/logger.js";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export async function perplexityResearch({ topic, targetAudience, targetWordCount, seedKeywords }) {
  // ── API Key Check ────────────────────────────────────────────────────────
  const apiKey = process.env.PERPLEXITY_API_KEY; // ← Set in .env
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  const keywordsStr = seedKeywords.join(", ");

  const systemPrompt = `You are a senior B2B research analyst specializing in technical whitepapers. 
Your task is to find high-quality, verifiable sources for whitepaper research.
Always return structured JSON with sources array and a researchSummary string.
Focus on: academic papers, trade publications, industry analyst reports (Gartner, Forrester, IDC), 
government data, and authoritative industry bodies. Avoid blogs and opinion pieces unless from recognized experts.`;

  const userPrompt = `Research the following whitepaper topic comprehensively.

Topic: ${topic}
Target audience: ${targetAudience}
Approximate word count target: ${targetWordCount} words
Seed keywords: ${keywordsStr}

Find 15–25 high-quality sources including:
1. Academic or peer-reviewed papers (last 5 years preferred)
2. Industry analyst reports (Gartner, Forrester, IDC, McKinsey, Deloitte)
3. Trade association publications and standards bodies
4. Government statistics and regulatory documents
5. Company research reports from recognised vendors in this space
6. Market size and forecast data with specific numbers

Return a JSON object with this exact structure:
{
  "researchSummary": "2-3 paragraph summary of key findings and themes",
  "sources": [
    {
      "title": "Full title of the source",
      "url": "Full URL",
      "publisher": "Publisher or organisation name",
      "publicationDate": "YYYY-MM or YYYY",
      "type": "academic|analyst_report|trade_publication|government|vendor_research|news",
      "keyFindings": "1-2 sentence summary of the most relevant finding",
      "relevanceScore": 1-10
    }
  ]
}`;

  logger.info("Calling Perplexity API...");

  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",           // Perplexity's best research model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,             // Low temp for factual research
      max_tokens: 4000,
      return_citations: true,       // Include citation metadata
      return_related_questions: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error("Empty response from Perplexity API");

  // Parse JSON from response (Perplexity may wrap in markdown fences)
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Attach Perplexity citations if available
  if (data.citations?.length) {
    parsed.perplexityCitations = data.citations;
  }

  return parsed;
}
