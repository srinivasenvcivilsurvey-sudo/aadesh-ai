# BANU FOLDER — FULL AUDIT REPORT
# Date: April 4, 2026
# Auditor: Claude Chat (CTO)
# Rule: DO NOT delete or move anything. Audit only.

---

## SUMMARY

| Metric | Count |
|--------|-------|
| Total folders (root level) | 21 |
| Total loose files (root level) | ~170+ |
| VPS Python scripts (should be in subfolder) | ~60 |
| Output/error logs (should be archived) | ~30 |
| QA screenshots (should be in subfolder) | ~15 |
| Blueprint files at root (duplicated in subfolder) | 3 |
| Agent context files (should be in subfolder) | 7 |
| Batch/automation files | 6 |
| Bridge/team system docs | ~20 |
| Empty error files (0 bytes) | ~12 |

**Verdict: The root folder is 80% garbage.** Only ~20 files at root actually need to be there.

---

## WHAT'S WELL-ORGANIZED (don't touch)

| Folder | Status | Why |
|--------|--------|-----|
| KarnatakaAI/ | CLEAN | Numbered 01-11, proper structure |
| DDLR Strategy & Planning/ | CLEAN | Blueprints, audits, strategy |
| DEEP_RESEARCH/ | CLEAN | Just organized today |
| _BACKUP_RAW_BANU_ORIGINALS/ | KEEP | Original Banu files |
| aadesh-ai/ | KEEP | App source code (GitHub repo) |
| tasks/ | CLEAN | pending/in-progress/done |

## WHAT'S MESSY (needs organizing)

### Category 1: VPS Scripts (~60 files) — MOVE TO _archive/vps_scripts/
These are one-time deployment/fix scripts. Already executed. Not needed daily.
Examples: vps_fix.py, vps_rebuild.py, deploy_aad20.py, fix_build_env.py,
vps_check_build.py, vps_patch_login.py, etc.

### Category 2: Output/Error Logs (~30 files) — MOVE TO _archive/logs/
Build outputs, deploy outputs, error logs. Historical only.
Examples: build_log.txt, deploy_out.txt, vps_debug_out.txt, oauth_fix_out.txt,
all *_err.txt files (most are 0 bytes)

### Category 3: QA Screenshots (~15 files) — MOVE TO _archive/qa_screenshots/
Test screenshots from various QA sessions. Historical.
Examples: qa_screen1_landing_kn.png, login_fixed_dashboard.png,
generate_page_ui.png, mobile_dashboard.png

### Category 4: Agent Contexts (7 files) — MOVE TO PAPERCLIP/agent_contexts/
Paperclip agent definitions. Belong with the Paperclip system.
Files: AGENT_CONTEXT_ARVIND.md, AGENT_CONTEXT_BANUBOT.md,
AGENT_CONTEXT_DHARMA.md, AGENT_CONTEXT_LAKSHMI.md,
AGENT_CONTEXT_PRIYA.md, AGENT_CONTEXT_RAVI.md, AGENT_CONTEXT_SHARED.md

### Category 5: Bridge/Team System (~20 files) — MOVE TO _archive/team_bridge/
Claude team bridge system files. Already completed (100%). Archive.
Files: BRIDGE-STRUCTURE.md, CLAUDE-BRIDGE-SYSTEM.md, CODE-COWORK-GUIDE.md,
TEAM-CAPABILITIES.md, TEAM_LOG.md, various task templates, etc.

### Category 6: Blueprint Duplicates (3 files at root) — MOVE TO DDLR Strategy/
Files: AADESH_AI_BLUEPRINT_v8.0.md, AADESH_AI_BLUEPRINT_v8.0_ADDENDUM.md
(duplicates of files already in DDLR Strategy & Planning/)

### Category 7: Possibly Obsolete Folders — REVIEW
| Folder | What It Is | Recommendation |
|--------|-----------|---------------|
| antigravity/ | Unknown — likely test/experiment | ARCHIVE |
| autocad-mcp/ | AutoCAD MCP server — unrelated to DDLR | ARCHIVE |
| tippani_prototype/ | Tippani patent prototype | KEEP but move to KarnatakaAI/ |
| team-bridge-mcp/ | Bridge system MCP — completed | ARCHIVE |
| DesktopCommanderMCP/ | Desktop Commander install | ARCHIVE |
| everything-claude-code/ | ECC plugin — already installed globally | ARCHIVE |
| file-organizer/ | File organizer script (task-001) | ARCHIVE |
| rollback/ | Rollback handler | ARCHIVE |
| testsprite_tests/ | TestSprite QA results | ARCHIVE |

---

## PROPOSED CLEAN STRUCTURE

```
Banu/
├── README.md                          ← Master index (what's where)
├── CLAUDE.md                          ← Context for Claude Code
├── SESSION-HANDOFF.md                 ← Current session state
│
├── KarnatakaAI/                       ← [KEEP] All DDLR orders, Bible, data
│   ├── 01_Source_Data/
│   ├── 02_System_Prompts/
│   ├── ... (01-11, already clean)
│   └── tippani_prototype/             ← moved here from root
│
├── DDLR Strategy & Planning/          ← [KEEP] All blueprints and strategy
│   ├── AADESH_AI_BLUEPRINT_v7_4.md
│   ├── AADESH_AI_BLUEPRINT_v8.0.md    ← moved from root
│   ├── AADESH_AI_BLUEPRINT_v8.0_ADDENDUM.md
│   ├── AADESH_AI_BLUEPRINT_v8.1_ADDENDUM.md
│   ├── AADESH_AI_BLUEPRINT_v8.2_TWO_TRACK_MODEL.md
│   └── Architecture_Audit_*.md
│
├── DEEP_RESEARCH/                     ← [KEEP] All research outputs
│   ├── DOUBT_1_GOVT_PROCUREMENT/
│   ├── DOUBT_2_COMPETITION_OPENSOURCE/
│   ├── DOUBT_3_PROMPT_CACHING/
│   ├── DOUBT_1_SYNTHESIS_REPORT.md
│   ├── DOUBT_2_SYNTHESIS_REPORT.md
│   ├── DOUBT_3_SYNTHESIS_REPORT.md
│   └── BANU_FOLDER_AUDIT_2026-04-04.md
│
├── aadesh-ai/                         ← [KEEP] App source code
├── _BACKUP_RAW_BANU_ORIGINALS/        ← [KEEP] Banu's original files
│
├── SESSION_LOG/                       ← [NEW] Chat session summaries
│   ├── 2026-03-26_session.md
│   ├── 2026-03-28_session.md
│   ├── ... (one file per session)
│   └── SESSION_INDEX.md
│
├── PAPERCLIP/                         ← [KEEP] Agent system
│   └── agent_contexts/                ← moved from root
│
├── _archive/                          ← [NEW] Everything historical
│   ├── vps_scripts/                   ← ~60 Python scripts
│   ├── logs/                          ← ~30 output/error files
│   ├── qa_screenshots/                ← ~15 PNG files
│   ├── team_bridge/                   ← Bridge system files
│   ├── batch_files/                   ← .bat automation files
│   ├── tools_installed/               ← ECC, DesktopCommander, etc.
│   └── experiments/                   ← antigravity, autocad-mcp, etc.
│
└── tasks/                             ← [KEEP] Task tracking
    ├── pending/
    ├── in-progress/
    └── done/
```

After cleanup: ROOT folder goes from ~170 files to ~5 files.

---

## WHO DOES THE WORK — TASK ASSIGNMENT

| Task | Assigned To | Why |
|------|------------|-----|
| Audit + plan (this document) | Claude Chat (CTO) | DONE — this file |
| Create _archive/ subfolders | Claude Code | File operations on laptop |
| Move ~60 VPS scripts to _archive/vps_scripts/ | Claude Code | Bulk file move |
| Move ~30 logs to _archive/logs/ | Claude Code | Bulk file move |
| Move ~15 screenshots to _archive/qa_screenshots/ | Claude Code | Bulk file move |
| Move agent contexts to PAPERCLIP/ | Claude Code | Small move |
| Move blueprints from root to Strategy folder | Claude Code | Small move |
| Move obsolete folders to _archive/ | Claude Code | Folder move |
| Create SESSION_LOG/ and index | Claude Chat | Knowledge/content work |
| Read each important .md file and summarize | Claude Chat | Analysis work |
| Update CLAUDE.md with new structure | Claude Code | After moves complete |
| Update Notion with folder audit | Claude Chat | DONE below |

**Claude Code does 80% of this work** — it's file operations.
**Claude Chat does 20%** — planning, summaries, session logs.
**Claude Cowork is NOT needed** — this is not a multi-agent task.

---

## SESSION LOG CONCEPT

Every Claude Chat session should end with a summary saved to SESSION_LOG/.
Format: YYYY-MM-DD_session_N.md

Each file contains:
- Date and session number
- What was discussed
- Decisions made (with decision IDs)
- Files created/modified
- Action items for next session
- Blueprint version changes

This way, even if all chat history is deleted, the SESSION_LOG folder
has the complete project history. A new Claude session reads the latest
SESSION_LOG file and picks up where we left off.

---

## IMMEDIATE NEXT STEP

Srinivas: paste the following prompt into Claude Code to execute the cleanup.
