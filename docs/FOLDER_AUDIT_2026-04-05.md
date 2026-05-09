# BANU FOLDER AUDIT — April 5, 2026
# Author: CTO (Claude Cowork)
# Location: C:\Users\north\OneDrive\Attachments\Desktop\Banu\

---

## FOLDER SUMMARY

| Item | Count |
|------|-------|
| Total root items | 22 (10 dirs + 6 files + 6 launcher scripts) |
| Total projects in this folder | 3 (DDLR AI + AutoCAD MCP + Tippani Patent) |
| Original Banu orders (backup) | 500+ .docx files |
| Curated reference orders | 37 appeals + reviews |
| Banu case PDFs (ready to generate) | 6 PDFs |
| Blueprint versions | v8.0 to v9.0 (v9.0 is ACTIVE) |
| Production app code | aadesh-ai/ (Next.js) |
| Legacy app code | KarnatakaAI/11_DDLR_App/ (Streamlit) |

---

## ROOT FILES (6 files + 6 launchers)

| File | Purpose |
|------|---------|
| CLAUDE.md | Claude Code instructions — tells Claude Code how to work in this folder |
| SESSION-HANDOFF.md | Context for new Claude sessions — folder structure, what to read first |
| .mcp.json | MCP server configuration for Claude tools |
| ⚡-MASTER-CONTROL-PANEL.bat | One-click launcher to open all tools |
| 💻-Launch-Code.bat | Opens Claude Code in VS Code |
| 📊-Check-Status.bat | Checks VPS/app status |
| 📊-DASHBOARD.html | Visual dashboard for project status |
| 🔧-Launch-CoWork.bat | Opens Cowork session |
| 🧪-TEST-REMAINING.bat | Runs remaining test tasks |

---

## PROJECT 1: DDLR AI ORDER DRAFTING (Main Project)

### aadesh-ai/ — PRODUCTION APP (Live at aadesh-ai.in)
- **Framework:** Next.js 15 + React 19 + Tailwind
- **Key files:** nextjs/ folder has all source code
- **.env.deploy** — deployment environment variables
- **deploy_vps.py** — VPS deployment script
- **supabase_schema.sql** — database schema
- **QA reports:** 5 QA/test reports from March 29

### KarnatakaAI/ — SOURCE DATA + LEGACY APP

| Subfolder | Contents | File Count | Purpose |
|-----------|----------|------------|---------|
| 01_Source_Data/ | Raw DDLR data files | varies | Original training data |
| 02_System_Prompts/ | System prompt versions | varies | V3.0 to V3.2.1 prompts |
| 03_Test_Results/ | Test scorecards | varies | Quality validation history |
| 04_AI_Generated_Drafts/ | 5 test outputs | 5 .docx | Test1-Test5 generated orders |
| 05_Guides_and_Plans/ | Strategy docs | varies | Historical guides |
| 06_Tools_and_Scripts/ | Python utilities | varies | OCR, conversion scripts |
| 07_Reports_and_Analysis/ | Analysis reports | varies | Phase results, analyses |
| 08_Approved_Outputs/ | Approved drafts | varies | Banu-approved outputs |
| **10_Cloud_Project_Bengaluru_South/** | **Claude Project reference set** | **37+10+1** | **THE GOLD — 37 appeals + 10 reviews curated for AI** |
| **11_DDLR_App/** | **Streamlit legacy app** | ~15 files | **app.py (1538 lines), system_prompt.md, templates/** |
| **SAMPLE_CASE_INPUT/** | **6 Banu PDFs ready to generate** | **6 PDFs** | **THE TEST FILES — use these for Phase 0 testing** |
| tippani_prototype/ | Survey sketch digitization | varies | SEPARATE PROJECT (patent pending) |

### THE 6 BANU TEST PDFs (SAMPLE_CASE_INPUT/)

These are the case files Banu sent. Ready for Phase 0, Task 1 testing:

| File | Village/Case | Status |
|------|-------------|--------|
| 1.pdf | Case file 1 | Ready to test |
| 2.pdf | Case file 2 | Ready to test |
| ABBIGERE 12.pdf | Abbigere Sy.12 | Ready to test |
| Dommasandra 42.2.3.pdf | Dommasandra Sy.42 | Ready to test |
| Hesaraghatta 129.pdf | Hesaraghatta Sy.129 | **Previously tested — scored 96-100/100** |
| Machohalli 163.pdf | Machohalli Sy.163 | Ready to test |

### CURATED REFERENCE ORDERS (10_Cloud_Project_Bengaluru_South/)

- **A_Reference_Orders_50/Appeals_40/** — 37 appeal orders (.docx, curated from 500+)
- **A_Reference_Orders_50/Reviews_10/** — Review/suo motu orders
- **B_Drafting_Bible_6/** — 6 drafting bible documents
- **C_AI_Generated_Drafts/** — 1 generated draft (Hesaraghatta Sy.129)

These are THE reference orders to load into Sonnet 4.6's 1M context.

### _BACKUP_RAW_BANU_ORIGINALS/ — 500+ original orders

**NEVER TOUCH. NEVER DELETE. NEVER MODIFY.**
- 500+ .docx files — Banu's original finalized DDLR orders
- All villages in Bangalore South Taluk
- Mix of appeals, suo motu reviews, podi cases
- Some have Kannada filenames (ಹುಣಸಮಾರನಹಳ್ಳಿ etc.)
- Some are 1.7-1.8 MB (contain embedded images/stamps)
- Contains "new files" subfolder with additional orders

---

### DDLR Strategy & Planning/ — BLUEPRINTS + STRATEGY

| File | Version | Status |
|------|---------|--------|
| AADESH_AI_BLUEPRINT_v8.0.md | v8.0 | ARCHIVED |
| AADESH_AI_BLUEPRINT_v8.0_ADDENDUM.md | v8.0 add | ARCHIVED |
| AADESH_AI_BLUEPRINT_v8.1_ADDENDUM.md | v8.1 add | ARCHIVED |
| AADESH_AI_BLUEPRINT_v8.2_TWO_TRACK_MODEL.md | v8.2 | ARCHIVED |
| **AADESH_AI_BLUEPRINT_v9.0.md** | **v9.0** | **ACTIVE — download from Claude chat to replace** |
| Architecture_Audit_v74_vs_v75_2026-04-02.md | Audit | Reference |
| PROJECT_VISION_THEME.md | Vision | PERMANENT — read every session |
| cost_log.json | Costs | March 30 VPS costs |

### DEEP_RESEARCH/ — Multi-LLM Research Reports

| File/Folder | What |
|-------------|------|
| DDLR_5Model_Consensus_Dashboard_SoloVsDevTeam.md | 5 AI models compared strategies — "SELL FIRST" |
| DOUBT_1_GOVT_PROCUREMENT/ + SYNTHESIS | Government procurement research |
| DOUBT_2_COMPETITION_OPENSOURCE/ + SYNTHESIS | Zero competitors confirmed |
| DOUBT_3_PROMPT_CACHING/ + SYNTHESIS | Caching works, 3 bugs found |
| BANU_FILE_VERDICTS.md | Banu's feedback on AI outputs |
| BANU_FOLDER_AUDIT_2026-04-04.md | Previous folder audit |

### SESSION_LOG/ — Session History

| File | What |
|------|------|
| 2026-04-04_session.md | April 4 session summary |
| 2026-04-05_session.md | Today's session summary |
| CONTENT_AUDIT_DEEP.md | Deep content audit task |

### _archive/ — Historical Files (202 files moved here Apr 4)

All old scripts, logs, bridge docs, VPS scripts archived.
Key subfolder: TEAM_INBOX/ (old task bridge between Cowork and Claude Code)

---

## PROJECT 2: AUTOCAD SURVEY DIGITIZATION (Separate)

### autocad-mcp/ — AutoCAD MCP Server
- **Purpose:** AI-powered survey sketch digitization (tippani to CAD)
- **Stack:** Python, MCP server, AutoCAD LISP integration
- **Status:** Active development, SEPARATE from DDLR AI
- **DO NOT archive or delete**

---

## PROJECT 3: TIPPANI PATENT (in KarnatakaAI/tippani_prototype/)

- **Purpose:** AI-powered digitization of hand-drawn survey sketches (tippani) to CAD
- **Status:** Patent draft completed March 28, 2026
- **Patent title:** "Method and System for Automated Digitization of Hand-Drawn Cadastral Survey Sketches"
- **CRITICAL:** File patent BEFORE any public demo (public disclosure = loss of novelty)
- **DO NOT mix with DDLR AI project**

---

## OTHER FOLDERS

| Folder | Purpose | Touch? |
|--------|---------|--------|
| .claude/ | Claude Code config | NO |
| .next/ | Next.js build cache | NO |
| .playwright-mcp/ | Browser testing tool | NO |
| everything-claude-code/ | Claude Code plugins (30 agents, 51 skills) | NO — in use |
| SESSION_LOG/ | Session summaries | Reference only |

---

## QUICK REFERENCE — "Where is what?"

| I need... | Location |
|-----------|----------|
| Banu's 6 test PDFs | KarnatakaAI/SAMPLE_CASE_INPUT/ |
| 37 curated appeal reference orders | KarnatakaAI/10_Cloud_Project_Bengaluru_South/A_Reference_Orders_50/Appeals_40/ |
| 10 review/suo motu references | KarnatakaAI/10_Cloud_Project_Bengaluru_South/A_Reference_Orders_50/Reviews_10/ |
| 6 drafting bible docs | KarnatakaAI/10_Cloud_Project_Bengaluru_South/B_Drafting_Bible_6/ |
| 500+ original Banu orders (BACKUP) | _BACKUP_RAW_BANU_ORIGINALS/ |
| Production Next.js code | aadesh-ai/nextjs/ |
| Deployment scripts | aadesh-ai/deploy_vps.py |
| Database schema | aadesh-ai/supabase_schema.sql |
| Legacy Streamlit app | KarnatakaAI/11_DDLR_App/app.py |
| System prompt V3.2.1 | KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_1.md |
| Active blueprint (v9.0) | DDLR Strategy & Planning/AADESH_AI_BLUEPRINT_v9.0.md |
| Founding vision document | DDLR Strategy & Planning/PROJECT_VISION_THEME.md |
| 5-model consensus research | DEEP_RESEARCH/DDLR_5Model_Consensus_Dashboard_SoloVsDevTeam.md |
| Competition research | DEEP_RESEARCH/DOUBT_2_SYNTHESIS_REPORT.md |
| Prompt caching research | DEEP_RESEARCH/DOUBT_3_SYNTHESIS_REPORT.md |
| Claude Code instructions | CLAUDE.md (root) |
| Session handoff for new Claude | SESSION-HANDOFF.md (root) |
| AutoCAD MCP project (SEPARATE) | autocad-mcp/ |
| Tippani patent (SEPARATE) | KarnatakaAI/tippani_prototype/ |
| All archived old files | _archive/ (202 files moved Apr 4) |

---

## PROVEN AI OUTPUTS (Orders that scored 95-100/100)

| File | Case | Score | Model |
|------|------|-------|-------|
| KarnatakaAI/10_.../C_AI_Generated_Drafts/DDLR_Order_Hesaraghatta_Sy129.docx | Hesaraghatta Sy.129 | ~96-100 | Sonnet 4.6 |
| KarnatakaAI/04_.../Test1_Hunasamaranahalli_Appeal.docx | Hunasamaranahalli appeal | ~90 | Earlier model |
| KarnatakaAI/04_.../Test2_Beguru_SuoMotu.docx | Beguru suo motu | ~85 | Earlier model |

Banu confirmed: "Only 1-2 minor corrections remaining. All is correct."

---

## WARNINGS

1. **NEVER delete _BACKUP_RAW_BANU_ORIGINALS/** — 500+ irreplaceable original orders
2. **autocad-mcp/ is a SEPARATE project** — do NOT archive or merge with DDLR AI
3. **tippani_prototype/ has patent-pending code** — do NOT make public
4. **aadesh-ai/.env.deploy has API keys** — NEVER commit to public GitHub
5. **VPS root password in _archive/vps_scripts/** — MUST rotate (still pending)
6. **v9.0 blueprint in DDLR Strategy & Planning/ needs replacing** — download full version from Claude chat

---

## SESSION CONTEXT (For next Claude session)

- Blueprint v9.0 is LOCKED and triple-validated (Claude + Perplexity + Gemini)
- Phase 0, Task 1 is NEXT: Test model locally with Banu's 6 PDFs
- The 6 PDFs are in KarnatakaAI/SAMPLE_CASE_INPUT/
- The 37 reference orders are in KarnatakaAI/10_.../Appeals_40/
- Sarvam Startup Program: applied March 28, response overdue
- VPS password rotation: STILL PENDING (critical security)
- Supabase custom domain: NOT configured yet (Phase 0 Task 2)

---

# END OF AUDIT
# Created: April 5, 2026 by CTO (Claude Cowork)
# Next audit: When folder structure changes significantly

