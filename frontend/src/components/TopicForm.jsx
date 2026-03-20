/**
 * Component: TopicForm
 * Step 1 — User enters topic, audience, word count, seed keywords
 */

import { useState } from "react";

export default function TopicForm({ onSubmit }) {
  const [form, setForm] = useState({
    topic: "",
    targetAudience: "",
    targetWordCount: 3000,
    seedKeywords: "",
    citationStyle: "APA",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim() || !form.targetAudience.trim() || !form.seedKeywords.trim()) return;

    onSubmit({
      ...form,
      targetWordCount: parseInt(form.targetWordCount),
      seedKeywords: form.seedKeywords.split(",").map((k) => k.trim()).filter(Boolean),
    });
  };

  return (
    <div className="form-card">
      <h2 className="form-title">New Whitepaper Brief</h2>
      <p className="form-desc">
        Enter your topic and the agent will research, outline, and draft your whitepaper in ~2 hours of processing.
      </p>

      <form onSubmit={handleSubmit} className="topic-form">
        <div className="form-group">
          <label className="form-label">Technical Topic *</label>
          <input
            className="form-input"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder="e.g. Industrial IoT Security in Manufacturing OT Networks"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Audience *</label>
          <input
            className="form-input"
            name="targetAudience"
            value={form.targetAudience}
            onChange={handleChange}
            placeholder="e.g. CISOs and IT/OT managers at German Mittelstand manufacturers"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Target Word Count</label>
            <select
              className="form-input"
              name="targetWordCount"
              value={form.targetWordCount}
              onChange={handleChange}
            >
              <option value={2000}>2,000 words</option>
              <option value={3000}>3,000 words</option>
              <option value={4000}>4,000 words</option>
              <option value={5000}>5,000 words</option>
              <option value={7000}>7,000 words</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Citation Style</label>
            <select
              className="form-input"
              name="citationStyle"
              value={form.citationStyle}
              onChange={handleChange}
            >
              <option value="APA">APA 7th</option>
              <option value="Harvard">Harvard</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Seed Keywords * <span className="form-hint">(3–5 keywords, comma-separated)</span>
          </label>
          <input
            className="form-input"
            name="seedKeywords"
            value={form.seedKeywords}
            onChange={handleChange}
            placeholder="e.g. OT security, ICS vulnerabilities, NIST CSF, Purdue model"
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!form.topic || !form.targetAudience || !form.seedKeywords}
          >
            🚀 Run Research Agent
          </button>
          <p className="form-cost">Estimated cost: ~$6 · Processing time: ~2 hours</p>
        </div>
      </form>
    </div>
  );
}
