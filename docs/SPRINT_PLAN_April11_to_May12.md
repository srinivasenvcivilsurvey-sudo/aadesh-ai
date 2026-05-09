# AADESH AI — SPRINT PLAN
# April 11 → May 12, 2026 (31 days to RAI deadline)
# Created by: Cowork | Date: April 11, 2026

---

## GOAL: By May 12, Banu is actively using the app AND RAI submission is filed.

---

## WEEK 1 — April 11–17: FIX QUALITY + MERGE PIPELINE

| Day | Task | Who | TEAM_INBOX file | Done? |
|-----|------|-----|----------------|-------|
| Apr 11 | 🔴 Send Anthropic DPA email | **Srinivas** | — | ☐ |
| Apr 11 | 🔴 Validate V3.2.2 on Machohalli PDF | Claude Code | TASK1_validate_v322.md | ☐ |
| Apr 12 | 🔴 Run all 5 PDFs with V3.2.2 | Claude Code | (TASK1 continuation) | ☐ |
| Apr 12 | 🔴 Merge Kiro pipeline into main app | Claude Code | TASK2_merge_kiro_pipeline.md | ☐ |
| Apr 13 | 🔴 Wire PII redaction + DB columns | Claude Code | TASK4_db_pii_hardening.md | ☐ |
| Apr 13 | 🟡 Set up UptimeRobot + Sentry | Claude Code | TASK3_monitoring_setup.md | ☐ |
| Apr 14 | 🔴 Wire PDF upload to AI pipeline | Claude Code | (new task after TASK2) | ☐ |
| Apr 15 | 🔴 Wire clarifying questions UI | Claude Code | (new task after TASK2) | ☐ |
| Apr 16 | 🟡 Test full pipeline end-to-end locally | Claude Code | (new task) | ☐ |
| Apr 17 | 🔴 Deploy all changes to VPS | Claude Code | (new task) | ☐ |

**Week 1 Goal: Banu can upload a PDF → get a clarifying questions screen → download a scored order.**

---

## WEEK 2 — April 18–24: BANU PILOT + ENTITY LOCK

| Day | Task | Who | Done? |
|-----|------|-----|-------|
| Apr 18 | 🔴 Give Banu live app link + test with 1 real case | **Srinivas + Banu** | ☐ |
| Apr 18 | 🔴 Build Entity Lock verification screen | Claude Code | ☐ |
| Apr 19 | 🟡 Fix any bugs Banu reports from first test | Claude Code | ☐ |
| Apr 20 | 🟡 Add rate limiter (5 orders/day) to live app | Claude Code | ☐ |
| Apr 21 | 🟡 Test Razorpay payment end-to-end (test mode) | Srinivas | ☐ |
| Apr 22 | 🟡 Supabase custom domain db.aadesh-ai.in | Claude Code | ☐ |
| Apr 23 | 🟡 Add VPS security: SSH key auth (remove password) | Claude Code | ☐ |
| Apr 24 | 🟡 Collect Banu feedback on 3+ orders | **Srinivas + Banu** | ☐ |

**Week 2 Goal: Banu has generated 3+ orders. Entity Lock is active. Razorpay tested.**

---

## WEEK 3 — April 25 – May 1: QUALITY REFINEMENT + RAI PREP

| Day | Task | Who | Done? |
|-----|------|-----|-------|
| Apr 25 | 🔴 Process Banu's feedback → update system prompt | Cowork + Claude Code | ☐ |
| Apr 26 | 🔴 Re-test PDFs with updated system prompt | Claude Code | ☐ |
| Apr 27 | 🟡 Add Terms of Service + Privacy Policy pages | Claude Code | ☐ |
| Apr 28 | 🟡 Add DPDP consent screen at first login | Claude Code | ☐ |
| Apr 29 | 🔴 Draft Karnataka RAI submission (use kiro draft) | **Srinivas + Cowork** | ☐ |
| Apr 30 | 🟡 Add credit refund logic on API failure | Claude Code | ☐ |
| May 1 | 🟡 Add email notification on order generated | Claude Code | ☐ |

**Week 3 Goal: System prompt at 90+ quality. RAI submission draft finalized.**

---

## WEEK 4 — May 2–8: POLISH + RAI SUBMISSION

| Day | Task | Who | Done? |
|-----|------|-----|-------|
| May 2 | 🔴 Final E2E test with Banu (3 real cases) | **Srinivas + Banu** | ☐ |
| May 3 | 🔴 Fix any remaining issues from E2E test | Claude Code | ☐ |
| May 4 | 🟡 VPS upgrade to 4GB RAM (before wider launch) | Srinivas + Claude Code | ☐ |
| May 5 | 🔴 Submit Karnataka RAI letter | **Srinivas** | ☐ |
| May 6 | 🟡 GeM registration (FREE, builds credibility) | **Srinivas** | ☐ |
| May 7 | 🟡 Add Billing Name field at checkout (GST invoices) | Claude Code | ☐ |
| May 8 | 🟡 Buffer day — fix anything remaining | Both | ☐ |

**Week 4 Goal: RAI submitted. 3 validated real orders. App is fully legal-compliant.**

---

## FINAL DAYS — May 9–12: DEADLINE BUFFER

| Day | Task | Who | Done? |
|-----|------|-----|-------|
| May 9–11 | Handle any emergency fixes | Claude Code | ☐ |
| **May 12** | **🔴 HARD DEADLINE: RAI Committee submission closes** | **Srinivas** | ☐ |

---

## TASK PRIORITY LEGEND
| Symbol | Meaning |
|--------|---------|
| 🔴 | Critical — project fails if not done |
| 🟡 | Important — needed for proper operation |
| 🟢 | Nice to have — Phase 1 material |

---

## TASKS FOR SRINIVAS (no code required)

These are YOUR tasks — Claude cannot do them for you:

| # | Task | Time | When |
|---|------|------|------|
| 1 | Send Anthropic DPA email | 5 min | **TODAY** |
| 2 | Sign up UptimeRobot (after Claude Code sets up /health) | 5 min | Apr 13 |
| 3 | Sign up Sentry.io (free account) | 5 min | Apr 13 |
| 4 | Test Razorpay payment with your own card | 30 min | Apr 21 |
| 5 | Give Banu the link + sit with him for first test | 1 hr | Apr 18 |
| 6 | Send Karnataka RAI submission letter | 30 min | **May 5** |
| 7 | GeM registration (startup registration) | 30 min | May 6 |

---

## TASKS FOR CLAUDE CODE (paste these in VS Code)

Tell Claude Code: *"Check TEAM_INBOX. There are 4 tasks. Start with TASK1."*

Tasks in TEAM_INBOX:
1. `FROM_COWORK_2026-04-11_TASK1_validate_v322.md` ← START HERE
2. `FROM_COWORK_2026-04-11_TASK2_merge_kiro_pipeline.md`
3. `FROM_COWORK_2026-04-11_TASK3_monitoring_setup.md`
4. `FROM_COWORK_2026-04-11_TASK4_db_pii_hardening.md`

---

## TASKS FOR COWORK (next planning session)

1. After Task 1 results come back → analyze scores → write V3.2.3 patches if needed
2. After Task 2 results come back → review what pipeline looks like in live app
3. After Banu's first feedback → update system prompt with real-world corrections
4. Finalize Karnataka RAI submission letter (use Kiro draft as base)
5. Plan Phase 1 feature set (multi-user, Nudi conversion, auto-classify)

---

*Created by Cowork on April 11, 2026. Update checkboxes as tasks complete.*
