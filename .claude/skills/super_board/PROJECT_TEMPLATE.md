# Super Board — Project Onboarding Template

Use this template when setting up Super Board for a new GitHub repository or project board.

## Prerequisites
- [ ] GitHub CLI installed and authenticated: `gh auth login`
- [ ] GitHub Project board created (classic or new Projects v2)
- [ ] Repository cloned locally
- [ ] Python 3.11+ / Node.js installed (matching project stack)
- [ ] CLAUDE.md exists in repo root

## Step 1 — Get your GitHub Project ID

```bash
# List your projects
gh project list --owner <your-github-username>

# Note the project NUMBER (e.g. 1, 2, 3)
# And the project node ID (used in API calls)
gh api graphql -f query='{ viewer { projectsV2(first: 10) { nodes { id number title } } } }'
```

## Step 2 — Get field IDs for your Status column

```bash
gh api graphql -f query='
{
  node(id: "<PROJECT_NODE_ID>") {
    ... on ProjectV2 {
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
        }
      }
    }
  }
}'
```
Copy the field ID for "Status" and the option IDs for: To Do, In Progress, In Review, Done, Blocked.

## Step 3 — Fill in CONFIG_TEMPLATE.md

Copy `CONFIG_TEMPLATE.md` to `.claude/super_board_config.json` and fill in all IDs from Steps 1-2.

## Step 4 — Initialize state file

```bash
cat > .claude/super_board_state.json << 'EOF'
{
  "pipeline_runs": [],
  "active_issue": null,
  "last_sync": null,
  "baseline_coverage": null
}
EOF
```

## Step 5 — Set QA baseline

Run the test suite on main and save the baseline:
```bash
git checkout main
python -m pytest tests/ --cov=src --cov-report=json:.claude/qa_baseline.json -q
```

## Step 6 — Test the pipeline end-to-end

```bash
# In Claude Code:
/superboard sync           # verify GitHub connection
/superboard status         # should show open issues
/superboard run <issue>    # pick a simple issue to test
```

## Step 7 — Add to CLAUDE.md

Append the Super Board section to your CLAUDE.md (see the section added automatically by setup).

## Troubleshooting

| Error | Fix |
|-------|-----|
| `gh: command not found` | Install: https://cli.github.com |
| `GraphQL error: Could not resolve` | Check PROJECT_NODE_ID in config |
| `No issues found` | Check label filters in config |
| Pipeline stuck | Check `.claude/super_board_state.json` and reset `active_issue` to null |
