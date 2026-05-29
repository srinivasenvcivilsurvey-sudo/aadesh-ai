# Super Board — Configuration Template

Copy this to `.claude/super_board_config.json` and fill in your values.

## JSON Config

```json
{
  "_comment": "Super Board configuration for AadeshAI. Fill in all values before first run.",

  "github": {
    "owner": "srinivasenvcivilsurvey-sudo",
    "repo": "aadesh-ai",
    "default_branch": "main",
    "project_number": null,
    "project_node_id": "PVT_XXXXXXXXX",
    "status_field_id": "PVTSSF_XXXXXXXXX",
    "status_options": {
      "todo":             "OPTION_ID_TODO",
      "in_progress":      "OPTION_ID_IN_PROGRESS",
      "in_review":        "OPTION_ID_IN_REVIEW",
      "done":             "OPTION_ID_DONE",
      "blocked":          "OPTION_ID_BLOCKED",
      "changes_requested":"OPTION_ID_CHANGES_REQUESTED"
    }
  },

  "pipeline": {
    "auto_run_on_labels": ["ready-for-ai", "super-board"],
    "skip_labels": ["wont-fix", "duplicate", "human-only"],
    "max_concurrent_issues": 1,
    "branch_prefix": "feat",
    "commit_sign": true
  },

  "build": {
    "setup_commands": [
      "pip install -r requirements.txt --quiet"
    ],
    "lint_command": "python -m ruff check src/ --output-format=json",
    "format_command": "python -m black --check src/",
    "type_check_command": "python -m mypy src/ --ignore-missing-imports",
    "language": "python"
  },

  "qa": {
    "test_command": "python -m pytest tests/ --cov=src --cov-report=json:.claude/coverage.json -q",
    "coverage_threshold_overall": 80,
    "coverage_threshold_new_code": 60,
    "security_scan": true,
    "baseline_file": ".claude/qa_baseline.json"
  },

  "review": {
    "require_human_review": true,
    "auto_merge": false,
    "post_pr_comment": true,
    "post_issue_comment": true,
    "review_checklist": "default"
  },

  "notifications": {
    "post_to_issue": true,
    "labels_on_pr": ["super-board-pr"],
    "assignee_on_pr": null
  }
}
```

## How to get IDs

### Project node ID
```bash
gh api graphql -f query='{ viewer { projectsV2(first: 10) { nodes { id number title } } } }' | python -m json.tool
```

### Status field ID and option IDs
```bash
gh api graphql -f query='
{
  node(id: "PVT_XXXXXXXXX") {
    ... on ProjectV2 {
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id name
            options { id name }
          }
        }
      }
    }
  }
}' | python -m json.tool
```

## Environment variables (set in shell or .env)
```bash
export GITHUB_TOKEN=$(gh auth token)   # auto-populated by gh CLI
# Do NOT put tokens in the JSON config
```
