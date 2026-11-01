# GapLens — AI-Assisted Information Gap Detection Platform

**Shinchan Online Hackathon 2026** | **Official Problem Statement:** *Digital Dark Spot*  
**Category:** Web Development, Artificial Intelligence, Research & Information Technology

---

## 1. Problem Statement: The "Digital Dark Spot"

People rely on online information every day to make high-stakes decisions regarding **education (scholarships), careers, public services, legal compliance, and business licensing**. However, critical regulatory and procedural information is fragmented across official notices, third-party blogs, archived PDF circulars, and community forums:

* **Information Gaps (Dark Spots):** Crucial prerequisites—such as multi-year scholarship renewal criteria, minimum CGPA/attendance rules, or mandatory fire safety NOCs—are frequently omitted without the reader realizing what is missing.
* **Cross-Source Contradictions:** Official notices and third-party guides often cite conflicting eligibility thresholds (e.g., an annual family income limit of Rs. 2.5 Lakh vs. Rs. 8.0 Lakh, or a Tehsildar Income Certificate vs. a Rs. 100 stamp-paper affidavit).
* **Temporal Drift & Outdated Cycles:** Search engines surface superseded circulars from earlier academic or fiscal cycles alongside current guidelines, or present undated community snippets that carry severe compliance risk.

**Why Existing Tools Fail:**  
Standard search engines help users *find* links, and AI summarizers *condense* whatever text is already present. Neither tells the user **what is missing, where sources contradict each other, which sources are outdated, or what to verify next**.

---

## 2. Proposed Solution: What is GapLens?

**GapLens** is an epistemic auditing and cross-examination platform that analyzes 2 to 6 sources simultaneously against a user's research question or decision goal. Instead of generating a generic summary, GapLens performs a structured 6-stage regulatory audit to expose **Digital Dark Spots**:

1. **Decision Readiness Score & Executive Audit:** Calculates a quantitative readiness score ($0\text{--}100$) with a risk classification and executive summary.
2. **Decision Completeness Rubric:** Evaluates 6 domain-specific decision parameters and classifies each parameter as **Verified**, **Conflicted**, or **Missing (Dark Spot)**.
3. **Structured Cross-Source Summary (Sourced Facts):** Extracts corroborated statements backed by verbatim `evidenceQuote` substrings and source confidence ratings.
4. **Potential Information Gaps & Unanswered Questions:** Identifies critical omitted policies and formulates the exact questions the user cannot answer from the reviewed sources.
5. **Source Contradiction & Conflict Radar:** Pinpoints direct numerical, procedural, or documentary clashes between sources with side-by-side claims, verbatim quotes, and resolution guidance.
6. **Outdated & Undated Temporal Warnings:** Automatically scans for stale academic/fiscal cycles (e.g., 2021 or 2023-24 circulars) and flags undated sources.
7. **Prioritized Next-Step Verification Checklist & Inquiry Generator:** Produces an interactive, priority-ranked checklist naming the exact target authority to contact, complete with a **1-Click Official Authority Email & Helpdesk Brief Generator**.

---

## 3. Key Features & Uniqueness / Innovation

* **Strict `.env`-Driven Google Gemini Engine:** Powered directly by the official Google Gemini REST API (`generativelanguage.googleapis.com`) using native `responseMimeType: "application/json"` schema enforcement. All available models and failover queues are dynamically and strictly parsed from `backend/.env` (`GEMINI_MODEL`).
* **Epistemic Transparency & Anti-Hallucination Guardrails:** Strictly separates **Tier 1: Sourced Evidence** (verbatim quotes), **Tier 2: AI Gap Signals** (labeled as *Potential Gap — Not Found in Reviewed Sources*), and **Tier 3: Conflict & Temporal Risks** (*Possible Conflict Between Sources*). GapLens never invents missing policies.
* **Traceable Source Inspector & Side-by-Side Conflict Diff Drawer:** Judges and users can click any fact, contradiction, or temporal alert to open the slide-over **Source Evidence Inspector**, which highlights the exact verbatim quote inside the original document corpus or displays a 2-column side-by-side conflict comparison.
* **Multi-Tier Smart Web Scraper & Permitted Search:** Extracts readable text from URLs using **Jina AI Reader** with an automatic **Cheerio HTML Parser** fallback, **Cloudflare/CAPTCHA Bot Firewall detection**, and an automated **Temporal Metadata Scanner** (`POST /api/scan-text`) that detects academic cycles and publication dates.
* **Official Authority Inquiry Generator:** Converts detected contradictions and missing parameters into a ready-to-send formal clarification email (`mailto:` integration) or a printable In-Person Nodal Helpdesk Verification Brief.
* **Resilient Dual-Persistence Architecture:** Persists research sessions and interactive checklist notes to **Supabase PostgreSQL** (`research_sessions` table), with an automatic zero-configuration fallback to an **In-Memory Server Store** and browser `localStorage`.
* **100% Fault-Tolerant Offline Demo & Dynamic Fallback Engine:** If live API keys are omitted or rate-limited during judging, GapLens transparently falls back to pre-verified deterministic audit datasets or its heuristic cross-examination engine so demonstrations never fail.

---

## 4. Pre-Seeded Hackathon Evaluation Scenarios (1-Click Load)

GapLens ships with **3 realistic pre-seeded evaluation scenarios** designed around the official Hackathon Problem Statement:

| Scenario ID | Title & Category | Built-in Information Defects Exposed by GapLens |
| :--- | :--- | :--- |
| **`scholarship-2026`** | **Post-Matric Scholarship Verification** *(Education — Official Problem Statement Case)* | **4 Sources:** Exposes a critical family income limit conflict (**Rs. 2.5 Lakh** in Official Notice vs. **Rs. 8.0 Lakh** in Student Blog), document conflict (**Tehsildar Certificate** vs. **Rs. 100 Stamp Paper**), missing **Year 2–4 Renewal/CGPA rules**, missing **2026-27 closing deadline**, an **outdated 2023-24 offline circular**, and an **undated hostel allowance FAQ**. |
| **`fssai-cloud-kitchen`** | **Cloud Kitchen Licensing & Compliance** *(Business)* | **3 Sources:** Exposes an annual turnover threshold conflict (**Rs. 12 Lakhs** vs. **Rs. 20 Lakhs** for Basic vs. State FSSAI License), missing **2026 Fire Safety NOC & Commercial LPG rules**, missing **Maharashtra Shop Act (Gumasta) registration**, and an **obsolete 2021 municipal fee circular**. |
| **`overseas-edu-subsidy`** | **Central Overseas Education Loan Interest Subsidy (CSIS)** *(Careers)* | **3 Sources:** Exposes a parental income ceiling conflict (**Rs. 4.5 Lakh** vs. **Rs. 6.0 Lakh**), income proof conflict (**Revenue Authority Certificate** vs. **Self-Affidavit**), missing **part-time/hybrid Master's eligibility rules**, and an **undated bank brochure**. |

---

## 5. Technology Stack

### Frontend (`/frontend`)
* **Framework:** React 18 (Vite, ES Modules, JSX)
* **Styling & Theme:** Tailwind CSS v3.4 (`darkMode: 'class'`), Custom Print Stylesheet (`@media print` for PDF Brief exports), Inter & JetBrains Mono typography
* **Icons & UI:** Lucide React (`lucide-react`)
* **HTTP Client:** Axios with automatic header injection & offline resilience

### Backend (`/backend`)
* **Runtime & Server:** Node.js, Express.js (`cors`, `dotenv`)
* **AI Engine:** Direct **Google Gemini REST API** (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`) with strict `.env` model registry (`GEMINI_MODEL`) and native JSON mode
* **Web Scraping & Search:** Jina AI Reader API (`r.jina.ai`, `s.jina.ai`), Cheerio HTML parser, Wikipedia Search API, IPv4 HTTPS Keep-Alive Agent
* **Database:** Supabase (`@supabase/supabase-js`) with automatic In-Memory fallback
* **Testing:** Node.js native `assert` test runner (`crossExamination.test.js` — 19 automated validation tests)

---

## 6. Repository Directory Structure

```text
GapLens/
├── README.md
├── backend/
│   ├── .env.example                 # Environment template (PORT, GEMINI_API_KEY, GEMINI_MODEL, SUPABASE_*)
│   ├── package.json                 # Backend dependencies and test scripts
│   ├── server.js                    # Express server entry point
│   ├── config/
│   │   ├── openRouterConfig.js      # Strict .env model parser & metadata generator for Gemini models
│   │   └── supabaseClient.js        # Supabase initialization + graceful in-memory fallback
│   ├── data/
│   │   ├── precomputedAnalyses.js   # Pre-verified audit datasets & dynamic heuristic fallback engine
│   │   └── sampleScenarios.js       # 3 pre-seeded multi-source hackathon scenarios
│   ├── routes/
│   │   └── apiRoutes.js             # REST API endpoints (/health, /models, /scenarios, /analyze, etc.)
│   ├── services/
│   │   ├── aiAnalysisService.js     # Google Gemini AI gap-detection engine & .env failover queue
│   │   └── scraperService.js        # Jina AI / Cheerio URL extractor, bot guard & temporal scanner
│   └── tests/
│       └── crossExamination.test.js # 19-test suite verifying gap detection, JSON sanitization & .env models
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js               # Vite dev server on port 5173 with /api proxy to backend
    └── src/
        ├── App.jsx                  # Master 4-step wizard state & session controller
        ├── index.css                # Tailwind directives & print-friendly PDF styles
        ├── main.jsx                 # React DOM root
        ├── context/
        │   └── ThemeContext.jsx     # Light / Dark theme provider persisted in localStorage
        ├── data/
        │   └── fallbackScenarios.js # Client-side backup scenarios & precomputed analyses
        ├── services/
        │   └── api.js               # Axios service wrapper & Google Gemini connection probe
        └── components/
            ├── Navbar.jsx                   # Step navigation, Supabase status, theme toggle, drawers
            ├── StepProgressBar.jsx          # 4-step progress wizard bar
            ├── MetricCardsRow.jsx           # Top KPI cards (Sources, Dark Spots, Conflicts, Readiness)
            ├── SampleLoader.jsx             # 1-click loader for the 3 Hackathon test scenarios
            ├── TopicInput.jsx               # Research question & category selector
            ├── SourceCollector.jsx          # Dynamic manager for 2 to 6 sources
            ├── SourceCard.jsx               # URL extraction, file upload (.txt/.md), date auto-detect
            ├── SearchSourcesModal.jsx       # Permitted web source discovery modal
            ├── ActionFooter.jsx             # Workspace validation bar & "Analyze Sources" trigger
            ├── AnalysisLoadingOverlay.jsx   # Animated 5-stage audit progress overlay
            ├── AnalysisResultsView.jsx      # 5-panel interactive Gap & Conflict Dashboard
            ├── RubricCoverageBar.jsx        # 6-parameter Decision Completeness Rubric bar
            ├── TransparencyLegendBar.jsx    # 3-Tier Epistemic Transparency & Confidence Legend
            ├── SourceInspectorDrawer.jsx    # Slide-over verbatim quote highlighter & 2-column Diff viewer
            ├── VerificationChecklistView.jsx# Interactive checklist, verification notes & export tools
            ├── InquiryDraftModal.jsx        # Official authority email & helpdesk brief generator
            ├── SavedSessionsDrawer.jsx      # Session history drawer (Supabase / LocalStorage)
            ├── ApiKeyModal.jsx              # Google Gemini API key & strict .env model selector modal
            └── DashboardPreview.jsx         # Analytical output schema preview
```

---

## 7. Installation & Quick Start Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)
* **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey)) — *Optional for demo scenarios due to built-in Offline Demo Mode, recommended for live custom audits.*

### Step 1: Clone the Repository
```bash
git clone <your-github-repo-url>
cd GapLens
```

### Step 2: Configure Backend Environment Variables
Create a `.env` file inside the `backend/` directory by copying `.env.example`:
```bash
cd backend
cp .env.example .env
```
Update `backend/.env` with your Google Gemini API key and comma-separated model list:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash,gemini-2.0-flash,gemini-2.5-flash-lite

# Optional Supabase Persistence (Automatically uses In-Memory Store if left blank)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```
> **Note:** GapLens strictly loads all available models and its failover queue from `GEMINI_MODEL` in `backend/.env`.

### Step 3: Install & Start the Backend Server
```bash
cd backend
npm install
npm start
```
The backend server will start on `http://localhost:5000`.

### Step 4: Run the Automated Validation Test Suite (Optional)
Verify that all 8 test groups (19 unit & integration tests) pass:
```bash
cd backend
npm test
```

### Step 5: Install & Start the Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 8. Backend API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend status, Supabase connectivity, Gemini API key readiness, `defaultModel`, and `availableModels` strictly from `.env`. |
| `GET` | `/api/models` | Returns the array of Gemini models strictly configured in `backend/.env`. |
| `GET` | `/api/scenarios` | Returns the 3 pre-seeded multi-source Hackathon evaluation scenarios. |
| `POST` | `/api/extract-url` | Scrapes clean article text from a URL via Jina AI Reader / Cheerio with Bot Firewall detection and temporal metadata scanning. |
| `POST` | `/api/search-sources` | Searches permitted web sources (Jina Search, Wikipedia API, and curated regulatory references). |
| `POST` | `/api/scan-text` | Scans raw text for academic/fiscal cycles (e.g., `2023-24`), explicit dates, and classifies temporal status (`current`, `outdated`, `undated`). |
| `POST` | `/api/analyze` | Executes the deep cross-source gap & contradiction audit via Google Gemini API (with `.env` model failover and deterministic fallback). |
| `GET` | `/api/sessions` | Retrieves the 15 most recent saved research sessions from Supabase or In-Memory store. |
| `POST` | `/api/sessions` | Saves a research session and its audit result. |
| `PATCH` | `/api/sessions/:id/checklist` | Persists interactive verification checklist progress and user verification notes. |
| `DELETE` | `/api/sessions/:id` | Deletes a saved research session. |

---

## 9. Suggested Judge Demo Walkthrough (2 Minutes)

Following **Section 7 (Suggested Demo Flow)** of the official Hackathon Problem Statement:

1. **Load a Real-World Scenario (Step 1 & 2):**  
   On the main workspace, click **"Post-Matric Scholarship Verification"** in the *Pre-Configured Evaluation Scenarios* bar. This populates the research question (*"What should I verify before applying for the State Post-Matric Scholarship?"*) and loads 4 sources (Official Portal Notice, Third-Party Blog, 2023-24 Archived Circular, and an Undated Student FAQ).
2. **Trigger Cross-Source Audit:**  
   Click **"Analyze Sources for Gaps & Contradictions"**. Watch the 5-stage audit progress overlay as GapLens evaluates the corpus.
3. **Inspect the Decision Completeness Rubric & Dark Spots (Step 3):**  
   * View the **Readiness Score (`54/100`)** and the **6-Parameter Decision Completeness Rubric** (*1 Verified, 3 Conflicted, 2 Missing*).
   * In the **Potential Information Gaps** tab, note how GapLens flags the missing **Multi-Year Renewal & CGPA Policy** and the missing **2026-27 Closing Deadline**, labeled responsibly as *"Potential Gap — Not Found in Reviewed Sources"*.
4. **Open Side-by-Side Conflict Diff & Traceable Quotes:**  
   * Switch to the **Contradictions (`3`)** tab to see the **Rs. 2,50,000 vs. Rs. 8,00,000** family income clash and **Tehsildar Certificate vs. Rs. 100 Stamp Paper** conflict.
   * Click **"Compare Side-by-Side in Inspector"** to open the 2-column Diff Drawer with exact verbatim quotes highlighted inside the original source text.
5. **Review Outdated & Undated Warnings:**  
   * Switch to the **Temporal Warnings (`2`)** tab to see warnings for the superseded **October 2023 (2023-24 Cycle)** offline circular and the **Undated** hostel allowance snippet.
6. **Execute the Prioritized Verification Checklist & Official Inquiry (Step 4):**  
   * Navigate to **Step 4: Verification Checklist**. Check off items as verified, record official desk notes, and click **"Draft Official Inquiry"** to generate a formal clarification email or printable helpdesk brief addressed to the target authority.

---

## 10. Future Scope

* **Multimodal PDF, Scanned Gazette & OCR Ingestion:** Direct ingestion of scanned government GR PDFs and stamped circulars using Gemini's native multimodal vision capabilities.
* **Multilingual Cross-Source Auditing:** Cross-examining regional-language state circulars (Hindi, Marathi, Tamil, etc.) against English summary portals to catch translation-induced policy discrepancies.
* **Automated RTI / Grievance Portal Integration:** 1-click formatting of unresolved information gaps into standardized Right to Information (RTI) or CPGRAMS public grievance drafts.
* **Browser Extension Companion:** A lightweight Chrome extension that highlights undated claims and missing prerequisites in real time while browsing scholarship or licensing portals.

---

## License & Attribution

Built for the **Shinchan Online Hackathon 2026 (DEVENGERS)** — *Problem Statement: Digital Dark Spot*.
