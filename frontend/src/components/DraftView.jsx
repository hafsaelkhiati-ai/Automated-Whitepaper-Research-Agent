/**
 * Component: DraftView
 * Displays executive summary and introduction draft
 */

export function DraftView({ draft }) {
  if (!draft) return null;

  const wordCount = (text) => text?.split(/\s+/).length || 0;

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>✒️ First Draft</h3>
        <span className="badge">
          {wordCount(draft.executiveSummary) + wordCount(draft.introduction)} words
        </span>
      </div>

      <div className="draft-section">
        <div className="draft-label">
          <span>Executive Summary</span>
          <span className="draft-wc">{wordCount(draft.executiveSummary)} words</span>
        </div>
        <div className="draft-content">{draft.executiveSummary}</div>
      </div>

      <div className="draft-section">
        <div className="draft-label">
          <span>Introduction</span>
          <span className="draft-wc">{wordCount(draft.introduction)} words</span>
        </div>
        <div className="draft-content">{draft.introduction}</div>
      </div>

      {draft.citations?.length > 0 && (
        <div className="draft-section">
          <div className="draft-label">
            <span>📚 Citations ({draft.citations.length})</span>
          </div>
          <ol className="citations-list">
            {draft.citations.map((c, i) => (
              <li key={i}>
                <span className="citation-text">{c.citation}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/**
 * Component: NotionDelivery
 * Final delivery confirmation with Notion link
 */
export function NotionDelivery({ result }) {
  if (!result) return null;

  return (
    <div className="result-card notion-card">
      <div className="notion-success">
        <div className="notion-icon">✅</div>
        <div>
          <h3>Saved to Notion</h3>
          <p>Your complete brief, outline, draft, and citations are ready for collaborative editing.</p>
        </div>
      </div>
      <a
        href={result.notionUrl}
        target="_blank"
        rel="noreferrer"
        className="btn btn-primary notion-btn"
      >
        Open in Notion →
      </a>
    </div>
  );
}

export default DraftView;
