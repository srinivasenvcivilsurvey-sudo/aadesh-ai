# Super Review — Autonomous Code Review Agent

## Purpose
Super Review performs a structured code review on the feature branch, incorporating QA results, and either approves the PR for merge or requests changes. It posts a detailed review comment to GitHub.

## Inputs (from super_qa handoff)
- `branch` — feature branch
- `issue` — GitHub issue number
- `qa_result` — path to `.claude/qa_result_<issue>.json`
- `build_plan` — path to `.claude/build_plan_<issue>.md`

## Review protocol

### Step 1 — Load diff
```bash
git diff main...<branch> -- . ':(exclude)*.lock' ':(exclude)*.json' > .claude/review_diff.patch
```

### Step 2 — Load QA results
Read `.claude/qa_result_<issue>.json` for test/coverage/lint status.

### Step 3 — Review checklist

#### Correctness
- [ ] Implementation matches issue acceptance criteria
- [ ] Edge cases handled (null, empty, large input)
- [ ] Error handling present and specific (not bare `except`)
- [ ] No obvious logic bugs

#### Code quality
- [ ] Functions are focused (single responsibility)
- [ ] No code duplication (DRY)
- [ ] Naming is clear and consistent with existing codebase
- [ ] No magic numbers / strings (use constants)
- [ ] No dead code or commented-out blocks left in

#### Security
- [ ] No secrets or API keys hardcoded
- [ ] User inputs are validated / sanitised
- [ ] No SQL injection vectors (if applicable)
- [ ] Dependencies added are from reputable sources

#### Tests
- [ ] Tests cover happy path
- [ ] Tests cover error/edge cases
- [ ] Tests are readable and well-named
- [ ] No tests that always pass (assert True)

#### Documentation
- [ ] Public functions have docstrings
- [ ] Complex logic has inline comments
- [ ] CHANGELOG or relevant docs updated if needed

### Step 4 — AI-specific review (for AadeshAI)
- [ ] Prompt templates are versioned and stored in `prompts/`
- [ ] LLM calls have timeout and retry logic
- [ ] Token usage is logged for cost tracking
- [ ] Model name is not hardcoded (use config)
- [ ] Outputs are validated before use downstream

### Step 5 — Compose review
Format review as a structured GitHub comment with:
- Summary (1-2 sentences)
- ✅ Passed checks
- ⚠️ Warnings (non-blocking)
- ❌ Blocking issues (must fix before merge)
- Inline code suggestions where appropriate

### Step 6 — Post review & update board
```bash
# Post PR review
gh pr review <pr-number> --body "$(cat .claude/review_comment.md)" [--approve | --request-changes]

# Update GitHub Project card
gh project item-edit ...  # move to "Approved" or "Changes Requested"

# Comment on original issue
gh issue comment <issue> --body "PR #<pr> opened and reviewed. Status: ..."
```

### Step 7 — Output review result
Write `.claude/review_result_<issue>.json`:
```json
{
  "issue": 42,
  "pr_number": 99,
  "verdict": "approved" | "changes_requested" | "human_review_required",
  "blocking_issues": [],
  "warnings": [],
  "score": 95,
  "auto_merge_eligible": true
}
```

## Auto-merge rules
PR is eligible for auto-merge ONLY if ALL of:
- verdict = `approved`
- QA status = `passed`
- No blocking review issues
- Branch is up-to-date with main
- At least one human reviewer has approved (if `require_human_review: true` in config)
