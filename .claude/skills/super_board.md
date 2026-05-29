# Super Board — Autonomous Pipeline Orchestrator

## Purpose
Super Board is the master orchestrator for AadeshAI's autonomous development pipeline. It coordinates issue intake from GitHub Projects, dispatches sub-agents for build/QA/review, and posts results back to the board automatically.

## When to invoke
- `/superboard` — open the interactive dashboard
- `/superboard run <issue-number>` — run full pipeline on a specific issue
- `/superboard status` — show pipeline state for all open issues
- `/superboard sync` — pull latest GitHub Project board state

## Pipeline stages

```
GitHub Issue Created
       │
       ▼
  [super_board] ──► Triage & assign priority
       │
       ▼
  [super_build] ──► Implement the feature / fix
       │
       ▼
  [super_qa]    ──► Run tests, lint, type-check
       │
       ▼
  [super_review] ─► Code review + security scan
       │
       ▼
  PR Created + GitHub Project card moved to "Review"
```

## Core responsibilities
1. **Issue ingestion** — read open issues from GitHub Projects via `gh` CLI or API
2. **Context loading** — read CLAUDE.md, graphify-out/GRAPH_REPORT.md, and relevant source files
3. **Agent dispatch** — invoke super_build → super_qa → super_review in sequence
4. **State tracking** — maintain `.claude/super_board_state.json` across pipeline runs
5. **Board updates** — move GitHub Project cards and post progress comments

## State file: `.claude/super_board_state.json`
```json
{
  "pipeline_runs": [],
  "active_issue": null,
  "last_sync": null,
  "config": "see CONFIG_TEMPLATE.md"
}
```

## GitHub CLI commands used
```bash
gh issue list --json number,title,labels,assignees
gh issue view <number> --json body,comments
gh pr create --title "..." --body "..." --base main
gh project item-edit --id <item-id> --field-id <field-id> --project-id <proj-id> --single-select-option-id <option-id>
```

## Failure handling
- If super_build fails → post comment on issue, move card to "Blocked", stop pipeline
- If super_qa fails → create sub-issue for each failing test, continue to review
- If super_review fails → request human review, do NOT auto-merge

## Usage example
```
/superboard run 42
```
This will: load issue #42, implement the fix, run QA, perform review, open a PR, and update the board — all autonomously.
