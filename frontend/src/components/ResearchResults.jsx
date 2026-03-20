/**
 * Component: ResearchResults
 * Displays validated sources after research phase
 */

export default function ResearchResults({ sources, summary }) {
  const typeColors = {
    academic: "#3b82f6",
    analyst_report: "#8b5cf6",
    trade_publication: "#f59e0b",
    government: "#10b981",
    vendor_research: "#f97316",
    news: "#6b7280",
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>🔍 Research Results</h3>
        <span className="badge">{sources.length} sources validated</span>
      </div>

      {summary && (
        <div className="summary-block">
          <h4>Research Summary</h4>
          <p>{summary}</p>
        </div>
      )}

      <div className="sources-grid">
        {sources.slice(0, 15).map((source, i) => (
          <div key={i} className="source-card">
            <div className="source-meta">
              <span
                className="source-type"
                style={{ background: typeColors[source.type] || "#6b7280" }}
              >
                {source.type?.replace(/_/g, " ")}
              </span>
              <span className="source-year">{source.pubYear || source.publicationDate}</span>
              {source.relevanceScore && (
                <span className="source-score">★ {source.relevanceScore}/10</span>
              )}
            </div>
            <a href={source.url} target="_blank" rel="noreferrer" className="source-title">
              {source.title}
            </a>
            <p className="source-publisher">{source.publisher}</p>
            {source.keyFindings && (
              <p className="source-finding">{source.keyFindings}</p>
            )}
          </div>
        ))}
      </div>

      {sources.length > 15 && (
        <p className="sources-more">+ {sources.length - 15} more sources in Notion</p>
      )}
    </div>
  );
}
