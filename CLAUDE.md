## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Super Board — Autonomous Pipeline

AadeshAI uses the Super Board pipeline for autonomous issue-to-PR development.

### Commands
- `/superboard run <issue>` — full autonomous pipeline: build → QA → review → PR
- `/superboard status` — show pipeline state for all open issues
- `/superboard sync` — sync GitHub Project board
- `/superboard plan <issue>` — dry-run (show plan only, no code changes)
- `/superboard reset` — clear stuck pipeline lock
- `/superboard onboard` — first-time setup wizard

### Skill files
All pipeline skills live in `.claude/skills/`:
- `super_board.md` — orchestrator
- `super_build.md` — implementation agent
- `super_qa.md` — QA agent
- `super_review.md` — code review agent
- `super_board/PROJECT_TEMPLATE.md` — onboarding guide
- `super_board/CONFIG_TEMPLATE.md` — config reference

### Config & state
- `.claude/super_board_config.json` — GitHub Project IDs, pipeline settings (fill in from CONFIG_TEMPLATE.md)
- `.claude/super_board_state.json` — runtime state (auto-managed)

### First-time setup
Before running `/superboard run`, complete onboarding:
1. `gh auth login` (if not already authenticated)
2. Fill in `.claude/super_board_config.json` using `.claude/skills/super_board/CONFIG_TEMPLATE.md`
3. Run `python -m pytest tests/ --cov=src --cov-report=json:.claude/qa_baseline.json -q` on main to set QA baseline
4. Run `/superboard sync` to verify GitHub connection
