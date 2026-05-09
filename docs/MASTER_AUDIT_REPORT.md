# BANU FOLDER — MASTER AUDIT REPORT
**Created:** April 11, 2026 | **By:** Claude Cowork (full folder read)
**Purpose:** Any new Claude (Chat, Cowork, or Code) reads THIS file first and instantly knows everything.
**Rule:** Update the "Last Updated" line and add a session entry at the bottom whenever major work is done.
**Last Updated:** April 11, 2026

---

## ⚡ 60-SECOND BRIEFING (read this, skip nothing)

| Item | Value |
|------|-------|
| **Product** | Aadesh AI (ಆದೇಶ AI) — AI drafting tool for Karnataka land-record officers |
| **Live URL** | https://aadesh-ai.in ✅ |
| **Founder** | Srinivasa T — non-technical, Bengaluru |
| **First user** | Banu — MALE, government caseworker, Bangalore South |
| **Quality now** | 76/100 average across 6 Banu test PDFs |
| **Quality target** | 95/100 |
| **Hard deadline** | May 12, 2026 — Karnataka RAI Committee submission |
| **Revenue** | Rs 0 (no paying users yet) |
| **API balance** | ~$38.85 (April 11, 2026) |
| **Biggest win** | Kiro pipeline folder has complete pipeline already built — 2-3 weeks saved |
| **Biggest risk** | PII of citizens flowing to US servers unredacted. Must fix before scale. |

---

## 1. THE THREE CLAUDE TOOLS — HOW THEY WORK TOGETHER

```
┌──────────────────────────────────────────────────────────────────┐
│                    THREE-TOOL TEAM                                │
│                                                                  │
│  Claude.ai Chat       TEAM_INBOX/        Claude Code (VS Code)  │
│  (Cowork = BRAIN) ←── folder on ──→ (HANDS = builds/tests)      │
│                        OneDrive                                  │
│                                                                  │
│  Reads:               FROM_COWORK_*      Reads: CLAUDE.md        │
│  PROJECT_JOURNAL.md   ←─ tasks ─→       MASTER_CONTEXT.md       │
│  MASTER_CONTEXT.md    FROM_CODE_*        TEAM_LOG.md             │
│  TEAM_LOG.md          ←─ results ─→     TEAM_INBOX/             │
└──────────────────────────────────────────────────────────────────┘
```

**How tasks flow:**
1. Cowork writes → `TEAM_INBOX/FROM_COWORK_{date}_{topic}.md`
2. Srinivas tells Claude Code: "Check TEAM_INBOX"
3. Claude Code runs the task → saves results to `TEAM_INBOX/FROM_CODE_{date}_{topic}.md`
4. Cowork reads results → plans next step

**What each tool reads at start of session:**
| Tool | Read first |
|------|-----------|
| Cowork / Claude Chat | `MASTER_AUDIT_REPORT.md` → `MASTER_CONTEXT.md` → `TEAM_LOG.md` → `TEAM_INBOX/` |
| Claude Code | `CLAUDE.md` (auto) → `TEAM_LOG.md` → `TEAM_INBOX/` → `SESSION-HANDOFF.md` |

---

## 2. COMPLETE FOLDER MAP — EVERY FILE, EVERY FOLDER

```
C:\Users\north\OneDrive\Attachments\Desktop\Banu\         ← ROOT (118 KB context files)
│
├── 📋 CONTEXT FILES — read at session start
│   ├── MASTER_AUDIT_REPORT.md     ← THIS FILE. Most complete. Read first.
│   ├── PROJECT_JOURNAL.md         ← Also comprehensive. Good alternate entry point.
│   ├── MASTER_CONTEXT.md          ← Claude Code's briefing file (12 KB)
│   ├── CLAUDE.md                  ← Claude Code's full instruction manual (17 KB)
│   ├── CLAUDE_READ_FIRST.md       ← One-liner: "read MASTER_CONTEXT.md"
│   ├── SESSION-HANDOFF.md         ← Current state snapshot (1 KB, updated each session)
│   ├── TEAM_LOG.md                ← Full session log (Claude Code writes this)
│   ├── STATUS-REALITY-CHECK.md    ← Honest: what's real vs planned (6 KB)
│   ├── MCP_BRIDGE_SETUP.md        ← How to reconnect MCPs on any laptop (7 KB)
│   ├── SETUP_NEW_LAPTOP.md        ← Full setup guide for new laptop (11 KB)
│   ├── FOLDER_AUDIT_2026-04-11.md ← Detailed project audit from April 11
│   └── FOLDER_AUDIT_2026-04-05.md ← Earlier audit (reference only)
│
├── 📬 TEAM_INBOX/                 ← BRIDGE FOLDER (Cowork ↔ Claude Code)
│   ├── FROM_COWORK_2026-04-11_kiro_audit_task.md      ← task for Claude Code
│   ├── FROM_COWORK_2026-04-11_v322_validation_task.md ← task: test V3.2.2 prompt
│   ├── FROM_CODE_20260411_1045_test_results.md        ← result: 1 PDF test
│   ├── FROM_CODE_20260411_1050_test_results.md        ← result
│   ├── FROM_CODE_20260411_1054_test_results.md        ← result: 69/100 (1.pdf)
│   ├── FROM_CODE_20260411_1124_remaining_4_results.md ← result: 4 PDFs, avg 76/100
│   └── ARCHIVE/                   ← completed task files moved here
│
├── 🚀 aadesh-ai/                  ← PRODUCTION WEB APP
│   └── nextjs/
│       ├── src/
│       │   ├── app/               ← Next.js 15 pages and API routes
│       │   │   └── api/generate-order/ ← main AI generation route
│       │   ├── components/        ← UI components (NO pipeline components yet)
│       │   └── lib/
│       │       ├── sarvam.ts      ← AI generation (Anthropic SDK + Sarvam fallback)
│       │       ├── guardrails.ts  ← Quality guardrails
│       │       ├── smart-context.ts ← Smart context selection
│       │       ├── system-prompt.ts ← System prompt loader
│       │       ├── pricing.ts     ← Pack pricing logic
│       │       ├── rateLimit.ts   ← Rate limiting
│       │       ├── types.ts       ← TypeScript types
│       │       └── supabase/      ← Supabase client
│       ├── .env.local             ← ALL API KEYS (never commit, in OneDrive)
│       ├── package.json
│       └── middleware.ts
│
├── 🔧 kiro/                       ← ⭐ CRITICAL: COMPLETE PIPELINE (not yet merged)
│   ├── .kiro/specs/generation-pipeline/
│   │   ├── requirements.md        ← 22 requirements with acceptance criteria
│   │   ├── tasks.md               ← 33 tasks, all marked done
│   │   └── design.md              ← Architecture design
│   └── aadesh-ai/
│       ├── KARNATAKA_RAI_SUBMISSION_DRAFT.md  ← READY TO SEND (before May 12)
│       ├── ANTHROPIC_DPA_EMAIL_DRAFT.md       ← SEND NOW to privacy@anthropic.com
│       ├── PHASE0_GAPS.md         ← Known gaps before Banu can test
│       ├── SECURITY_AUDIT.md      ← Security findings (read before deploy)
│       ├── PHASE0_QUALITY_REPORT.md
│       ├── QA_RETEST_sarvam105b_March29.md
│       └── nextjs/src/
│           ├── lib/pipeline/      ← 12 production pipeline files (USE THESE)
│           │   ├── piiRedactor.ts     ← masks citizen names before API (DPDP critical)
│           │   ├── buildPrompt.ts     ← assembles prompt with cache_control
│           │   ├── auditOrder.ts      ← 4-guardrail quality check
│           │   ├── rateLimiter.ts     ← 5 orders/day per user
│           │   ├── withRetry.ts       ← auto-retry on rate limits
│           │   ├── logCacheMetrics.ts ← cache hit/miss monitoring
│           │   ├── pipelineReducer.ts ← state machine
│           │   ├── validateAnswers.ts ← input validation
│           │   ├── sarvamGenerate.ts  ← Sarvam fallback
│           │   ├── types.ts           ← TypeScript types
│           │   ├── errorLogger.ts     ← self-hosted error logging
│           │   └── getAuthToken.ts    ← auth token helper
│           ├── app/api/pipeline/  ← 6 API routes
│           │   ├── validate/      ← file type + page count check
│           │   ├── vision-read/   ← Claude Vision reads PDF
│           │   ├── generate/      ← SSE streaming order generation
│           │   ├── export-docx/   ← DOCX download with Kannada font + footer
│           │   ├── migrate/       ← DB schema migration
│           │   └── health/        ← UptimeRobot endpoint
│           └── components/pipeline/ ← 6 UI components
│               ├── FileUploadStep.tsx    ← PDF upload
│               ├── VisionReadingStep.tsx ← progress indicator
│               ├── QuestionsStep.tsx     ← clarifying questions
│               ├── GeneratingStep.tsx    ← live streaming display
│               ├── PreviewEditorStep.tsx ← edit + Entity Lock checkbox
│               └── DownloadStep.tsx      ← DOCX download
│
├── 🧪 KarnatakaAI/               ← ALL KANNADA DATA + LOCAL TEST TOOLS
│   ├── 00_MASTER_INDEX.md        ← index of all files here
│   ├── 00_FILE_INVENTORY_2026-03-17.md
│   ├── SAMPLE_CASE_INPUT/        ← 6 Banu test PDFs (score benchmarks)
│   │   ├── 1.pdf                 ← Suo motu | 69/100 | statute error (fixed in V3.2.2)
│   │   ├── 2.pdf                 ← Appeal   | 74/100
│   │   ├── ABBIGERE 12.pdf       ← Appeal   | 76/100
│   │   ├── Dommasandra 42.2.3.pdf← Appeal   | 74/100
│   │   ├── Hesaraghatta 129.pdf  ← Appeal   | 85/100 ← BEST REFERENCE CASE
│   │   └── Machohalli 163.pdf    ← Appeal   | 80/100
│   ├── 11_DDLR_App/              ← LOCAL TEST ENVIRONMENT (active)
│   │   ├── app.py                ← Streamlit app (13 AI models, 550+ lines)
│   │   ├── phase0_test_v2.py     ← QUALITY SCORING SCRIPT (use this for tests)
│   │   ├── system_prompt.md      ← V3.2.1 (old, kept for reference)
│   │   ├── DDLR_SYSTEM_PROMPT_V3_2_1.md ← V3.2.1 (383 lines, 17 rules)
│   │   ├── DDLR_SYSTEM_PROMPT_V3_2_2.md ← V3.2.2 (ACTIVE — 6 patches, not yet validated)
│   │   ├── GOLDEN_TEMPLATE_1.md  ← Golden template reference
│   │   ├── *_ORDER.txt           ← Generated orders from tests
│   │   ├── RESULTS_*.json        ← Scoring results (4 files from April 11)
│   │   ├── generated_orders/     ← Generated DOCX files
│   │   ├── .env                  ← API keys for local tests
│   │   ├── requirements.txt      ← Python dependencies
│   │   ├── smoke_test.py         ← Smoke test script
│   │   └── test_app.py           ← Structure test script
│   ├── 01_Source_Data/           ← Knowledge base + tippani docs
│   │   ├── DDLR_Original/        ← 516+ raw Banu originals (READ ONLY)
│   │   ├── DDLR_Unicode/         ← Unicode versions
│   │   ├── ADLR/                 ← ADLR reference docs
│   │   └── KARNATAKA_SURVEY_KNOWLEDGE_BASE.md
│   ├── 02_System_Prompts/        ← OLD prompts archive
│   │   ├── DDLR_SYSTEM_PROMPT_V3.md
│   │   ├── DDLR_SYSTEM_PROMPT_V3.1.md
│   │   └── PROMPT_CHANGELOG.md
│   ├── 03_Test_Results/          ← Test result files (archive)
│   ├── 04_AI_Generated_Drafts/   ← Old AI outputs
│   ├── 05_Guides_and_Plans/      ← Process guides
│   ├── 06_Tools_and_Scripts/     ← Helper scripts
│   ├── 07_Reports_and_Analysis/  ← Quality reports
│   ├── 08_Approved_Outputs/      ← Banu-approved orders
│   ├── 10_Cloud_Project_Bengaluru_South/
│   │   ├── 00_CLOUD_PROJECT_INDEX.md
│   │   ├── A_Reference_Orders_50/ ← 50 reference orders (37 curated for AI use)
│   │   │   └── Appeals_40/        ← THESE ARE LOADED INTO AI CONTEXT
│   │   ├── B_Drafting_Bible_6/    ← 6 Drafting Bible files
│   │   └── C_AI_Generated_Drafts/
│   └── tippani_prototype/        ← AutoCAD DXF files (separate project)
│
├── 📊 DDLR Strategy & Planning/  ← ALL STRATEGY DOCS
│   ├── AADESH_AI_BLUEPRINT_v9_2_2.md  ← ✅ ACTIVE BLUEPRINT (read for decisions)
│   ├── AADESH_AI_BLUEPRINT_v9_2_FINAL.md  ← same as above
│   ├── AADESH_AI_BLUEPRINT_v9_2.md    ← previous version
│   ├── AADESH_AI_BLUEPRINT_v9_1.md    ← older
│   ├── AADESH_AI_BLUEPRINT_v9_0.md    ← older
│   ├── AADESH_AI_BLUEPRINT_v9.*.md    ← archived versions
│   ├── AADESH_AI_BLUEPRINT_v8.*.md    ← archived versions
│   ├── EMERGENT_BUILD_LOG.md          ← Emergent.sh prototype build log
│   ├── PRODUCT_STORY_v1.md            ← one-page product story
│   ├── PROJECT_VISION_THEME.md        ← design vision
│   ├── Architecture_Audit_v74_vs_v75_2026-04-02.md
│   ├── BLUEPRINT_v6.6_RED_TEAM_AUDIT.html
│   └── cost_log.json                  ← API cost tracking JSON
│
├── 🔬 DEEP_RESEARCH/             ← COMPLETED RESEARCH (archive quality)
│   ├── README.md
│   ├── BANU_FOLDER_AUDIT_2026-04-04.md ← Previous full audit
│   ├── BANU_FILE_VERDICTS.md           ← File-by-file keep/delete decisions
│   ├── DDLR_5Model_Consensus_Dashboard_SoloVsDevTeam.md
│   ├── DOUBT_1_SYNTHESIS_REPORT.md     ← Govt procurement: price <Rs5L, B2C strategy
│   ├── DOUBT_2_SYNTHESIS_REPORT.md     ← Competition: ZERO direct competitors exist
│   ├── DOUBT_3_SYNTHESIS_REPORT.md     ← Prompt caching: confirmed working, gotchas listed
│   ├── DOUBT_1_GOVT_PROCUREMENT/       ← Raw research files
│   ├── DOUBT_2_COMPETITION_OPENSOURCE/ ← Raw research files
│   └── DOUBT_3_PROMPT_CACHING/         ← Raw research files
│
├── 📝 SESSION_LOG/               ← SESSION HISTORY
│   ├── 2026-04-04_session.md     ← Folder audit, archive cleanup
│   ├── 2026-04-05_session.md     ← VPS deploy, SSL setup
│   ├── 2026-04-09_session.md     ← Blueprint v9.2 lock, Hesaraghatta 85/100 test
│   ├── DEEP_CONTENT_AUDIT_REPORT.md
│   ├── CONTENT_AUDIT_DEEP.md
│   └── TASK_deep_content_audit.md
│
├── 🗄️ _BACKUP_RAW_BANU_ORIGINALS/ ← 576 ORIGINAL BANU ORDERS — NEVER TOUCH
│   └── [576 .docx files]          ← Sacred originals. Read-only forever.
│
├── 🗃️ _archive/                  ← ALL OLD FILES (don't work here)
│   ├── old_app_files/            ← Old versions of app.py
│   ├── old_system_prompts/       ← Old system prompt versions
│   ├── old_test_results/         ← Old test result files
│   ├── old_generated_orders/     ← Old generated orders
│   ├── old_strategy/             ← Old strategy docs
│   ├── old_guides/               ← Old guides
│   ├── old_reports/              ← Old reports
│   ├── old_logs/                 ← Old log files
│   ├── logs/                     ← Log archive
│   ├── vps_scripts/              ← Archived VPS deploy scripts
│   ├── one_time_scripts/         ← One-time use scripts
│   ├── session_logs/             ← Older session logs
│   ├── shared-context/           ← Old context files
│   ├── tasks/                    ← Old task files
│   ├── completions/              ← Task completion reports
│   ├── duplicates/               ← Duplicate files removed from root
│   ├── rollback/                 ← Rollback versions
│   ├── qa_screenshots/           ← QA screenshots
│   ├── tools_installed/          ← Record of installed tools
│   ├── team_bridge_docs/         ← Old bridge documentation (superseded)
│   ├── _bridge_tools/            ← Old bridge automation scripts
│   ├── TEAM_INBOX/               ← Old team inbox files
│   ├── PAPERCLIP/                ← Paperclip agent system (experimental)
│   └── antigravity/              ← Misc experimental files
│
├── 🔧 autocad-mcp/               ← SEPARATE PROJECT (AutoCAD survey digitization)
│   └── [Python MCP for hand-drawn survey sketch → AutoCAD DXF]
│
├── 📚 everything-claude-code/    ← CLAUDE CODE REFERENCE REPO (not project files)
│   └── [Downloaded Claude Code docs and examples — reference only]
│
├── ⚙️ HELPER SCRIPTS (double-click to run on Windows)
│   ├── ⚡-MASTER-CONTROL-PANEL.bat   ← All launcher options in one menu (7.66 KB)
│   ├── 💻-Launch-Code.bat             ← Start Claude Code in VS Code
│   ├── 🔧-Launch-CoWork.bat           ← Start Claude Cowork session
│   ├── 📊-Check-Status.bat            ← Check app/VPS status
│   ├── 📊-DASHBOARD.html              ← Project dashboard (open in browser)
│   └── 🧪-TEST-REMAINING.bat          ← Run remaining PDF quality tests
│
└── ⚙️ CONFIG FILES
    ├── .mcp.json                  ← Claude Code project MCP (TestSprite — key needs rotation)
    ├── .claude/settings.local.json ← Claude Code permissions
    └── .claude/launch.json        ← App launch configurations (Streamlit + Next.js)
```

---

## 3. TECHNOLOGY STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 15 + React + TypeScript + Tailwind | Live at aadesh-ai.in |
| Database | Supabase PostgreSQL Mumbai | 5 tables + RLS. URL: uyxkjhzaqmzoqvjodhcb.supabase.co |
| Auth | Supabase + Google OAuth | Banu uses banu.test@aadesh-ai.in |
| AI Primary | Claude Sonnet 4.6 — direct Anthropic SDK | score 96/100, Rs 12/order |
| AI Fallback | Sarvam | score 90/100 but 7K context limit prevents use with full prompt |
| Deployment | DigitalOcean Bangalore VPS | IP 165.232.176.181, PM2 + Nginx + SSL |
| Domain | aadesh-ai.in | Cloudflare DNS |
| Documents | python-docx + NotoSansKannada | DOCX output with proper font |
| Billing | Razorpay | 4 packs in code, not tested with real money |
| GitHub | srinivasenvcivilsurvey-sudo/aadesh-ai | |
| Local test | Streamlit (app.py) | localhost:8501 |
| Test web app | Next.js dev (npm run dev) | localhost:3000 |

### VPS Details
| Item | Value |
|------|-------|
| Provider | DigitalOcean |
| IP | 165.232.176.181 |
| Region | Bangalore |
| OS | Ubuntu 24.04 |
| RAM | 1 GB + 2 GB swap (needs upgrade to 4 GB before 5+ users) |
| Process manager | PM2 (`pm2 restart aadesh-ai`) |
| App location on VPS | /root/aadesh-ai/nextjs |
| Console access | DigitalOcean browser console → Droplets → northcot-blr1 |

### Supabase Tables
| Table | Purpose |
|-------|---------|
| profiles | User profiles, credit balance |
| orders | Generated orders, status, prompt_version |
| references | Uploaded reference orders per user |
| transactions | Razorpay payment records |
| audit_log | All generation events |

---

## 4. QUALITY SCORES (all tests as of April 11, 2026)

| PDF | Case Type | Score | Key Issue |
|-----|----------|-------|-----------|
| Hesaraghatta 129 | Appeal | **85/100** | Reference case — best score |
| Machohalli 163 | Appeal | 80/100 | |
| ABBIGERE 12 | Appeal | 76/100 | |
| 2.pdf | Appeal | 74/100 | |
| Dommasandra 42.2.3 | Appeal | 74/100 | |
| 1.pdf | Suo motu | 69/100 | Wrong statute cited (49(ಎ) instead of 49(2)) |
| **Average** | | **76/100** | **Target: 95. Gap: 19 points** |

### 3 Recurring Issues Causing the 19-point Gap:
1. **Unfilled placeholders** — case number, officer name, hearing dates left as [___]
2. **Missing compliance deadline** — no "60 days" in operative order
3. **Incomplete land area table** — Khara/Baki/Baabu columns empty

### System Prompt History:
| Version | File | Status |
|---------|------|--------|
| V3.2.2 | `KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_2.md` | ✅ ACTIVE — 6 patches, not yet validated |
| V3.2.1 | `KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_1.md` | Previous (383 lines, 17 rules) |
| V3.1 | `KarnatakaAI/02_System_Prompts/DDLR_SYSTEM_PROMPT_V3.1.md` | Archive |
| V3.0 | `KarnatakaAI/02_System_Prompts/DDLR_SYSTEM_PROMPT_V3.md` | Archive |

### AI Model Benchmarks (locked):
| Model | Score | Cost/Order | Status |
|-------|-------|-----------|--------|
| Claude Opus 4.6 | 98/100 | Rs 40 | Too expensive |
| Claude Sonnet 4.6 | 96/100 | Rs 12 | ✅ Production model |
| Gemini 2.5 Pro | 91/100 | Rs 8 | Backup |
| Sarvam 105B | 90/100 | FREE | Context limit blocks use |

---

## 5. MCP INTEGRATIONS (how Claude.ai connects to your tools)

### Claude.ai Chat / Cowork — Connected MCPs:
| MCP | What it does | Auth |
|-----|-------------|------|
| **ddlr-filesystem** | Read/write Banu folder directly | Path-based → `C:\Users\north\OneDrive\Attachments\Desktop\Banu\` |
| **Notion** | Update project hub + task DB | Notion OAuth |
| **Gmail** | Read/send emails | Google OAuth |
| **Google Calendar** | View/create meetings | Google OAuth |
| **Craft** | Document creation | Craft OAuth |
| **Canva** | Design creation | Canva OAuth |
| **Base44** | Admin dashboard | Base44 OAuth |
| **Firecrawl** | Web scraping, research | API key |
| **Supabase** | Direct DB queries | Supabase OAuth |
| **Playwright** | Browser automation | Built-in |
| **PDF Tools** | Read/fill PDF forms | Built-in |
| **Memory** | Cross-session knowledge graph | Built-in |

### Claude Code (VS Code) — Project MCPs:
File: `.mcp.json` in Banu root
| MCP | Status |
|-----|--------|
| TestSprite | ⚠️ API key needs rotation — regenerate from TestSprite dashboard |

### Notion IDs:
| What | ID |
|------|----|
| Main project page | `324290d32bc680649230c47760b400e5` |
| Decisions database | `05bc222d-bbd4-452d-92bc-7313bdc3ebc1` |
| Tasks database | `95720a69-bd99-4a45-a10b-cf4fe18f2de8` |
| Live Status Log | `32f290d32bc6819e9653e1e760587186` |

---

## 6. LOCKED DECISIONS (do not re-debate)

| # | Decision | Reason |
|---|---------|--------|
| D1 | AI = Claude Sonnet 4.6 direct API | OpenRouter blocked adaptive thinking + caching |
| D2 | No RAG/embeddings | Full context = 100/100. RAG = 62/100. Simple wins. |
| D3 | Sarvam = fallback only | 7K context limit can't handle our 20K prompt |
| D4 | B2C first, B2G later | Officers pay from pocket. No govt procurement hurdle. |
| D5 | Don't rebuild app | Already live. Improve phase by phase only. |
| D6 | max_tokens = 12000 minimum | Kannada = 14 tokens/word. 600-word order = 8,400 tokens. |
| D7 | No thinking mode | Adds 7x cost, zero quality benefit for template task |
| D8 | Sarvam cannot generate | Confirmed April 11: 7K limit vs 20K prompt = impossible |

---

## 7. WHAT IS REAL vs PLANNED (April 11, 2026)

### ✅ REAL AND WORKING:
- aadesh-ai.in live with SSL, Google OAuth, Razorpay billing, Supabase DB
- 6 Banu test PDFs scored (average 76/100)
- System prompt V3.2.2 written (not yet validated)
- Kiro pipeline fully built (not yet merged into main app)
- VPS deployed with PM2 + Nginx
- 576 original Banu orders available as training data
- Karnataka RAI submission draft ready to send
- Anthropic DPA email ready to send

### 🟡 PARTIAL (started, not complete):
- Quality tests: 6 PDFs done, V3.2.2 validation not run yet
- Kiro pipeline: built but not merged into main app
- Base44 admin dashboard: built with sample data, not connected to real Supabase

### 🔴 NOT STARTED (Phase 0 backlog):
- PDF upload wired to AI pipeline
- PII redaction (DPDP legal critical)
- Entity Lock verification screen (BNS legal shield)
- Clarifying questions UI (+6 to +16 quality points proven)
- UptimeRobot health check (FREE, 15 min to set up)
- Sentry error monitoring (FREE, 30 min to set up)
- Supabase custom domain db.aadesh-ai.in
- Razorpay end-to-end payment test
- Rate limiter (5 orders/day per user)
- VPS security hardening

---

## 8. IMMEDIATE NEXT ACTIONS (do these in order)

| # | Action | Who | Time | Priority |
|---|--------|-----|------|---------|
| 1 | Send Anthropic DPA email | **Srinivas** | 5 min | 🔴 LEGAL |
| 2 | Validate V3.2.2 on Machohalli 163.pdf | Claude Code | 30 min | 🔴 QUALITY |
| 3 | If 88+: run all 5 PDFs with V3.2.2 | Claude Code | 2 hrs | 🔴 QUALITY |
| 4 | Merge Kiro pipeline into main app | Claude Code | 1 day | 🔴 FEATURE |
| 5 | Wire PDF upload to AI pipeline | Claude Code | 1 day | 🔴 FEATURE |
| 6 | Add PII redaction (piiRedactor.ts from Kiro) | Claude Code | 2 hrs | 🔴 LEGAL |
| 7 | Set up UptimeRobot | Claude Code | 15 min | 🟡 OPS |
| 8 | Set up Sentry | Claude Code | 30 min | 🟡 OPS |
| 9 | Send RAI Committee submission | **Srinivas** | 30 min | 🔴 DEADLINE |
| 10 | Give Banu real login + monitor first orders | Srinivas + Banu | ongoing | 🔴 PILOT |

---

## 9. RESEARCH CONCLUSIONS (already done — don't redo)

### Competition (Doubt 2):
**ZERO direct competitors exist.** No AI tool drafts legal orders for Indian land-revenue officers in regional language. LexLegis, VakilAI, CaseMine etc. all serve lawyers in English. We own this niche.

### Government Procurement (Doubt 1):
- KTPP Act exempts purchases below Rs 5 lakh — DC can approve without formal tender
- Officers CANNOT pay from personal pocket for official software → B2C recharge model needs rethink for scale
- Register on GeM immediately (FREE, builds credibility)
- Short term: B2C (officers pay personally) → Long term: B2G (office budget)

### Prompt Caching (Doubt 3):
- Works. Confirmed. 79% faster cached vs cold. 90% cost saving on cached tokens.
- Average cost with caching: Rs 8.70/order across 5-order session
- Now implemented: direct Anthropic SDK with cache_control ephemeral 1h TTL

---

## 10. SESSION HISTORY (newest first)

### April 11, 2026 — Quality Testing + System Prompt Fix
- Created `phase0_test_v2.py`, fixed Kannada tokenization (max_tokens=12000)
- Tested all 6 PDFs: average 76/100
- Found 3 recurring issues. Wrote V3.2.2 with 6 patches.
- Discovered Kiro pipeline folder (complete, save 2-3 weeks)
- Created PROJECT_JOURNAL.md, SETUP_NEW_LAPTOP.md, MASTER_AUDIT_REPORT.md
- Saved full project context to Claude memory graph

### April 9, 2026 — Blueprint Lock + Hesaraghatta Test
- Blueprint v9.2 locked (668 lines, 35 decisions, 7 AI models cross-validated)
- Tested Hesaraghatta 129.pdf: 85/100 score
- Built Base44 admin dashboard prototype
- STATUS-REALITY-CHECK.md written (honest assessment)

### April 5, 2026 — VPS + Deployment
- DigitalOcean VPS deployed
- SSL, Nginx, PM2 configured
- aadesh-ai.in live

### April 4, 2026 — Folder Audit + Cleanup
- Full folder audit done
- Old files archived to _archive/
- DEEP_RESEARCH research completed (3 doubts resolved)

### March 28-30, 2026 — Initial Setup
- Supabase Mumbai set up (5 tables)
- Domain aadesh-ai.in purchased
- Google OAuth configured
- Razorpay billing integrated (4 packs)

---

## 11. FOR NEW CLAUDE SESSIONS — WHAT TO DO FIRST

**If you are Claude Chat / Cowork:**
```
1. Read this file (done ✅)
2. Read TEAM_LOG.md (last 30 lines)
3. Check TEAM_INBOX/ — any FROM_CODE_*.md files?
4. Check SESSION-HANDOFF.md for current state
5. Plan next task. Write to TEAM_INBOX/FROM_COWORK_{date}_{topic}.md
```

**If you are Claude Code:**
```
1. CLAUDE.md loads automatically
2. Read TEAM_LOG.md
3. Check TEAM_INBOX/ for FROM_COWORK_*.md tasks
4. Execute the task
5. Save results to TEAM_INBOX/FROM_CODE_{date}_{topic}.md
6. Update TEAM_LOG.md
```

**If Srinivas says "start fresh" — the 5 files that tell you everything:**
1. `MASTER_AUDIT_REPORT.md` — this file (most complete)
2. `MASTER_CONTEXT.md` — Claude Code's briefing
3. `TEAM_LOG.md` — recent session history
4. `SESSION-HANDOFF.md` — current state snapshot
5. `DDLR Strategy & Planning/AADESH_AI_BLUEPRINT_v9_2_2.md` — full strategy

---

## 12. CRITICAL RULES (all Claude tools must follow)

1. **NEVER modify** `_BACKUP_RAW_BANU_ORIGINALS/` — sacred originals
2. **Always UTF-8** encoding — Kannada breaks without it
3. **Never hardcode API keys** — always `os.getenv()` or `.env` file
4. **max_tokens = 12000 minimum** for Kannada generation
5. **No thinking mode** for order generation — 7x cost, zero benefit
6. **Sarvam cannot do generation** with reference orders — 7K context limit
7. **Quality gate before Banu sees any order:** structure ✓ + word count 550-750 ✓ + no English transliterations ✓
8. **Update TEAM_LOG.md** at end of every session
9. **Update Notion Status Log** (ID: `32f290d32bc6819e9653e1e760587186`) after major steps
10. **Do NOT rebuild app** from scratch — only improve existing aadesh-ai/nextjs/

---

## 13. UPDATE LOG (add new entry at top when you update this file)

| Date | Who | What changed |
|------|-----|-------------|
| April 11, 2026 | Cowork (Srinivas session) | Created this file. Full folder read. All sections written from scratch. Memory saved. |

---
*This report was created by reading EVERY markdown file in the Banu folder on April 11, 2026.*
*Total files read: 30+ markdown files across all folders.*
*Also saved to Claude memory graph for cross-session recall.*
