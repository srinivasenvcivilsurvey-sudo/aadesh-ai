# /superboard — Super Board Command

Runs the Super Board autonomous development pipeline for AadeshAI.

## Usage

```
/superboard                        # Open interactive dashboard
/superboard run <issue-number>     # Run full pipeline on one issue
/superboard status                 # Show status of all active/recent runs
/superboard sync                   # Sync GitHub Project board state
/superboard plan <issue-number>    # Show build plan only (dry run, no code changes)
/superboard reset                  # Clear active_issue lock in state file
/superboard onboard                # Run first-time setup wizard
```

## What it does

When you run `/superboard run 42`, Claude will:

1. **Load context** — read CLAUDE.md, graphify graph, issue #42 from GitHub
2. **Triage** — determine priority, labels, affected modules
3. **Build** (super_build) — create branch, implement the feature/fix, write tests
4. **QA** (super_qa) — run lint, type checks, pytest with coverage
5. **Review** (super_review) — structured code review against checklist
6. **PR + board update** — open PR, move GitHub Project card, comment on issue

## Prerequisites

Before first use, complete the onboarding in `.claude/skills/super_board/PROJECT_TEMPLATE.md`:
- GitHub CLI authenticated (`gh auth status`)
- `.claude/super_board_config.json` filled in with your Project IDs
- `.claude/qa_baseline.json` generated from main branch
- `graphify-out/` exists (run `graphify update .` from project root)

## Skill files loaded by this command

| Skill | Purpose |
|-------|---------|
| `skills/super_board.md` | Orchestration logic |
| `skills/super_build.md` | Implementation agent |
| `skills/super_qa.md` | Quality assurance agent |
| `skills/super_review.md` | Code review agent |

## Config & state

- **Config:** `.claude/super_board_config.json`
- **State:** `.claude/super_board_state.json`
- **Logs:** `.claude/build_plan_<issue>.md`, `.claude/qa_result_<issue>.json`, `.claude/review_result_<issue>.json`

## Example session

```
You: /superboard run 17
Claude: Loading issue #17: "Add rate limiting to /api/chat endpoint"
        Affected modules: src/api/routes.py, src/middleware/
        Creating branch: feat/issue-17-rate-limiting
        [Building...] ✅ Implementation complete (3 files changed)
        [QA...] ✅ 47/47 tests passed, coverage 91%
        [Review...] ✅ All checks passed, no blocking issues
        PR #34 opened: "feat: add rate limiting to /api/chat (#17)"
        GitHub Project card moved to "In Review"
        Issue #17 updated with progress comment
```

## Troubleshooting

If the pipeline gets stuck, run `/superboard reset` to clear the lock, then retry.

Check `.claude/super_board_state.json` for the last known state.

For first-time setup, run `/superboard onboard` to walk through the PROJECT_TEMPLATE interactively.
