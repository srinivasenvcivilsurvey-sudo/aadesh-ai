# Phase 0 Gap Analysis — What's Missing Before Banu Tests
**Date:** 2026-03-29 | **Deadline:** April 5, 2026 (7 days)

## CRITICAL BLOCKERS (must fix before Banu tests)

| # | Gap | Owner | Effort | Priority |
|---|-----|-------|--------|----------|
| 1 | **Supabase SQL not run** — profiles, orders, references, transactions, audit_log tables don't exist yet. Dashboard shows 0, orders don't save, credits don't work. | **Srinivas** | 5 min (copy-paste SQL) | P0 |
| 2 | **Supabase auth redirect URLs** — after email verification, user may not redirect back to app. Need to add `http://165.232.176.181` to Supabase Auth → URL Configuration → Redirect URLs. | **Srinivas** | 2 min | P0 |
| 3 | **HTTPS not configured** — government users may see "Not Secure" warning. Need Let's Encrypt certificate. | **Claude Code** | 15 min | P0 |

## HIGH PRIORITY (should fix before April 5)

| # | Gap | Detail | Effort |
|---|-----|--------|--------|
| 4 | PDF download broken | Currently returns DOCX when PDF requested. Needs Kannada font embedding. | 2 hours |
| 5 | No domain name | `http://165.232.176.181` is not memorable. Need `aadesh.ai` or similar. | 30 min + DNS |
| 6 | Credits not verified end-to-end | Credit deduction code exists but needs testing with real Supabase tables. | 30 min |
| 7 | Razorpay test mode | Payment integration exists but not tested with real keys. | 1 hour |

## MEDIUM PRIORITY (nice to have for Phase 0)

| # | Gap | Detail |
|---|-----|--------|
| 8 | OCR not implemented | Users must type/paste case details, can't upload scanned PDFs |
| 9 | No email notifications | No confirmation email after order generation |
| 10 | No admin dashboard | Can't see user count, order count, revenue |
| 11 | Smart routing not implemented | All orders go to Sarvam, no Claude Sonnet fallback |
| 12 | Self-correction pass missing | AI output not reviewed by second LLM pass |

## LOW PRIORITY (Phase 1A)

| # | Gap | Detail |
|---|-----|--------|
| 13 | No Nudi auto-conversion | Uploaded Nudi-encoded files not converted to Unicode |
| 14 | No file text extraction | Upload stores file but doesn't extract text for smart-context |
| 15 | No version control on orders | No parent_id/version_number tracking yet |
| 16 | No AI readiness test | No auto-test when user uploads 8+ files |

## Action Plan for Next 7 Days

| Day | Task | Who |
|-----|------|-----|
| Day 1 (Mar 29) | Run Supabase SQL + set redirect URLs | Srinivas |
| Day 1 (Mar 29) | Add HTTPS via Let's Encrypt | Claude Code |
| Day 2 (Mar 30) | End-to-end test: register → upload → generate → download | Both |
| Day 3 (Mar 31) | Fix any bugs found in testing | Claude Code |
| Day 4 (Apr 1) | Send URL to Banu, collect feedback | Srinivas |
| Day 5 (Apr 2) | Fix Banu's feedback | Claude Code |
| Day 6 (Apr 3) | Domain name setup (if ready) | Srinivas |
| Day 7 (Apr 4) | Final smoke test + buffer | Both |
| **Apr 5** | **DEADLINE: Banu actively using app** | |

## Smoke Test Results (Mar 29)

| Route | Status | Note |
|-------|--------|------|
| / (landing) | 200 PASS | |
| /auth/login | 200 PASS | |
| /auth/register | 200 PASS | |
| /auth/forgot-password | 200 PASS | |
| /app (dashboard) | 307 PASS | Redirects to login (correct) |
| /app/generate | 307 PASS | |
| /app/train | 307 PASS | |
| /app/my-orders | 307 PASS | |
| /app/billing | 307 PASS | |
| /app/user-settings | 307 PASS | |
| /app/storage | 307 PASS | |
| /api/generate-order (POST) | 405 PASS | GET not allowed (correct) |
| /api/orders (GET) | 401 PASS | Needs auth (correct) |

**Result: 13/13 routes responding correctly.**
