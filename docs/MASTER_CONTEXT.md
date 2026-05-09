# AADESH AI — MASTER CONTEXT FILE
# Version: 3.0 | Updated: April 14, 2026
# READ THIS FIRST — every Claude session (Chat, Cowork, Code) must read this.

> ⚠ **SUPERSEDED PRICING NOTICE — 2026-04-27**
> Pricing tables in this document (Pack A/B/C/D, Section 18) are outdated.
> Current source of truth: `AADESH_AI_PRICING_DECISION_v2.md`
> Launch packs:
> - Trial (1 free order, internal only — never a Razorpay object)
> - Starter ₹999 / 3 orders
> - Regular ₹1,499 / 5 orders
> - Pro ₹2,499 / 10 orders
> Bulk and Power packs are HIDDEN until 20-30 paid orders prove real cost.
# This is the SINGLE SOURCE OF TRUTH. Never delete. Keep growing it.

---

## 1. WHO ARE WE

**Product:** Aadesh AI (ಆದೇಶ AI) — AI drafting assistant for any office that writes formal documents
**Website:** https://aadesh-ai.in (LIVE ✅)
**Founder:** Srinivasa T — non-technical, business & domain expert. Bengaluru.
**First user:** Banu — MALE, DDLR caseworker, Bangalore South
**Login:** banu.test@aadesh-ai.in (49 credits loaded)

**What it does:**
Officer uploads 5-20 best past orders → uploads new case PDF →
AI reads it → asks clarifying questions → generates complete formal order
in Sarakari Kannada → officer reviews → downloads .docx → signs and submits.
Replaces human drafter (₹1,000-2,000/order). Aadesh AI costs ₹109-142/order.

**UNIVERSAL PRODUCT:** Not DDLR-only. Any office (government OR private),
any document type. Same engine, any content. User uploads their own
docs → AI mimics their style. Never hardcode DDLR/Kannada on landing page.

---

## 2. HOW THE 3 CLAUDE TOOLS WORK TOGETHER

Srinivas uses **Claude Desktop App** (NOT VS Code). It has 3 tabs:
| Tab | Role |
|-----|------|
| Claude Chat / Cowork | BRAIN — strategy, tasks, Notion updates |
| Claude Code | HANDS — coding, testing, SSH, file ops |
| New chat session | Also BRAIN — reads this file, picks up from last session |

**Bridge:** `C:\Users\north\OneDrive\Attachments\Desktop\Banu\`
- `TEAM_INBOX/FROM_COWORK_*.md` → tasks for Claude Code
- `TEAM_INBOX/FROM_CODE_*.md` → results from Claude Code
- `TEAM_LOG.md` → full session history
- `MASTER_CONTEXT.md` → this file

---

## 3. FOLDER MAP

```
Banu/
├── MASTER_CONTEXT.md           ← YOU ARE HERE (read first)
├── SESSION-HANDOFF.md          ← Quick next-session guide
├── TEAM_LOG.md                 ← Full history
├── TEAM_INBOX/                 ← Cowork ↔ Code bridge
│   ├── FROM_COWORK_*.md
│   ├── FROM_CODE_*.md
│   └── ARCHIVE/
│
├── aadesh-ai/nextjs/           ← PRODUCTION APP (live at aadesh-ai.in)
│   ├── src/lib/sarvam.ts       ← AI routing (Sarvam default + manual override)
│   ├── src/lib/pipeline/       ← 12 pipeline lib files
│   ├── src/components/pipeline/ ← 6 UI step components
│   ├── src/app/api/pipeline/   ← 5 API routes
│   ├── src/app/app/pipeline/   ← 6-step wizard page
│   ├── src/components/LandingPage.tsx ← Full landing page (rebuilt Apr 13)
│   ├── .github/workflows/      ← keepalive.yml (pings /api/health every 6h)
│   └── .env.local              ← ALL keys (DO NOT COMMIT)
│
├── KarnatakaAI/
│   ├── SAMPLE_CASE_INPUT/      ← 6 Banu test PDFs
│   ├── 10_Cloud_Project.../Appeals_40/ ← 37 reference orders
│   └── 11_DDLR_App/
│       ├── DDLR_SYSTEM_PROMPT_V3_2_6.md ← ACTIVE SYSTEM PROMPT
│       ├── phase0_test_v2.py   ← Quality test script
│       └── RESULTS_*.json      ← Test scores
│
├── DDLR Strategy & Planning/
│   ├── AADESH_AI_BLUEPRINT_v9_2_2.md   ← ACTIVE BLUEPRINT (LOCKED)
│   ├── KARNATAKA_RAI_SUBMISSION_DRAFT.md ← Ready to send before May 12
│   └── ANTHROPIC_DPA_EMAIL_DRAFT.md    ← Ready to send to privacy@anthropic.com
│
└── _ARCHIVE/kiro_2026-04-11/   ← Archived (already merged into main app)
```

---

## 4. LIVE SYSTEM STATE (April 14, 2026)

### Production (aadesh-ai.in):
| Item | Status |
|------|--------|
| App | ✅ LIVE |
| Health | ✅ https://aadesh-ai.in/api/health → {"status":"ok","version":"0.1.0"} |
| PM2 | ✅ online, 0 restarts, ~96MB RAM |
| Supabase | ✅ ACTIVE_HEALTHY — GitHub Actions keepalive prevents auto-pause |
| Google OAuth | ✅ Working |
| Credits system | ✅ Built — deducts on export, badge in header |
| Landing page | ✅ Rebuilt April 13 — all 9 sections live |

### VPS:
| Item | Value |
|------|-------|
| Provider | DigitalOcean Bangalore |
| IP | 165.232.176.181 |
| Source code | /root/aadesh-ai-src/nextjs |
| Live build | /root/aadesh-ai |
| PM2 restart | `source .env.local && pm2 restart aadesh-ai --update-env` |

### Database (Supabase Mumbai):
| Item | Value |
|------|-------|
| Project ref | uyxkjhzaqmzoqvjodhcb |
| URL | https://uyxkjhzaqmzoqvjodhcb.supabase.co |
| Users | 6 |
| Orders | 29 |
| New columns | profiles.personal_prompt, training_status, prompt_generated_at ✅ |
| New columns | orders.prompt_version, generation_cost_rupees, word_count, credits_used ✅ |
| Storage | references bucket created with RLS ✅ |

---

## 5. BUG STATUS (April 14, 2026)

| # | Bug | Status | Notes |
|---|-----|--------|-------|
| B3 | VisionReadingStep not sending PDF | ✅ FIXED | April 12 |
| B5 | Wrong system prompt in generate route | ✅ FIXED | V3.2.6 wired April 12 |
| F7 | Reference orders not per-user | ✅ FIXED | Per-user refs from Supabase April 12 |
| F6 | No credit refund on API failure | ✅ FIXED | Auto-refund built April 12 |
| F4 | Rate limit 5/day too low | ✅ FIXED | Changed to 10/day April 12 |
| F3 | No React ErrorBoundary | ⏳ PENDING | Claude Code task sent April 14 |
| B6 | piiRedactor regex bug | ✅ FIXED | April 12 |
| B1 | .env.local unquoted value | LOW | Works via PM2, harmless |
| B2 | Stale Server Action cache | LOW | Normal Next.js behaviour |
| B4 | officerAnswers passed as any | MEDIUM | Low priority |
| F2 | VPS 1GB RAM OOM at 3-4 users | HIGH | Upgrade to 4GB before user #4 |
| F5 | API keys syncing to OneDrive | MEDIUM | Rotate keys when time allows |

### New items from April 14:
| # | Item | Status |
|---|------|--------|
| N1 | Dommasandra PDF validate bug (pdf-lib crash) | ⏳ Claude Code task sent |
| N2 | Privacy policy page /privacy | ⏳ Claude Code task sent |
| N3 | AI provider selector in pipeline UI | ⏳ Claude Code task sent |
| N4 | Sarvam as default model (all cases) | ⏳ Claude Code task sent |
| N5 | Pricing update in all files | ⏳ Claude Code task sent |

---

## 6. QUALITY SCORES — Full History

| Prompt | Machohalli | Average | Key change |
|--------|-----------|---------|------------|
| V3.2.1 | 80 | 76.0 | Baseline |
| V3.2.2 | 72 ⬇️ | ~74 | Patches bloated words |
| V3.2.3 | 76 | ~76 | Trim not working |
| V3.2.4 | 87 | 87.2 | **+11 pts — per-section word budgets** |
| V3.2.5 | 88 | 87.6 | Minor, KLR backfired |
| **V3.2.6** | **91** | **89.2** | Trim fixed, delay auto-detect |
| V3.2.7 | — | — | Waiting for Banu real feedback |

**Active prompt:** `KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_6.md`
**DO NOT** run more synthetic tests before Banu gives real feedback.

---

## 7. API COST TRACKING (UPDATED April 14, 2026)

| Event | Cost | Balance |
|-------|------|---------|
| Start | — | $50.00 |
| Thinking accident (morning Apr 11) | -$11.15 | $38.85 |
| V3.2.3-V3.2.6 testing + Claude Code builds | -$21.85 | **$17.00 ← current** |

### Real cost per order (confirmed from console):
| Metric | Value |
|--------|-------|
| Useful spend | $21.85 |
| Orders generated in testing | ~60 |
| **Real cost per order** | **$0.36/order** |
| Safety buffer (1.5x) | $0.54/order |
| USD/INR rate (April 14, 2026) | ₹93.34 |
| **Safe cost budget in ₹** | **₹50/order** |
| With 18% GST on imported service | included in ₹50 |

**⚠️ Old figure of ₹24/order was WRONG — based on theory not real testing.**
**Correct safe budget: ₹50/order.**

---

## 8. GIT HISTORY (all on main branch)

| Hash | Commit |
|------|--------|
| 8971f58 | fix: allow generation with 0 references (new users unblocked) |
| (Apr 14) | feat: credits system — deduct on export, badge in header |
| (Apr 14) | feat: cost tracking — estimateCostRupees in export-docx |
| (Apr 13) | fix: landing page hydration bug, hero CTA, pricing note |
| 9e18f46 | feat: full sprint — refs, personal prompt, pii, rate limits |
| 8c195f1 | ci: add keepalive workflow |

---

## 9. ARCHITECTURE DECISIONS (locked — do not re-debate)

| # | Decision |
|---|---------|
| D1 | Claude Sonnet 4.6 direct API (not OpenRouter) |
| D2 | No RAG — full 1M context (100/100 vs 62/100) |
| D3 | Sarvam = vision OCR fallback only |
| D4 | B2C first — no procurement approval needed |
| D5 | Do NOT rebuild — improve phase by phase |
| D6 | max_tokens = 12000 (Kannada ~14 tokens/word) |
| D7 | NO thinking mode for generation (template task, 7x cost zero benefit) |
| D8 | Sarvam removed from generation as auto-route |
| D-9.41 | PDF on Next.js server for Phase 0 (migrate to Edge Function at user #4) |
| D-9.42 | pipeline/rateLimiter.ts = single limiter (10/day) |
| D-9.43 | Pipeline UI at /app/pipeline/ |
| D-9.44 | Sarvam context too small for generation (confirmed) |
| **D-10** | **Sarvam = DEFAULT for ALL cases (free). Claude/OpenRouter = manual officer selection only** |
| **D-11** | **AI provider selector in pipeline UI: 3 cards — Sarvam (default/free), Claude (₹50/order), OpenRouter** |

---

## 10. TECH STACK

| Component | Tool | Cost |
|-----------|------|------|
| Primary AI | Sarvam 105B (default, FREE) | ₹0/order |
| Premium AI | Claude Sonnet 4.6 (manual select) | ~₹50/order |
| Framework | Next.js 15 | Free |
| Database | Supabase Mumbai (ap-south-1) | Free (upgrade at 3+ users) |
| Hosting | DigitalOcean Bangalore VPS | ₹1,250/mo |
| Payments | Razorpay | Per-txn (3.53%) |
| Auth | Google OAuth via Supabase | Free |
| Keepalive | GitHub Actions (every 6h) | Free |

**Monthly infra total:** ~₹5,000 | **Break-even:** 4 Pack A sales/month

---

## 11. HARD DEADLINES

| Date | Task | Status |
|------|------|--------|
| **April 30** | 1M beta header retirement | ✅ Already clean |
| **May 5** | Submit RAI Committee draft | ⏳ **21 days** |
| **May 12** | Karnataka RAI Committee deadline | ⏳ 28 days |
| **User #4** | Upgrade VPS to 4GB + migrate PDF to Edge Function | When needed |

---

## 12. SRINIVAS TODO (in priority order)

| # | Task | File/Link | Time |
|---|------|-----------|------|
| 1 | **Send Banu the URL** | aadesh-ai.in | 2 min |
| 2 | Update Razorpay — deactivate old 4 links, create 4 new | razorpay.com/dashboard | 15 min |
| 3 | Send Anthropic DPA email | `DDLR Strategy & Planning/ANTHROPIC_DPA_EMAIL_DRAFT.md` → privacy@anthropic.com | 5 min |
| 4 | Delete .env.vps file (security) | Banu root folder | 1 min |
| 5 | Submit RAI letter | `DDLR Strategy & Planning/KARNATAKA_RAI_SUBMISSION_DRAFT.md` | Before May 5 |
| 6 | Upgrade Supabase to Pro ($25/mo) | supabase.com/dashboard | When 3+ users |

### Razorpay update (Task 2 detail):
- Deactivate: ₹499, ₹999, ₹1,999, ₹4,999 links
- Create new: ₹999, ₹1,999, ₹3,499, ₹5,999 links
- Update RAZORPAY amounts in VPS .env.local if hardcoded

---

## 13. NEXT SESSION PRIORITY (for Claude Code)

Check TEAM_INBOX for results from April 14 tasks first.

**Pending tasks sent April 14:**
1. N4 — Sarvam as default model (all cases), AI provider selector UI
2. N1 — Dommasandra PDF validate bug fix
3. F3 — React ErrorBoundary
4. N2 — Privacy policy page /privacy
5. N5 — Pricing update across all files

**After Claude Code confirms all done:**
- Send Banu the URL
- Watch PM2 logs during Banu's first test
- Collect real errors → V3.2.7 prompt based on real feedback only

---

## 14. USEFUL COMMANDS

```bash
# Quality test locally:
cd "KarnatakaAI/11_DDLR_App"
python phase0_test_v2.py

# VPS via DigitalOcean console (root login):
cd /root/aadesh-ai-src/nextjs
source .env.local && pm2 restart aadesh-ai --update-env
pm2 logs aadesh-ai --lines 50

# TypeScript check:
cd aadesh-ai/nextjs
npx tsc --noEmit

# Git log:
git log --oneline -10
```

---

## 15. IMPORTANT NOTES FOR NEW SESSIONS

1. **Supabase auto-pause:** GitHub Actions keepalive (every 6h) prevents this.
2. **PM2 restart must use `--update-env`** otherwise server-side env vars are missing
3. **Never use thinking mode** for order generation (D7 — 7x cost, zero benefit)
4. **kiro/ folder is archived** — do not look for it, everything was merged
5. **Blueprint v9.2.2 is LOCKED** — no strategy changes until Banu validates
6. **Do NOT run more quality tests** until Banu gives real feedback
7. **Sarvam is now DEFAULT** — Claude only when officer manually selects (D-10)
8. **Real cost is ₹50/order** (Claude). Sarvam = FREE. (D-11)

---

## 16. ANTHROPIC API PRICING (April 2026 — exact rates)

| Token type | Rate (USD) |
|-----------|-----------|
| Input tokens | $3.00 per million |
| Output tokens | $15.00 per million |
| Cache write (first time) | $3.75 per million |
| Cache read (cached hit) | $0.30 per million |

**India markup:** Add 21% (2-3% forex + 18% GST on imported services)

### Real cost confirmed from Anthropic console (April 14, 2026):
| Metric | Value |
|--------|-------|
| Total spend to date | $33 ($50 - $17 remaining) |
| Useful testing spend | $21.85 |
| Orders generated | ~60 |
| **Actual cost/order** | **$0.36** |
| **With 1.5x safety buffer** | **$0.54 = ₹50** |
| USD/INR rate | ₹93.34 |

---

## 17. BUSINESS MODEL & REVENUE (UPDATED April 14, 2026)

### New pricing packs (⚠️ UPDATE RAZORPAY):

| Pack | Price | Credits | Revenue/order | Cost/order | **Margin** |
|------|-------|---------|---------------|------------|-----------|
| Trial | FREE | 3 | ₹0 | ₹50 | Loss leader |
| **Pack A** | **₹999** | **7** | **₹142** | ₹50 | **64%** |
| **Pack B** | **₹1,999** | **18** | **₹111** | ₹50 | **53%** |
| **Pack C** | **₹3,499** | **32** | **₹109** | ₹50 | **52%** |
| **Pack D** | **₹5,999** | **55** | **₹109** | ₹50 | **52%** |

*Margin calculated after Razorpay fee (3.53%) and ₹50/order safe cost*

### Razorpay fee: 3.53% per transaction
| Pack | Razorpay fee | Net received | Cost | Net profit |
|------|-------------|-------------|------|-----------|
| Pack A ₹999 | ₹35.27 | ₹963.73 | ₹350 (7×₹50) | **₹613.73** |
| Pack B ₹1,999 | ₹70.60 | ₹1,928.40 | ₹900 (18×₹50) | **₹1,028.40** |
| Pack C ₹3,499 | ₹123.52 | ₹3,375.48 | ₹1,600 (32×₹50) | **₹1,775.48** |
| Pack D ₹5,999 | ₹211.77 | ₹5,787.23 | ₹2,750 (55×₹50) | **₹3,037.23** |

### Break-even:
- Monthly infra: ₹5,000
- Pack A profit: ₹613/sale → need **8 Pack A sales/month**
- Pack B profit: ₹1,028/sale → need **5 Pack B sales/month**

### GST:
- Register proactively at ₹15 lakh revenue (not ₹20L)
- Razorpay reports ALL transactions to GSTN monthly

---

## 18. API KEYS LOCATION

| Key | Location | Used for |
|-----|----------|---------|
| ANTHROPIC_API_KEY | `aadesh-ai/nextjs/.env.local` + VPS `.env.local` | Claude (manual select) |
| SARVAM_API_KEY | Same .env.local files | Vision OCR + default generation |
| OPENROUTER_API_KEY | Same .env.local files | Manual select option |
| NEXT_PUBLIC_SUPABASE_URL | Same | Database URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Same | Public DB access |
| SUPABASE_SERVICE_ROLE_KEY | Same | Server-side DB (admin) |
| RAZORPAY_KEY_ID / SECRET | Same | Payments |
| GOOGLE_CLIENT_ID / SECRET | Same | OAuth |

⚠️ **Security issues:**
- `.env.local` syncs to OneDrive (exposure risk) — rotate keys
- `.env.vps` in Banu root has VPS password — DELETE this file

---

## 19. SUPABASE SCHEMA (5 tables)

```sql
profiles     — user account + credits + officer details
             — new columns: personal_prompt, training_status,
               prompt_generated_at ✅ (added April 12)
references   — uploaded reference orders per user ✅ WIRED
orders       — generated orders history + token tracking
             — new columns: prompt_version, generation_cost_rupees,
               word_count, credits_used, input_tokens, output_tokens,
               acknowledgement_at ✅ (added April 14)
transactions — payment records from Razorpay
audit_log    — DPDP compliance log (planned Phase 1)
```

**Current data:** 6 users, 29 orders, 0 transactions (no paying users yet)

---

## 20. RAI COMMITTEE — COMPLIANCE STRATEGY

**Deadline:** May 12, 2026 (Karnataka RAI interim report)
**⚠️ Only 28 days remaining. Submit by May 5.**
**Our classification target:** "Medium-risk" (human-in-the-loop)

**Why we qualify as medium-risk (not high-risk):**
- Officer always reviews and signs — AI never submits autonomously
- India VPS (Bangalore) + PII redaction before Anthropic API
- Full audit trail
- AI disclaimer watermark on every output

**Submission file:** `DDLR Strategy & Planning/KARNATAKA_RAI_SUBMISSION_DRAFT.md`

**Gujarat HC precedent (April 2026):** HC banned AI for drafting final orders.
Our framing: "drafting assistant" not "order generator" — officer always verifies.

---

## 21. GITHUB REPOSITORY

| Item | Value |
|------|-------|
| Repo | https://github.com/srinivasenvcivilsurvey-sudo/aadesh-ai |
| Branch | main |
| Auto-deploy | NO — manual VPS deploy required after each push |

### Deploy commands (run on VPS after git push):
```bash
cd /root/aadesh-ai-src/nextjs
git pull origin main
npm install --legacy-peer-deps
npm run build
cp -r .next/standalone/. /root/aadesh-ai/
cp -r .next/static /root/aadesh-ai/.next/static
cp -r public /root/aadesh-ai/public
source .env.local && pm2 restart aadesh-ai --update-env
```

---

## 22. WHAT IS BUILT vs WHAT IS NOT (April 14, 2026)

### ✅ BUILT AND WORKING:
- Google OAuth login
- Razorpay billing (4 packs — prices need Razorpay update)
- Dashboard with order history
- 6-step pipeline UI (/app/pipeline/)
- Claude Vision PDF reading
- Clarifying questions (structured outputs)
- Order generation (Anthropic SDK + Sarvam, adaptive thinking, 1h caching)
- Entity Lock verification screen
- PII redaction (server-side, before API)
- DOCX download (Noto Sans Kannada font)
- /api/health endpoint
- Daily rate limiting (10/day) ✅
- DPDP consent checkbox
- Language toggle (Kannada/English)
- Full landing page (rebuilt April 13) ✅
- Mobile-responsive UI
- Audit logging
- GitHub Actions keepalive (every 6h) ✅
- Reference upload page (/app/my-references) ✅
- Auto-prompt generator (triggers at 5+ refs) ✅
- Per-user reference orders from Supabase ✅
- Credits badge in header ✅
- Credit deduction on export ✅
- Auto-refund on API failure ✅
- Cost tracking per order (generation_cost_rupees) ✅
- Generation unblocked for 0-ref users (new users) ✅

### ⏳ PENDING (Claude Code tasks sent April 14):
- Sarvam as default model + AI provider selector UI
- Dommasandra PDF validate bug fix
- React ErrorBoundary
- Privacy policy page /privacy
- Pricing update in all files

### ❌ NOT BUILT YET:
- Sentry error monitoring
- Supabase custom domain db.aadesh-ai.in
- "Delete my data" account deletion
- Bhashini voice input (Phase 1)
- WhatsApp referral system (Phase 1)
- B2G / department pricing (Phase 2)
- Supabase self-hosting (Phase 1)
- Admin dashboard (Base44 prototype exists, not connected)
- Real Razorpay payment flow (billing page is placeholder — Srinivas must update)

---

## 23. SARVAM AI — STATUS & THREAT

### Current use (updated April 14):
- **Vision OCR** — fallback when Claude Vision fails
- **DEFAULT generation model** — all case types (D-10, April 14)
- **Cost: FREE** — officers use this by default at no API cost

### Competitive threat:
- Sarvam launched **Chanakya** (March 31, 2026) — air-gapped govt AI platform
- Signed MoUs: Odisha (Feb 6), Tamil Nadu (Feb 2026)
- Karnataka MoU likely next — **our window: 6-18 months**

### Strategy:
- Do NOT partner with Sarvam (they are a competitor)
- Race to get 50+ individual users before Chanakya arrives

---

## 24. TRACK 1 vs TRACK 2 STRATEGY

```
TRACK 1 (NOW):                     TRACK 2 (LATER — when 50+ users):
Individual officers                 Department / Government procurement
Pay from own pocket                 Department budget
Like Netflix subscription           Like enterprise software
No approval needed                  DC / Revenue Secretary approval
₹999-5,999 packs                   ₹4-5 lakh/year/office
Word of mouth                       Formal tender process
```

**DigitalOcean is NOT MeitY-empanelled** — Track 2 requires migration to AWS Mumbai or Azure Pune.

---

## APRIL 14, 2026 — SESSION UPDATE

### KEY DECISIONS THIS SESSION
1. **Real API cost confirmed:** $0.36/order from Anthropic console ($17 balance remaining from $50)
2. **Safe cost budget: ₹50/order** ($0.36 × 1.5 safety × ₹93.34 USD/INR)
3. **ALL pricing revised** — old pricing had Pack C/D losing money
4. **Sarvam set as default** for all cases (D-10) — Claude only on manual select
5. **AI provider selector** added to pipeline UI (D-11)

### NEW PRICING (LOCKED April 14)
- Pack A: ₹999/7 orders (64% margin)
- Pack B: ₹1,999/18 orders (53% margin)
- Pack C: ₹3,499/32 orders (52% margin)
- Pack D: ₹5,999/55 orders (52% margin)

### TOOLS EXPLORED THIS SESSION
- DesignArena (designarena.ai) — free AI design tool, used to prototype landing page
- Caveman Claude Code skill — cuts 65-75% output tokens, install via GitHub
- DesignArena generated landing page validated our design (navy/gold, bilingual)

### SRINIVAS MUST DO (before next session)
1. **Update Razorpay** — deactivate old 4 links, create 4 new at new prices
2. **Send Banu the URL** — app is ready, Banu has 49 credits
3. **Send Anthropic DPA email** — file is ready at ANTHROPIC_DPA_EMAIL_DRAFT.md

### NEXT SESSION MUST DO
1. Check TEAM_INBOX — confirm Claude Code completed April 14 tasks
2. Verify pricing update is live on aadesh-ai.in
3. Banu tests — watch PM2 logs, collect real errors
4. V3.2.7 prompt only after Banu real feedback
5. RAI submission — 21 days left, do not delay further


---
## APRIL 18, 2026 — SESSION UPDATE (appended)

### WORK COMPLETED TODAY

**Infrastructure fixes (Claude Code):**
- CI/CD pipeline `deploy.yml` fixed — root cause of Apr 18 16:44 UTC outage.
  Was copying only .next/static/, not standalone runtime. Fixed + verified with
  real push. Workflow run 24609653904 ✅
- Sarvam BUG-L2 fixed — `reasoning_effort: 'low'` added to sarvam.ts
  (commit 977f1ac2). Stops `content: null` returns from 105B reasoning eating tokens.
- BUG-L3 fixed — max_tokens reduced 8192 → 4096 (Sarvam starter tier cap)
  (commit f0a97a25)
- BUG-L4 fixed — removed invalid `effort`/`thinking` params from Claude fallback
  (commit f0a97a25)
- **E2E verified:** Real Kannada order generated via Banu test account.
  2,757 chars proper Sarakari Kannada, Sarvam 105B primary path, cost ₹0.
- package.json bumped 0.1.0 → 0.1.1

**Known issues still open:**
- OpenRouter fallback #3 at 97 credits — will fail if Sarvam + Claude both down
- buildSha shows "unknown" in /api/health — NEXT_PUBLIC_BUILD_SHA not wired
- .gitconfig on pull-only token — Claude Code needs Playwright for owner pushes

### SARVAM AI RESEARCH — COMPREHENSIVE FINDINGS

Research sources: (1) Official Sarvam docs pulled directly Apr 18, (2) Perplexity
deep research, (3) Gemini deep research. Cross-referenced for consistency.

#### Current Sarvam Model Lineup (April 2026 — verified)

| Model | Size | Status | Cost |
|-------|------|--------|------|
| Sarvam Vision | 3B VLM | ✅ Active (Feb 2026) | **₹1.50/page, max 10 pages/job** |
| Sarvam 105B | 105B MoE (~10.3B active) | ✅ Active (Feb 2026) | **₹0/token — confirmed free** |
| Sarvam 30B | 30B MoE | ✅ Active (Feb 2026) | **₹0/token — confirmed free** |
| Sarvam-M | 24B hybrid | 🔶 Legacy | ₹0/token |
| Saaras v3 | STT | ✅ Active | ₹30/hour audio |
| Bulbul v3 | TTS | ✅ Active | ₹30/10K chars |
| Sarvam Translate v1 | Translation 23 langs | ✅ Active | ₹20/10K chars |
| Mayura v1 | Translation 11 langs | ✅ Active | ₹20/10K chars |
| **Sarvam Akshar** | Vision workbench layer | ✅ Active (Feb 2026) | Handwriting + grounded reasoning |
| **Chanakya** | Air-gapped gov/defense vertical | ✅ Active (Mar 29 2026) | Enterprise negotiated |
| **Arya** | Multi-agent orchestration stack | ✅ Active (Feb 2026) | Enterprise |

#### Verified Pricing (Apr 18 — from Sarvam pricing page)

- Sign-up credits: Pricing page says ₹1,000, rate-limits docs say ₹100.
  **Conflict in Sarvam's own docs.** Srinivas's account has 877 credits remaining
  from the ₹1,000 legacy starter bonus. New signups today likely get ₹100 only.
- Plans: Starter (pay-as-you-go), Pro (₹10,000 + ₹1,000 bonus), Business
  (₹50,000 + ₹7,500 bonus), Enterprise (custom)
- Vision pricing — Feb 2026 free promo ENDED. Now firm ₹1.50/page.
- 105B / 30B = ₹0/token VERIFIED via our dashboard (used 290K + 45.8K tokens, paid ₹0)
- Our 90-day actual spend: ₹122.17 total (mostly Bulbul v3 + 3 Vision pages + 7 min Saaras)

#### Rate Limits — critical constraints

**Vision rate limits are UNIFORM across ALL plans — upgrading does NOT help:**
- Document Intelligence (vis-doc-dig): 10 req/min provisioned, 20 burst, 5 high-tput
- Vision real-time (vis-rt): 30 req/min provisioned

**105B / 30B chat limits:**
- Starter: 40 rpm provisioned, 60 burst, 5 high-tput
- Pro: 60 rpm, 80 burst, 20 high-tput
- Business: 120 rpm, 200 burst, 50 high-tput

**105B max_tokens Starter tier = 4,096 hard cap.** Long orders truncate here.

#### Benchmarks (Sarvam self-reported, not independently reproduced)

On **Sarvam's own Indic OCR Bench** (20,267 samples):
- Kannada: Sarvam Vision 89.89% word accuracy
- Kannada: Claude Opus 4.5 = 77.41% (Sarvam's benchmark)
- Kannada: Gemini 3 Pro = 87.36%
- Kannada: GPT-5.2 = 26.49% (collapses on Indic scripts)

On **olmOCR-Bench English:**
- Sarvam Vision 84.3% > Gemini 3 Pro 80.2% > GPT-5.2 69.8%

**Reasoning benchmarks (Sonnet 4.6 vs Sarvam 105B):**
- Composite: Sonnet 84 vs Sarvam 60
- SWE-bench: Sonnet 79.6% vs Sarvam 45.0%
- GPQA: Sonnet 79.7% vs Sarvam 73.8%

**Implication:** Sarvam wins OCR on Indic. Claude wins reasoning. Hybrid makes sense.

Sarvam's benchmarks are NOT independently verified — all citations trace back to
Sarvam's own Feb 2026 blog post. Treat as directional, not definitive.

#### DPDP / Data Residency — CONFLICTING CLAIMS ⚠️

| Source | Claim | Credibility |
|--------|-------|-------------|
| Sarvam Privacy Policy (Aug 2024, primary) | "May use Input and Output to train and improve product" | ✅ Primary source — default is they train on our data |
| Sarvam Terms of Use | User consent required for training; denying consent may revoke access | ✅ Primary source |
| LinkedIn governance critique (Feb 2026) | Consumer data retained indefinitely, processed via US cloud | 🟡 Expert opinion |
| Perplexity research | No public DPA, no DPDP cert, DPA likely enterprise-only | ✅ Consistent with Sarvam policy |
| **Gemini research** | "SOC 2 Type II + ISO 27001 certified, readily executes DPAs, zero-retention" | 🔴 **NOT VERIFIED — likely hallucinated.** Not on Sarvam website |

**Trust hierarchy locked:** Official docs > Perplexity (cites sources) > Gemini
(tends to confabulate compliance claims). Never cite Gemini-sourced DPDP/SOC claims
in RAI submission without primary-source verification.

**Safe RAI Committee statement:**
"Sarvam is India-based, uses Indian compute infrastructure, and is DPDP-aware."

**Do NOT claim without signed contract:**
"Zero retention, zero training, SOC 2 certified."

**Action required BEFORE migration:** Email developer@sarvam.ai requesting DPA +
no-retention + no-training guarantee for government land records use case.

#### Vendor Stability

- Raising $250-350M at $1.5B valuation (Bloomberg Apr 2, 2026)
- Investors: Nvidia, Bessemer, Amazon, HCL, Accel, Peak XV
- Last closed: $41M Series A (Dec 2023)
- IndiaAI Mission compute subsidy (~₹200 crore GPU allocation)
- No reported layoffs or key departures in 2026
- Confidence Sarvam exists in 3-5 years: HIGH

#### Competition Risk — Chanakya & Arya vs Aadesh AI

- Chanakya: central ministries, PSUs, defense, critical infrastructure
- Arya: enterprise ETL data extraction
- **Neither is a self-serve SaaS for DDLR/caseworker drafting**
- Risk: GoI partners / SIs could build Aadesh-like product on Sarvam infra
- Mitigation: Deep domain specialization + model-agnostic architecture

#### Sarvam Vision API Pattern (new architectural consideration)

**NOT synchronous** — async job-based flow only:
1. `create_job(language="kn-IN", output_format="md")` → returns job_id
2. `upload_file(pdf)`
3. `start()`
4. Poll status OR use webhook callback until complete
5. `download_output(zip_path)` → extract .md and .json from ZIP

**Key implication:** Migration from Claude's sync API to Sarvam's async requires
refactoring Vision step end-to-end. Frontend must show job progress/polling, not
blocking spinner. ~2-3 weeks focused engineering.

#### Decision Framework Matrix

| Option | Cost/order | Kannada OCR | Reasoning | DPDP | RAI story | Risk |
|--------|-----------|-------------|-----------|------|-----------|------|
| A: Claude everything | ~₹8 | 77% | Best | 🔴 US processing | Weak | Low |
| B: Full Sarvam | ~₹15 | 90% | Weaker | 🟡 Needs contract | Strongest | Medium |
| C: Hybrid (Sarvam OCR + Claude gen) | ~₹16 | 90% | Best | 🟡 Needs contract | Strong | Low |

**Current recommendation: Option C (Hybrid)** — pending:
(1) Benchmark results from Apr 18 A/B test (Claude Code running now)
(2) DPA response from Sarvam

### DECISIONS LOCKED THIS SESSION

- **D-9.45**: Sarvam Vision migration blocked until (a) A/B benchmark passes
  >80% Kannada accuracy on real DDLR PDFs AND (b) written DPA from Sarvam
  confirming zero retention + no training. Default Sarvam policy = they train on data.
- **D-9.46**: If migrating to Sarvam Vision, Claude Vision stays as fallback
  triggered by: API errors, timeout, quality gate fail on critical fields
  (case number, party names, survey numbers).
- **D-9.47**: 105B starter-tier 4096 token cap is a real constraint. Long orders
  either upgrade tier or route to Claude generation path.
- **D-9.48**: Trust hierarchy for vendor research: Official docs > Perplexity
  (cites sources) > Gemini (may hallucinate compliance claims). RAI submission
  must use primary sources only.

### KARNATAKA RAI COMMITTEE — NEW INTEL (Apr 2026)

- **Chair:** Kris Gopalakrishnan (Infosys co-founder)
- **Co-lead:** N Manjula, Secretary, Department of Electronics/IT/Biotech/S&T
- **Interim report:** 60 days from formation
- **Final recommendations:** 90 days
- **Karnataka AI Cell** exists under DPAR e-Governance — Principal Secretary
  Pankaj Kumar Pandey, IAS. This is likely our Track 2 door, NOT RDPR.
- Committee will produce: policy framework + AI risk classification + adoption roadmap
- Prohibited AI practices list includes: social scoring, unlawful surveillance,
  discriminatory profiling

**Our classification target:** Medium-risk (human-in-the-loop). Officer always
reviews and signs. AI never submits autonomously.

### TODO — NEXT SESSION (priority order)

1. Read A/B benchmark results: `TEAM_INBOX/FROM_CODE_2026-04-18_sarvam_vision_benchmark.md`
2. Run Banu E2E test on live site (still pending)
3. Draft + send DPA email to developer@sarvam.ai
4. Update RAI submission — add Kris Gopalakrishnan + Karnataka AI Cell references
5. Based on benchmark + DPA response → implement Option A/B/C
6. Top up OpenRouter credits (97 remaining, fallback safety net)

### SESSION NUMBERS (for reference)

- Sarvam credits remaining: 877 of original 1,000
- Sarvam 90-day spend: ₹122.17 (3 Vision pages + 7 min STT + 42K TTS chars)
- Anthropic API balance: ~$26.55 (approx, last checked Apr 12)
- VPS: aadesh-ai.in live, 0 restarts since fix
- Banu test account: 49 credits, 0 reference uploads, 0 real orders generated yet
- Quality score: 91/100 (V3.2.6, synthetic tests — waiting for Banu real feedback)
- Deadline: Karnataka RAI submission May 5 = **17 days remaining**



---
## APRIL 19, 2026 — SESSION UPDATE (V1.0 LOCK + V3.2.7 PROD DEPLOY)

### 🆕 TWO PROMPT LINEAGES NOW LOCKED

**Production lineage (aadesh-ai.in):**
- `system_prompt.md` = **V3.2.7** (deployed today, was stuck at V3.2.1)
- 22 rules; fixes Machohalli_163 bugs: party swap, header duplication, Section 10 token-loop repetition
- 3 new rules: Rule 21 (Party-Role Lock), Rule 22 (Header Once), Section 10 fixed sub-sections
- Model: Sonnet 4.6 adaptive

**Claude Project lineage (DDLR Bangalore South on claude.ai):**
- `V1.0` = V3.2.1 base + Rule 18 (doc conflict resolution) + Rule 19 (Section 8 hard-mandatory) + Rule 20 (strip advocate Bar Council roll nos) + terminology (ಪರವಾನಗಿ ಸಂಖ್ಯೆ / ನಕ್ಷೆ) + REVIEW NOTE block
- Model: Opus 4.7 adaptive
- Saved: `KarnatakaAI\11_DDLR_App\Claude_Project_Prompts\DDLR_PROJECT_PROMPT_V1_0_2026-04-19.md`
- Standard 5-prompt workflow: `DDLR_Standard_Prompts_V1_0.md` (same folder)

**⚠️ NEVER MIX LINEAGES.** Production `system_prompt.md` and Claude Project V1.0 are separate environments with different orchestration.

### MODEL AVAILABILITY (Apr 16 change)

Opus 4.6 **DEPRECATED**. Only options now:
- Opus 4.7 adaptive (stricter instruction-following, new tokenizer 1.0–1.35× more tokens for Kannada, vision 3.75MP)
- Sonnet 4.6 adaptive

Extended-thinking budgets removed on Opus 4.7 — adaptive is the only thinking mode.

### TEST SCORE JOURNEY (Claude Project — V3.2.1 → V1.0)

| Test | Date | PDF | Model | Prompt | Score |
|------|------|-----|-------|--------|-------|
| 4-8 | 17-Mar-26 | 5 synthetic | Opus 4.6 | V3.2.1 | 91.2% avg |
| 9 | 19-Apr-26 | Nagaruru Sy 4/1AB (108pg) | Opus 4.7 | V3.2.1 | **89.5%** |
| 10 | 19-Apr-26 | Tirumenahalli Sy 34 (50pg) | Opus 4.7 | **V1.0** | **98.1% ✅ G1 HARD PASS** |

### TEST 10 — ALL 5 V1.0 DELTAS FIRED ON FRESH PDF

Different case than Nagaruru (1 appellant / 6 respondents / 48-year-old impugned order):

1. ✅ **Rule 18** — flagged 4 document conflicts (appellant age 63 vs 65, PIN 560049 vs 562129, extent expression 5½ vs 5.8, parent extent 4A21G vs 5A1G) with source precedence cited for each
2. ✅ **Rule 19** — Section 8 table present with 3 rows (parent + 34/1 + 34/2); 7 [___] cells individually logged in REVIEW NOTE (no silent brackets)
3. ✅ **Rule 20** — stripped 2 advocate Bar Council roll numbers (KAR/1602/15 + KAR 1607/2015), name "ಶ್ರೀ ಹರೀಶ್ ಸಿ.ಎಸ್." retained
4. ✅ **Terminology** — ಪರವಾನಗಿ ಸಂಖ್ಯೆ used (not ಲೈಸೆನ್ಸ್), ನಕ್ಷೆ used (not ಸ್ಕೆಚ್)
5. ✅ **REVIEW NOTE block** — properly placed after FT-6, 6 sections (A-F), marked for pre-print deletion

### KEY DECISIONS THIS SESSION

- **D-9.55**: Two prompt lineages locked (Production V3.2.7 vs Claude Project V1.0). Never merge.
- **D-9.56**: V1.0 validated at 98.1% on fresh PDF. All 5 deltas fired. G1 HARD PASS. Proceed to Phase 2.
- **D-9.57**: Rollback trigger: any test <90/105 → revert Project to V3.2.1 immediately. Max 2 soft-fails before killing V1.0.

### VALIDATION PLAN (from V1.0 refinement round)

**Phase 1 (done):** Test 10 Tirumenahalli → 98.1% ✅
**Phase 2 (next):** Re-run Tests 4-8 on V1.0 to verify no regression vs 91.2% baseline
**Phase 3:** One fresh PDF Srinivas hasn't tested yet

**Gates:**
- G1 Test 9-type: ≥95/105 pass, <90 hard-fail → rollback
- G4 Test 4-8 avg: ≥92.5% pass, <91.2% hard-fail → rollback
- Individual drop >2 pts vs V3.2.1 baseline → hard-fail

### TODO — NEXT SESSION (priority order)

1. Run Banu's 3 remaining PDFs on V1.0 in Claude Project (Phase 2)
2. Score each on 105-point scorecard, compare vs 91.2% baseline
3. If avg ≥92.5% → lock V1.0 as canonical Project prompt
4. If any <90/105 → revert to V3.2.1 immediately
5. Read Sarvam A/B benchmark from Apr 18: `TEAM_INBOX/FROM_CODE_2026-04-18_sarvam_vision_benchmark.md`
6. Draft DPA email to developer@sarvam.ai
7. Update RAI submission (23 days to deadline)
8. Tell Banu to test production app (V3.2.7 live, Sarvam primary)

### FILES CREATED TODAY

- `KarnatakaAI\11_DDLR_App\Claude_Project_Prompts\DDLR_PROJECT_PROMPT_V1_0_2026-04-19.md`
- `KarnatakaAI\11_DDLR_App\Claude_Project_Prompts\DDLR_Standard_Prompts_V1_0.md`
- `KarnatakaAI\11_DDLR_App\Claude_Project_Prompts\README.md` (lineage separation note)
- `TEAM_INBOX/FROM_CODE_v3_2_prompt_audit_2026-04-19.md` (audit of 8 prompt versions)
- `SESSION_LOG/2026-04-19_V1_0_validation.md` (this session's full log)

### FILES MODIFIED TODAY

- Production `KarnatakaAI\11_DDLR_App\system_prompt.md` — V3.2.1 → V3.2.7 deployed
- `MASTER_CONTEXT.md` — this file (appended Apr 19 section)
- Notion hub (324290d32bc680649230c47760b400e5) — updated via Notion MCP
- Notion Claude Code Updates page (32f290d32bc6819e9653e1e760587186) — updated via Notion MCP
