# AGENT 05 — Automated Whitepaper Research Agent

> Technical B2B topic in → research brief + structured outline + first-draft out  
> **~80% research time saved · ~$6 per whitepaper · 2 hours vs 2 days**

---

## Stack

| Layer     | Technology                          | Purpose                              |
|-----------|-------------------------------------|--------------------------------------|
| Research  | Perplexity API (sonar-pro)          | Real-time source retrieval           |
| Outline   | Claude API (claude-opus-4-5)       | Structured H1/H2/H3 outline          |
| Draft     | Claude API (claude-opus-4-5)       | Exec summary + introduction          |
| Delivery  | Notion API                          | Collaborative editing database       |
| Validation| CrossRef / DOI lookup              | Citation verification                |
| Frontend  | React + Vite                        | Pipeline UI                          |
| Backend   | Node.js + Express                   | API orchestration                    |

## Project Structure

```
whitepaper-agent/
├── backend/
│   ├── server.js                 ← Express server entry point
│   ├── .env.example              ← Copy to .env, fill in API keys
│   ├── package.json
│   ├── routes/
│   │   ├── research.js           ← POST /api/research
│   │   ├── outline.js            ← POST /api/outline
│   │   ├── draft.js              ← POST /api/draft
│   │   └── notion.js             ← POST /api/notion/save
│   ├── services/
│   │   ├── perplexity.js         ← Perplexity API calls
│   │   ├── claude.js             ← Claude outline + draft
│   │   ├── notion.js             ← Notion page creation
│   │   ├── sourceValidator.js    ← URL + date validation
│   │   └── citations.js          ← APA / Harvard formatting
│   └── utils/
│       └── logger.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx               ← Main pipeline orchestrator
│   │   ├── main.jsx
│   │   ├── styles/app.css
│   │   └── components/
│   │       ├── TopicForm.jsx     ← Step 1 input form
│   │       ├── PipelineStatus.jsx← 7-step progress tracker
│   │       ├── ResearchResults.jsx
│   │       ├── OutlineView.jsx
│   │       └── DraftView.jsx     ← Draft + NotionDelivery
│   ├── index.html
│   ├── vite.config.js
│   └── .env.example              ← Copy to .env, set VITE_API_URL
└── DEPLOYMENT_GUIDE.md           ← Full VPS setup instructions
```

## Quick Start (Local Dev)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/agent05.git
cd agent05

# 2. Backend
cd backend
cp .env.example .env          # Fill in your API keys
npm install
npm run dev                   # Starts on :3001

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env          # Set VITE_API_URL=http://localhost:3001
npm install
npm run dev                   # Starts on :3000
```

Open http://localhost:3000

## API Keys Required

| Key                  | Get it at                                      |
|----------------------|------------------------------------------------|
| `PERPLEXITY_API_KEY` | https://www.perplexity.ai/settings/api         |
| `ANTHROPIC_API_KEY`  | https://console.anthropic.com/settings/keys    |
| `NOTION_API_KEY`     | https://www.notion.so/my-integrations          |
| `NOTION_DATABASE_ID` | From your Notion database URL                  |

## Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for full VPS setup with Nginx + PM2 + HTTPS.

## Cost Per Whitepaper

| API           | Cost     |
|---------------|----------|
| Perplexity    | ~$5.00   |
| Claude        | ~$0.50   |
| Notion        | Free     |
| **Total**     | **~$5.50–6** |
