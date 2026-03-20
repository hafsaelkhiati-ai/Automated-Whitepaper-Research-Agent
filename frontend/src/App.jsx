/**
 * AGENT 05 — Frontend React App
 * Main App component — orchestrates the 7-step pipeline UI
 * 
 * API endpoint: Set VITE_API_URL in frontend/.env
 */

import { useState } from "react";
import TopicForm from "./components/TopicForm";
import PipelineStatus from "./components/PipelineStatus";
import ResearchResults from "./components/ResearchResults";
import OutlineView from "./components/OutlineView";
import DraftView from "./components/DraftView";
import NotionDelivery from "./components/NotionDelivery";
import "./styles/app.css";

// ← Set your backend URL in frontend/.env as VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STEPS = [
  { id: 1, label: "Topic Input", icon: "✍️" },
  { id: 2, label: "Deep Research", icon: "🔍" },
  { id: 3, label: "Source Validation", icon: "✅" },
  { id: 4, label: "Outline Generation", icon: "📑" },
  { id: 5, label: "Draft Writing", icon: "✒️" },
  { id: 6, label: "Citations", icon: "📚" },
  { id: 7, label: "Notion Delivery", icon: "📤" },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState("idle"); // idle | running | complete | error
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  // Pipeline state
  const [sources, setSources] = useState([]);
  const [researchSummary, setResearchSummary] = useState("");
  const [outline, setOutline] = useState(null);
  const [draft, setDraft] = useState(null);
  const [notionResult, setNotionResult] = useState(null);

  const runPipeline = async (formValues) => {
    setFormData(formValues);
    setStatus("running");
    setError(null);

    try {
      // ── Step 2: Deep Research ──────────────────────────────────────────────
      setCurrentStep(2);
      const researchRes = await fetch(`${API_BASE}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      if (!researchRes.ok) throw new Error(await researchRes.text());
      const researchData = await researchRes.json();

      // Step 3 (validation happens in backend — just advance UI)
      setCurrentStep(3);
      setSources(researchData.sources);
      setResearchSummary(researchData.researchSummary);
      await delay(800); // Brief pause to show validation step

      // ── Step 4: Outline Generation ─────────────────────────────────────────
      setCurrentStep(4);
      const outlineRes = await fetch(`${API_BASE}/api/outline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formValues,
          sources: researchData.sources,
          researchSummary: researchData.researchSummary,
        }),
      });
      if (!outlineRes.ok) throw new Error(await outlineRes.text());
      const outlineData = await outlineRes.json();
      setOutline(outlineData.outline);

      // ── Step 5 & 6: Draft + Citations ─────────────────────────────────────
      setCurrentStep(5);
      const draftRes = await fetch(`${API_BASE}/api/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formValues,
          outline: outlineData.outline,
          sources: researchData.sources,
          citationStyle: formValues.citationStyle || "APA",
        }),
      });
      if (!draftRes.ok) throw new Error(await draftRes.text());
      const draftData = await draftRes.json();
      setDraft(draftData.draft);
      setCurrentStep(6);
      await delay(600);

      // ── Step 7: Notion Delivery ────────────────────────────────────────────
      setCurrentStep(7);
      const notionRes = await fetch(`${API_BASE}/api/notion/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formValues,
          sources: researchData.sources,
          outline: outlineData.outline,
          draft: draftData.draft,
        }),
      });
      if (!notionRes.ok) throw new Error(await notionRes.text());
      const notionData = await notionRes.json();
      setNotionResult(notionData);

      setStatus("complete");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const reset = () => {
    setCurrentStep(1);
    setStatus("idle");
    setError(null);
    setFormData(null);
    setSources([]);
    setResearchSummary("");
    setOutline(null);
    setDraft(null);
    setNotionResult(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-mark">A05</div>
          <div>
            <h1 className="app-title">AGENT 05</h1>
            <p className="app-subtitle">Automated Whitepaper Research Agent</p>
          </div>
          <div className="cost-badge">~$6 / whitepaper</div>
        </div>
      </header>

      <main className="app-main">
        <PipelineStatus steps={STEPS} currentStep={currentStep} status={status} />

        {status === "idle" && (
          <TopicForm onSubmit={runPipeline} />
        )}

        {status === "running" && (
          <div className="running-state">
            <div className="spinner" />
            <p className="running-label">{STEPS[currentStep - 1]?.icon} {STEPS[currentStep - 1]?.label}...</p>
          </div>
        )}

        {status === "error" && (
          <div className="error-card">
            <h3>❌ Pipeline Error</h3>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={reset}>Try Again</button>
          </div>
        )}

        {status === "complete" && (
          <div className="results-container">
            <ResearchResults sources={sources} summary={researchSummary} />
            <OutlineView outline={outline} />
            <DraftView draft={draft} />
            <NotionDelivery result={notionResult} />
            <button className="btn btn-secondary reset-btn" onClick={reset}>
              ↩ New Whitepaper
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span>AGENT 05 · Built with Perplexity + Claude + Notion</span>
        <span>~80% research time saved</span>
      </footer>
    </div>
  );
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
