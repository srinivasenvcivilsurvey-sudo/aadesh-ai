# Super QA — Autonomous Quality Assurance Agent

## Purpose
Super QA runs the full quality gate on a feature branch produced by super_build. It verifies tests pass, checks code quality, validates coverage, and flags regressions before code review.

## Inputs (from super_build handoff)
- `branch` — the feature branch to test
- `files_changed` — list of modified files
- `issue` — GitHub issue number

## QA protocol

### Step 1 — Checkout branch
```bash
git fetch origin
git checkout <branch>
git pull origin <branch>
```

### Step 2 — Dependency check
```bash
pip install -r requirements.txt --quiet   # Python
npm ci                                     # if package-lock.json changed
```

### Step 3 — Lint & formatting
```bash
python -m ruff check src/ --output-format=json > .claude/ruff_report.json
python -m black --check src/
# For TS: npx eslint src/ --format json > .claude/eslint_report.json
```

### Step 4 — Type checking
```bash
python -m mypy src/ --ignore-missing-imports --json-report .claude/mypy_report
```

### Step 5 — Unit tests with coverage
```bash
python -m pytest tests/ \
  --cov=src \
  --cov-report=json:.claude/coverage.json \
  --cov-report=term-missing \
  --tb=short \
  -q 2>&1 | tee .claude/test_output.txt
```

### Step 6 — Coverage threshold check
- Minimum coverage: **80%** on changed files
- If below threshold: flag as `qa_warning`, do not block PR but annotate

### Step 7 — Security scan (lightweight)
```bash
pip show bandit > /dev/null 2>&1 && python -m bandit -r src/ -f json -o .claude/bandit_report.json || echo "bandit not installed, skipping"
```

### Step 8 — Output QA result
Write `.claude/qa_result_<issue>.json`:
```json
{
  "issue": 42,
  "branch": "feat/issue-42-add-auth",
  "status": "passed" | "warnings" | "failed",
  "tests": { "total": 50, "passed": 50, "failed": 0 },
  "coverage": { "overall": 87.3, "changed_files": 92.1 },
  "lint_errors": 0,
  "type_errors": 0,
  "security_issues": 0,
  "blocking": false,
  "notes": "..."
}
```

## Pass / fail criteria
| Check | Blocking |
|-------|----------|
| Test failures | ✅ Yes |
| Coverage < 60% on new code | ✅ Yes |
| Lint errors (error level) | ✅ Yes |
| Type errors | ✅ Yes |
| Coverage < 80% on new code | ⚠️ Warning |
| Lint warnings | ⚠️ Warning |
| Security issues (medium) | ⚠️ Warning |

## Regression detection
Compare coverage.json to `main` branch baseline stored in `.claude/qa_baseline.json`. If overall coverage drops more than 2%, flag as warning.
