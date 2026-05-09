# AADESH AI — BLUEPRINT v9.2.2
# Date: April 10, 2026 (patched from v9.2.1 of April 9) | Status: ACTIVE
# This is the ONLY blueprint. All previous versions archived.
# v9.2 patches: Google Deep Research findings (6 NEW critical items)
# Cross-validated by: Claude + Perplexity + Gemini x2 + GPT + Google DR x2 (7 rounds, 6 models)

---

## PATCH NOTES — v9.2.2 (April 10, 2026)

Tech scan + **full SDK migration executed**. 4 tech items + 1 major architecture discovery. Core product logic UNCHANGED.

### ⚠️ ARCHITECTURE DISCOVERY (April 10, 2026)

**Critical finding from Claude Code:** App was calling Anthropic via OpenRouter HTTP passthrough, NOT the Anthropic SDK directly. OpenRouter BLOCKS all Anthropic-native features: adaptive thinking, prompt caching, structured outputs.

**Resolution: Migrated contested appeal path to direct Anthropic SDK (Option A). COMPLETE.**

| File | What changed |
|------|-------------|
| `package.json` | Added `@anthropic-ai/sdk@^0.88.0` |
| `src/lib/sarvam.ts` | Added `callAnthropicSonnet()`, `generateClarifyingQuestions()`, `extractEntitiesForLock()` |
| `src/app/api/generate-order/route.ts` | Wired Anthropic key + split prompts for caching |

**New routing logic:**
- `ANTHROPIC_API_KEY` set → Direct Anthropic SDK (adaptive thinking + 1h caching) ✅
- Key missing → OpenRouter fallback
- Both missing → Sarvam degraded fallback

**TypeScript:** `npx tsc --noEmit` → **0 errors** ✅

### ⚠️ PENDING DEPLOYMENT ACTION (Srinivas must do)

```bash
# On VPS: 165.232.176.181
cd ~/aadesh-ai/nextjs
nano .env              # add: ANTHROPIC_API_KEY=sk-ant-api03-...
npm install            # picks up @anthropic-ai/sdk
pm2 restart aadesh-ai
```

### What changed (tech scan items)

| # | Item | Old (v9.2.1) | New (v9.2.2) | Status |
|---|------|-------------|--------------|--------|
| P-7 | Prompt caching | Manual breakpoints or none | Automatic `cache_control: { type: 'ephemeral', ttl: '1h' }` on system prompt + reference orders. 90% cost saving on cached tokens. | ✅ DONE in sarvam.ts |
| P-8 | 1M context beta header `context-1m-2025-08-07` | May exist in old code | Codebase was **already clean** — zero matches found | ✅ P-0.49 DONE |
| P-9 | Claude Managed Agents | Not applicable | Launched April 8 public beta. $0.08/session-hour. Could replace Phase 1 orchestration. | WATCH — re-evaluate when GA |
| P-10 | Advisor Tool (new beta) | Not applicable | Pair Haiku 4.5 executor + Sonnet 4.6 advisor. Could cut costs 50-60% in Phase 1. | Evaluate Phase 1 start |

### Tasks completed this session

| ID | Task | Status |
|----|------|--------|
| P-0.46 | Adaptive thinking migration | ✅ DONE — `thinking: {type:'adaptive'}, effort: 'medium'/'high'` |
| P-0.47 | Structured Outputs — Clarifying Questions | ✅ DONE — `generateClarifyingQuestions()` with full JSON schema |
| P-0.47 | Structured Outputs — Entity Lock | ✅ DONE — `extractEntitiesForLock()` with full JSON schema |
| P-0.49 | Remove old beta header | ✅ DONE — codebase was already clean |

### What did NOT change

- Sarvam path (withdrawal, suo_motu) — completely untouched ✅
- All v9.2.1 decisions re-confirmed ✅
- Sonnet 4.6 as primary model ✅
- Core architecture, database, frontend — unchanged ✅

### New tasks added

| ID | Task | Owner | Deadline |
|----|------|-------|----------|
| P-0.49 | ~~Remove context-1m-2025-08-07~~ | ~~Claude Code~~ | ✅ ALREADY CLEAN |
| P-0.50 | **Deploy to VPS: add ANTHROPIC_API_KEY + npm install + pm2 restart** | Srinivas | TODAY |
| P-1.39 | Evaluate Advisor Tool (Haiku executor + Sonnet advisor) for cost reduction | Claude Code | Phase 1 start |

### Scan sources

- Anthropic release notes — April 10, 2026
- Anthropic Managed Agents blog — April 8, 2026
- Claude Code execution results — April 10, 2026

### Version

- Blueprint version: v9.2.2 (patch)
- Previous: v9.2.1 (April 9, 2026)
- Next scheduled review: After Banu delivers 5 completed orders OR Sarvam Karnataka announcement, whichever first

---

## PATCH NOTES — v9.2.1 (April 9, 2026)

This is a minor patch to v9.2. The core architecture is unchanged. Only 6 items updated based on technology scan April 9, 2026.

### What changed

| # | Item | Old (v9.2) | New (v9.2.1) | Reason |
|---|------|-----------|--------------|--------|
| P-1 | Thinking mode on Sonnet 4.6 | thinking: {type: "enabled", budget_tokens: N} | thinking: {type: "adaptive"} with effort parameter | Old syntax deprecated on Opus 4.6 / Sonnet 4.6. Adaptive mode auto-decides depth. Interleaved thinking is automatic — no beta header needed. |
| P-2 | JSON output for Entity Lock + Clarifying Questions | Manual prompt instructions + regex parsing | Structured Outputs (GA) — native schema enforcement via API | GA on Claude API as of early 2026. No beta header. Eliminates parsing bugs and malformed JSON errors. Must-have for Entity Lock reliability. |
| P-3 | 1-hour cache TTL | Assumed still beta | GA — no beta header required | Confirmed GA. Our prompt-caching architecture (v9.2 Section D) is unchanged; just remove any beta header references in code. |
| P-4 | Long-session context management | Manual trimming logic planned | Evaluate "Compaction" (auto server-side summarization) in Phase 1 | New Anthropic feature. Auto-summarizes earlier context when approaching window limit. Could simplify Phase 1 multi-order sessions. DO NOT commit yet — test first. |
| P-5 | Sarvam Chanakya threat level | "MEDIUM — monitor" | "HIGH — ACTIVE" (launched March 31, 2026) | Air-gapped govt AI platform, multimodal, targets exactly our Track 2 buyer (Revenue Department). Confirms v9.2 D-9.20: Sarvam is a competitor, not a partner. |
| P-6 | Sarvam sovereign partnerships | Not mentioned | Odisha MoU signed Feb 6, 2026. Tamil Nadu MoU signed Feb 2026. Karnataka is a realistic next target. | Our 6–18 month window just tightened. Karnataka RAI Committee submission (due May 12) must explicitly position Aadesh AI as personal human-in-the-loop tool (different lane from Chanakya govt platform). |

### What did NOT change

These v9.2 decisions are RE-CONFIRMED by this scan:

- Sonnet 4.6 as primary model (D-9.2) ✅
- Sarvam as fallback only, not partner (D-9.20) ✅
- Vectorless RAG / full reference orders in context (D-9.3) ✅
- Entity Lock verification screen as P0 mandatory ✅
- Supabase self-hosting in Phase 1 ✅
- Prompt caching with 1-hour TTL architecture ✅
- All cost models, pricing, GST thresholds ✅
- Clarifying questions phase as #1 quality lever ✅

### New P0 tasks added

| ID | Task | Owner | Deadline |
|----|------|-------|----------|
| **P-0.46** | Migrate Sonnet 4.6 calls from budget_tokens → adaptive thinking + add effort: "high" parameter | Claude Code | ✅ DONE Apr 10 |
| **P-0.47** | Convert Entity Lock + Clarifying Questions to Structured Outputs schema | Claude Code | ✅ DONE Apr 10 |
| **P-0.48** | Rewrite Karnataka RAI Committee submission to emphasize "personal tool, not govt platform" framing | Srinivas + Claude Chat | May 5, 2026 |
| **P-0.49** | ~~Search codebase for context-1m-2025-08-07~~ | ~~Claude Code~~ | ✅ CLEAN — never existed |
| **P-0.50** | **DEPLOY: Add ANTHROPIC_API_KEY to VPS .env + npm install + pm2 restart** (unlocks adaptive thinking + 90% cache saving + structured outputs) | Srinivas | TODAY — do before next session |

### Scan sources

- Anthropic docs (platform.claude.com/docs/en/release-notes/overview) — April 9, 2026
- Anthropic "What's new in Claude 4.6" page
- Sarvam AI news (Digit.in, Medianama, Wikipedia) — Mar 31, 2026 Chanakya launch
- Sarvam Odisha MoU announcement — Feb 6, 2026

### Version

- Blueprint version: v9.2.1 (patch)
- Previous: v9.2 (April 6, 2026)
- Next scheduled review: After Banu delivers 5 completed orders OR Sarvam Karnataka announcement, whichever first

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
| Hosting | DigitalOcean Bangalore VPS | Rs 1,250-2,500/mo | India data residency. **MUST upgrade to 2-4GB RAM before 5+ users** (PDF-to-image conversion is memory-intensive; 1GB will OOM crash) |
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
| 2nd order within 1 hour (cache read) | Rs 10.50 | References at 10% cost |
| 3rd-5th orders within 1 hour | Rs 10.50 each | Same cache read |
| **Average across 5-order burst** | **Rs 13.20** | Best case — officer does 5 orders in a row |
| **Realistic average (sporadic use)** | **Rs 18-20** | Cache expires after 60 min. If officer has meeting between orders, cache dies, pays full price again. |

**Gemini red-team finding:** Cache TTL expiration is the hidden cost killer.
If officers generate orders spread across the day (not in bursts),
the true average is Rs 18-20, not Rs 13. Plan margins accordingly.

**v9.1 cross-validation finding:** Regeneration cost is the SECOND hidden killer.
If self-audit fails (estimated 20-30% of contested cases), we regenerate = Rs 18 extra.
Worst case average: Rs 28-35/order. Budget a 25% regeneration buffer on all margins.
Set hard page limit on PDF uploads (max 80 pages) to prevent 200-page cost explosions.

### Prompt caching architecture (MUST follow this order):

```
1. System prompt V3.2.1           → CACHED (rarely changes)
2. Reference orders (5-8 full)    → CACHED with cache_control (changes only on new upload)
3. Case input + officer answers   → NOT cached (changes every order)
```

### 3 known caching bugs to watch:

1. 1-hour TTL can be silently ignored — monitor cached_tokens in API response
2. Don't set provider.order manually on OpenRouter — breaks sticky routing
3. Cache only covers content up to cache_control breakpoint — put references BEFORE case input (automatic caching handles this automatically — use top-level cache_control to avoid this bug entirely)

### Automatic caching note (v9.2.2):

Prefer automatic caching over manual breakpoints:
- Add `cache_control: { type: "ephemeral", ttl: "1h" }` at the TOP LEVEL of the API request body
- System auto-caches last cacheable block and moves forward as conversation grows
- Eliminates bug #3 above (wrong breakpoint order)
- No beta header required (GA)

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
Average cost per order (realistic): ~Rs 20
Average revenue per order (Pack B avg): ~Rs 64
Break-even: 8 paid orders/month (about 2 Pack A sales)

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
  prompt_version  TEXT DEFAULT 'V3.2.1',  -- v9.1: track which prompt version generated this order
  input_tokens    INTEGER,                -- v9.1: track actual API cost per order
  output_tokens   INTEGER,
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
| **PII redaction** | **MUST: Mask names/survey numbers BEFORE sending to Anthropic API** | **CRITICAL — Phase 0** |
| Data Processing Agreement | Get DPA from Anthropic for API use | TO DO |
| Right to erasure | Build "delete my data" in settings | EXISTS (transfer mode) |
| Audit logging | Log every order generation with user_id, timestamp | EXISTS |

### PII Redaction Design (Gemini red-team finding — critical for Track 2):

```
BEFORE sending to Anthropic API:
  "ರಾಮಕೃಷ್ಣ" → [NAME_1]
  "ಸರ್ವೆ ನಂ.45/2" → [SURVEY_1]
  "ಗ್ರಾಮ ಹೂಣಸಮರನಹಳ್ಳಿ" → [VILLAGE_1]

AI generates order with placeholders:
  "[NAME_1] ಅವರು [SURVEY_1] ಸಂಖ್ಯೆಯ..."

AFTER receiving output, on our India VPS:
  Replace [NAME_1] → "ರಾಮಕೃಷ್ಣ"
  Replace [SURVEY_1] → "ಸರ್ವೆ ನಂ.45/2"
  Replace [VILLAGE_1] → "ಗ್ರಾಮ ಹೂಣಸಮರನಹಳ್ಳಿ"

Result: Real citizen names NEVER leave India.
```

Why this matters: If Karnataka RAI Committee classifies us as "high-risk"
because citizen PII goes to US servers, this redaction layer immediately
drops us to "medium-risk" or "low-risk". Insurance for Track 2.

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
| **VPS OOM crash on PDF processing** | **HIGH** | 1GB RAM + PDF-to-base64 = crash at 3-4 concurrent users. Upgrade to 4GB in Phase 1. Or offload to Supabase Edge Function. |
| **API failure = lost credit = broken trust** | **HIGH** | Auto-refund on failure. Kannada error message. Phase 0 task. |

---

## K. BUILD SEQUENCE

### RULE: SELL FIRST, BUILD SECOND

All 5 AI research models (Grok, Perplexity, GPT 5.4, Gemini, Claude DR) unanimously said: "Stop building, start selling." The app already works at 100/100 quality. The bottleneck is users, not code.

Phase 0 = **Validate quality locally + get first paying user**
Phase 1 = **Improve app only after first revenue confirmed**
Custom rebuild trigger = **30 paying users + Rs 60,000 MRR** (not before)

### 3 MANDATORY EXECUTION RULES (Gemini-validated, April 5, 2026)

**RULE 1: EDGE FUNCTION FOR PDF** (applies to Task 4)
PDF-to-base64 image conversion MUST happen in a Supabase Edge Function,
NOT inside Next.js server. 1GB VPS will OOM-crash if PDF processing
runs on the main server. Claude Code prompt MUST include:
"Write a Supabase Edge Function to handle PDF-to-base64 conversion
and Claude Vision API call. Do NOT process PDF on Next.js backend."

**RULE 2: REFERRAL + QUEUE = SAME DAY** (applies to Task 15 + 17)
NEVER launch the referral system without the queue system.
The moment Banu shares on WhatsApp, 10 officers may log in at once.
Without queue = app crash. Both launch together or neither launches.

**RULE 3: CACHE ORDER IN API CALL** (applies to Task 3)
Claude Code MUST use AUTOMATIC CACHING (v9.2.2 update — simpler than manual breakpoints):

```javascript
// CORRECT — automatic caching (v9.2.2)
{
  model: "claude-sonnet-4-6",
  cache_control: { type: "ephemeral", ttl: "1h" },  // ← TOP LEVEL. Done.
  messages: [...]
}
```

System automatically caches up to the last cacheable block. No manual breakpoint placement needed.

⚠️ If manual breakpoints are used instead, follow this order (fallback only):
1. System Prompt (CACHED)
2. Reference Orders with cache_control ephemeral (CACHED)
3. New Case Input (NOT CACHED)
If case input comes before references, cache breaks, costs double.

### Phase 0 — Validate + First Sale (~10 days)

| # | Task | Priority | Time | Status |
|---|------|----------|------|--------|
| 1 | Test latest model locally (Sonnet 4.6 in Claude Project) | P0 | 1 day | START HERE |
| 2 | Configure Supabase custom domain (db.aadesh-ai.in) | P0 | 2 hours | TO DO |
| 3 | Fix/rebuild generation pipeline with prompt caching | P0 | 2 days | TO DO |
| 4 | Add PDF upload + Claude Vision read **via Supabase Edge Function** (NOT on Next.js server — Rule 1) | P0 | 1 day | PARTIAL |
| 5 | Add clarifying questions UI | P0 | 0.5 day | TO DO |
| 6 | Add privacy policy page + consent checkbox + "AI is assistive only" disclaimer | P0 | 0.5 day | TO DO |
| 7 | **PII redaction layer** — mask names/survey numbers before API call, re-inject in DOCX | P0 | 1 day | TO DO |
| 8 | **Credit refund on API failure** — if generation times out or fails, auto-refund credit + show Kannada error | P0 | 0.5 day | TO DO |
| 9 | **Sentry error monitoring (FREE)** — 30 min setup. Without this, crashes are invisible. | P0 | 30 min | TO DO |
| 10 | **UptimeRobot health check (FREE)** — alerts when VPS goes down | P0 | 15 min | TO DO |
| 11 | **Per-user rate limit** — max 5 orders/day per user. One user spamming = cost explosion. | P0 | 2 hrs | TO DO |
| 12 | **VPS security hardening** — firewall (ufw), fail2ban, SSH key auth, disable root password login | P0 | 1 hr | TO DO |
| 13 | **Add prompt_version to orders table** — store V3.2.1 with every order for quality tracking | P0 | 15 min | TO DO |
| 14 | **Execute Anthropic DPA** — Data Processing Agreement. Takes 1 hour. Do before Banu's first real case. | P0 | 1 hr | TO DO |
| 15 | **Entity Lock verification screen** — Un-skippable checkbox before download: "I have verified all survey numbers and names. I accept full responsibility as signatory." Shifts forgery liability from Aadesh AI to officer. BNS criminal exposure without this. | P0 | 2 hrs | TO DO |
| 16 | **Submit to Karnataka RAI Committee** — Written representation before May 12 interim report. Position as human-in-the-loop (medium-risk), NOT autonomous (high-risk). Email to committee before deadline. | P0 | 1 day | TO DO |
| 17 | **Add Billing Name field to checkout** — Officers need GST invoices with legal name for reimbursement claims. Without this, officers can't claim Rs 499 from department. Conversion enabler. | P0 | 1 hr | TO DO |
| 18 | **Terms of Service page (Kannada + English)** — Must include: officer is author, AI is assistive only, non-reliance clause, data handling. Kannada version mandatory for enforceability with Kannada-medium officers. | P0 | 0.5 day | TO DO |
| 19 | Test with 3 real Banu cases end-to-end | P0 | 1 day | TO DO |
| 20 | Give Banu login, monitor first 5 orders | P0 | 2 days | TO DO |
| **TOTAL Phase 0** | | | **~14 days** | |

### Phase 1 (after Banu validates — April-May 2026):

| # | Task | Priority | Time |
|---|------|----------|------|
| 21 | Onboarding flow (office type, district, case types) | P1 | 1 day |
| 22 | Training page (upload references, status bar) | P1 | 1 day |
| 23 | Smart reference selection (top 5-8 by case type match) | P1 | 1 day |
| 24 | Self-audit loop (4 guardrails) | P1 | 0.5 day |
| 25 | User rating before download | P1 | 0.5 day |
| 26 | Admin dashboard for Srinivas (/admin) | P1 | 1 day |
| 27 | Referral system (invite link + 5 free credits) | P1 | 0.5 day |
| 28 | DPIIT Startup India registration | P1 | 1 week (govt process) |
| 29 | **API queue system** — Supabase job_queue table. Prevents rate limit crashes when 5+ officers generate at once. | P1 | 1 day |
| 30 | **Client-side image compression** — Browser compresses phone photos to <2MB before upload. | P1 | 0.5 day |
| 31 | **Upgrade VPS to 4GB RAM** — 1GB crashes at 3-4 concurrent users. $24/mo (~Rs 2,000). | P1 | 1 hour |
| 32 | **Request Anthropic API tier upgrade** — Apply for Tier 2/3 before reaching 10 users. | P1 | 1 day |
| 33 | **⚠️ Gemini 2.5 BLOCKED for Kannada** — Content filters REJECT Kannada. Test only for non-Kannada subtasks. | P1 | 1 day |
| 34 | **Test Sarvam Vision for PDF reading** — ₹1.5/page vs Claude Vision. Cut input costs 80%. | P1 | 1 day |
| 35 | **Bhashini ULCA STT integration** — Kannada voice-to-text. ⚠️ NOT free for commercial SaaS — email bhashini@cdac.in for MoU terms first. Sarvam Bulbul V3 is backup STT option. | P1 | 0.5 day |
| 36 | **Abstract database layer** — thin wrapper so Supabase can be swapped for plain Postgres in hours. | P1 | 1 day |
| 37 | **Supabase self-hosting on VPS (Docker)** — CRITICAL: Feb 2026 block was DNS + IP level. Custom domain alone DOESN'T protect. Self-hosting = only real protection. | P1 | 2 days |
| 38 | **Streaming output + progress stages** — Show "Reading PDF... Analyzing... Generating..." instead of 60-sec blank wait. Govt users think app is broken without progress. | P1 | 0.5 day |
| 39 | **Evaluate Advisor Tool** — Anthropic beta: pair Haiku 4.5 (fast output) + Sonnet 4.6 (smart advisor). Could cut per-order token cost 50-60% while maintaining quality. Test on 10 orders before deciding. | P1 | 1 day |

### Phase 2 (10+ users — June-July 2026):

| # | Task | Priority |
|---|------|----------|
| 39 | Bible generation from reference orders (style optimization) | P2 |
| 40 | Edit tracking and learning loop | P2 |
| 41 | Global knowledge pool (demo mode) | P2 |
| 42 | Transfer mode (officer moves to new office) | P2 |
| 43 | Multi-office expansion (BBMP, BDA, Sub-Registrar) | P2 |
| 44 | WhatsApp Business integration — share DOCX via WhatsApp, primary officer channel | P2 |
| 45 | Extracted text preview — show officer what AI read from PDF, allow corrections before generation | P2 |

---

## L. REGISTRATIONS CHECKLIST

| Registration | When | Cost | Status |
|-------------|------|------|--------|
| DPIIT Startup India | NOW | FREE | NOT DONE |
| Udyam/MSME | NOW | FREE | NOT DONE |
| GST | Register proactively at Rs 15L (Razorpay reports ALL txns to GSTN monthly — late = penalties) | FREE | NOT DONE |
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
| Govt document AI in Karnataka | **Karnataka Revenue Dept** announced AI for land registration docs at BTS Nov 2024. NIC could build internal tool in 12-18 months. | **HIGH** — our window is 6-18 months. Lock B2C users fast. |
| Sarvam Chanakya (govt AI platform) | Sarvam AI (Rs 247 crore from IndiaAI Mission) | **COMPETITOR** — govt funding + govt relationships + Kannada models. Track 2 apex threat. |
| NIC Karnataka | NIC built Bhoomi, Kaveri 2.0, FRUITS | **MEDIUM** — if Revenue Dept orders internal drafting module, NIC builds it. |
| Generic AI (ChatGPT, Claude) | OpenAI, Anthropic | Not specialized for Sarakari Kannada orders |
| Gujarat HC precedent | Gujarat HC banned AI drafting final orders (Apr 2026) | **WATCH** — if Karnataka copies, we must be strictly "assistant" |

---

## O. KEY PARTNERSHIPS TO PURSUE

| Partner | What | When |
|---------|------|------|
| ~~Sarvam AI~~ | ~~Startup Program credits~~ **RECLASSIFIED AS COMPETITOR (D-9.20). Use their API but don't depend on them.** | Monitor |
| CATS AI CoE (KEONICS) | Incubation + govt credibility | Phase 1 |
| Karnataka Revenue Department | Formal MoU for authorized use (structure as preferred vendor, not just authorized) | Phase 1-2 |
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
| D-9.14 | **PII redaction layer = Phase 0 critical task** | Gemini red-team: citizen names must NOT leave India. Mask before API, re-inject in DOCX. | Apr 5, 2026 |
| D-9.15 | **VPS must upgrade to 4GB RAM before 5+ users** | Gemini red-team: PDF-to-base64 conversion OOM-crashes 1GB server at 3-4 concurrent users | Apr 5, 2026 |
| D-9.16 | **Auto-refund credits on API failure** | Gemini red-team: if officer pays and generation fails, trust is permanently broken | Apr 5, 2026 |
| D-9.17 | Cache TTL cost reality = Rs 18-20 avg (not Rs 13) | Gemini red-team: 1-hour cache expires between sporadic orders. Plan margins for worst case. | Apr 5, 2026 |
| **D-9.18** | **Sentry + UptimeRobot = Phase 0 mandatory** | 3/3 reviewers flagged zero monitoring as biggest ops gap. Both are free. | Apr 6, 2026 |
| **D-9.19** | **Per-user rate limit = 5 orders/day** | One user spamming = cost explosion. Must enforce from Day 1. | Apr 6, 2026 |
| **D-9.20** | **Sarvam = COMPETITOR, not partner** | 3/3 reviewers: if Chanakya adds drafting module, they outreach us via govt channels. | Apr 6, 2026 |
| **D-9.21** | **Regeneration cost budget = 25% buffer** | Self-audit failure triggers regeneration at Rs 18 extra. 20-30% failure rate on contested cases. | Apr 6, 2026 |
| **D-9.22** | **~~Gemini 2.5 Flash-Lite test~~ → CANCELLED by D-9.28** | Google DR found Gemini BLOCKS Kannada. Cannot use for drafting. Test only for metadata tasks. | Apr 6, 2026 |
| **D-9.23** | **Bhashini STT moved from Phase 2 → Phase 1** | Free Kannada voice-to-text available NOW. Phase 1 differentiator for older officers. | Apr 6, 2026 |
| **D-9.24** | **prompt_version + token tracking in orders table** | Without version tracking, quality comparisons break on prompt updates. | Apr 6, 2026 |
| **D-9.25** | **VPS security hardening = Phase 0** | No firewall, no fail2ban, no SSH keys = public target for automated scanning. | Apr 6, 2026 |
| **D-9.26** | **Anthropic DPA = execute before first real case** | Without DPA, relying on general ToS for Indian citizen data. Takes 1 hour. | Apr 6, 2026 |
| **D-9.27** | **Entity Lock screen = Phase 0 CRITICAL** | Google DR: AI hallucinating survey number = "forged electronic record" under BNS. Officer MUST verify before download. Shifts criminal liability. | Apr 6, 2026 |
| **D-9.28** | **Gemini 2.5 CANNOT be used for Kannada** | Google DR: Gemini content filters BLOCK Kannada input as "not permitted." Eliminates Gemini as alternative for core drafting. | Apr 6, 2026 |
| **D-9.29** | **Supabase self-hosting moved P2 → P1** | Google DR: Feb 2026 block was DNS + IP level. Custom domain alone doesn't protect. Self-host on DO = only real fix. | Apr 6, 2026 |
| **D-9.30** | **Submit to Karnataka RAI Committee before May 12** | Position as human-in-the-loop (medium-risk). If classified high-risk, may need to pause. | Apr 6, 2026 |
| **D-9.31** | **Test Sarvam Vision for PDF reading (₹1.5/page)** | Could replace Claude Vision for Step 2, cutting input costs 80%. Keep Claude for generation only. | Apr 6, 2026 |
| **D-9.32** | **Gujarat HC banned AI drafting final orders (Apr 2026)** | Precedent: if Karnataka follows, we MUST be "drafting assistant" not "order generator." UI label critical. | Apr 6, 2026 |
| **D-9.33** | **DigitalOcean NOT MeitY-empanelled** | Track 2 (B2G) requires migration to AWS Mumbai or Azure Pune. DO fine for Track 1 B2C. | Apr 6, 2026 |
| **D-9.34** | **Register GST proactively at Rs 15L (not 20L)** | Razorpay reports ALL transactions to GSTN monthly. Late registration = penalties + retrospective liability. | Apr 6, 2026 |
| **D-9.35** | **Add Billing Name field to checkout** | Officers need GST invoices with legal name for reimbursement claims from department. | Apr 6, 2026 |
| **D-9.36** | **Use automatic caching (top-level cache_control) not manual breakpoints** | New Anthropic GA feature. One field at top of request = system auto-handles cache placement. Eliminates wrong-order bugs. Simpler code. | Apr 10, 2026 |
| **D-9.37** | **Claude Managed Agents — WATCH, do not adopt yet** | Launched April 8 in public beta. Could eliminate Phase 1 custom pipeline orchestration. Beta = breaking changes possible. Re-evaluate when GA. Our app must not depend on beta infra. | Apr 10, 2026 |
| **D-9.38** | **Remove context-1m-2025-08-07 beta header from all code before April 30** | Anthropic retiring this beta header April 30. Sonnet 4.6 has 1M context as GA (no header needed). Codebase was already clean — zero matches found. | Apr 10, 2026 |
| **D-9.39** | **Migrate contested appeal path from OpenRouter → Direct Anthropic SDK** | Critical discovery: OpenRouter HTTP passthrough BLOCKS adaptive thinking, prompt caching, and structured outputs. Direct SDK is strictly better: more features + lower cost (no middleman markup) + enables 90% cache savings. DONE in sarvam.ts. | Apr 10, 2026 |
| **D-9.40** | **Keep OpenRouter as FALLBACK only, not primary** | After SDK migration, routing is: Anthropic SDK (primary) → OpenRouter (fallback if key missing) → Sarvam (degraded fallback). OpenRouter removed from primary contested appeal path. | Apr 10, 2026 |

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
| **v9.0** | **Apr 5** | **CLEAN REWRITE. One document. 10 contradictions resolved. DPDP compliance, Supabase protection, honest cost model, simplified database, Karnataka RAI prep. SELL FIRST principle. Prompt caching. Triple-validated (Claude + Perplexity + Gemini).** |
| **v9.1** | **Apr 6** | **CROSS-VALIDATION PATCH. 8 findings from 3 reviews. Added monitoring, rate limits, security, prompt tracking, Sarvam reclassified, regeneration buffer, Bhashini moved to P1.** |
| **v9.2** | **Apr 6** | **GOOGLE DR PATCH + FINAL AUDIT. 13 fixes: (1) Gemini BLOCKS Kannada, (2) Supabase self-host moved to P1, (3) Gujarat HC precedent, (4) Entity Lock screen, (5) RAI Committee May 12, (6) Sarvam Vision ₹1.5/page, (7) 5 numbering bugs fixed, (8) 4 contradictions resolved, (9) Kannada ToS added, (10) NIC/Revenue Minister threat added, (11) GST threshold corrected, (12) Bhashini MoU requirement, (13) streaming output added. 35 decisions. 45 build tasks (20 P0 + 18 P1 + 7 P2). ZERO known contradictions remaining.** |
| **v9.2.1** | **Apr 9** | **TECH SCAN PATCH. 6 items: adaptive thinking syntax, Structured Outputs GA, 1-hour cache GA, Compaction evaluate, Sarvam Chanakya HIGH-ACTIVE, Karnataka MoU tightened. 3 new P0 tasks (P-0.46, P-0.47, P-0.48).** |
| **v9.2.2** | **Apr 10** | **TECH SCAN + SDK MIGRATION. Discovery: app used OpenRouter HTTP (blocks all Anthropic-native features). Fix: migrated contested path to direct Anthropic SDK. Built: callAnthropicSonnet() + generateClarifyingQuestions() + extractEntitiesForLock(). Unlocked: adaptive thinking, 1h prompt caching (90% cost saving), structured outputs. TypeScript: 0 errors. P-0.46/47/49 all DONE. 2 new decisions (D-9.39, D-9.40). Pending: add ANTHROPIC_API_KEY to VPS + npm install + pm2 restart.** |

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

# END OF BLUEPRINT v9.2.2
# This is the ONLY active blueprint.
# All previous versions (v6.7 through v9.2.1) are archived for reference only.
# Cross-validated by: Claude (CTO) + Perplexity DR + Gemini x2 + GPT + Google DR x2
# Total reviews: 7 rounds by 6 different AI models
# This is the most cross-validated startup blueprint ever created by AI.
