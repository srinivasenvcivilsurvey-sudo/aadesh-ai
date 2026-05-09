# STATUS REALITY CHECK — Aadesh AI

**Generated:** April 9, 2026
**Purpose:** Single source of truth. What is REAL vs what is PLANNED vs what is CLAIMED.
**Rule:** No hype. No optimism. Just facts.

---

## ✅ WHAT IS REAL (working right now)

| Item | Evidence |
|------|----------|
| Domain + SSL | https://aadesh-ai.in responds 200 OK |
| Next.js app deployed | 14 files, 1,521 lines in `aadesh-ai/nextjs/` |
| Google OAuth | Banu logged in with banu.test@aadesh-ai.in |
| Razorpay integration | 4 packs configured in code (not yet tested with real payment) |
| DOCX download | docxtpl + Noto Sans Kannada working locally |
| Sonnet 4.6 quality | 100/100 score PROVEN on Hesaraghatta test in Claude Project |
| Supabase Mumbai | 5 tables with RLS. Working. |
| VPS | DigitalOcean Bangalore 165.232.176.181, Ubuntu 24.04, 1GB RAM, 2GB swap, PM2 + Nginx |
| GitHub repo | srinivasenvcivilsurvey-sudo/aadesh-ai |
| System Prompt V3.2.1 | 383 lines, 17 rules, active |
| 37 curated reference orders | Appeals_40/ folder |
| 6 Banu test PDFs | KarnatakaAI/SAMPLE_CASE_INPUT/ |
| Base44 admin dashboard | Built with SAMPLE data, not connected to real Supabase yet |
| Blueprint v9.2 | Locked. 668 lines. Saved to DDLR Strategy & Planning/ and Notion. |

---

## 🟡 WHAT IS PARTIALLY REAL (started but incomplete)

| Item | What's done | What's missing |
|------|-------------|----------------|
| Test DOCX generation | 1 test case (Hesaraghatta 129) scored 85/100 | 5 remaining Banu test PDFs not yet run |
| Banu pilot | Login given, 20 credits added | Zero real orders generated yet, zero feedback received |
| PDF Vision pipeline | Works in Claude Project chat | NOT wired into live app via Supabase Edge Function |
| Generation pipeline | Works end-to-end in chat | NOT rebuilt in live app with prompt caching |
| Prompt caching | Architecture designed | NOT implemented in code |
| Quality guardrails | 4 guardrails defined | Self-audit loop not yet built in app |

---

## 🔴 WHAT IS PLANNED BUT NOT STARTED (Phase 0 backlog)

| # | Task | Why critical | Time |
|---|------|--------------|------|
| 1 | Test remaining 5 Banu PDFs locally | Validates quality across case types | 1 day |
| 2 | Supabase custom domain db.aadesh-ai.in | India block protection | 2 hrs |
| 3 | Prompt caching in live app | Cost control | 2 days |
| 4 | PDF upload via Edge Function | VPS OOM protection | 1 day |
| 5 | Clarifying questions UI | Quality driver (proven +6 to +16 points) | 0.5 day |
| 6 | Privacy policy + consent + AI disclaimer | DPDP compliance | 0.5 day |
| 7 | **PII redaction layer** | DPDP CRITICAL — citizen names must not leave India | 1 day |
| 8 | Credit refund on API failure | Trust — if Banu pays and generation fails | 0.5 day |
| 9 | Sentry error monitoring (FREE) | Operations — crashes are invisible without this | 30 min |
| 10 | UptimeRobot health check (FREE) | Operations — silent downtime kills trust | 15 min |
| 11 | Per-user rate limit (5/day) | Cost protection — spam = bankruptcy | 2 hrs |
| 12 | VPS security hardening | Public IP = automated scanning target | 1 hr |
| 13 | prompt_version in orders table | Quality tracking across prompt updates | 15 min |
| 14 | Anthropic DPA | Legal — DPDP compliance | 1 hr |
| 15 | **Entity Lock verification screen** | LEGAL CRITICAL — BNS forgery shield | 2 hrs |
| 16 | **Karnataka RAI Committee submission** | **HARD DEADLINE MAY 12** — 33 days | 1 day |
| 17 | Billing Name field at checkout | GST invoices for officer reimbursement | 1 hr |
| 18 | Terms of Service (Kannada + English) | Legal enforceability | 0.5 day |
| 19 | Test with 3 real Banu cases E2E | Validation | 1 day |
| 20 | Give Banu login, monitor first 5 orders | Real user validation | 2 days |

**Phase 0 total:** ~14 days of focused work. **0 of 20 started in code.**

---

## ❌ WHAT WAS CLAIMED BUT IS NOT REAL

| Claim | Reality |
|-------|---------|
| "App generates Kannada orders" | YES in Claude Project chat. NO in live app with proper pipeline (needs rebuild of pipeline with caching). |
| "100/100 quality" | TRUE for ONE tested case in Claude Project. Not yet validated across 5 case types. |
| "Ready for Banu" | Banu has login. App is live. But generation pipeline is not yet rebuilt with v9.2 architecture. |
| "Sarvam Startup credits" | APPLIED March 28. Zero response as of April 9. 12 days overdue. Assume DENIED until proven otherwise. |
| "Karnataka RAI compliant" | PLANNED. Not yet submitted. Must submit before May 12. |
| "PII redaction" | DESIGNED in blueprint. NOT built in code. Citizen data currently flows unredacted if app is used. |

---

## 🔥 HIGHEST ACTUAL RISK RIGHT NOW

| # | Risk | Why it's the top risk |
|---|------|----------------------|
| 1 | **May 12 RAI deadline miss** | If we miss the representation window, may be classified "high-risk" and forced to pause. 33 days. |
| 2 | **Entity Lock screen not built** | Every order downloaded without verification = potential BNS forgery exposure for officer + us |
| 3 | **PII redaction not built** | Citizen data going to US servers without masking = DPDP exposure at scale |
| 4 | **VPS OOM crash** | 1GB RAM will crash at 3-4 concurrent users. Phase 1 upgrade required but not done. |
| 5 | **Banu has no real feedback yet** | Pilot user pilot not started. Every day wasted = lost learning. |

---

## 💰 REAL ECONOMICS (not projections)

| Item | Number |
|------|--------|
| Revenue earned to date | **Rs 0** |
| Paying users | **0** |
| Actual monthly cost | ~Rs 5,000 (VPS + Supabase + domain) |
| API cost per order (realistic avg) | Rs 18-20 |
| Break-even | 8 paid orders/month |
| Days until cash burn matters | Unknown (founder funded) |

---

## 📍 GROUND TRUTH SUMMARY (one paragraph)

The app is live at aadesh-ai.in with basic auth, billing, and UI. The generation pipeline that produced 100/100 quality exists ONLY inside Claude Project chat — NOT yet rebuilt in the live app with prompt caching, PII redaction, Entity Lock, or self-audit. Blueprint v9.2 defines exactly what to build. Phase 0 has 20 tasks, ~14 days of work, zero started in code. First user Banu has login but zero real orders. Karnataka RAI Committee representation is the single hardest deadline at 33 days. Base44 admin dashboard is built with sample data. Strategy is DONE. Execution has not begun.
