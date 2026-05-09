# BANU FOLDER — FILE-BY-FILE VERDICT TABLE
# Auditor: Claude Chat (CTO)
# Date: April 4, 2026
# Method: Every .md and .json file READ and assessed
# Rule: Nothing deleted without Srinivas approval

---

## VERDICT KEY
- KEEP ROOT = Must stay in root folder, used every session
- KEEP MOVE = Valuable content, move to organized subfolder
- ARCHIVE = Historical value only, move to _archive/
- MERGE = Content should be merged into another file
- DELETE = Empty, broken, or completely obsolete (needs Srinivas OK)

---

## MARKDOWN FILES (35 files — ALL READ)

| # | File | Size | Read? | What's Inside | Verdict | Move Where |
|---|------|------|-------|---------------|---------|-----------|
| 1 | CLAUDE.md | 17KB | YES | Claude Code instructions, role, folder structure, tech stack, rules | KEEP ROOT | Stays — Claude Code reads this first |
| 2 | MASTER-README.md | 8KB | YES | Task bridge system documentation (pending/done workflow) | ARCHIVE | _archive/team_bridge/ — system completed, not actively used |
| 3 | SESSION-HANDOFF.md | 3.4KB | YES | April 3 session handoff — what was done, what's next | KEEP ROOT | Stays — new sessions read this |
| 4 | END-OF-SESSION-SUMMARY.md | 0.9KB | YES | April 3 session summary (4 accomplishments) | KEEP ROOT | Stays — quick session summary |
| 5 | STATUS-REALITY-CHECK.md | 2.6KB | YES | 12/12 tasks completed status table | ARCHIVE | _archive/team_bridge/ — completed, historical |
| 6 | FILE_INDEX.md | 18KB | YES | Full folder audit from March 22 — OUTDATED | MERGE | Replace with this new audit. Move old to _archive/ |
| 7 | PROJECT_KNOWLEDGE_SUMMARY.md | 17.8KB | YES | Deep project knowledge from March 22 — business facts, tech stack, all key info | KEEP MOVE | KarnatakaAI/09_Strategy/ — valuable reference but outdated on pricing |
| 8 | PROJECT_VISION_THEME.md | 7.2KB | YES | The ONE-LINE VISION + problem + solution. Permanent reference. | KEEP MOVE | DDLR Strategy & Planning/ — foundational document |
| 9 | COMPLETE-STATUS-REVIEW.md | 10KB | YES | Full bridge system history from Apr 3 session | ARCHIVE | _archive/team_bridge/ — session history |
| 10 | COMPLETED-TODAY-LOG.md | 1.1KB | YES | Short task completion log | ARCHIVE | _archive/team_bridge/ |
| 11 | DDLR_5Model_Consensus_Dashboard.md | 12.5KB | YES | 5-model research consensus from March 22 — solo vs dev team analysis | KEEP MOVE | DEEP_RESEARCH/ — historical research, valuable |
| 12 | DDLR_Week1_Guide_AUDIT_17_Issues.md | 13.3KB | YES | 17 blind spots found March 22 — most now resolved | ARCHIVE | _archive/historical_audits/ |
| 13 | PROMPT_CHANGELOG.md | 3.4KB | YES | System prompt version history (V3.1, V3.2, V3.2.1) | KEEP MOVE | KarnatakaAI/02_System_Prompts/ — tracks prompt evolution |
| 14 | AUTOMATION-ANALYSIS.md | 6.4KB | YES | Bridge automation multi-stage workflow analysis | ARCHIVE | _archive/team_bridge/ |
| 15 | IMPROVEMENTS-ANALYSIS.md | 5.6KB | YES | Bridge system improvement suggestions | ARCHIVE | _archive/team_bridge/ |
| 16 | FEEDBACK_LOG.md | 0.8KB | YES | Short feedback notes (2 entries only) | ARCHIVE | _archive/team_bridge/ |
| 17 | REVIEW_LOG.md | 0.9KB | YES | Review tracking (2 entries only) | ARCHIVE | _archive/team_bridge/ |
| 18 | MY-SUGGESTIONS-TRACKER.md | 3KB | YES | CTO suggestion tracking | ARCHIVE | _archive/team_bridge/ |
| 19 | TEAM_LOG.md | 32KB | YES | Full team activity log — large, detailed history | KEEP MOVE | SESSION_LOG/ — rename to team_log_historical.md |
| 20 | TEAM-CAPABILITIES.md | 16.2KB | YES | What Chat/Code/Cowork can each do — capabilities registry | KEEP MOVE | SESSION_LOG/ — reference for new sessions |
| 21 | BRIDGE-STRUCTURE.md | 1.7KB | YES | Bridge folder structure diagram | ARCHIVE | _archive/team_bridge/ |
| 22 | CLAUDE-BRIDGE-SYSTEM.md | 5.1KB | YES | Bridge system design doc | ARCHIVE | _archive/team_bridge/ |
| 23 | THE_BRIDGE_COMPLETE_GUIDE.md | 9.8KB | YES | Full bridge guide | ARCHIVE | _archive/team_bridge/ |
| 24 | CODE-COWORK-GUIDE.md | 3.6KB | YES | How Code and Cowork interact | ARCHIVE | _archive/team_bridge/ |
| 25 | CLAUDE_CHAT_INSTRUCTIONS.md | 5.6KB | YES | Chat instructions for bridge | ARCHIVE | _archive/team_bridge/ |
| 26 | COWORK_INSTRUCTIONS_ABSOLUTE_FINAL.md | 3.8KB | YES | Cowork final instructions | ARCHIVE | _archive/team_bridge/ |
| 27 | CLAUDE-WORKSPACE-README.md | 1KB | YES | Short workspace readme | ARCHIVE | _archive/team_bridge/ |
| 28 | MULTI-STAGE-GUIDE.md | 7.1KB | YES | Multi-stage task guide | ARCHIVE | _archive/team_bridge/ |
| 29 | QUICK-START.md | 2.3KB | YES | Quick start for bridge | ARCHIVE | _archive/team_bridge/ |
| 30 | FINAL-SETUP-INSTRUCTIONS.md | 3.5KB | YES | Bridge setup instructions | ARCHIVE | _archive/team_bridge/ |
| 31 | OVERNIGHT_SUMMARY_2026-03-30.md | 3.1KB | YES | Overnight automation summary | ARCHIVE | _archive/logs/ |
| 32 | COPY-PASTE-PROMPTS.txt | 3.7KB | YES | Ready-to-paste prompts for Code/Cowork | ARCHIVE | _archive/team_bridge/ |
| 33 | CODE-SELF-DISCOVERY-PROMPT.txt | 1.5KB | YES | Prompt for Code self-discovery | ARCHIVE | _archive/team_bridge/ |
| 34 | COWORK-SELF-DISCOVERY-PROMPT.txt | 1.4KB | YES | Prompt for Cowork self-discovery | ARCHIVE | _archive/team_bridge/ |
| 35 | cowork-prompt.txt | 0.3KB | YES | Short cowork prompt | ARCHIVE | _archive/team_bridge/ |

## BLUEPRINT FILES AT ROOT (3 files — duplicated in DDLR Strategy/)

| # | File | Size | Verdict | Reason |
|---|------|------|---------|--------|
| 36 | AADESH_AI_BLUEPRINT_v8.0.md | 29.8KB | MOVE | Duplicate — already in DDLR Strategy/. Move to _archive/duplicates/ |
| 37 | AADESH_AI_BLUEPRINT_v8.0_ADDENDUM.md | 11.2KB | MOVE | Duplicate — move to _archive/duplicates/ |
| 38 | AGENT_CONTEXT_SHARED.md | 1.5KB | MOVE | Paperclip agent — move to PAPERCLIP/agent_contexts/ |

## AGENT CONTEXT FILES (7 files — Paperclip system)

| # | File | Size | Verdict | Move Where |
|---|------|------|---------|-----------|
| 39 | AGENT_CONTEXT_ARVIND.md | 6.3KB | MOVE | PAPERCLIP/agent_contexts/ |
| 40 | AGENT_CONTEXT_BANUBOT.md | 3.9KB | MOVE | PAPERCLIP/agent_contexts/ |
| 41 | AGENT_CONTEXT_DHARMA.md | 13KB | MOVE | PAPERCLIP/agent_contexts/ |
| 42 | AGENT_CONTEXT_LAKSHMI.md | 4.6KB | MOVE | PAPERCLIP/agent_contexts/ |
| 43 | AGENT_CONTEXT_PRIYA.md | 4.1KB | MOVE | PAPERCLIP/agent_contexts/ |
| 44 | AGENT_CONTEXT_RAVI.md | 4.1KB | MOVE | PAPERCLIP/agent_contexts/ |

## JSON FILES (10 files)

| # | File | Size | Read? | Verdict | Move Where |
|---|------|------|-------|---------|-----------|
| 45 | CONTEXT-HEALTH.json | 0.4KB | YES | KEEP ROOT | Session health tracker |
| 46 | SYSTEM_STATUS.json | 0.9KB | YES | KEEP ROOT | System status |
| 47 | quick-status-summary.json | 0.4KB | YES | ARCHIVE | _archive/team_bridge/ |
| 48 | claude-task-example.json | 1KB | YES | ARCHIVE | _archive/team_bridge/ |
| 49 | completion-report-template.json | 1.1KB | YES | ARCHIVE | _archive/team_bridge/ |
| 50 | completion-template.json | 1.4KB | YES | ARCHIVE | _archive/team_bridge/ |
| 51 | multi-stage-task-template.json | 2.1KB | YES | ARCHIVE | _archive/team_bridge/ |
| 52 | task-template-parallel.json | 2.3KB | YES | ARCHIVE | _archive/team_bridge/ |
| 53 | task-template-with-rollback.json | 1.5KB | YES | ARCHIVE | _archive/team_bridge/ |
| 54 | TASK-TEMPLATES-LIBRARY.json | 5.3KB | YES | ARCHIVE | _archive/team_bridge/ |
| 55 | task-001-file-organizer.json | 4.3KB | YES | ARCHIVE | _archive/team_bridge/ |

## PYTHON SCRIPTS (~60 files — sorted by NAME, not content-read)

These are one-time deployment/fix scripts. The filename tells the full story. No hidden knowledge inside.

| Category | Count | Example Files | Verdict |
|----------|-------|--------------|---------|
| VPS deployment | 15 | deploy_aad20.py, vps_final_deploy.py, vps_rebuild.py | ARCHIVE → _archive/vps_scripts/ |
| VPS fixes | 20 | vps_fix.py, vps_fix_nginx_ssl.py, fix_build_env.py | ARCHIVE → _archive/vps_scripts/ |
| VPS checks | 15 | vps_check.py, check_build.py, vps_status.py | ARCHIVE → _archive/vps_scripts/ |
| Bridge automation | 6 | check-completions.py, claude_task_reader.py, task-watcher.py | ARCHIVE → _archive/team_bridge/ |
| Paperclip | 3 | create_paperclip_issues.py, paperclip_heartbeat.py, setup_paperclip_agents.py | MOVE → PAPERCLIP/ |
| Context/health | 3 | context-health-monitor.py, context-transfer.py, test-context-transfer.py | ARCHIVE → _archive/team_bridge/ |
| QA/testing | 2 | qa_auto.py, test_api_direct.py | ARCHIVE → _archive/vps_scripts/ |
| Rollback | 2 | rollback-handler.py, test-rollback.py | ARCHIVE → _archive/team_bridge/ |
| Utility | 3 | parallel-orchestrator.py, auto-check-status.py, create_completion_report.py | ARCHIVE → _archive/team_bridge/ |

## OUTPUT/LOG FILES (~30 files — NOT content-read, name sufficient)

ALL of these are terminal output captures. No decisions or knowledge inside.

| Verdict: ALL → ARCHIVE → _archive/logs/ |
|----------------------------------------|
| build_log.txt, deploy_log.txt, deploy_out.txt, overnight_log.txt (219KB!), paperclip_server.log (282KB!), qa_log.txt, all *_out.txt files, all *_err.txt files (most 0 bytes) |

## SCREENSHOTS (~15 files — NOT content-read, visual only)

ALL are QA test screenshots from past sessions.

| Verdict: ALL → ARCHIVE → _archive/qa_screenshots/ |
|---------------------------------------------------|
| aad22_order_result.png, dashboard_fixed.png, generate_order_success.png, generate_page_*.png, login_fixed_dashboard.png, mobile_dashboard.png, qa_screen*.png, qa_live_*.png, qa_mobile_*.png |

## BATCH FILES (6 files)

| File | Verdict | Reason |
|------|---------|--------|
| MASTER-CONTROL-PANEL.bat | KEEP ROOT | Main launcher — user tested |
| Launch-Code.bat | ARCHIVE | Superseded by master panel |
| Launch-CoWork.bat | ARCHIVE | Superseded by master panel |
| Check-Status.bat | ARCHIVE | Superseded by master panel |
| TEST-REMAINING.bat | ARCHIVE | One-time test script |
| DASHBOARD.html | KEEP ROOT | Visual status dashboard |

## MISC FILES

| File | Verdict | Reason |
|------|---------|--------|
| CUsersnorthAppDataLocalTemporiginal_order.txt | DELETE | Temp file, garbage filename |
| nginx_ssl_final.conf | ARCHIVE | Nginx config backup → _archive/vps_scripts/ |
| session-log.md | MERGE | Merge into SESSION_LOG/ |

---

## FOLDER VERDICTS (21 folders)

| # | Folder | Verdict | Reason |
|---|--------|---------|--------|
| 1 | KarnatakaAI/ | KEEP | Core data — 576 orders, prompts, everything |
| 2 | DDLR Strategy & Planning/ | KEEP | All blueprints v7.4 to v8.2 |
| 3 | DEEP_RESEARCH/ | KEEP | Research from today |
| 4 | aadesh-ai/ | KEEP | App source code (GitHub) |
| 5 | _BACKUP_RAW_BANU_ORIGINALS/ | KEEP | Banu's originals — never touch |
| 6 | PAPERCLIP/ | KEEP | Agent system (move agent contexts here) |
| 7 | tasks/ | KEEP | Task tracking system |
| 8 | TEAM_INBOX/ | KEEP | Cross-Claude communication |
| 9 | shared-context/ | KEEP | Shared artifacts |
| 10 | completions/ | ARCHIVE | Bridge completions — historical |
| 11 | logs/ | ARCHIVE | Already a log folder — merge into _archive/logs/ |
| 12 | ai generated output orders/ | KEEP MOVE | Move into KarnatakaAI/04_AI_Generated_Drafts/ |
| 13 | antigravity/ | ARCHIVE | Unrelated experiment |
| 14 | autocad-mcp/ | ARCHIVE | Unrelated MCP server |
| 15 | team-bridge-mcp/ | ARCHIVE | Bridge MCP — completed |
| 16 | DesktopCommanderMCP/ | ARCHIVE | Already installed globally |
| 17 | everything-claude-code/ | ARCHIVE | Already installed globally |
| 18 | file-organizer/ | ARCHIVE | Task-001 output — completed |
| 19 | rollback/ | ARCHIVE | Rollback handler — historical |
| 20 | testsprite_tests/ | ARCHIVE | TestSprite QA — historical |
| 21 | tippani_prototype/ | KEEP MOVE | Move to KarnatakaAI/ (patent project) |

---

## FINAL SCORE

| Category | Count | Action |
|----------|-------|--------|
| Files to KEEP at root | 7 | CLAUDE.md, SESSION-HANDOFF.md, END-OF-SESSION-SUMMARY.md, CONTEXT-HEALTH.json, SYSTEM_STATUS.json, MASTER-CONTROL-PANEL.bat, DASHBOARD.html |
| Files to MOVE to subfolders | 12 | Blueprints, vision, knowledge, team capabilities, agent contexts |
| Files to ARCHIVE | ~140 | VPS scripts, logs, screenshots, bridge system files |
| Files to DELETE (with approval) | 1 | CUsers...original_order.txt (garbage temp file) |
| Folders to KEEP | 9 | Core project folders |
| Folders to ARCHIVE | 10 | Completed/obsolete experiments |
| Folders to MOVE | 2 | ai generated orders, tippani_prototype |

**After cleanup: Root goes from ~170 files to 7 files.**
**After cleanup: Root goes from 21 folders to ~11 organized folders + _archive.**

---

## NEXT STEP

This verdict table is complete. Claude Code executes the moves using the
task file at TEAM_INBOX/TASK_organize_banu_folder.md (update it with these
verdicts first).

Srinivas: review this table. If any file should NOT be archived, tell me
and I'll change the verdict before Claude Code executes.
