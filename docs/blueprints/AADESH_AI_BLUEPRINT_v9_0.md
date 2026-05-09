# AADESH AI — BLUEPRINT v9.0
# Date: April 5, 2026 | Status: ACTIVE
# This is the ONLY blueprint. v8.0-v8.2 are archived.
# Replaces: v8.0, v8.0 Addendum, v8.1 Addendum, v8.2 Two-Track Model

---

## A. WHAT IS AADESH AI (One Line)

A personal AI drafter for Karnataka government officers. Upload your best orders, upload a new case file, AI reads it, asks questions, generates the order in YOUR style. Like training a junior clerk who never forgets — but faster, cheaper, better.

**Customer:** Individual officer (DDLR / AC / Tahsildar / DC / any Karnataka govt office)
**Price:** Rs 42-100 per order (credit packs). Cheaper than Rs 1,000-2,000 human drafter.
**Model:** B2C first (officer pays from pocket). B2G later (department pays budget).
**Moat:** Zero competitors in Kannada government order drafting. Per-user style learning.

---

## B. TWO-TRACK GO-TO-MARKET

```
TRACK 1: INDIVIDUAL (NOW)              TRACK 2: DEPARTMENT (LATER)
Officer pays from pocket                Department pays from budget
Like paying a drafter                   Like buying office software
Price: Rs 42-100/order (packs)          Price: Rs 4-5 lakh/year/office
Growth: Word of mouth                   Growth: Formal procurement
Approval: NONE needed                   Approval: DC / Revenue Secretary
Timeline: NOW                           Timeline: When 50+ users exist

        Track 1 creates Track 2 automatically.
```

---

## C. TECHNOLOGY STACK (LOCKED — April 5, 2026)

| Component | Tool | Cost | Why |
|-----------|------|------|-----|
| Primary AI | Claude Sonnet 4.6 (Anthropic API) | ~Rs 20/order | 100/100 score, 1M context, Vision |
| Fallback AI | Sarvam 105B (API) | FREE | Simple cases only (withdrawal, suo motu) |
| Database + Auth | Supabase Mumbai (ap-south-1) | Rs 0-2,100/mo | Must configure custom domain |
| Hosting | DigitalOcean Bangalore VPS | Rs 1,250/mo | India data residency |
| Framework | Next.js (existing app) | Rs 0 | Already built, live at aadesh-ai.in |
| Payments | Razorpay UPI | Per-txn | Already integrated |
| Domain | aadesh-ai.in (GoDaddy) | Rs 800/yr | Already owned |
| Word output | docxtpl + Noto Sans Kannada | Rs 0 | Proven Kannada rendering |
| Builder | Claude Code (VS Code) | Rs 0 | FREE with Max subscription |
| TOTAL monthly | | Rs 3,350-5,450 | |

### Model Decision: Why TWO models, not one

| Scenario | Model | Why | Cost |
|----------|-------|-----|------|
| Contested appeal (complex) | Claude Sonnet 4.6 | Needs 5-8 reference orders in context. 1M window. Best quality. | ~Rs 20 |
| Withdrawal / Suo motu (simple) | Sarvam 105B | Template-like orders. 128K context enough. FREE. | Rs 0 |
| PDF reading (all cases) | Claude Sonnet 4.6 Vision | Only model that reads PDFs natively as images | ~Rs 5 |

### What was KILLED from v8.0-v8.1

| Killed | Why |
|--------|-----|
| RAG pipeline (8 Python files) | 1M context replaces RAG. RAG scored 62/100. Full-context scored 100/100. |
| Bible generation engine | Overengineered for Phase 0-1. Full reference orders in context works better. |
| user_bibles table | Not needed. Reference orders sent as-is in system prompt. |
| pgvector / embeddings | No vector database needed with 1M context. |
| Global knowledge pool | Phase 2 feature. Adds DPDP risk with zero users to benefit. |
| Demo mode | Phase 2. Need real users first. |
| Edit tracking to bible loop | Phase 2. Continuous improvement comes later. |
| Sarvam as DEFAULT model | Sarvam 128K context cannot load all references. Sonnet 4.6 is primary. |

---

## D. COST MODEL (HONEST)

### Per order cost (Sonnet 4.6, contested appeal):

**Note: All API costs include 21% India markup (2-3% forex + 18% GST on imported services)**

| Step | What happens | Base cost | After India tax |
|------|-------------|-----------|-----------------|
| 1. Read PDF | Claude Vision reads case file (avg 20 pages) | ~Rs 5 | ~Rs 6 |
| 2. Generate | System prompt + 5-8 reference orders (cached) + case details + questions | ~Rs 12 | ~Rs 14.50 |
| 3. Self-audit | AI reviews its own output for errors | ~Rs 3 | ~Rs 3.60 |
| 4. DOCX | Local processing, no API call | Rs 0 | Rs 0 |
| **TOTAL (first order)** | | | **~Rs 24/order** |

### With prompt caching (the real cost after first order):

Reference orders (120K tokens) are cached. Cache read = 10% of input price. Use 1-hour TTL.

| Order in session | Cost | Why |
|-----------------|------|-----|
| 1st order (cache write) | Rs 24 | Full price + 25% write premium on references |
| 2nd order (cache read) | Rs 10.50 | References at 10% cost |
| 3rd-5th orders | Rs 10.50 each | Same cache read |
| **Average across 5-order session** | **Rs 13.20** | Cache makes it affordable |

### Prompt caching architecture (MUST follow this order):

```
1. System prompt V3.2.1           → CACHED (rarely changes)
2. Reference orders (5-8 full)    → CACHED with cache_control (changes only on new upload)
3. Case input + officer answers   → NOT cached (changes every order)
```

### 3 known caching bugs to watch:

1. 1-hour TTL can be silently ignored — monitor cached_tokens in API response
2. Don't set provider.order manually on OpenRouter — breaks sticky routing
3. Cache only covers content up to cache_control breakpoint — put references BEFORE case input

### Revenue per order (after Razorpay fee of 3.53%):

| Pack | Price | Razorpay fee | Net received | Cost/order (avg) | Margin |
|------|-------|-------------|-------------|-----------------|--------|
| Trial | FREE | - | Rs 0 | Rs 24 | -100% (acquisition) |
| Pack A | Rs 499 | Rs 17.60 | Rs 481 | Rs 66 (5 orders) | 86% |
| Pack B | Rs 999 | Rs 35.30 | Rs 964 | Rs 66 (15 orders) | 93% |
| Pack C | Rs 1,999 | Rs 70.60 | Rs 1,928 | Rs 66 (40 orders) | 97% |
| Pack D | Rs 4,999 | Rs 176.50 | Rs 4,823 | Rs 66 (120 orders) | 99% |

### Break-even:

Monthly infra cost: ~Rs 5,000
Average cost per order (with caching): ~Rs 13
Average revenue per order (Pack B avg): ~Rs 64
Break-even: 6 paid orders/month (about 1.5 Pack A sales)

---

## E. GENERATION PIPELINE (How it works)

```
OFFICER UPLOADS CASE PDF
        |
        v
[1. VALIDATE] Max 200 pages, PDF/DOCX/JPG/PNG
        |
        v
[2. CLAUDE VISION READS] Sonnet 4.6 reads every page as image
   Returns: case summary, case type, 4-5 questions
   Cost: ~Rs 5 | Time: 15-30 seconds
        |
        v
[3. OFFICER ANSWERS QUESTIONS] (60 seconds)
   - What is the outcome? (Allowed / Dismissed / Remanded)
   - Presiding officer name? (pre-filled from profile)
   - Order date? (calendar picker)
   - Related previous cases? (optional)
   - AI asks 1 case-specific question
        |
        v
[4. BUILD PROMPT] System prompt V3.2.1 (17 rules)
   + Officer profile (name, designation, district style)
   + 5-8 best reference orders (full text, cached)
   + Case summary from Step 2
   + Officer's answers from Step 3
   Total context: ~130K tokens (13% of 1M limit)
        |
        v
[5. GENERATE ORDER] Claude Sonnet 4.6
   Cost: ~Rs 12 | Time: 30-60 seconds
   Target: 550-750 words in Sarakari Kannada
        |
        v
[6. SELF-AUDIT] AI checks output against 4 guardrails:
   - Section completeness (all required sections present)
   - Kannada purity (zero English transliteration)
   - Fact preservation (all input facts in output)
   - Word count (550-750 for appeals, 300-500 for withdrawals)
   If fails: regenerate once with corrections
   Cost: ~Rs 3
        |
        v
[7. PREVIEW + EDIT] Officer reviews in browser
   Can edit any text before downloading
   AI disclaimer watermark until verified
        |
        v
[8. DOWNLOAD DOCX] Generated using docxtpl templates
   Noto Sans Kannada font embedded
   Auto-saves to order history
   Footer on every page: "ಆದೇಶ AI ಸಹಾಯದಿಂದ ಕರಡು | Drafted by Aadesh AI | Verified by [Officer Name]"
   (Every printed order = free advertisement on other officers' desks)
```

### Fallback path (simple cases on Sarvam 105B):

For withdrawal and suo motu cases:
- Skip Step 2 (no PDF upload needed — officer fills text form)
- Skip Step 6 (simpler self-audit)
- Cost: Rs 0 (Sarvam FREE tier)
- Quality: 78-90/100 (acceptable for simple orders)

---

## F. USER JOURNEY

### Phase 1: SETUP (one time, 2 minutes)

1. Sign up (Google OAuth or email)
2. Select office type: DDLR / AC / Tahsildar / DC / Other
3. Select district (all 31 Karnataka) and taluk
4. Enter: officer name, designation, salutation
5. Define case types handled (1-20 types, suggested defaults shown)

### Phase 2: TRAINING (one time, 10-30 minutes)

1. Upload 5-20 best finalized signed orders (PDF/DOCX/images)
2. Per case type: minimum 3 orders = ready
3. Training meter shows progress: 0% to 100%
4. Files stored in Supabase Storage per user

What happens on upload:
- File stored in Supabase Storage: /references/{user_id}/{case_type}/
- Text extracted (for search/matching)
- Training status recalculated
- NO bible generation (full orders used directly in context)

### Phase 3: GENERATE (daily use, 3-4 minutes per order)

1. Select case type
2. Upload case file PDF (or fill text form for simple cases)
3. AI reads, asks questions
4. Officer answers (60 seconds)
5. AI generates order (30-60 seconds)
6. Officer previews, edits if needed
7. Downloads .docx
8. Rates quality (optional, helps improve future orders)

---

## G. DATABASE (Phase 0 — 3 tables only)

```sql
-- Table 1: User profiles
CREATE TABLE profiles (
  id               UUID PRIMARY KEY,
  email            TEXT NOT NULL,
  full_name        TEXT NOT NULL,
  office_type      TEXT NOT NULL,
  district         TEXT NOT NULL,
  taluk            TEXT NOT NULL,
  officer_name     TEXT NOT NULL,
  designation      TEXT,
  salutation       TEXT,
  case_types       JSONB DEFAULT '[]',
  training_status  INTEGER DEFAULT 0,
  credits          INTEGER DEFAULT 3,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Reference orders
CREATE TABLE references (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_type_id    TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  extracted_text  TEXT,
  uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Generated orders
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_type       TEXT NOT NULL,
  case_number     TEXT,
  generated_text  TEXT NOT NULL,
  word_count      INTEGER,
  model_used      TEXT,
  guardrail_score INTEGER,
  user_rating     INTEGER,
  credits_used    INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

Phase 2 additions (LATER, not now):
- audit_log table (DPDP compliance)
- referrals table (growth)
- global_patterns table (demo mode)
- user_bibles table (style optimization)
- edited_text column in orders (edit tracking)

---

## H. SUPABASE PROTECTION PLAN

Supabase was blocked in India Feb 24-Mar 4, 2026. Our entire app depends on it.

### Immediate (do this week):

1. Configure Supabase custom domain: db.aadesh-ai.in
   - This hides *.supabase.co from ISP blocks
   - If future block targets supabase.co again, our custom domain may survive
   - Supabase Pro plan required ($25/mo = Rs 2,100)

2. Set up automated daily backups
   - pg_dump to DigitalOcean Spaces (India)
   - Can restore to any Postgres in 1 hour if needed

### Medium term (Phase 1):

3. Abstract database access layer
   - Thin wrapper so swapping Supabase for plain Postgres is config change, not rewrite
   - Keep Supabase auth but have fallback plan

### If blocked again (emergency):

4. Self-host Supabase on our DigitalOcean VPS
   - Open source, Docker-based
   - Same APIs, full control
   - Needs DevOps work but possible in 1-2 days

---

## I. COMPLIANCE (DPDP + Karnataka RAI)

### DPDP Act 2023 — What we MUST do:

| Requirement | Action | Status |
|------------|--------|--------|
| Privacy policy | Add /privacy page explaining data use, cross-border transfer to US | TO DO |
| Consent | Add checkbox: "I consent to processing my case data via AI" | TO DO |
| Data minimization | Consider stripping names/survey numbers before API call | EVALUATE |
| Data Processing Agreement | Get DPA from Anthropic for API use | TO DO |
| Right to erasure | Build "delete my data" in settings | EXISTS (transfer mode) |
| Audit logging | Log every order generation with user_id, timestamp | EXISTS |

### Cross-border transfer:

- DPDP allows transfers by default (negative list model)
- US is NOT on the restricted list
- We are Data Fiduciary. Anthropic is Data Processor.
- We remain legally responsible for Anthropic's handling of data.

### Officers using personal tools for official work:

**Status: GREY AREA.** No explicit ban, no explicit permission.

Our approach:
1. Short term: Position as personal productivity tool (like ChatGPT)
2. In-app disclaimer: "Please follow your department's IT policies"
3. Medium term: Seek formal MoU with Revenue Department
4. Design for Karnataka RAI compliance BEFORE the rules come

### Karnataka Responsible AI Committee:

- Formed March 2026 (Kris Gopalakrishnan, chair)
- Interim report due ~May 12, 2026
- Will create risk classification for AI in governance
- Our tool likely = "medium-risk" (assists drafting, officer always reviews/signs)
- Being compliant BEFORE report = first-mover advantage

Our compliance-ready features:
- Human-in-the-loop (officer always reviews before signing)
- No auto-signing or auto-submission
- Full audit trail
- India data hosting (VPS in Bangalore)
- AI disclaimer watermark on outputs

---

## J. RISK TABLE

| Risk | Severity | Mitigation |
|------|----------|------------|
| Supabase blocked again | HIGH | Custom domain + daily backups + self-host fallback |
| Anthropic API down | MEDIUM | Sarvam 105B fallback for simple cases. Queue for complex. |
| Anthropic raises prices | LOW | Current margin is 52-80%. Can absorb 2-3x price increase. |
| Karnataka RAI restricts AI | MEDIUM | Already designed for compliance. Human-in-loop. |
| Officer conduct rules issue | MEDIUM | Disclaimer in app. Seek formal MoU. |
| DPDP enforcement | MEDIUM | Privacy policy + consent + DPA with Anthropic. |
| Competitor enters market | LOW | Zero competitors today. First-mover + per-user training = moat. |
| Sarvam Startup credits denied | LOW | Only affects free-tier usage. Paid API is backup. |
| API rate limits (5+ officers at once) | MEDIUM | Queue system in Phase 1. Requests processed one-by-one. |
| Rural 2G/3G upload failures | MEDIUM | Client-side compression in Phase 1. Photos under 2MB. |

---

## K. BUILD SEQUENCE

### RULE: SELL FIRST, BUILD SECOND

All 5 AI research models (Grok, Perplexity, GPT 5.4, Gemini, Claude DR) unanimously said: "Stop building, start selling." The app already works at 100/100 quality. The bottleneck is users, not code.

Phase 0 = **Validate quality locally + get first paying user**
Phase 1 = **Improve app only after first revenue confirmed**
Custom rebuild trigger = **30 paying users + Rs 60,000 MRR** (not before)

### Phase 0 — Validate + First Sale (~8 days)

| # | Task | Priority | Time | Status |
|---|------|----------|------|--------|
| 1 | Test latest model locally (Sonnet 4.6 in Claude Project) | P0 | 1 day | START HERE |
| 2 | Configure Supabase custom domain (db.aadesh-ai.in) | P0 | 2 hours | TO DO |
| 3 | Fix/rebuild generation pipeline with prompt caching | P0 | 2 days | TO DO |
| 4 | Add PDF upload + Claude Vision read | P0 | 1 day | PARTIAL |
| 5 | Add clarifying questions UI | P0 | 0.5 day | TO DO |
| 6 | Add privacy policy page + consent checkbox | P0 | 0.5 day | TO DO |
| 7 | Test with 3 real Banu cases end-to-end | P0 | 1 day | TO DO |
| 8 | Give Banu login, monitor first 5 orders | P0 | 2 days | TO DO |
| **TOTAL Phase 0** | | | **~8 days** | |

### Phase 1 (after Banu validates — April-May 2026):

| # | Task | Priority | Time |
|---|------|----------|------|
| 9 | Onboarding flow (office type, district, case types) | P1 | 1 day |
| 10 | Training page (upload references, status bar) | P1 | 1 day |
| 11 | Smart reference selection (top 5-8 by case type match) | P1 | 1 day |
| 12 | Self-audit loop (4 guardrails) | P1 | 0.5 day |
| 13 | User rating before download | P1 | 0.5 day |
| 14 | Admin dashboard for Srinivas (/admin) | P1 | 1 day |
| 15 | Referral system (invite link + 5 free credits) | P1 | 0.5 day |
| 16 | DPIIT Startup India registration | P1 | 1 week (govt process) |
| 17 | **API queue system** — Supabase job_queue table. Officers see "Analyzing..." while requests process one-by-one. Prevents rate limit crashes when 5+ officers generate at once. | P1 | 1 day |
| 18 | **Client-side image compression** — Browser compresses phone photos to <2MB before upload. Officers on 2G/3G in rural taluks can't upload 50MB files. Makes app feel fast on bad internet. | P1 | 0.5 day |

### Phase 2 (10+ users — June-July 2026):

| # | Task | Priority |
|---|------|----------|
| 19 | Bible generation from reference orders (style optimization) | P2 |
| 20 | Edit tracking and learning loop | P2 |
| 21 | Global knowledge pool (demo mode) | P2 |
| 22 | Transfer mode (officer moves to new office) | P2 |
| 23 | Multi-office expansion (BBMP, BDA, Sub-Registrar) | P2 |
| 24 | Supabase self-hosting readiness (Docker on VPS) | P2 |
| 25 | **Bhashini voice-to-text** — Officer speaks Kannada answers to clarifying questions instead of typing. Removes keyboard friction for older officers. | P2 |

---

## L. REGISTRATIONS CHECKLIST

| Registration | When | Cost | Status |
|-------------|------|------|--------|
| DPIIT Startup India | NOW | FREE | NOT DONE |
| Udyam/MSME | NOW | FREE | NOT DONE |
| GST | When revenue > Rs 20 lakh | FREE | Not needed yet |
| Karnataka Shops & Establishments | Within 30 days of launch | ~Rs 500 | NOT DONE |
| GeM Seller | Track 2 only | FREE | LATER |
| ISO 27001 | Phase 3+ | Rs 2-5 lakh | LATER |

---

## M. MARKET SIZE

### Phase 1: Land Revenue (NOW)
- 31 districts x ~5 taluks = ~155 offices
- 1-3 caseworkers per office = 300-500 potential users
- At Rs 50/order avg, 10 orders/user/month = Rs 1.5-2.5 lakh/month

### Phase 2: Urban Bodies (July 2026)
- BBMP, City Corporations, CMC/TMC = 200-300 more users
- Zero code changes needed (user defines own case types)

### Phase 3: Development + Other (Oct 2026+)
- BDA, MUDA, Sub-Registrar, RTO, Labor, Forest = 600+ users

### Total Karnataka potential: 1,100-1,500 users = Rs 27-37 lakh/month = Rs 3.3-4.5 crore/year

---

## N. COMPETITIVE LANDSCAPE

| Category | Players | Threat to Aadesh AI |
|----------|---------|---------------------|
| Indian legal AI (for lawyers) | BharatLaw, DraftBot Pro, VIDUR | NONE — different customer |
| Govt document AI in Karnataka | NOBODY | We are FIRST |
| Sarvam Chanakya (govt AI platform) | Sarvam AI | PARTNER, not competitor — we can run ON their platform |
| Generic AI (ChatGPT, Claude) | OpenAI, Anthropic | Not specialized for Sarakari Kannada orders |

---

## O. KEY PARTNERSHIPS TO PURSUE

| Partner | What | When |
|---------|------|------|
| Sarvam AI | Startup Program credits + Chanakya platform | NOW (follow up) |
| CATS AI CoE (KEONICS) | Incubation + govt credibility | Phase 1 |
| Karnataka Revenue Department | Formal MoU for authorized use | Phase 1-2 |
| KDEM (Karnataka Digital Economy Mission) | Startup support + visibility | Phase 1 |

---

## O2. MARKETING (Zero-Cost, High-Trust)

No Facebook/Google ads. Government officers trust other officers, not ads.

| Channel | How | Cost | When |
|---------|-----|------|------|
| **DOCX footer** | Every printed order has "Drafted by Aadesh AI" + aadesh-ai.in. Every order on another officer's desk = free ad. | Rs 0 | Phase 0 (built into template) |
| **WhatsApp referral** | Officer shares link → colleague gets 3 free orders → officer gets 5 credits | Rs 0 | Phase 1 |
| **Banu video testimonial** | 60-second phone video: "Before: 3 hours. Now: 5 minutes." On homepage. | Rs 0 | After Banu validates |
| **Physical posters** | QR code poster near Taluk office Xerox shops. "Perfect Kannada draft in 5 min. 3 FREE." | Rs 500/district | Phase 1 |
| **Officer WhatsApp groups** | Pre-written Kannada message for officer to share in their district group | Rs 0 | Phase 1 |

---

## P. DECISIONS LOG

| # | Decision | Rationale | Date |
|---|---------|-----------|------|
| D-9.1 | Blueprint v9.0 replaces all previous versions | 4 documents with conflicts = confusion. One truth. | Apr 5, 2026 |
| D-9.2 | Claude Sonnet 4.6 is PRIMARY model, Sarvam is fallback only | Sarvam 128K cannot load all references. Sonnet 1M can. | Apr 5, 2026 |
| D-9.3 | Bible generation deferred to Phase 2 | Full-context approach scored 100/100. Bible scored 62/100. | Apr 5, 2026 |
| D-9.4 | Honest cost = Rs 24/order first, Rs 13 avg with caching | Includes Vision + audit + 21% India tax | Apr 5, 2026 |
| D-9.5 | Supabase custom domain is P0 security task | India blocked Supabase for 8 days in Feb 2026. Cannot risk again. | Apr 5, 2026 |
| D-9.6 | Database simplified to 3 tables for Phase 0 | 7 tables was overengineered for 1 user | Apr 5, 2026 |
| D-9.7 | Privacy policy + consent = P0 (not Phase 1) | DPDP Act applies from day 1. Cannot launch without it. | Apr 5, 2026 |
| D-9.8 | B2C first (Track 1), B2G later (Track 2) | Officers pay drafters from pocket. Same logic. Founder's insight. | Apr 4, 2026 |
| D-9.9 | Seek Revenue Dept MoU in Phase 1 | Officers using unauthorized tools = grey area risk | Apr 5, 2026 |
| D-9.10 | Monitor Karnataka RAI Committee (interim report ~May 12) | Could affect our product. Being ready = advantage. | Apr 5, 2026 |
| D-9.11 | DOCX footer = free marketing on every printed order | Gemini cross-validated. Every order on a desk = ad for us. | Apr 5, 2026 |
| D-9.12 | API queue system in Phase 1 | Gemini identified: 5+ officers at once = rate limit crash | Apr 5, 2026 |
| D-9.13 | Client-side image compression in Phase 1 | Gemini identified: rural 2G/3G can't handle 50MB uploads | Apr 5, 2026 |

---

## Q. VERSION HISTORY

| Version | Date | What Changed |
|---------|------|-------------|
| v6.7 | Mar 26 | Base: text form, Sarvam 105B |
| v7.0 | Mar 28 | Document upload concept |
| v7.4 | Mar 31 | RAG pipeline (scored 62/100) |
| v7.5 | Apr 2 | PIVOT: PDF + Claude Vision = 100/100 |
| v8.0 | Apr 3 | Multi-tenant architecture |
| v8.1 | Apr 4 | 1M context discovery, Chanakya |
| v8.2 | Apr 4 | Two-Track Model (B2C first) |
| **v9.0** | **Apr 5** | **CLEAN REWRITE. One document. 10 contradictions resolved. DPDP compliance, Supabase protection, honest cost model (Rs 24/order first, Rs 13 avg with caching), simplified database, Karnataka RAI prep. SELL FIRST principle. Prompt caching architecture. India tax markup. Razorpay fees.** |

---

## R. WHAT STAYS FROM EXISTING APP

The live app at aadesh-ai.in already has:

- Domain + SSL + VPS (working)
- Google OAuth + Supabase auth (working)
- Razorpay billing with 4 packs (working)
- Order history page (working)
- DOCX download (working)
- Language toggle Kannada/English (working)
- Mobile-first UI (working)
- Smart routing: contested to Sonnet, simple to Sarvam (working)
- Audit logging (working)
- 100/100 quality score on Sonnet 4.6 (proven)

**We are NOT rebuilding the app. We are improving it phase by phase.**

---

# END OF BLUEPRINT v9.0
# This is the ONLY active blueprint.
# All previous versions (v6.7 through v8.2) are archived for reference only.
