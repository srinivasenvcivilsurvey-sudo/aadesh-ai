# Super Build — Autonomous Implementation Agent

## Purpose
Super Build reads a GitHub issue and autonomously implements the required feature, fix, or refactor in the AadeshAI codebase. It is invoked by super_board after issue triage.

## Inputs (passed from super_board)
- `issue_number` — GitHub issue number
- `issue_title` — short description
- `issue_body` — full specification
- `labels` — e.g. `feature`, `bug`, `refactor`
- `priority` — critical / high / medium / low

## Build protocol

### Step 1 — Load context
```bash
# Read codebase map
cat graphify-out/GRAPH_REPORT.md        # god nodes, module structure
cat graphify-out/wiki/index.md          # if exists
cat CLAUDE.md                           # project rules & conventions
```

### Step 2 — Understand the issue
- Parse acceptance criteria from issue body
- Identify affected modules from graphify graph
- Check for existing related code with `grep -r`

### Step 3 — Plan
Write a brief implementation plan (5-10 bullet points) to `.claude/build_plan_<issue>.md` before writing any code.

### Step 4 — Implement
- Create a feature branch: `git checkout -b feat/issue-<number>-<slug>`
- Write code following project conventions in CLAUDE.md
- Add/update unit tests
- Update docstrings and type hints

### Step 5 — Self-verify
```bash
python -m pytest tests/ -x -q          # stop on first failure
python -m mypy src/ --ignore-missing-imports
python -m ruff check src/              # or eslint for JS/TS
```

### Step 6 — Handoff
Output a handoff JSON to `.claude/build_result_<issue>.json`:
```json
{
  "issue": 42,
  "branch": "feat/issue-42-add-auth",
  "files_changed": ["src/auth.py", "tests/test_auth.py"],
  "build_plan": ".claude/build_plan_42.md",
  "status": "success" | "partial" | "failed",
  "notes": "..."
}
```

## Conventions for AadeshAI
- Language: Python 3.11+ (primary), TypeScript (frontend)
- Style: ruff + black formatting, PEP 8
- Tests: pytest with fixtures in `tests/conftest.py`
- Branching: `feat/`, `fix/`, `refactor/` prefixes

## Do NOT
- Merge to main directly
- Skip writing tests for new logic
- Modify `.env` or secrets files
- Change `requirements.txt` / `package.json` without noting it in handoff
