# AADESH AI — PROJECT JOURNAL
# The ONE file every Claude (Chat, Cowork, or Code) must read FIRST
# Version: 1.0 | Created: April 11, 2026 | Author: Cowork (Claude)
# Rule: NEVER delete this file. Add new entries at the top. Keep growing it.

---

## ⚡ START HERE — 60 SECOND BRIEFING

**What is this project?**
Aadesh AI (ಆದೇಶ AI) — AI drafting tool for Karnataka government land-record officers.
Officer uploads their old orders + a new case PDF → AI generates a formal Kannada order draft.
Saves 2-4 hours per order. Priced at ₹24,000/year per office.

**Who are you talking to?**
- **Founder:** Srinivasa T (Srinivas) — non-technical, gives business direction
- **First User:** Banu — MALE, government caseworker, Bangalore South, first tester

**What tool are you?**
| You are... | Your role |
|------------|----------|
| **Claude.ai Chat / Cowork** | BRAIN — strategy, analysis, planning, writing tasks for Claude Code |
| **Claude Code (VS Code)** | HANDS — coding, file editing, testing, deploying |
| **Claude.ai (new Chat session)** | BRAIN — same as Cowork, read this file and continue from last session |

**Current status (April 11, 2026):**
- Live website: https://aadesh-ai.in ✅
- Quality score: 76/100 average (target: 95/100)
- Next: validate system prompt V3.2.2 on Machohalli 163.pdf
- Hard deadline: May 12, 2026 — Karnataka RAI Committee submission
- API balance: ~$38.85 remaining

---

## 1. THE THREE CLAUDE TOOLS — FULL EXPLANATION

```
┌─────────────────────────────────────────────────────────────────────┐
│                     THE AADESH AI TEAM                              │
│                                                                     │
│  ┌──────────────────┐    FILES     ┌──────────────────────────┐    │
│  │  Claude.ai Chat  │ ←──────────→ │  Claude Code (VS Code)   │    │
│  │  (Cowork/Brain)  │  TEAM_INBOX  │  (Hands/Builder)         │    │
│  │                  │   folder     │                           │    │
│  │  - Plans tasks   │              │  - Writes code            │    │
│  │  - Reads results │              │  - Runs tests             │    │
│  │  - Analyzes data │              │  - Fixes bugs             │    │
│  │  - Writes specs  │              │  - Deploys to VPS         │    │
│  └──────────────────┘              └──────────────────────────┘    │
│           ↕                                   ↕                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SHARED BANU FOLDER                        │   │
│  │   C:\Users\north\OneDrive\Attachments\Desktop\Banu\         │   │
│  │   (both tools read & write the SAME files on disk)          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│           ↕                                                         │
│  ┌──────────────────┐                                              │
│  │   Srinivas       │  (carries short messages between tools       │
│  │   (Founder)      │   when needed — but FILES are automatic)    │
│  └──────────────────┘                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### How tasks flow between tools:
1. Cowork writes a task file → `TEAM_INBOX/FROM_COWORK_{date}_{topic}.md`
2. Srinivas tells Claude Code: "Check TEAM_INBOX"
3. Claude Code reads the file, executes the task, writes results
4. Claude Code saves results → `TEAM_INBOX/FROM_CODE_{date}_{topic}.md`
5. Cowork reads results → plans next step

### What each Claude reads at session start:
| Tool | What to read |
|------|-------------|
| Claude Code | `CLAUDE.md` (auto-loaded), then `TEAM_LOG.md`, then `TEAM_INBOX/` |
| Cowork / Chat | `PROJECT_JOURNAL.md` (this file), then `TEAM_LOG.md`, then `TEAM_INBOX/` |

---

## 2. FOLDER MAP — COMPLETE (what every file does)

```
C:\Users\north\OneDrive\Attachments\Desktop\Banu\
│
├── 📋 CONTEXT FILES (read these first)
│   ├── PROJECT_JOURNAL.md     ← THIS FILE. Master journal for all Claude tools.
│   ├── MASTER_CONTEXT.md      ← Detailed project context (Claude Code-focused)
│   ├── CLAUDE.md              ← Claude Code's instruction file (role, rules, tools)
│   ├── CLAUDE_READ_FIRST.md   ← One-line pointer to MASTER_CONTEXT.md
│   ├── SESSION-HANDOFF.md     ← Quick state summary between sessions
│   ├── TEAM_LOG.md            ← Full log of every session (Claude Code writes this)
│   ├── STATUS-REALITY-CHECK.md ← Honest: what is real vs planned vs claimed
│   ├── MCP_BRIDGE_SETUP.md    ← How to set up MCPs and bridge on new laptop
│   └── .mcp.json              ← Claude Code project MCP config (TestSprite)
│
├── 📬 TEAM_INBOX/ (task communication between Cowork and Claude Code)
│   ├── FROM_COWORK_*.md       ← Tasks Cowork writes for Claude Code
│   ├── FROM_CODE_*.md         ← Results Claude Code writes for Cowork
│   └── ARCHIVE/               ← Completed task files moved here
│
├── 🚀 aadesh-ai/ (PRODUCTION WEB APP — the live product)
│   └── nextjs/
│       ├── src/
│       │   ├── app/           ← Next.js pages and API routes
│       │   ├── components/    ← UI components
│       │   └── lib/
│       │       └── sarvam.ts  ← AI order generation logic (Anthropic SDK)
│       ├── .env.local         ← ALL API KEYS (never commit, stays in OneDrive)
│       ├── package.json       ← Node dependencies
│       └── README.md
│
├── 🔧 kiro/ (COMPLETE PIPELINE — built by Amazon Kiro AI tool)
│   └── aadesh-ai/nextjs/
│       └── src/lib/pipeline/  ← 12 production-ready pipeline files:
│           ├── piiRedactor.ts     ← masks citizen names before sending to API
│           ├── buildPrompt.ts     ← assembles prompt with prompt caching
│           ├── auditOrder.ts      ← 4-guardrail quality check
│           ├── rateLimiter.ts     ← 5 orders/day per user
│           ├── withRetry.ts       ← auto-retry on rate limits
│           ├── sarvamGenerate.ts  ← Sarvam AI fallback
│           ├── pipelineReducer.ts ← state machine
│           └── [6 more files]
│       └── src/components/pipeline/ ← 6 UI components (FileUpload → Download)
│
├── 🧪 KarnatakaAI/ (LOCAL TEST TOOLS + ALL KANNADA DATA)
│   ├── 11_DDLR_App/           ← Local Streamlit test app
│   │   ├── app.py             ← 550+ line Streamlit app (13 AI models)
│   │   ├── phase0_test_v2.py  ← Quality scoring script (use this for tests)
│   │   ├── system_prompt.md   ← Active system prompt (V3.2.1 currently)
│   │   ├── DDLR_SYSTEM_PROMPT_V3_2_2.md ← Next version (not yet active)
│   │   ├── generated_orders/  ← All generated DOCX and TXT orders
│   │   ├── RESULTS_*.json     ← Scoring results from phase0_test_v2.py
│   │   ├── logs/              ← App logs
│   │   └── .env               ← API keys for local test app
│   │
│   ├── SAMPLE_CASE_INPUT/     ← 6 Banu test PDFs
│   │   ├── 1.pdf              ← Suo motu case | Score: 69/100
│   │   ├── 2.pdf              ← Appeal | Score: 74/100
│   │   ├── ABBIGERE 12.pdf    ← Appeal | Score: 76/100
│   │   ├── Dommasandra 42.2.3.pdf ← Appeal | Score: 74/100
│   │   ├── Hesaraghatta 129.pdf   ← Appeal | Score: 85/100 (REFERENCE CASE)
│   │   └── Machohalli 163.pdf ← Appeal | Score: 80/100
│   │
│   ├── 01_Source_Data/        ← Knowledge base, tippani docs, survey data
│   ├── 02_System_Prompts/     ← Old system prompts V3.0, V3.1
│   ├── 03_Test_Results/       ← Detailed test result JSON files
│   ├── 04_AI_Generated_Drafts/← Past AI-generated order drafts
│   ├── 05_Guides_and_Plans/   ← Process guides
│   ├── 06_Tools_and_Scripts/  ← Helper scripts
│   ├── 07_Reports_and_Analysis/ ← Quality analysis reports
│   ├── 08_Approved_Outputs/   ← Banu-approved final orders
│   └── 10_Cloud_Project_Bengaluru_South/ ← 50 reference orders + Drafting Bible
│
├── 📊 DDLR Strategy & Planning/ (STRATEGY DOCUMENTS)
│   ├── AADESH_AI_BLUEPRINT_v9_2_2.md  ← CURRENT LOCKED BLUEPRINT (read this)
│   ├── AADESH_AI_BLUEPRINT_v9_2_FINAL.md ← Final v9.2 version
│   ├── [older versions v8.0 → v9.2]   ← Archive, do not edit
│   ├── EMERGENT_BUILD_LOG.md          ← Real-time build decisions log
│   ├── PRODUCT_STORY_v1.md            ← One-page product story
│   └── cost_log.json                  ← API cost tracking
│
├── 🔬 DEEP_RESEARCH/ (RESEARCH FINDINGS)
│   ├── BANU_FOLDER_AUDIT_2026-04-04.md ← Previous complete audit
│   ├── BANU_FILE_VERDICTS.md           ← File-by-file keep/delete decisions
│   ├── DOUBT_1_GOVT_PROCUREMENT/       ← Research: can govt buy AI SaaS?
│   ├── DOUBT_2_COMPETITION_OPENSOURCE/ ← Research: competitor analysis
│   ├── DOUBT_3_PROMPT_CACHING/         ← Research: caching architecture
│   └── [3 synthesis reports]
│
├── 📝 SESSION_LOG/ (DETAILED SESSION NOTES)
│   ├── 2026-04-04_session.md
│   ├── 2026-04-05_session.md
│   ├── 2026-04-09_session.md
│   └── DEEP_CONTENT_AUDIT_REPORT.md
│
├── 🗄️ _BACKUP_RAW_BANU_ORIGINALS/ (576 ORIGINAL KANNADA ORDER FILES)
│   └── [576 .docx files] ← DO NOT MODIFY. Banu's original finalized orders.
│
├── 🗃️ _archive/ (ARCHIVED/OLD FILES)
│   ├── team_bridge_docs/      ← Old bridge setup docs (superseded by this file)
│   ├── _bridge_tools/         ← Old automation scripts
│   ├── old_app_files/         ← Old versions of app.py
│   ├── old_system_prompts/    ← Old system prompt versions
│   ├── old_test_results/      ← Old test result files
│   ├── vps_scripts/           ← VPS deployment scripts (archived)
│   ├── logs/                  ← Old log files
│   └── [other archive folders]
│
├── 🔧 autocad-mcp/ (SEPARATE PROJECT — AutoCAD Survey Digitization)
│   └── [Python MCP for converting hand-drawn survey sketches to AutoCAD DXF]
│
├── 📦 everything-claude-code/ (CLAUDE CODE REFERENCE REPO)
│   └── [Downloaded Claude Code documentation and examples repo]
│
├── ⚙️ HELPER SCRIPTS (run on Windows)
│   ├── ⚡-MASTER-CONTROL-PANEL.bat    ← All-in-one launcher
│   ├── 💻-Launch-Code.bat             ← Start Claude Code
│   ├── 🔧-Launch-CoWork.bat           ← Start Cowork
│   ├── 📊-Check-Status.bat            ← Check app status
│   ├── 📊-DASHBOARD.html              ← Project dashboard (open in browser)
│   └── 🧪-TEST-REMAINING.bat          ← Run remaining PDF tests
│
└── .claude/ (CLAUDE CODE CONFIG)
    ├── settings.local.json    ← Permission settings for Claude Code
    └── launch.json            ← App launch configurations
```

---

## 3. TECHNOLOGY STACK

### Production App (aadesh-ai/nextjs)
| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Next.js 15 + React | TypeScript, Tailwind CSS |
| Database | Supabase (PostgreSQL) | Mumbai region, 5 tables with RLS |
| Auth | Supabase Auth | Google OAuth only |
| AI - Default | Sarvam 105B | FREE, score 90/100, Indian language |
| AI - Premium | Claude Sonnet 4.6 | ₹12/order, score 96/100, contested cases |
| AI - Champion | Claude Opus 4.6 | ₹40/order, score 98/100, not in production |
| Deployment | DigitalOcean VPS | Bangalore region, PM2 + Nginx + SSL |
| Domain | aadesh-ai.in | Cloudflare DNS |
| Documents | python-docx + NotoSansKannada | DOCX output |
| Billing | Razorpay | 4 credit packs (not yet tested with real payments) |

### Local Test Environment (KarnatakaAI/11_DDLR_App)
| Layer | Technology |
|-------|-----------|
| Framework | Streamlit |
| Testing | phase0_test_v2.py (custom scoring script) |
| AI | Direct Anthropic SDK (Claude Sonnet 4.6) |
| Output | .docx + .txt files |

### VPS Details
| Item | Value |
|------|-------|
| Provider | DigitalOcean |
| IP | 165.232.176.181 |
| Region | Bangalore |
| OS | Ubuntu 24.04 |
| RAM | 1GB + 2GB swap |
| Process manager | PM2 |
| Web server | Nginx with SSL |
| App port | 3000 (Next.js) |

---

## 4. AI QUALITY BENCHMARKS (Locked)

| Model | Score | Cost/Order | Status |
|-------|-------|-----------|--------|
| Claude Opus 4.6 (Projects) | 98/100 | ₹40 | Champion, too expensive |
| Claude Sonnet 4.6 | 96/100 | ₹12 | Premium, contested appeals |
| Gemini 2.5 Pro | 91/100 | ₹8 | Backup option |
| Sarvam 105B | 90/100 | FREE | Default production |

**Current Phase 0 Test Results:**
| PDF | Case Type | Score | Status |
|-----|----------|-------|--------|
| Hesaraghatta 129 | Appeal | 85/100 | Best so far (reference case) |
| Machohalli 163 | Appeal | 80/100 | Good |
| ABBIGERE 12 | Appeal | 76/100 | Needs work |
| 2.pdf | Appeal | 74/100 | Needs work |
| Dommasandra 42.2.3 | Appeal | 74/100 | Needs work |
| 1.pdf | Suo motu | 69/100 | Needs work (wrong statute cited) |
| **Average** | - | **76/100** | **Target: 95/100** |

**System Prompt Versions:**
| Version | Location | Status |
|---------|----------|--------|
| V3.2.1 | `KarnatakaAI/11_DDLR_App/system_prompt.md` | Active in local tests |
| V3.2.2 | `KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_2.md` | Next — not yet validated |
| V3.1 | `KarnatakaAI/02_System_Prompts/DDLR_SYSTEM_PROMPT_V3.1.md` | Archived |

---

## 5. MCP INTEGRATIONS — WHAT IS CONNECTED TO WHAT

### Claude.ai Chat / Cowork — Connected MCPs:
These are set up in claude.ai → Settings → Integrations:

| MCP Name | What it does | Auth type |
|----------|-------------|----------|
| **ddlr-filesystem** | Read & write files in Banu folder | Points to Banu folder path |
| **Notion** | Update project hub, decisions DB, tasks DB | Notion OAuth |
| **Gmail** | Read/send emails | Google OAuth |
| **Google Calendar** | Schedule management | Google OAuth |
| **Craft** | Document creation | Craft OAuth |
| **Canva** | Design creation | Canva OAuth |
| **Base44** | Admin dashboards | Base44 OAuth |
| **Firecrawl** | Web scraping and research | API key |
| **Supabase** | Direct DB access | Supabase OAuth |
| **Playwright** | Browser automation | Built-in |
| **PDF Tools** | PDF reading and filling | Built-in |
| **NPI Lookup** | Healthcare provider lookup | Built-in |
| **PubMed / bioRxiv** | Research papers | Built-in |
| **TestSprite** | UI testing | API key |

### Claude Code (VS Code) — Connected MCPs:
Claude Code reads `.mcp.json` in the Banu folder root for project-specific MCPs.

**Current `.mcp.json` content:**
```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "⚠️ ROTATE THIS KEY — regenerate from TestSprite dashboard"
      }
    }
  }
}
```

Claude Code also has built-in access to: bash, file system, web browser.

### Notion IDs (for updating project hub):
| What | ID |
|------|----|
| Main project page | `324290d32bc680649230c47760b400e5` |
| Decisions database | `05bc222d-bbd4-452d-92bc-7313bdc3ebc1` |
| Tasks database | `95720a69-bd99-4a45-a10b-cf4fe18f2de8` |
| Live Status Log | `32f290d32bc6819e9653e1e760587186` |

---

## 6. KEY DECISIONS LOG (most important only)

| Date | Decision | Why |
|------|----------|-----|
| April 10 | Switched from OpenRouter → Direct Anthropic SDK | More control, same cost |
| April 10 | Prompt caching architecture locked | Cache system prompt + reference orders |
| April 9 | Kiro pipeline discovered — USE IT | 12 pipeline files fully built, tested |
| April 5 | Blueprint v9.2.2 locked | No more strategy, only execution |
| April 4 | Quality target: 95/100 | Below this = unusable for Banu |
| April 2 | Sarvam 105B as default | FREE + 90/100 score = best economics |
| March 29 | VPS deployed | DigitalOcean Bangalore, live |
| March 28 | Domain aadesh-ai.in live | Cloudflare SSL |
| March 28 | Supabase Mumbai selected | India data residency |

---

## 7. PRICING MODEL

| Pack | Price | Orders | Cost/Order | Profit? |
|------|-------|--------|-----------|---------|
| Pack A | ₹499 | 30 | ₹16.6 | ❌ Losing money |
| Pack B | ₹999 | 75 | ₹13.3 | ❌ Losing money |
| Pack C | ₹1,999 | 200 | ₹10 | ❌ Losing money |
| Pack D | ₹4,999 | 600 | ₹8.3 | ✅ Only profitable pack |

**Fix needed:** Smart routing — simple cases → Sarvam (FREE), complex → Sonnet (₹12)

---

## 8. WHAT IS REAL vs PLANNED (as of April 11, 2026)

### ✅ REAL (working right now):
- Live website at aadesh-ai.in
- Google OAuth login (Banu can log in)
- Supabase database with 5 tables + RLS
- Razorpay billing integration (4 packs in code — not tested with real money)
- DOCX download with NotoSansKannada font
- Local test app (Streamlit, localhost:8501)
- VPS deployed with PM2 + Nginx + SSL
- 576 original Banu orders (training data)
- 50 reference orders in Cloud Project
- 6 Banu test PDFs with scores

### 🟡 PARTIAL (started but incomplete):
- Quality testing: 5/6 PDFs tested, average 76/100 (target 95)
- Kiro pipeline: built by Kiro, NOT yet merged into live aadesh-ai app
- System prompt V3.2.2: written, NOT yet validated

### 🔴 NOT STARTED (Phase 0 backlog):
1. PII redaction layer (DPDP critical — citizen names must not leave India)
2. PDF upload via Supabase Edge Function (VPS OOM protection)
3. Clarifying questions UI (proven +6 to +16 quality points)
4. Sentry error monitoring
5. UptimeRobot health check
6. Supabase custom domain db.aadesh-ai.in
7. Anthropic DPA signature
8. Privacy policy + consent screen

---

## 9. IMMEDIATE NEXT ACTIONS (what to do right now)

**Priority 1 — Quality validation:**
```bash
# Run in Claude Code:
cd KarnatakaAI/11_DDLR_App
python phase0_test_v2.py
# Test Machohalli 163.pdf with DDLR_SYSTEM_PROMPT_V3_2_2.md
# Target: 88-92/100
```

**Priority 2 — Merge Kiro pipeline into live app:**
- Copy `kiro/aadesh-ai/nextjs/src/lib/pipeline/` → `aadesh-ai/nextjs/src/lib/pipeline/`
- Copy `kiro/aadesh-ai/nextjs/src/components/pipeline/` → `aadesh-ai/nextjs/src/components/`
- Wire into existing app

**Priority 3 — PII redaction:**
- The `kiro/aadesh-ai/nextjs/src/lib/pipeline/piiRedactor.ts` is already built
- Just needs to be wired into the live app

**Hard deadline: May 12, 2026** — Karnataka RAI Committee submission
(31 days from April 11)

---

## 10. SESSION HISTORY (newest first)

### April 11, 2026
- **What:** Phase 0 quality testing — ran all 6 Banu PDFs through scoring script
- **Result:** Average 76/100. System prompt V3.2.2 written with 6 fixes.
- **Files created:** `phase0_test_v2.py`, `DDLR_SYSTEM_PROMPT_V3_2_2.md`, 4 RESULTS JSON files
- **Next:** Validate V3.2.2 on Machohalli 163.pdf

### April 9, 2026
- **What:** Deep content audit, Kiro pipeline discovery, blueprint lock
- **Result:** Found complete pipeline in kiro/ folder. Blueprint v9.2.2 locked.
- **Key insight:** Kiro built everything we planned — skip rebuild, just merge

### April 5, 2026
- **What:** VPS debugging, deployment, domain and SSL setup
- **Result:** aadesh-ai.in live with SSL

### April 4, 2026
- **What:** Complete folder audit, archive cleanup, Streamlit app fixes
- **Result:** Folder organized, old files archived

### April 2, 2026
- **What:** Architecture audit, Sarvam integration
- **Result:** Sarvam 105B selected as default (FREE, 90/100)

### March 28-30, 2026
- **What:** Initial setup — domain, VPS, Supabase, Google OAuth, Razorpay
- **Result:** All infrastructure live

---

## 11. HOW TO PICK UP WORK IN A NEW SESSION

**If you are Cowork / Claude Chat:**
1. Read this file (done ✅)
2. Read `TEAM_LOG.md` (last 20 lines = what happened recently)
3. Check `TEAM_INBOX/` for any `FROM_CODE_*.md` files
4. Check `SESSION-HANDOFF.md` for quick state
5. Plan next task, write to `TEAM_INBOX/FROM_COWORK_{date}_{topic}.md`

**If you are Claude Code:**
1. `CLAUDE.md` loads automatically
2. Read `TEAM_LOG.md`
3. Check `TEAM_INBOX/` for `FROM_COWORK_*.md` files
4. Execute the task
5. Write results to `TEAM_INBOX/FROM_CODE_{date}_{topic}.md`
6. Update `TEAM_LOG.md` with what you did

---

## 12. IMPORTANT RULES — ALL CLAUDE TOOLS MUST FOLLOW

1. **Never modify** `_BACKUP_RAW_BANU_ORIGINALS/` — these are sacred originals
2. **Always use UTF-8** encoding for all files — Kannada breaks without it
3. **Never hardcode API keys** — always use environment variables
4. **max_tokens for Kannada = 12000 minimum** — Kannada tokenizes at 14 tokens/word
5. **Quality gate before showing Banu:** structure ✓, word count 550-750 ✓, no English transliterations ✓
6. **Sarvam = default model, Sonnet = contested appeals only** (cost control)
7. **Update TEAM_LOG.md** after every session with what you did
8. **Update Notion Status Log** `32f290d32bc6819e9653e1e760587186` after major steps

---

*This journal was created by Cowork (Claude.ai) on April 11, 2026.*
*Update this file at the START of each major session by adding to Section 10.*
*Do not delete any section — only add and update.*
