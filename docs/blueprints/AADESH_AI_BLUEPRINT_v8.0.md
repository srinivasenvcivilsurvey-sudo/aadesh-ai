# AADESH AI — BLUEPRINT v8.0
# Date: April 3, 2026 | Status: APPROVED
# Architecture: Personalized Few-Shot Learning with Crowdsourced Quality Pool
# NOT RAG. NOT Agentic RAG. NOT LangChain.

---

## A. PRODUCT (One Line)

Any Karnataka land revenue caseworker uploads their best orders → AI learns THEIR style → uploads new case PDF → AI reads, asks questions, generates order in THEIR style → caseworker rates accuracy → high-rated orders improve the system for everyone.

**Customer:** Individual caseworker (DDLR / AC / Tahsildar / DC)
**Price:** ₹500/order (after trust built via free demo)
**Moat:** Per-user style adaptation + network effect (more users = better for all)

---

## B. THREE-PHASE USER JOURNEY

### PHASE 1: SETUP (one time, 2 minutes)

```
Screen: /onboarding

Step 1: Sign up (Google OAuth or email/password)
Step 2: Select office type
        → Dropdown: DDLR / AC / Tahsildar / Special DC / Other
Step 3: Select district
        → Dropdown: All 31 Karnataka districts
Step 4: Select taluk
        → Dropdown: Filtered by district selection
Step 5: Enter officer details
        → Name: ___________
        → Designation: ___________
        → Salutation: ___________  (e.g., "ವಿಶೇಷ ಉಪ ತಹಸೀಲ್ದಾರ್")
Step 6: Define case types you handle
        → "Add case type" button
        → Type name: ___________ (e.g., "ಪೋಡಿ ರದ್ದು", "ಸುಮೊಟೊ ಪರಿಶೀಲನೆ")
        → Can add 1-20 case types
        → Suggested defaults shown per office type
Step 7: Profile created → Redirect to Training page
```

**Database: profiles table**
```sql
id              UUID PRIMARY KEY (from Supabase auth)
email           TEXT NOT NULL
full_name       TEXT NOT NULL
office_type     TEXT NOT NULL  -- 'DDLR' | 'AC' | 'Tahsildar' | 'DC' | 'Other'
district        TEXT NOT NULL  -- 'Bangalore Urban' | 'Mysore' | etc.
taluk           TEXT NOT NULL  -- 'Bangalore South' | 'Hunsur' | etc.
officer_name    TEXT NOT NULL  -- For order placeholders
designation     TEXT           -- For order header
salutation      TEXT           -- For order format
case_types      JSONB NOT NULL -- [{id, name, ref_count, status}]
training_status INTEGER DEFAULT 0  -- 0-100 percentage
mode            TEXT DEFAULT 'personal'  -- 'personal' | 'global' | 'demo'
credits         INTEGER DEFAULT 3  -- Free starter credits
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

---

### PHASE 2: TRAINING (one time, 10-30 minutes)

```
Screen: /app/train

HEADER: "Train your AI assistant"
SUBTEXT: "Upload your best signed orders. More orders = better results."

FOR EACH CASE TYPE:
┌─────────────────────────────────────────────────┐
│ Case Type: ಪೋಡಿ ರದ್ದು (RTC Cancellation)        │
│                                                  │
│ Status: ██████░░░░ 60% (3 of 5 minimum)         │
│                                                  │
│ Uploaded: 3 files                                │
│   ✅ Order_RTC_Cancel_001.pdf  (12 pages)        │
│   ✅ Order_RTC_Cancel_002.pdf  (8 pages)         │
│   ✅ Order_RTC_Cancel_003.docx (5 pages)         │
│                                                  │
│ [+ Upload more orders]                           │
│                                                  │
│ ⚠️ Upload 2 more orders for best results        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Case Type: ಮೇಲ್ಮನವಿ ವಜಾ (Appeal Dismissed)      │
│                                                  │
│ Status: ██████████ 100% READY ✅                 │
│                                                  │
│ Uploaded: 5 files                                │
│   ✅ Appeal_Dismissed_001.pdf                     │
│   ✅ Appeal_Dismissed_002.pdf                     │
│   ✅ Appeal_Dismissed_003.pdf                     │
│   ✅ Appeal_Dismissed_004.pdf                     │
│   ✅ Appeal_Dismissed_005.pdf                     │
│                                                  │
│ ✅ Ready to generate orders for this type        │
└─────────────────────────────────────────────────┘

OVERALL TRAINING STATUS BAR:
████████░░ 80% — 4 of 5 case types ready

BUTTON (when 100%): [✅ Start generating orders →]
BUTTON (anytime):   [🌐 Try with global knowledge (demo mode) →]
```

**Training readiness formula:**
```
Per case type: min(uploaded_count / 3, 1.0) × 100%
  - 0 files = 0%
  - 1 file = 33%
  - 2 files = 67%
  - 3+ files = 100% READY

Overall: (types at 100% / total types) × 100%
  - 4 of 5 types ready = 80%
  - 5 of 5 = 100% = fully trained
```

**What happens when files are uploaded:**
```
1. File saved to Supabase Storage: /references/{user_id}/{case_type_id}/
2. Claude Vision API reads each file (extracts text, structure)
3. System extracts:
   - Section structure (headings, order of sections)
   - Legal phrases and terminology
   - Sentence patterns
   - Word count and density
   - Formatting conventions
4. Per-user "bible" auto-generated and stored as JSONB
5. Training status recalculated
```

**Database: references table**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE
case_type_id    TEXT NOT NULL  -- matches case_types JSONB key
file_name       TEXT NOT NULL
file_path       TEXT NOT NULL  -- Supabase storage path
file_size       INTEGER
page_count      INTEGER
extracted_text   TEXT          -- Full OCR text (for search)
extracted_bible  JSONB         -- {sections, phrases, terminology, patterns}
quality_score   INTEGER        -- AI self-assessed quality of this reference
uploaded_at     TIMESTAMPTZ DEFAULT NOW()
```

**Database: user_bibles table**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE
case_type_id    TEXT NOT NULL
bible_version   INTEGER DEFAULT 1  -- Increments with each update
sections        JSONB NOT NULL     -- Typical section order
terminology     JSONB NOT NULL     -- Key legal terms used
phrases         JSONB NOT NULL     -- Common sentence patterns
style_notes     JSONB              -- Word count range, density, formality
district_style  JSONB              -- District-specific patterns
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, case_type_id)  -- One bible per case type per user
```

---

### PHASE 3: GENERATE (daily use, 3-4 minutes per order)

```
Screen: /app/generate

STEP 1: SELECT MODE
┌──────────────────────┐  ┌──────────────────────┐
│ 📁 Personal Mode     │  │ 🌐 Global Demo Mode  │
│ Uses YOUR references │  │ Uses best orders     │
│ 95-100% accuracy     │  │ from all districts   │
│ ✅ Recommended       │  │ ~80% accuracy        │
└──────────────────────┘  └──────────────────────┘

STEP 2: SELECT CASE TYPE (if personal mode)
→ Dropdown of user's defined case types
→ Only shows types with 100% training status
→ Types below 100% show "Upload X more files to unlock"

STEP 3: UPLOAD CASE FILE
┌─────────────────────────────────────────────────┐
│                                                  │
│         📄 Upload your case file PDF             │
│                                                  │
│     Drag and drop or click to browse             │
│     Accepts: PDF, DOCX (max 200 pages)           │
│                                                  │
└─────────────────────────────────────────────────┘

STEP 4: AI READS (loading screen, 15-30 seconds)
"ನಿಮ್ಮ ಪ್ರಕರಣ ಓದಲಾಗುತ್ತಿದೆ... (Reading your case file...)"
Progress bar: ██████░░░░ 60%

STEP 5: CLARIFYING QUESTIONS (4-5 questions, ~60 seconds)
┌─────────────────────────────────────────────────┐
│ AI has read your case file. Please confirm:      │
│                                                  │
│ 1. What is the outcome of this case?             │
│    ○ ಪುರಸ್ಕರಿಸಿದೆ (Allowed)                      │
│    ○ ವಜಾಗೊಳಿಸಿದೆ (Dismissed)                     │
│    ○ ಮರುಕಳುಹಿಸಿದೆ (Remanded)                    │
│                                                  │
│ 2. Presiding officer name and designation?       │
│    [Pre-filled from profile: Ramesh K., DDLR]    │
│                                                  │
│ 3. Date of this order?                           │
│    [Calendar picker]                             │
│                                                  │
│ 4. Any previous related case numbers?            │
│    [Text input, optional]                        │
│                                                  │
│ 5. AI asks case-specific question based on       │
│    what it read (e.g., "The HC order mentions    │
│    survey 45/2 — should this be included?")      │
│                                                  │
│ [Generate Order →]                               │
└─────────────────────────────────────────────────┘

STEP 6: ORDER GENERATED (preview + edit)
┌─────────────────────────────────────────────────┐
│ ✅ Order generated (687 words)                   │
│                                                  │
│ [Editable Kannada text area]                     │
│ ಕರ್ನಾಟಕ ಸರ್ಕಾರ                                  │
│ ಕಂದಾಯ ಇಲಾಖೆ                                    │
│ ...                                              │
│                                                  │
│ AI Confidence: 92% ████████░░                    │
│                                                  │
│ Section scores:                                  │
│  ✅ Header (98%)  ✅ Facts (90%)                  │
│  ✅ Findings (88%)  ✅ Verdict (95%)              │
│                                                  │
└─────────────────────────────────────────────────┘

STEP 7: USER RATES ACCURACY (BEFORE download)
┌─────────────────────────────────────────────────┐
│ ⭐ How accurate is this order?                   │
│                                                  │
│ ○ 50% — Many corrections needed                 │
│ ○ 60% — Several corrections needed              │
│ ○ 70% — Some corrections needed                 │
│ ○ 80% — Minor corrections needed                │
│ ○ 90% — Almost perfect                          │
│ ○ 95% — Nearly perfect, tiny edits only         │
│ ○ 100% — Perfect, no changes needed             │
│                                                  │
│ ☐ Allow anonymized patterns to help other        │
│   officers (no personal data shared)             │
│                                                  │
│ [Download DOCX →]    [Download PDF →]            │
└─────────────────────────────────────────────────┘
```

**Database: orders table**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE
case_type_id    TEXT NOT NULL
mode            TEXT NOT NULL  -- 'personal' | 'global'
input_file_path TEXT           -- Uploaded case PDF
input_summary   TEXT           -- AI-generated case summary
questions       JSONB          -- Questions asked + answers given
generated_text  TEXT NOT NULL   -- Raw AI output
edited_text     TEXT           -- User's edited version (if changed)
edit_distance   INTEGER        -- How much user changed (chars)
ai_confidence   INTEGER        -- AI self-score (0-100)
user_rating     INTEGER        -- User's accuracy rating (50-100)
consent_global  BOOLEAN DEFAULT FALSE  -- User consented to global pool
word_count      INTEGER
model_used      TEXT           -- 'claude-sonnet-4-6' | 'sarvam-105b'
cost_inr        DECIMAL(10,2)  -- Actual API cost
credits_used    INTEGER DEFAULT 1
created_at      TIMESTAMPTZ DEFAULT NOW()
```

**Database: global_patterns table**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
office_type     TEXT NOT NULL
case_type_name  TEXT NOT NULL
district        TEXT NOT NULL
source_order_id UUID REFERENCES orders(id)
source_rating   INTEGER NOT NULL  -- Must be >= 95
patterns        JSONB NOT NULL    -- {sections, phrases, terminology}
                                  -- NO personal data, NO names, NO case numbers
contributed_at  TIMESTAMPTZ DEFAULT NOW()

-- Only orders rated 95%+ with consent enter this table
-- Patterns are extracted, not full text
```

**Database: audit_log table**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES profiles(id)
action          TEXT NOT NULL  -- 'generate' | 'download' | 'rate' | 'upload_ref'
details         JSONB
ip_address      TEXT
user_agent      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## C. TECHNOLOGY STACK

| Component | Tool | Monthly Cost | Why |
|-----------|------|-------------|-----|
| Frontend | Next.js 15 | ₹0 | Already built, proven |
| Database | Supabase Mumbai (ap-south-1) | ₹0-2,100 | India data residency |
| Storage | Supabase Storage | ₹0 (included) | Reference files |
| Auth | Supabase Auth + Google OAuth | ₹0 | Already working |
| AI (reading PDF) | Claude Sonnet 4.6 Vision | ~₹5/read | Native PDF vision |
| AI (generating) | Claude Sonnet 4.6 | ~₹12/order | Proven 100/100 |
| AI (fallback) | Sarvam 105B | FREE | Simple cases only |
| Documents | docxtpl + Noto Sans Kannada | ₹0 | Proven Kannada rendering |
| VPS | DigitalOcean Bangalore | ₹1,250 | India hosting |
| Payments | Razorpay | Per-txn | Already integrated |
| Domain | aadesh-ai.in (GoDaddy) | ₹800/yr | Already owned |
| **TOTAL** | | **₹3,350-5,450/month** | |

---

## D. API ENDPOINTS

### Auth & Profile
```
POST   /api/auth/signup          — Create account
POST   /api/auth/login           — Login
GET    /api/profile              — Get user profile
PUT    /api/profile              — Update profile
PUT    /api/profile/case-types   — Add/edit case types
```

### Training
```
POST   /api/references/upload    — Upload reference order
GET    /api/references           — List user's references
DELETE /api/references/:id       — Remove a reference
GET    /api/training/status      — Get training readiness %
POST   /api/training/build-bible — Trigger bible generation
```

### Generation
```
POST   /api/read-case            — Upload case PDF → Claude reads → returns summary + questions
POST   /api/generate-order       — Answers + context → Claude generates order
POST   /api/self-audit           — AI checks its own output → returns V2 if needed
```

### Feedback & Download
```
POST   /api/orders/:id/rate      — Submit user rating + consent
GET    /api/orders/:id/download  — Download DOCX/PDF
POST   /api/orders/:id/edits     — Save user's edited version
```

### Global Pool
```
GET    /api/global/patterns      — Get global patterns for demo mode
POST   /api/global/contribute    — Add 95%+ order patterns to pool
```

---

## E. GENERATION PIPELINE (Technical Flow)

```
USER UPLOADS PDF
       │
       ▼
┌─────────────────────────────────────┐
│ 1. UPLOAD & VALIDATE                │
│    - Max 200 pages, max 50MB        │
│    - Convert each page to base64    │
│    - Store original in Supabase     │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 2. CLAUDE READS (Vision API)        │
│    Model: claude-sonnet-4-6         │
│    Input: All pages as image blocks │
│    System: "Read this case file.    │
│     Return JSON: {summary, type,    │
│     questions[]}"                   │
│    Cost: ~₹5 per read               │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 3. SHOW QUESTIONS TO USER           │
│    - Pre-fill from profile          │
│    - 4-5 questions, 60 seconds      │
│    - Include case-specific question │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 4. BUILD CONTEXT                    │
│    - Load user's bible for this     │
│      case type                      │
│    - Select top 2-3 matching        │
│      reference orders               │
│    - Build dynamic system prompt:   │
│      base rules + user bible +      │
│      profile placeholders           │
│    - If global mode: load global    │
│      patterns instead               │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 5. GENERATE ORDER                   │
│    Model: claude-sonnet-4-6         │
│    System prompt:                   │
│      [Base rules] +                 │
│      [User's bible] +              │
│      [Officer details] +            │
│      [2-3 reference examples]       │
│    User message:                    │
│      [Case summary] +              │
│      [User's answers] +            │
│      "Generate a complete Kannada   │
│       order for this case"          │
│    Max tokens: 8192                 │
│    Cost: ~₹12 per generation        │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 6. SELF-AUDIT                       │
│    Same model, new call:            │
│    "Review this order. Check:       │
│     - All sections present?         │
│     - Facts match input?            │
│     - Terminology correct?          │
│     - Word count 600-900?           │
│     - No English words?             │
│     Return: {score, issues[],       │
│      fixed_version (if score<85)}"  │
│    Cost: ~₹3 per audit              │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 7. SHOW PREVIEW + COLLECT RATING    │
│    - Editable text area             │
│    - AI confidence score shown      │
│    - User rates 50-100%             │
│    - Consent checkbox for global    │
│    - Track what user edits          │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 8. DOCX GENERATION                  │
│    - docxtpl with templates         │
│    - Noto Sans Kannada font         │
│    - Template per office type       │
│    - Officer name auto-filled       │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 9. POST-DOWNLOAD ACTIONS            │
│    - Save order to database         │
│    - Save user edits (if any)       │
│    - If rating >= 95% AND consent:  │
│      → Extract patterns             │
│      → Strip ALL personal data      │
│      → Add to global_patterns       │
│    - Log to audit_log               │
│    - Deduct credits                 │
└─────────────────────────────────────┘
```

---

## F. DYNAMIC SYSTEM PROMPT (How it adapts per user)

The system prompt is NOT fixed. It's assembled at runtime:

```
SYSTEM PROMPT = 
  [BASE_RULES]           ← Universal rules (17 rules from V3.2.1)
  + [OFFICE_HEADER]      ← Office type specific header format
  + [USER_BIBLE]         ← Extracted from user's reference orders
  + [OFFICER_DETAILS]    ← From profile: name, designation, district
  + [REFERENCE_EXAMPLES] ← 2-3 best matching reference orders (full text)
```

**Example for Mysore DDLR officer:**
```
You are drafting a Sarakari Kannada order for:
Officer: Ramesh K., DDLR, Mysore District, Nanjangud Taluk

Based on this officer's previous orders, follow these patterns:
- Section order: ಕ್ರಮ ಸಂಖ್ಯೆ, ಮೇಲ್ಮನವಿದಾರರು, ಎದುರುದಾರರು, ಹಿನ್ನೆಲೆ, ...
- Average word count: 720 words
- Terminology: Use ಎದುರುದಾರರು (not ಪ್ರತಿವಾದಿ)
- Style: Formal, 3rd person, no abbreviations
- Verdict format: "ಆದ್ದರಿಂದ ಈ ಮೇಲ್ಮನವಿಯನ್ನು _____ ಮಾಡಲಾಗಿದೆ"

[17 base rules follow...]
[2-3 complete reference order examples follow...]
```

**Example for Gulbarga AC officer:**
```
You are drafting a Sarakari Kannada order for:
Officer: Suresh M., AC, Gulbarga District, Aland Taluk

Based on this officer's previous orders, follow these patterns:
- Section order: [different from Mysore]
- Average word count: 850 words
- Terminology: [Gulbarga-specific terms]
- Style: [Gulbarga-specific patterns]
...
```

---

## G. GLOBAL KNOWLEDGE POOL (Demo Mode)

### How patterns enter the pool:
```
1. User generates order → rates 95%+ → consents to sharing
2. System extracts PATTERNS ONLY (not full text):
   - Section structure
   - Legal phrase templates (with placeholders)
   - Terminology list
   - Sentence patterns
3. ALL personal data stripped:
   ❌ Names, survey numbers, villages, case numbers, dates
   ✅ Structure, phrases, formatting rules
4. Pattern stored in global_patterns with metadata:
   - office_type, case_type, district (for matching)
```

### How demo mode uses the pool:
```
1. New user selects "Global Demo Mode"
2. System finds best matching patterns:
   - Match by office_type first
   - Then by case_type
   - Prefer same district, fall back to any
3. Patterns injected into system prompt as bible
4. Generate with lower expected accuracy (~80%)
5. UI clearly shows: "Demo mode — 80% accuracy expected.
   Upload your own orders for 95%+ accuracy."
```

### Privacy safeguards:
```
1. Patterns only — never full order text
2. Minimum 10 districts contributing before any pattern is shared
3. Explicit opt-in consent per order
4. User can revoke consent anytime → patterns removed
5. DPDP Act compliance: anonymized data exempt (Section 7)
6. All audit logged
```

---

## H. EDIT TRACKING (Learning Signal)

When user edits the generated order before downloading:

```
1. Save original AI text (generated_text)
2. Save edited text (edited_text)
3. Calculate edit_distance (character-level diff)
4. Extract WHAT changed:
   - Terminology corrections
   - Section additions/removals
   - Fact corrections
   - Style adjustments
5. Feed changes back into user's bible:
   - "User always changes X to Y" → update bible
   - "User always adds section Z" → update bible
6. Bible version increments
7. Next generation uses updated bible → better quality
```

This creates a **continuous improvement loop** per user.

---

## I. COST MODEL

### Per order cost:
```
Step 2 (Read PDF):    ~₹5   (Claude Vision, ~20 pages avg)
Step 5 (Generate):    ~₹12  (Claude Sonnet 4.6, 8K output)
Step 6 (Self-audit):  ~₹3   (Claude Sonnet 4.6, review)
Step 8 (DOCX):        ~₹0   (local processing)
────────────────────────────
TOTAL PER ORDER:      ~₹20

Revenue per order:    ₹500
Gross margin:         96%
```

### Monthly infrastructure:
```
Supabase Pro:         ₹2,100
DigitalOcean VPS:     ₹1,250
Domain:               ₹67 (₹800/year)
────────────────────────────
TOTAL MONTHLY:        ₹3,417

Break-even:           7 orders/month (₹3,417 / ₹480 margin)
```

---

## J. RISK MITIGATIONS

| Risk | Severity | Mitigation |
|------|----------|------------|
| DPDP compliance | HIGH | Patterns only in global pool. Anonymized. Consent-based. |
| Token cost explosion | HIGH | Smart reference selection — max 2-3 refs per call. Bible for rest. |
| Sarvam Chanakya competition | HIGH | Monitor. We're B2C (individual caseworkers), they're B2G (govt contracts). Different buyer. |
| Training readiness gaming | MEDIUM | Formula: min 3 orders per type. No subjective score. |
| Feedback gaming (fake 100%) | LOW | Cross-check: AI score vs user score. Track edit distance. |
| Internet unreliability | MEDIUM | Sarvam Vision as OCR fallback when Claude API down. |
| User data in wrong hands | HIGH | Supabase RLS — each user sees ONLY their data. Zero cross-access. |

---

## K. BUILD SEQUENCE (Claude Code Tasks)

| # | Task | Priority | Est. Time | Dependencies |
|---|------|----------|-----------|-------------|
| 1 | Onboarding screens (office, district, case types) | P0 | 1 day | None |
| 2 | Training page (upload references, status bar) | P0 | 1 day | Task 1 |
| 3 | Bible generation engine | P0 | 1 day | Task 2 |
| 4 | Dynamic system prompt builder | P0 | 0.5 day | Task 3 |
| 5 | PDF upload + Claude Vision read | P0 | 1 day | None |
| 6 | Clarifying questions UI | P0 | 0.5 day | Task 5 |
| 7 | Order generation with dynamic prompt | P0 | 1 day | Task 4, 6 |
| 8 | Self-audit loop | P1 | 0.5 day | Task 7 |
| 9 | Preview + edit tracking | P1 | 0.5 day | Task 7 |
| 10 | User rating UI | P1 | 0.5 day | Task 9 |
| 11 | DOCX generation with templates per office | P1 | 0.5 day | Task 7 |
| 12 | Global pool backend | P2 | 1 day | Task 10 |
| 13 | Demo mode | P2 | 0.5 day | Task 12 |
| 14 | Edit tracking → bible update | P2 | 1 day | Task 9 |
| 15 | Taluk-level clustering | P3 | 1 day | Task 12 |

**Total estimated: 11 days**
**P0 only (MVP): 6 days**

---

## L. WHAT STAYS FROM v7.5

- aadesh-ai.in domain + SSL + VPS ✅
- Google OAuth + Supabase auth ✅
- Razorpay billing (4 packs) ✅
- Order history page ✅
- DOCX download ✅
- Language toggle (Kannada/English) ✅
- Mobile-first UI ✅
- Claude Sonnet 4.6 as primary AI ✅
- docxtpl for Word generation ✅
- Audit logging ✅

## M. WHAT'S NEW IN v8.0

- Multi-office support (DDLR/AC/Tahsildar/DC) ✅ NEW
- Multi-district support (all 31 Karnataka districts) ✅ NEW
- Per-user case type definitions ✅ NEW
- Per-user reference upload + training ✅ NEW
- Training readiness meter ✅ NEW
- Dynamic system prompt (not fixed V3.2.1) ✅ NEW
- Personal bible auto-generation ✅ NEW
- User accuracy rating (before download) ✅ NEW
- Edit tracking (learning signal) ✅ NEW
- Global knowledge pool (demo mode) ✅ NEW
- AI confidence score per section ✅ NEW
- DPDP-compliant pattern sharing ✅ NEW

---

## N. SUCCESS METRICS

| Metric | Phase 0 Target | Phase 1 Target | Phase 2 Target |
|--------|---------------|----------------|----------------|
| Active users | 1 (Banu) | 10 | 100 |
| Orders/month | 10 | 100 | 1,000 |
| Avg rating | 90%+ | 92%+ | 95%+ |
| Global pool size | 0 | 20 patterns | 200 patterns |
| Districts covered | 1 | 3 | 10 |
| Office types | 1 (DDLR) | 2 | 4 |
| Revenue/month | ₹0 (free) | ₹5,000 | ₹50,000 |

---

## O. VERSION HISTORY

| Version | Date | What Changed |
|---------|------|-------------|
| v6.7 | Mar 26 | Base: text form, Sarvam 105B |
| v7.0 | Mar 28 | Added: document upload concept |
| v7.4 | Mar 31 | RAG pipeline (8 files, scored 62/100) |
| v7.5 | Apr 2 | PIVOT: PDF + Claude Vision = 100/100. RAG dropped. |
| **v8.0** | **Apr 3** | **MULTI-TENANT: Any office, any district, per-user training, global pool, feedback loop, edit tracking** |

---

# END OF BLUEPRINT v8.0
