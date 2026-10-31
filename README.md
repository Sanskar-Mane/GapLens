# GapLens — AI-Assisted Information Gap Detection Platform
**Shinchan Online Hackathon 2026** | **Problem Statement: Digital Dark Spot**

GapLens is an analytical intelligence platform designed to uncover "Digital Dark Spots" in multi-source policies, academic regulations, government schemes, and business compliance documents. Instead of merely summarizing text, GapLens systematically cross-examines documents to expose what is **missing, contradictory, or outdated**.

---

## 🏛️ Architecture & Highlights (Phase 0 & 1)

- **Strict Two-Folder Structure:** `GapLens/backend` (Express.js, `@supabase/supabase-js`, Jina AI reader & Cheerio) and `GapLens/frontend` (React JSX, Vite, Tailwind CSS, Lucide icons).
- **Global Light & Dark Theme System:**
  - Tailwind CSS configured with `darkMode: 'class'`.
  - `ThemeContext.jsx` persisting `'light'` or `'dark'` in `localStorage` (`gaplens_theme`) and syncing with `document.documentElement`.
  - Crisp Sun/Moon toggle button in the Navbar.
  - Executive-grade dual-theme styling across all components (`bg-slate-50 dark:bg-slate-950`, `bg-white dark:bg-slate-900`, `border-slate-200 dark:border-slate-800`, `text-slate-900 dark:text-slate-100`).
- **Resilient Supabase Integration:** Connects to Supabase (`research_sessions` table) using `@supabase/supabase-js`, with an automatic graceful in-memory fallback array when `SUPABASE_URL` or `SUPABASE_ANON_KEY` are missing in `.env`.
- **OpenRouter Free Models Engine:** Defaults to `meta-llama/llama-3.3-70b-instruct:free` with a built-in registry of zero-cost models:
  - `meta-llama/llama-3.3-70b-instruct:free` (Primary Recommended - Fast & Reliable JSON)
  - `google/gemma-3-27b-it:free` (Google Gemma 3 27B Free)
  - `mistralai/mistral-small-3.1-24b-instruct:free` (Mistral Small 3.1 24B Free)
  - `nvidia/llama-3.3-nemotron-super-49b-v1:free` (NVIDIA Nemotron Super 49B Free)
  - `deepseek/deepseek-r1:free` (DeepSeek R1 Free)
  - `qwen/qwen3-235b-a22b:free` (Qwen 3 235B Free)
  - `openrouter/auto` (OpenRouter Auto Router)
  - Plus a custom model ID input option in the UI and a "Force Offline Demo Mode" toggle.
- **1-Click Pre-Seeded Judge Scenarios:**
  1. *Post-Matric Scholarship Verification (Official Hackathon Case):* Conflicting income limits (Rs. 2.5L in Official Notice vs Rs. 8L in third-party guide), missing renewal conditions & exact cutoff deadline, superseded 2023 physical circular.
  2. *Cloud Kitchen Licensing & Compliance (Business Case):* Conflicting turnover thresholds (Rs. 12L vs Rs. 20L), missing Fire & Pollution NOC renewal rules, undated blog.
- **Multi-Source Collector (2 to 6 Sources):** Dynamic workspace with source cards supporting Title, Source Type (`Official Notice`, `Third-Party Guide`, `Archived Circular`, `News Article`, `Forum/Other`), Publication Date/Cycle, URL with 1-click Jina AI scraping, and raw text editing with character count.
- **Validation Action Bar:** Real-time form validation, undated source warning detection, active model badge, and analysis trigger.
- **5-Panel Output Wireframe Blueprint:**
  1. Panel 1: Structured Cross-Source Summary (Sourced Facts)
  2. Panel 2: Potential Information Gaps & Unanswered Questions (Dark Spot Radar)
  3. Panel 3: Source Contradiction & Conflict Radar
  4. Panel 4: Outdated & Undated Source Warnings (Temporal Radar)
  5. Panel 5: Prioritized Next-Step Verification Checklist

---

## 📁 Repository Structure

```text
GapLens/
├── backend/
│   ├── config/
│   │   ├── supabaseClient.js        # Supabase client initialization + graceful in-memory fallback
│   │   └── openRouterConfig.js      # Free tier models list & OpenRouter headers helper
│   ├── data/
│   │   └── sampleScenarios.js       # Pre-seeded realistic sample datasets
│   ├── routes/
│   │   └── apiRoutes.js             # Express routes for health, scenarios, URL extraction, sessions, analyze
│   ├── .env.example                 # PORT, SUPABASE_URL, SUPABASE_ANON_KEY, OPENROUTER_API_KEY, OPENROUTER_MODEL
│   ├── package.json                 # express, @supabase/supabase-js, cors, dotenv, axios, cheerio
│   └── server.js                    # Express server entry point on port 5000
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── context/
    │   │   └── ThemeContext.jsx     # Light/Dark mode provider syncing with document.documentElement & localStorage
    │   ├── components/
    │   │   ├── Navbar.jsx           # Sun/Moon theme toggle, branding, Supabase/OpenRouter pills, settings modal, reset
    │   │   ├── ApiKeyModal.jsx      # Modal for OpenRouter API key, Free Models dropdown, custom model ID, test probe
    │   │   ├── SampleLoader.jsx     # 1-click preset loader for Hackathon sample scenarios
    │   │   ├── TopicInput.jsx       # Research question / decision goal input panel
    │   │   ├── SourceCollector.jsx  # Dynamic manager for 2 to 6 sources
    │   │   ├── SourceCard.jsx       # Individual source input (Title, Type, URL, Date/Cycle, Raw Text)
    │   │   ├── ActionFooter.jsx     # Validation bar & "Analyze Sources for Gaps & Contradictions" CTA
    │   │   └── DashboardPreview.jsx # Dual-theme visual blueprint of the 5 expected output panels
    │   ├── data/
    │   │   └── fallbackScenarios.js # Client-side backup of sample scenarios
    │   ├── services/
    │   │   └── api.js               # Axios wrapper sending OpenRouter key & selected model to backend
    │   ├── App.jsx                  # Master state container wrapped in ThemeProvider
    │   ├── index.css                # Tailwind CSS directives and smooth theme transition styles
    │   └── main.jsx                 # React DOM entry point
    ├── index.html
    ├── package.json                 # react, react-dom, lucide-react, axios, tailwindcss, vite
    ├── postcss.config.js
    ├── tailwind.config.js           # Configured with darkMode: 'class'
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Port 5000)
```bash
cd backend
npm install
npm start
```
Server boots on `http://localhost:5000`.

### 2. Frontend Setup (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 Backend API Endpoints

- `GET /` — API directory and service status probe
- `GET /api/health` — Status, Supabase connectivity (`supabaseConnected`), OpenRouter readiness, and `availableModels` list
- `GET /api/scenarios` — Pre-seeded sample scenarios
- `POST /api/extract-url` — URL text extraction via Jina AI reader with Cheerio fallback
- `POST /api/sessions` — Inserts research session into Supabase `research_sessions` table (or in-memory store)
- `GET /api/sessions` — Retrieves recent research sessions ordered by `created_at` descending
- `POST /api/analyze` — Phase 1 validation and workspace synchronization stub
