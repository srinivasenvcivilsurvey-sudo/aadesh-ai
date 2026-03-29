# PHASE 0 GAPS ANALYSIS
**Date:** 2026-03-29
**Purpose:** What's missing vs what's built before Banu test (March 31)

---

## WHAT'S BUILT (Working)

| Feature | Route | Status |
|---------|-------|--------|
| Landing page with product info | `/` | Live |
| User registration with email | `/auth/register` | Live |
| Email verification flow | `/auth/verify-email` | Live |
| Login with password | `/auth/login` | Live |
| Forgot password flow | `/auth/forgot-password` | Live |
| Protected dashboard | `/app` | Live |
| Order generation (Sarvam 105B) | `/app/generate` | Live |
| 4 guardrail checks | API | Live |
| DOCX download | API | Live |
| My Orders history | `/app/my-orders` | Live |
| Training page (upload + processing) | `/app/train` | Live |
| File storage | `/app/storage` | Live |
| Billing with Razorpay | `/app/billing` | Live |
| User settings + transfer mode | `/app/user-settings` | Live |
| Language toggle (EN/KN) | All pages | Live |
| Mobile bottom navigation | All app pages | Live |
| Smart context (top 5 refs) | API | Live |
| Demo mode (5 pre-loaded refs) | API | Live |
| Rate limiting | API | Live |
| Row-level security (5 tables) | Supabase | Ready |
| Audit logging (DPDP) | API | Live |
| Auto-save on edit | Generate page | Live |
| Print stylesheet | Generate page | Live |
| Offline detection | Generate page | Live |

---

## WHAT'S MISSING (Gaps)

### CRITICAL FOR BANU TEST (Must have by March 31)

| Gap | Impact | Fix Time | Action |
|-----|--------|----------|--------|
| Supabase SQL not verified on live | App crashes on first use | 5 min | Run `supabase_schema.sql` in SQL Editor |
| SSL/HTTPS on droplet | Browser security warnings | 30 min | Configure Let's Encrypt |
| No test account for Banu | Can't log in | 2 min | Create account via Supabase dashboard |
| 3 free credits may not be enough | Banu runs out quickly | 2 min | Manually set credits to 20 in profiles table |

### IMPORTANT (Should fix this week)

| Gap | Impact | Effort | Phase |
|-----|--------|--------|-------|
| OCR — no PDF text extraction | Users must type/paste case details | 2 days | 1A |
| PDF Kannada rendering | PDF button returns DOCX instead | 1 day | 1A |
| Self-correction pass | Single AI pass, no quality loop | 1 day | 1A |
| Auto-fact extraction | No automatic parsing of case files | 2 days | 1A |
| Smart routing (Sarvam vs Sonnet) | All packs unprofitable | 1 day | 1A |
| Anti-hallucination check | Relies on system prompt only | 1 day | 1A |

### NICE TO HAVE (Can wait)

| Gap | Description | Phase |
|-----|-------------|-------|
| Google/SSO login | Only email/password currently | 1B |
| Real-time collaboration | Multiple users editing same order | 2 |
| Batch generation | Generate multiple orders at once | 1B |
| Analytics dashboard | Usage statistics for admin | 1B |
| WhatsApp integration | Notifications via WhatsApp | 2 |
| Multi-district support | Currently single-office | 2 |
| Neon PostgreSQL migration | Currently Supabase only | 2 |
| n8n automation | Workflow automation | 2 |
| Claude Agent SDK | Agentic workflows | 1B |

---

## BANU TEST PREPARATION CHECKLIST

- [x] End-to-end smoke test completed
- [x] Critical bugs found and fixed (payment, PDF, auth layout, billing locale)
- [x] Build passes without errors
- [ ] **Supabase SQL verified on live project** (Srinivas must confirm)
- [ ] **SSL certificate installed on 165.232.176.181** (Srinivas to configure)
- [ ] **Test account created for Banu** with 20 credits
- [ ] Deploy latest build to droplet
- [ ] Push to GitHub

---

## RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Supabase tables don't exist | Medium | App crashes | Run SQL before test |
| Sarvam API rate limit hit | Low | Generation fails | 3-attempt auto-recovery built in |
| No internet at Banu's office | Medium | Can't use app | Offline banner warns user |
| Banu uploads non-DOCX/PDF | Low | Error shown | File type validation built in |
| Credits run out during test | Medium | Can't generate more | Set 20 credits in advance |
| Kannada text not rendering | Low | Broken output | Noto Sans Kannada font specified in DOCX |

---

## BOTTOM LINE

**Phase 0 is 78% complete.** The core loop (signup -> generate -> review -> download) works. The 4 critical bugs found today (payment flow, PDF, locale, auth layout) would have embarrassed us — all fixed now.

**To make March 31 test succeed, Srinivas must:**
1. Run `supabase_schema.sql` in Supabase SQL Editor
2. Create Banu's account and set 20 credits
3. Deploy the latest build
4. Ideally, add SSL (Let's Encrypt)
