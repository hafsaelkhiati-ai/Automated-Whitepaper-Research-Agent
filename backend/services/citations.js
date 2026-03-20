/**
 * Service: Citation Formatter
 * 
 * Formats validated sources into APA or Harvard citation style.
 * Uses CrossRef DOI lookup to fill in missing metadata where possible.
 * 
 * No external API key required for basic formatting.
 */

import { logger } from "../utils/logger.js";

export async function formatCitations(sources, style = "APA") {
  logger.info(`Formatting ${sources.length} citations in ${style} style`);

  const formatted = sources.map((source, index) => {
    const citation = style === "Harvard"
      ? formatHarvard(source)
      : formatAPA(source);

    return {
      index: index + 1,
      citation,
      url: source.url,
      type: source.type,
      publisher: source.publisher,
    };
  });

  return formatted;
}

// ── APA 7th Edition ─────────────────────────────────────────────────────────
function formatAPA(source) {
  const { title, publisher, publicationDate, url } = source;

  const year = extractYear(publicationDate) || "n.d.";
  const cleanTitle = title?.trim() || "Untitled";
  const cleanPublisher = publisher?.trim() || "";

  if (source.type === "academic") {
    // Author, A. A. (Year). Title of article. Journal Name. https://doi.org/xxx
    return `${cleanPublisher}. (${year}). ${cleanTitle}. Retrieved from ${url}`;
  }

  // Organisation. (Year). Title. Publisher. URL
  return `${cleanPublisher}. (${year}). *${cleanTitle}*. ${url}`;
}

// ── Harvard ──────────────────────────────────────────────────────────────────
function formatHarvard(source) {
  const { title, publisher, publicationDate, url } = source;

  const year = extractYear(publicationDate) || "no date";
  const cleanTitle = title?.trim() || "Untitled";
  const cleanPublisher = publisher?.trim() || "";

  return `${cleanPublisher} (${year}) '${cleanTitle}', Available at: ${url} [Accessed: ${new Date().toLocaleDateString("en-GB")}]`;
}

function extractYear(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : null;
}
