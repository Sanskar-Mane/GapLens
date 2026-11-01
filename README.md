# GapLens — AI-Assisted Information Gap & Contradiction Auditing Platform

**Event:** Shinchan Online Hackathon 2026 (DEVENGERS)  
**Problem Statement:** Digital Dark Spot — AI-Assisted Information Gap Detection Platform  
**Category:** Web Development, Artificial Intelligence, Research & Information Technology  

---

## Table of Contents

1. [The Problem: Digital Dark Spots](#1-the-problem-digital-dark-spots)
2. [Proposed Solution: What is GapLens?](#2-proposed-solution-what-is-gaplens)
3. [System Architecture & End-to-End Workflow](#3-system-architecture--end-to-end-workflow)
4. [Major Features](#4-major-features)
5. [Uniqueness & Technical Innovation](#5-uniqueness--technical-innovation)
6. [Technology Stack](#6-technology-stack)
7. [Repository Directory Structure](#7-repository-directory-structure)
8. [Local Installation & Setup Guide](#8-local-installation--setup-guide)
9. [REST API Reference](#9-rest-api-reference)
10. [Automated Validation & Test Suite](#10-automated-validation--test-suite)
11. [Judge Demo Walkthrough](#11-judge-demo-walkthrough)
12. [Future Scope](#12-future-scope)

---

## 1. The Problem: Digital Dark Spots

People rely on online information every day to make high-stakes decisions regarding education (scholarships, admissions), careers, public services, legal compliance, and business licensing. However, critical procedural and regulatory information is rarely found in one place. It is scattered across official government portals, archived PDF circulars, news articles, third-party guidance blogs, and community forums.

When researching a decision, users face three major blind spots:
* **Information Gaps (Omissions):** Crucial requirements—such as second-year scholarship renewal criteria, minimum CGPA/attendance thresholds, or mandatory municipal fire safety NOCs—are frequently left out of summary pages without the reader knowing what they missed.
* **Cross-Source Contradictions:** Different sources often state conflicting numbers or rules for the exact same requirement (for example, an official portal mandating a family income ceiling of Rs. 2.5 Lakh with a Tehsildar certificate, while a popular student blog claims a Rs. 8.0 Lakh limit using a Rs. 100 stamp paper affidavit).
* **Temporal Drift & Outdated Cycles:** Search engines regularly surface superseded circulars from older academic or fiscal years (such as 2021 or 2023–24 offline submission rules) alongside current 2026 digital guidelines, or show undated snippets that carry high compliance risk.

**Why Existing Tools Fall Short:**  
Standard search engines help users *find* links, and standard AI summarizers *condense* whatever text is already on the page. Neither tells the user **what is missing, where sources disagree, which documents are outdated, which source carries legal authority, or what specific questions to verify next**.

---

## 2. Proposed Solution: What is GapLens?

**GapLens** is an epistemic auditing and cross-examination web platform. Instead of acting as a generic chatbot or text summarizer, GapLens ingests 2 to 6 sources simultaneously (via manual input, URL extraction, file upload, or autonomous web discovery) and audits them against a user's specific research question or decision goal.

GapLens performs a structured multi-stage regulatory audit to produce:
1. **Decision Readiness Score ($0\text{--}100$):** A quantitative readiness metric paired with an executive risk assessment.
2. **6-Parameter Decision Completeness Rubric:** Evaluates domain-specific decision pillars and marks each as **Verified**, **Conflicted**, or **Missing (Dark Spot)**.
3. **Corroborated Cross-Source Facts:** Extracts verified statements backed by exact verbatim quotes (`evidenceQuote`) and source confidence levels.
4. **Potential Information Gaps & Unanswered Questions:** Highlights omitted prerequisites and formulates the exact questions left unanswered across the reviewed corpus.
5. **Contradiction Radar & Legal Precedence Arbiter:** Pinpoints numerical, documentary, or procedural clashes between sources side-by-side and determines which source holds binding precedence.
6. **Temporal & Undated Source Warnings:** Automatically scans text for academic/fiscal cycles and flags pre-2025 outdated circulars or undated documents.
7. **Decision Pre-Mortem Simulator:** Projects concrete administrative delays, failure scenarios, and financial/compliance penalties if the user proceeds without resolving the detected dark spots.
8. **Prioritized Verification Checklist & Official Inquiry Generator:** Generates an interactive checklist naming the exact target authority to contact, complete with a 1-click formal clarification email and printable helpdesk brief generator.

---

## 3. System Architecture & End-to-End Workflow

```text
+-----------------------------------------------------------------------------------+
|                           USER RESEARCH WORKSPACE (React 18)                      |
|  [1. Research Goal & Category] ---> [2. Source Collector (Manual / URL / File)]   |
+--------------------------------------------------+--------------------------------+
                                                   |
                                                   v
+-----------------------------------------------------------------------------------+
|                     INGESTION & AUTONOMOUS DISCOVERY PIPELINE                     |
|  • Autonomous Web Discovery (/api/auto-discover):                                 |
|    Queries DuckDuckGo HTML + Jina Search + Wikipedia API in parallel              |
|  • Modular Dual-Format Extractor (/api/extract):                                  |
|    Stage 1: IPv4 Axios + Cheerio DOM Cleaning + Turndown (Markdown & Plain Text)  |
|    Stage 2: SPA Shell & Bot Firewall Detection -> Puppeteer / Jina Reader Fallback|
|  • Temporal Metadata Scanner (/api/scan-text):                                    |
|    Regex detection for academic cycles (e.g., 2023-24), dates, & staleness        |
+--------------------------------------------------+--------------------------------+
                                                   |
                                                   v
+-----------------------------------------------------------------------------------+
|                   HIGH-SIGNAL COMPRESSION & AI AUDITING ENGINE                    |
|  • Token Compressor: Strips inline URLs, scores sentences by regulatory signals,  |
|    and condenses sources to high-density 1200-char extracts (>70% token savings)  |
|  • SHA-256 Request Cache: Instant 0-token retrieval for repeat corpus audits      |
|  • Google Gemini REST Engine: Native JSON Schema enforcement + .env Model         |
|    Failover Queue (gemini-2.5-flash -> gemini-2.0-flash -> gemini-2.5-flash-lite) |
+--------------------------------------------------+--------------------------------+
                                                   |
                                                   v
+-----------------------------------------------------------------------------------+
|                 INTERACTIVE AUDIT DASHBOARD & PERSISTENCE LAYER                   |
|  • 5-Panel Gap & Conflict View + Slide-Over Verbatim Quote & 2-Column Diff Drawer |
|  • Interactive Verification Checklist + Official Authority Inquiry Generator      |
|  • User-Isolated Storage: Supabase PostgreSQL (RLS) + In-Memory/Local Fallback    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Major Features

* **4-Step Guided Audit Wizard:** Walks the user cleanly through defining a *Research Goal*, building a *Source Workspace*, inspecting the *Gap & Conflict Dashboard*, and executing the *Verification Checklist*.
* **Autonomous Relative Website Discovery:** If a user enters only a research question (or fewer than 2 sources) and enables *Auto-Scan Relative Websites*, GapLens automatically formulates targeted regulatory search queries, discovers relevant official notices and third-party guides across live search engines, scrapes their content, and merges them into the audit corpus.
* **Dual-View Source Extraction (Markdown & Plain Text):** Users can paste a URL to automatically extract clean article text, toggle between structured Markdown and flattened Plain Text views, or upload local `.txt` and `.md` files.
* **Interactive 6-Parameter Decision Rubric Bar:** Displays at a glance how many core decision requirements are verified, conflicted, or missing, allowing users to click any pillar to filter the dashboard.
* **Slide-Over Source Evidence Inspector & 2-Column Conflict Diff:** Clicking any sourced fact, temporal warning, or contradiction opens a slide-over drawer that highlights the exact verbatim quote inside the raw source text or displays a side-by-side comparison of clashing sources.
* **Interactive Checklist with Persistent Desk Notes:** Users can check off verification tasks as they complete them, type in official responses or circular numbers per item, and export a print-ready PDF verification brief.
* **1-Click Official Authority Inquiry Generator:** Converts unresolved contradictions and information gaps into a pre-formatted formal clarification email (`mailto:` client integration) or an In-Person Nodal Helpdesk Verification Sheet.
* **User Authentication & Isolated Session History:** Supports account registration, sign-in, and a 1-click Hackathon Demo User mode. Saved analyses and checklist notes are strictly isolated per user account.

---

## 5. Uniqueness & Technical Innovation

### 1. Epistemic Transparency & Anti-Hallucination Guardrails
Judging guidance requires that AI-generated findings be communicated responsibly and never presented as guaranteed facts. GapLens enforces a strict 3-Tier Epistemic Standard:
* **Tier 1 (Sourced Evidence):** Must include an exact 8–18 word verbatim `evidenceQuote` substring extracted directly from the user's source text.
* **Tier 2 (AI Gap Signals):** Explicitly badged as `"Potential Gap — Not Found in Reviewed Sources"` or `"Potential Gap — Unanswered Question"`. GapLens never invents missing policies.
* **Tier 3 (Conflict & Temporal Risk):** Explicitly badged as `"Possible Conflict Between Sources"`, showing both competing claims side by side.

### 2. Legal Hierarchy of Authority (LHoA) Precedence Arbiter
When two sources contradict each other, simply pointing out the conflict is only half the solution. GapLens evaluates the authority tier of each source (**Tier 1: Statutory Gazettes > Tier 2: Official Portals > Tier 3: Established Media > Tier 4: Blogs & Forums**) and outputs a `precedenceVerdict` indicating which source carries binding weight and why.

### 3. Decision Pre-Mortem Risk Simulator
To make information gaps tangible, GapLens runs a pre-mortem simulation (`decisionPreMortem`) that estimates the administrative delay (e.g., *"30 to 60 Days Processing Delay"*) and maps specific dark spots (`gap-1`, `conf-1`) to real-world failure scenarios and financial or statutory penalties.

### 4. High-Signal Regulatory Token Compressor ($>70\%$ Token Reduction)
Regulatory circulars and scraped web pages contain massive amounts of boilerplate. Before calling the LLM, `compressSourceForLLM()` strips URLs, splits text into sentences, scores each sentence for regulatory density (numbers, currency, years, legal modal verbs like *must*, *mandatory*, *eligible*, *deadline*, *certificate*), and reconstructs a high-signal corpus in chronological order. Combined with `thinkingBudget: 0` on Gemini 2.5 models and an in-memory SHA-256 request cache, audits run rapidly with minimal token overhead.

### 5. Multi-Stage Scraper with SPA & Bot-Firewall Resilience
Government portals frequently suffer from incomplete SSL chains or client-side rendering shells. Our modular extractor (`backend/services/extractor.js`) uses a custom IPv4 HTTPS agent with TLS tolerance, strips DOM noise via Cheerio, normalizes relative links to absolute URLs, and converts content to Markdown via Turndown. If it detects an empty React/Next.js SPA shell or a Cloudflare challenge wall, it automatically falls back to headless rendering (Puppeteer / Jina Cloud Reader).

---

## 6. Technology Stack

### Frontend (`/frontend`)
* **Framework:** React 18 (Vite 6, ES Modules, JSX)
* **Styling:** Tailwind CSS v3.4 (`darkMode: 'class'`), Custom `@media print` stylesheet for physical PDF brief exports, Inter & JetBrains Mono typography
* **Icons:** Lucide React (`lucide-react`)
* **HTTP Client & State:** Axios with request interceptors for API keys, models, and bearer tokens; React Context API (`AuthContext`, `ThemeContext`)

### Backend (`/backend`)
* **Runtime & Framework:** Node.js, Express.js (`cors`, `dotenv`)
* **AI Engine:** Direct **Google Gemini REST API** (`generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`) with `responseMimeType: "application/json"`, strict `.env` model registry (`GEMINI_MODEL`), and automatic multi-model failover
* **Web Extraction & Search:** Cheerio, Turndown (HTML-to-Markdown), DuckDuckGo HTML Search, Jina AI Reader & Search API (`r.jina.ai`, `s.jina.ai`), Wikipedia Search API, IPv4 Keep-Alive HTTPS Agent
* **Database & Auth:** Supabase (`@supabase/supabase-js`) with PostgreSQL Row-Level Security (RLS) policies, backed by an automatic zero-config In-Memory Server Store and `localStorage` fallback
* **Testing:** Node.js native `assert` test suite (`backend/tests/crossExamination.test.js`)

---

## 7. Repository Directory Structure

```text
GapLens/
├── README.md
├── backend/
│   ├── .env.example                 # Environment template (PORT, GEMINI_API_KEY, GEMINI_MODEL, SUPABASE_*)
│   ├── package.json                 # Backend dependencies & test script
│   ├── server.js                    # Express server entry point
│   ├── supabase_rls_schema.sql      # PostgreSQL table & Row-Level Security (RLS) policies
│   ├── config/
│   │   ├── openRouterConfig.js      # Dynamic .env model parser & metadata generator for Gemini models
│   │   └── supabaseClient.js        # Supabase client initialization + graceful in-memory fallback
│   ├── data/
│   │   ├── precomputedAnalyses.js   # Dynamic heuristic fallback engine & schema baseline generator
│   │   └── sampleScenarios.js       # Scenario registry
│   ├── routes/
│   │   └── apiRoutes.js             # REST endpoints (/health, /extract, /auto-discover, /analyze, /auth, /sessions)
│   ├── services/
│   │   ├── aiAnalysisService.js     # Gemini AI gap-detection engine, token compressor, cache & failover queue
│   │   ├── extractor.js             # Modular Cheerio + Turndown extractor & SPA/headless fallback
│   │   └── scraperService.js        # Multi-engine search, autonomous web discovery & temporal scanner
│   └── tests/
│       └── crossExamination.test.js # 29-test validation suite across 10 functional groups
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js               # Vite dev server on port 5173 with /api proxy to localhost:5000
    └── src/
        ├── App.jsx                  # Master 4-step wizard state & session controller
        ├── index.css                # Tailwind directives, dark/light styling & print media rules
        ├── main.jsx                 # React DOM entry point
        ├── context/
        │   ├── AuthContext.jsx      # User authentication provider (Supabase + Local Demo mode)
        │   └── ThemeContext.jsx     # Light / Dark theme provider persisted in localStorage
        ├── data/
        │   └── fallbackScenarios.js # Client-side fallback schema support
        ├── services/
        │   └── api.js               # Axios API client, interceptors & dynamic client fallback generator
        └── components/
            ├── Navbar.jsx                   # Step navigation, auth status, Supabase indicator & drawers
            ├── StepProgressBar.jsx          # 4-step progress wizard bar
            ├── MetricCardsRow.jsx           # Top KPI cards (Sources, Dark Spots, Conflicts, Readiness)
            ├── SampleLoader.jsx             # Scenario loader bar
            ├── TopicInput.jsx               # Research question input, category selector & auto-discovery toggle
            ├── SourceCollector.jsx          # Dynamic manager for 2 to 6 sources + 1-click web auto-scraper
            ├── SourceCard.jsx               # URL extraction, Markdown/Plain toggle, file upload & date scanner
            ├── SearchSourcesModal.jsx       # Permitted web source discovery modal
            ├── ActionFooter.jsx             # Workspace validation bar & "Analyze Sources" trigger
            ├── AnalysisLoadingOverlay.jsx   # Animated 5-stage audit progress overlay
            ├── AnalysisResultsView.jsx      # Interactive Gap, Conflict, Pre-Mortem & Rubric Dashboard
            ├── RubricCoverageBar.jsx        # 6-parameter Decision Completeness Rubric bar
            ├── TransparencyLegendBar.jsx    # 3-Tier Epistemic Transparency & Confidence Legend
            ├── SourceInspectorDrawer.jsx    # Slide-over verbatim quote highlighter & 2-column Diff viewer
            ├── VerificationChecklistView.jsx# Interactive checklist, desk notes & PDF/Markdown export
            ├── InquiryDraftModal.jsx        # Official authority email & helpdesk brief generator
            ├── SavedSessionsDrawer.jsx      # User-isolated session history drawer
            ├── AuthModal.jsx                # Sign In / Create Account / Demo User modal
            ├── ApiKeyModal.jsx              # Gemini API key & .env model selector modal
            └── DashboardPreview.jsx         # Analytical output blueprint preview
```

---

## 8. Local Installation & Setup Guide

### Prerequisites
* **Node.js** v18.0.0 or higher
* **npm** v9.0.0 or higher
* **Google Gemini API Key** (Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Step 1: Clone the Repository
```bash
git clone <your-github-repository-url>
cd GapLens
```

### Step 2: Configure Backend Environment Variables
Navigate to the `backend` folder and create a `.env` file from `.env.example`:
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` and add your Google Gemini API key and preferred model failover list:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash,gemini-2.0-flash,gemini-2.5-flash-lite

# Optional Supabase Credentials (automatically falls back to In-Memory Store if omitted)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_publishable_key
SUPABASE_SECRET_KEY=your_supabase_service_role_secret_key
```
*(Optional)* If you are connecting a live Supabase project, run the SQL script in `backend/supabase_rls_schema.sql` in your Supabase SQL Editor to enable Row-Level Security (RLS) on the `research_sessions` table.

### Step 3: Install & Start the Backend Server
```bash
cd backend
npm install
npm start
```
The backend API will start at `http://localhost:5000`.

### Step 4: Install & Start the Frontend Application
Open a new terminal window and run:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 9. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server status, Supabase connection state, Gemini key readiness, `defaultModel`, and `availableModels` parsed from `.env`. |
| `GET` | `/api/models` | Returns the list of Gemini models configured in `backend/.env`. |
| `POST` | `/api/extract` | Extracts clean Markdown (`markdownText`), plain text (`plainText`), title, and temporal metadata from a URL with headless fallback. |
| `POST` | `/api/search-sources` | Searches permitted web sources concurrently across DuckDuckGo HTML, Jina Search, and Wikipedia API. |
| `POST` | `/api/auto-discover` | Automatically formulates regulatory queries for a topic, discovers relevant websites, scrapes their live text, and returns formatted sources. |
| `POST` | `/api/scan-text` | Scans raw text for academic/fiscal cycles (e.g., `2023-24`), explicit dates, and classifies temporal status (`current`, `outdated`, `undated`). |
| `POST` | `/api/analyze` | Executes the cross-source gap & contradiction audit via Google Gemini API (triggers autonomous web discovery if fewer than 2 sources are provided). |
| `POST` | `/api/auth/signup` | Registers a user account via Supabase Auth or Local Demo fallback. |
| `POST` | `/api/auth/login` | Authenticates a user or initializes a Demo User session. |
| `GET` | `/api/auth/me` | Resolves the currently authenticated user profile from the Bearer token. |
| `GET` | `/api/sessions` | Retrieves saved research sessions strictly isolated to the authenticated `user_id`. |
| `POST` | `/api/sessions` | Saves a research session and its audit output scoped to the current user. |
| `PATCH` | `/api/sessions/:id/checklist` | Persists interactive verification checklist checkboxes and user desk notes (enforces 403 Forbidden on cross-user access). |
| `DELETE` | `/api/sessions/:id` | Deletes a saved research session owned by the authenticated user. |

---

## 10. Automated Validation & Test Suite

GapLens includes an automated validation suite (`backend/tests/crossExamination.test.js`) with **29 unit and integration tests** across 10 test groups:
* **Groups 1–3:** Benchmark specification audits for Scholarship Verification (Rs. 2.5L vs. Rs. 8.0L conflict, missing renewal policy, outdated 2023-24 circular), FSSAI Cloud Kitchen Licensing, and Overseas Education Loan Interest Subsidy.
* **Group 4:** Dynamic cross-examination engine boundary tests across 2, 4, and 6 sources.
* **Group 5, 5B & 5C:** Temporal metadata scanner, Cheerio/Turndown HTML-to-Markdown noise stripping, and autonomous web discovery (`autoDiscoverAndScrapeSources`).
* **Group 6 & 6B:** Live API fault tolerance, high-signal source compression (`compressSourceForLLM`), and zero-token SHA-256 request caching.
* **Group 7 & 8:** Strict `.env` model registry parsing and LLM JSON sanitization (`<think>` tag stripping, trailing comma removal, unescaped newline recovery).
* **Group 9 & 10:** Authentication validation and strict cross-user data isolation (verifying User A cannot read, modify, or delete User B's sessions).

Run the test suite at any time with:
```bash
cd backend
npm test
```

---

## 11. Judge Demo Walkthrough

Following **Section 7 (Suggested Demo Flow)** of the official Hackathon Problem Statement:

1. **Enter Research Goal (Step 1):**  
   Enter a high-stakes question such as: *"What should I verify before applying for the State Post-Matric Scholarship 2026?"* and select the **Education** category.
2. **Collect or Auto-Discover Sources (Step 2):**  
   * Paste URLs or text snippets (e.g., an Official State Portal notice stating a Rs. 2.5 Lakh income limit, a student guidance blog claiming a Rs. 8.0 Lakh limit, and an older 2023–24 circular), **or** click **"Scan & Pull Relative Websites"** to watch GapLens discover and scrape live web sources automatically.
   * Observe the real-time **Undated** and **Outdated Cycle** badges on the source cards.
3. **Run the Cross-Source Audit (Step 3):**  
   * Click **"Analyze Sources for Gaps & Contradictions"**.
   * Inspect the **Decision Readiness Score**, the **6-Parameter Completeness Rubric**, and the **Decision Pre-Mortem Simulator**.
   * Under **Potential Information Gaps**, review the omitted multi-year renewal/CGPA rules and missing closing deadline, labeled responsibly as *"Potential Gap — Not Found in Reviewed Sources"*.
   * Switch to **Contradictions**, view the **Legal Hierarchy of Authority (LHoA)** precedence verdict, and click **"Compare Side-by-Side in Inspector"** to view the highlighted verbatim quotes in the 2-column Diff Drawer.
4. **Verify & Generate Official Inquiry (Step 4):**  
   * Open **Step 4: Verification Checklist**, check off verified items, record notes, and click **"Draft Official Inquiry"** to generate a formal clarification email or printable helpdesk brief addressed to the Nodal Officer.

---

## 12. Future Scope

* **Multimodal Scanned PDF & Gazette OCR:** Direct ingestion of scanned government resolutions (GRs) and stamped physical notices using Gemini's native multimodal vision capabilities.
* **Multilingual Cross-Source Auditing:** Auditing regional-language circulars (Hindi, Marathi, Tamil, etc.) directly against English portal summaries to detect translation-induced compliance discrepancies.
* **Automated RTI & Public Grievance Drafts:** 1-click conversion of unresolved governmental dark spots into standardized Right to Information (RTI) applications or CPGRAMS grievance filings.
* **Real-Time Browser Extension:** A lightweight companion extension that highlights undated claims and missing prerequisites directly while a user browses scholarship, admission, or licensing websites.

---

Built for **Shinchan Online Hackathon 2026 (DEVENGERS)** — *Official Problem Statement: Digital Dark Spot*.
