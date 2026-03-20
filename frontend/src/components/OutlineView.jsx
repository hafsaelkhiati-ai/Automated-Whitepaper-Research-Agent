/**
 * Component: OutlineView
 * Displays generated whitepaper outline with word counts
 */

export default function OutlineView({ outline }) {
  if (!outline) return null;

  const totalWords = outline.sections?.reduce((sum, s) => sum + (s.suggestedWordCount || 0), 0);

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>📑 Whitepaper Outline</h3>
        <span className="badge">~{totalWords?.toLocaleString()} words</span>
      </div>

      <div className="outline-meta">
        <h2 className="outline-title">{outline.title}</h2>
        {outline.subtitle && <p className="outline-subtitle">{outline.subtitle}</p>}
        {outline.keyArgument && (
          <div className="key-argument">
            <strong>Core argument:</strong> {outline.keyArgument}
          </div>
        )}
      </div>

      <div className="outline-sections">
        {outline.sections?.map((section, i) => (
          <div key={i} className="outline-section">
            <div className="section-header">
              <span className="section-num">H1</span>
              <h4 className="section-title">{section.title}</h4>
              <span className="section-wc">{section.suggestedWordCount}w</span>
            </div>
            {section.description && (
              <p className="section-desc">{section.description}</p>
            )}
            {section.keyPoints?.length > 0 && (
              <ul className="section-points">
                {section.keyPoints.map((pt, j) => (
                  <li key={j}>{pt}</li>
                ))}
              </ul>
            )}
            {section.subsections?.map((sub, k) => (
              <div key={k} className="outline-subsection">
                <div className="section-header">
                  <span className="section-num sub">H2</span>
                  <span className="section-title">{sub.title}</span>
                  <span className="section-wc">{sub.suggestedWordCount}w</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
