# AADESH AI — COMPLETE BACKEND ARCHITECTURE
## Based on actual code only. No assumptions. No marketing.
## Written by: Claude (CTO) | Date: April 12, 2026
## Source files read: generate/route.ts, vision-read/route.ts, references/upload/route.ts,
##   references/generate-prompt/route.ts, export-docx/route.ts, buildPrompt.ts,
##   auditOrder.ts, piiRedactor.ts, rateLimiter.ts, guardrails.ts,
##   smart-context.ts, system-prompt.ts, generate-order/route.ts (old),
##   MASTER_CONTEXT.md, SESSION-HANDOFF.md, STATUS-REALITY-CHECK.md,
##   MASTER_AUDIT_REPORT.md, SPRINT_PLAN.md, AADESH_AI_BLUEPRINT_v9_2_2.md

---

## ⚠️ CRITICAL CONTEXT: TWO GENERATION SYSTEMS EXIST IN PRODUCTION

This is the #1 thing to understand before reading anything else.

| System | Route | Status | What it does |
|--------|-------|--------|-------------|
| **OLD route** | `/api/generate-order` | Still live in production | Text input → Sarvam/Claude → order. Uses `smart-context.ts`. No PDF upload. |
| **NEW pipeline** | `/api/pipeline/generate` | Active — 6-step wizard | PDF upload → Vision read → Questions → Generate. Uses `buildPrompt.ts`. |

Both routes are live. Both can be called. The new pipeline is the intended product.
The old route is legacy but not removed.

---

## 1. USER FLOW (End-to-End)

### New Pipeline (6-step wizard — the real product)

```
Step 1: Officer uploads case PDF
    ↓
Step 2: System sends PDF to Claude Vision → extracts case facts
    ↓
Step 3: Entity Lock screen — officer confirms extracted facts are correct
    ↓ (officer checks a box: "I verify these facts are accurate")
Step 4: Clarifying questions — officer answers 4-5 specific questions
    (outcome = Allowed/Dismissed/Remanded, order date, officer name, related cases)
    ↓
Step 5: System generates Kannada order (live streaming — words appear in real time)
    ↓
Step 6: Officer reviews → edits if needed → downloads .docx file
```

### Login → Dashboard Flow

```
Officer visits aadesh-ai.in
    ↓
Clicks "Login with Google"
    ↓
Google OAuth via Supabase → creates row in profiles table
    ↓
Lands on /app (Dashboard)
    ↓
Sees: credit balance, past orders list, "Upload References" button, "Generate Order" button
```

---

## 2. REFERENCE UPLOAD FLOW

### What the officer does
Officer goes to `/app/my-references` → selects a PDF/DOCX/TXT file from their computer → clicks Upload.

⚠️ **NOTE: `/app/my-references` is currently 404 on the VPS.** The route file exists in code but has not been deployed/confirmed working on the live server. Officers cannot reach this page right now.

### What happens on the server

```
Officer's file arrives at /api/references/upload
    ↓
Check 1: Is user logged in? (Bearer token validation)
Check 2: Is file type PDF, DOCX, or TXT? (no other types accepted)
Check 3: Is file size under 10MB?
Check 4: Does user already have 30 files? (max allowed)
    ↓
Extract all text from the file:
    PDF  → pdf-parse library → plain text
    DOCX → mammoth library   → plain text
    TXT  → read directly     → plain text
    ↓
Upload ORIGINAL FILE to Supabase Storage bucket: "references"
    Path: {user_id}/{timestamp}_{filename}
    (e.g. abc-123/1744444400000_Hesaraghatta_129.pdf)
    ↓
Save TEXT + METADATA to Supabase database (references table)
    ↓
Return: { success: true, total_count: N, text_length: N }
```

### What is saved in the `references` table

| Column | What is stored | Example |
|--------|---------------|---------|
| `user_id` | Officer's UUID | "abc-123-def" |
| `file_name` | Original filename | "Hesaraghatta_129.pdf" |
| `file_path` | Path in Storage bucket | "abc-123/1744400000_Hesaraghatta_129.pdf" |
| `extracted_text` | **Full text of the order** — this is what Claude reads | 800-word Kannada order text |
| `case_type_id` | Case type | ⚠️ **NEVER SET during upload — always NULL** |
| `uploaded_at` | Timestamp | "2026-04-12T10:00:00Z" |

### ⚠️ IMPORTANT: `case_type_id` is never set
The upload route does NOT ask the officer what type of case the reference is.
It inserts the row without `case_type_id`. The column exists in the table. The fetch queries reference it as a fallback. But since it's always NULL, the fallback never works.

### After upload: the original file is NEVER read again
Once text is extracted and saved to `extracted_text`, the file in Supabase Storage is just a backup.
All future AI generation reads ONLY the `extracted_text` column from the database.

### Supabase Storage — TWO SEPARATE BUCKETS

| Bucket name | What is stored in it |
|------------|---------------------|
| `references` | Reference order files uploaded by officers (PDF/DOCX/TXT) |
| `files` | Generated DOCX order files (saved when officer downloads) |

These are completely separate. Do not confuse them.

---

## 3. MINIMUM 5 REFERENCES LOGIC

### Where the check happens
Inside `/api/pipeline/generate/route.ts`, BEFORE credit deduction.

### Exact sequence in code

```
1. Load all references for this user from the references table
   (ordered by uploaded_at DESC, limit 8)
   ↓
2. Count how many rows came back
   ↓
3. If count < 5:
   → Send error event to browser:
     { message: "Upload minimum 5 reference orders before generating",
       code: "INSUFFICIENT_REFERENCES",
       referencesFound: N }
   → Close stream
   → DO NOT deduct any credit
   → Generation STOPPED
   ↓
4. If count >= 5:
   → Continue to credit deduction and generation
```

### Is there a frontend check too?
Not confirmed from the code read. The backend is the definitive gate.
The frontend may show a count, but the hard block is server-side.

---

## 4. HOW AI READS REFERENCES

### Are files converted to text? YES — at upload time

When officer uploads a file, ALL text is extracted immediately and saved to `extracted_text` in the database. The original file in Supabase Storage is never re-read.

### Where is extracted text stored?
`references` table → `extracted_text` column (TEXT type — can hold thousands of characters).

### How is it retrieved during generation?

```sql
SELECT id, extracted_text, case_type_id, uploaded_at
FROM references
WHERE user_id = [officer's ID]
ORDER BY uploaded_at DESC
LIMIT 8
```

The system takes **the 8 most recently uploaded files** for this officer.
Files beyond 8 are ignored regardless of relevance or quality.

### What if user has no references?
The old route (`/api/generate-order`) has a fallback:
- First checks `references` table with `.eq('is_active', true)` (column never set — always returns nothing)
- Then checks Supabase Storage `files` bucket for any uploaded files
- If nothing found → uses **DEMO_REFERENCES** — 5 hardcoded short Kannada text excerpts embedded directly in `smart-context.ts`

These demo excerpts are generic DDLR-style text, not any specific officer's style.
The new pipeline (`/api/pipeline/generate`) does NOT have a demo fallback — it simply blocks with the "minimum 5 references" error.

---

## 5. PROMPT BUILDING

### File: `src/lib/pipeline/buildPrompt.ts`

Think of the prompt as a 3-layer sandwich sent to Claude as ONE user message:

```
┌────────────────────────────────────────────────────┐
│  LAYER 1 — System Prompt                           │
│  (CACHED for 1 hour — saves 90% cost on repeats)  │
│                                                    │
│  What goes here:                                   │
│  → IF officer has personal_prompt in profiles:     │
│    Use the personal_prompt (contains V3.2.6 base  │
│    + officer's extracted style additions)          │
│  → IF no personal_prompt:                         │
│    Use buildSystemPrompt() → returns V3.2.1       │
│    (hardcoded in system-prompt.ts)                 │
├────────────────────────────────────────────────────┤
│  LAYER 2 — Reference Orders                        │
│  (CACHED for 1 hour — saves 90% cost on repeats)  │
│                                                    │
│  All reference orders joined together:             │
│  "═══ Reference Orders (N used) ═══              │
│   ── Reference 1 ──                               │
│   [full text of order 1]                           │
│   ── Reference 2 ──                               │
│   [full text of order 2]                           │
│   ... up to 8 orders ...                           │
│   ═══ Follow the style of above references ═══"  │
│                                                    │
│  If user has NO references: fallback to a          │
│  profile block (just officer name/designation)     │
├────────────────────────────────────────────────────┤
│  LAYER 3 — This Specific Case                      │
│  (NOT CACHED — changes every order)                │
│                                                    │
│  Contains:                                         │
│  → Case type (contested_appeal / withdrawal / etc) │
│  → Petitioner and respondent names                 │
│  → Key facts (survey numbers, dates, names)        │
│  → Relief sought                                   │
│  → Officer's answers to 4-5 clarifying questions:  │
│    - Outcome (Allowed/Dismissed/Remanded)           │
│    - Officer name                                  │
│    - Order date                                    │
│    - Related cases                                 │
│    - Extra information from AI question            │
└────────────────────────────────────────────────────┘
```

### All 3 layers are sent as ONE user message
There is no separate `system:` field in the Anthropic API call.
All three layers go inside the `messages[0].content` array with `cache_control` markers on layers 1 and 2.

### Token limit check
Before sending, `buildPrompt.ts` estimates total tokens (text length ÷ 4).
If estimate > 200,000 tokens → throws an error. Generation blocked.
Rough estimate: 1 reference order ≈ 800 words ≈ 3,200 tokens. 8 orders ≈ 25,600 tokens.

---

## 6. STYLE LEARNING — EXACT HONEST EXPLANATION

There are two completely different mechanisms. Understanding both is critical.

### Mechanism 1 — In-Context Reference (ALWAYS ACTIVE, minimal style learning)

During every generation, the officer's reference orders are placed in the prompt (Layer 2).
Claude reads them and tries to write in a similar style in that session.

**What this does:** Shows Claude examples of the officer's writing. Claude imitates the pattern.
**What this does NOT do:** No learning. Claude forgets everything after the conversation ends.
**Analogy:** Giving a writer 8 samples and saying "write like this."

### Mechanism 2 — Personal Prompt Generation (ONE-TIME ANALYSIS, stored permanently)

Route: `POST /api/references/generate-prompt`

**When does this run?** It is NOT triggered automatically. It must be called manually (from the My References page, if/when that page exists). It can run when user has 5+ reference files.

**What it does step by step:**

```
1. Load up to 20 of the officer's reference orders from the database
   ↓
2. Load V3.2.6 system prompt from file system:
   Tries these paths in order:
   → [app root]/../KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_6.md
   → [app root]/../../KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_6.md
   → /root/aadesh-ai/KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_6.md
   IF file not found: falls back silently to V3.2.1 (the hardcoded version)
   ↓
3. Send to Claude Sonnet 4.6 with instruction:
   "Read all these orders by ONE officer.
    Write a custom system prompt that captures THIS officer's personal style.
    Base it on V3.2.6 and ADD a section called
    '=== OFFICER PERSONAL STYLE (auto-generated) ==='
    Document: 3-5 real phrases, section lengths, legal terms, opening/closing patterns"
   ↓
4. Claude returns: V3.2.6 text + a new "Personal Style" section with real quotes from their orders
   ↓
5. Save this entire text to profiles.personal_prompt (can be 8,000+ words)
6. Set profiles.training_status = min(100, number_of_refs × 5)
7. Set profiles.prompt_generated_at = now()
```

**What "training_status" means:**
- It is NOT based on quality. It is simply: `number_of_files × 5`, capped at 100.
- 20 files = 100%. 10 files = 50%. This is a display number only.

**Is this real machine learning?** No.
- No model weights are changed
- No fine-tuning happens
- It is a one-time analysis, stored as a long text instruction
- If officer uploads more files later, personal_prompt is NOT updated automatically
- To update, generate-prompt must be called again manually

**Analogy:** An editor who reads all your previous writing, then writes a 2-page "style guide" describing how you write. Every new document is written with that style guide. The guide captures your style in words, not in neural network weights.

---

## 7. GENERATION PIPELINE — STEP BY STEP

### Full path (contested_appeal, appeal, contested)

```
Officer clicks "Generate" in the browser
│
│  Browser sends to /api/pipeline/generate:
│  { caseType, caseSummary, officerAnswers }
│  + Authorization: Bearer [token]
│
▼
GATE 1: Validate Bearer token → confirm user identity via Supabase
│  (If invalid → 401 error, stop)
│
▼
GATE 2: Check daily rate limit
│  Count rows in orders table where user_id = X AND created_at = today (IST)
│  Limit: 10 orders per day (raised from 5 on April 12, 2026)
│  Reset: midnight IST
│  If rate limit checks fails (DB error) → ALLOW and log warning
│  (If over limit → error with reset time, stop)
│
▼
GATE 3: Load officer profile from profiles table
│  Gets: credits_remaining, officer_name, designation, district,
│         salutation, personal_prompt, training_status
│  (If profile not found → error, stop)
│
▼
GATE 4: Check credits
│  If credits_remaining < 1 → error "No credits", stop
│
▼
GATE 5: Load reference orders
│  Query: SELECT extracted_text FROM references
│          WHERE user_id = X
│          ORDER BY uploaded_at DESC LIMIT 8
│  If user has references → use them
│  If no references → try case-type-specific fallback (same query + case_type_id filter)
│  If still none → continue with 0 references
│
▼
GATE 6: Minimum reference check
│  If references.length < 5 → error "Upload minimum 5", stop
│  (Credit NOT deducted at this point)
│
▼
DEDUCT 1 CREDIT (atomic — only after all gates pass)
│  UPDATE profiles SET credits_remaining = credits_remaining - 1
│  WHERE id = X AND credits_remaining >= 1
│  If fails (race condition, no credits) → error "No credits", stop
│  creditDeducted = true (for auto-refund on any later error)
│
▼
PII REDACTION
│  Scan caseSummary + officerAnswers
│  Replace:
│  → Survey numbers (preceded by ಸರ್ವೆ ನಂ / ಸ.ನಂ) → [SURVEY_1], [SURVEY_2]...
│  → Village names (words ending in ಹಳ್ಳಿ, ಪುರ, ನಗರ, etc.) → [VILLAGE_1]...
│  → Names after honorifics (ಶ್ರೀ, ಶ್ರೀಮತಿ, ಕುಮಾರಿ) → [NAME_1], [NAME_2]...
│  Keep a map: { "[NAME_1]" → "ರಾಮಕೃಷ್ಣ", "[SURVEY_1]" → "ಸ.ನಂ 45/3", ... }
│  NOTE: Bare numbers like "12/3/2025" are NOT redacted (fixed April 12)
│        Revenue terms like "ಮಾಲೀಕ" are NOT redacted (fixed April 12)
│
▼
BUILD PROMPT (via buildPrompt.ts)
│  Layer 1: personal_prompt if available, else buildSystemPrompt() = V3.2.1
│  Layer 2: All reference orders joined with Kannada headers
│  Layer 3: Redacted case details + officer answers
│  All in one user message with cache_control on layers 1 and 2
│  Token estimate check: if > 200K → throw error
│
▼
CALL CLAUDE SONNET 4.6 (streaming)
│  Model: claude-sonnet-4-6
│  max_tokens: 8192
│  Streaming: YES (SSE — words sent to browser in real time as chunks)
│  Timeout: 120 seconds
│  Retry: 3 attempts with 30-second delay between retries
│
▼
PII RE-INJECTION
│  Replace [NAME_1] → "ರಾಮಕೃಷ್ಣ" etc. using the map from redaction step
│  Any placeholder not in map → left visible for officer (flagged in warning)
│
▼
NFKC NORMALIZATION
│  (Applied inside guardrails checks)
│  Normalizes Unicode characters for consistent Kannada text comparison
│
▼
SELF-AUDIT (4 guardrail checks — pure regex, zero AI cost)
│  Check 1: Section Completeness
│    → Are 75%+ of required Kannada section markers present?
│    → For appeal: ನ್ಯಾಯಾಲಯ, ಮೇಲ್ಮನವಿ, ಮೇಲ್ಮನವಿದಾರ, ಎದುರುದಾರ,
│                  ಪ್ರಕರಣ, ಸರ್ವೆ, ಆದೇಶ, ಸಹಿ (8 markers)
│    → Pass if 6/8 or more found
│  Check 2: Kannada Purity
│    → Do any blacklisted English words appear? (appeal, order, district, etc.)
│    → Pass if zero English words found
│  Check 3: Fact Preservation
│    → Do all numbers/case numbers from input appear in output?
│    → Extracts all N/N patterns, NN+ numbers from input
│    → Checks each appears in generated text
│  Check 4: Word Count
│    → Auto-detects case category: withdrawal, suo_motu, or contested
│    → Contested: minimum 600 words (target 600-850)
│    → Suo motu: minimum 650 words (target 650-850)
│    → Withdrawal: minimum 400 words (target 400-550)
│    → Only minimum enforced (no upper limit failure)
│  Score: 0-4 (how many checks passed)
│
▼
IF AUDIT SCORE < 4 AND case is not withdrawal/suo_motu:
│  Build correction instruction: "These problems were found: [list]
│  Please fix these problems and rewrite the complete order."
│  Append correction to prompt → call Claude ONCE more (no streaming)
│  Re-run audit on corrected text
│  (Maximum 1 correction attempt — no infinite loop)
│
▼
SEND "done" event to browser:
│  { guardrailScore: 0-4, cachedTokens, modelUsed, creditsRemaining, promptVersion }
│
▼
⚠️ NOTE: Orders table is NOT saved here in the new pipeline.
   Orders are only saved when the officer downloads the DOCX (Step 6).

▼
IF ANY ERROR AFTER CREDIT DEDUCTED:
   Auto-refund: UPDATE profiles SET credits_remaining = credits_remaining + 1
   Uses Supabase RPC 'increment_credits' if available, else direct UPDATE
   Logs to error_log if refund also fails (critical alert)

```

### Simple path (withdrawal, suo_motu)
Same flow except:
- If `SARVAM_API_KEY` is set: uses Sarvam 105B instead of Claude (FREE, faster)
- Self-audit runs only the word count check (not all 4 checks)

---

## 8. DATA STORAGE — ALL TABLES AND BUCKETS

### `profiles` table (1 row per officer)

| Column | What it stores | Notes |
|--------|---------------|-------|
| `id` | User UUID from Google OAuth | Primary key |
| `credits_remaining` | How many orders left | Decremented on generation |
| `officer_name` | Officer's name | Set during profile setup |
| `designation` | Title (e.g. ಕ.ಆ.ಸೇ) | |
| `district` | District name | |
| `salutation` | ಶ್ರೀ or ಶ್ರೀಮತಿ | |
| `full_name` | Full name fallback | Used if officer_name empty |
| `personal_prompt` | AI-generated custom system prompt | TEXT, 8,000+ words. NULL until generate-prompt runs |
| `training_status` | 0–100 integer | = min(100, ref_count × 5). Display only. |
| `prompt_generated_at` | When personal_prompt was last generated | Timestamp |
| `total_orders_generated` | Lifetime order count | Incremented in old route |
| `updated_at` | Last profile update | |

### `references` table (1 row per uploaded file)

| Column | What it stores | Notes |
|--------|---------------|-------|
| `id` | Row UUID | |
| `user_id` | Which officer | Foreign key to profiles |
| `file_name` | Original filename | |
| `file_path` | Path in `references` Storage bucket | |
| `extracted_text` | **Full text of the reference order** | This is what Claude reads. Most important column. |
| `case_type_id` | Case type | ⚠️ ALWAYS NULL — never set by upload route |
| `uploaded_at` | Upload timestamp | Used for ORDER BY — newest first |

### `orders` table (1 row per completed order)

**Important:** In the NEW pipeline, orders are inserted when officer DOWNLOADS the DOCX, not when generation happens.
In the OLD route, orders are inserted at generation time with `verified: false`.

| Column | What it stores | New pipeline | Old route |
|--------|---------------|-------------|----------|
| `id` | UUID | Random UUID | From Supabase auto |
| `user_id` | Officer | ✅ | ✅ |
| `case_type` | Order type | ✅ | ✅ |
| `case_number` | Case reference number | ✅ | ❌ |
| `generated_order` | Full Kannada text | ✅ | ✅ |
| `score` | Guardrail score | 0-4 from auditOrder | 90 or 70 |
| `model_used` | AI model | claude-sonnet-4-6 | From result.model |
| `verified` | Officer acknowledged? | ✅ **true** (set at download) | ❌ **false** always |
| `word_count` | Word count | ✅ | ❌ |
| `credits_used` | Always 1 | ✅ | ❌ |
| `prompt_version` | System prompt version | V3.2.6 (label, see note) | ❌ |
| `input_tokens` | API input tokens | ✅ | ❌ |
| `output_tokens` | API output tokens | ✅ | ❌ |
| `acknowledgement_at` | When officer checked Entity Lock | ✅ | ❌ |
| `created_at` | Timestamp | Used for rate limit count | ✅ |

⚠️ **Note on `prompt_version: 'V3.2.6'`:** This label is written even when personal_prompt is empty, in which case the actual system prompt used is V3.2.1 (the hardcoded fallback). The label is not fully accurate.

### `transactions` table (payments)
Razorpay payment records. 0 entries currently (no paying users yet).

### `audit_log` table
DPDP compliance log. Planned in blueprint. Empty currently.

### Supabase Storage Buckets

| Bucket | What's stored | When written |
|--------|-------------|-------------|
| `references` | Original uploaded files (PDF/DOCX/TXT) | On reference upload |
| `files` | Generated DOCX order files | On download (export-docx route) |

---

## 9. DEMO MODE — EXACT HONEST EXPLANATION

### There is no dedicated "demo mode" switch

However, the **old route** (`/api/generate-order`) behaves like a demo because it works without personal reference uploads.

### How `smart-context.ts` provides demo references

```
When officer has NO uploaded references:
    ↓
1. Query references table with is_active = true AND user_id = X
   (is_active column is never set by upload route → returns nothing)
    ↓
2. Check Supabase Storage `files` bucket for officer's uploads
   (likely empty for new users)
    ↓
3. Fall back to DEMO_REFERENCES — 5 hardcoded Kannada text excerpts
   embedded directly in smart-context.ts
   These are generic DDLR-style text blocks, NOT real orders.
   They look like real orders but are artificial examples.
```

### The 5 demo reference excerpts are:
- 2 appeal-type excerpts (phodi, extent correction)
- 2 suo_motu excerpts (self-initiated review)
- 1 appeal excerpt (area correction)

Each is 4-6 lines of Kannada text only — much shorter than real reference orders.

### Does demo use real AI?
Yes. The old route calls real Claude/Sarvam API with the demo references.
It deducts real credits. It uses real API budget.
There is no sandbox mode.

### New pipeline behavior without references
The new pipeline (`/api/pipeline/generate`) does NOT use demo references.
It blocks with "Upload minimum 5 reference orders" error.
There is no demo path in the new pipeline.

---

## 10. DOCX GENERATION

Route: `POST /api/pipeline/export-docx`

This route is called when the officer clicks "Download" in Step 6.

### What happens

```
1. Receive: { finalText, caseType, caseNumber, orderDate,
              officerName, userId, guardrailScore, modelUsed,
              promptVersion, inputTokens, outputTokens, acknowledgementAt }
   ↓
2. Verify userId in body matches authenticated user (IDOR protection)
   ↓
3. Generate DOCX in memory using `docx` npm package:
   → Parse finalText line by line
   → Detect headers (ಉಪಸ್ಥಿತರು, ಪ್ರಸ್ತಾವನೆ, ಆದೇಶ, etc.)
   → Detect court headers (contains ನ್ಯಾಯಾಲಯ in first 3 lines) → center-align
   → Set font: Noto Sans Kannada on every paragraph
   → Font sizes: court header = 28pt, section headers = 24pt, body = 22pt
   → Footer on every page: "ಆದೇಶ AI ಸಹಾಯದಿಂದ ಕರಡು | Drafted by Aadesh AI | Verified by [OfficerName] | [page number]"
   → Margins: 1 inch all sides, 1.2 inches bottom
   ↓
4. Build filename: {caseType}_{caseNumber}_{date}.docx
   (e.g. contested_appeal_163-2024_12-04-2026.docx)
   ↓
5. Upload DOCX to Supabase Storage bucket `files`
   Path: orders/{user_id}/{orderId}.docx
   ↓
6. Save order record to orders table (verified: true)
   ↓
7. Create signed URL (60 seconds valid) for browser download
   If storage fails → return file as base64 in response body
   ↓
8. Return { downloadUrl, orderId, fileName }
```

---

## 11. SYSTEM PROMPTS — EXACT HIERARCHY

This is critical to understand. Multiple prompt versions exist and which one is used depends on officer state.

```
Case: Officer has uploaded 5+ refs AND manually triggered generate-prompt
    → profiles.personal_prompt = V3.2.6 base + style analysis
    → Used in Layer 1 of buildPrompt
    → Most personalized. Best quality.

Case: Officer has uploaded 5+ refs BUT has NOT triggered generate-prompt
    → profiles.personal_prompt = NULL
    → buildPrompt falls back to buildSystemPrompt() = V3.2.1 (hardcoded)
    → Same 5-8 reference orders in context (helps quality)
    → Missing V3.2.6 improvements

Case: Officer has fewer than 5 refs (blocked from generation)
    → Error: "Upload minimum 5 references"
    → No generation happens

Case: Old route (/api/generate-order)
    → Uses DEFAULT_SYSTEM_PROMPT from sarvam.ts
    → This is the same V3.2.1 system prompt
    → Uses smart-context.ts references (user or demo)
```

### Version history (for reference)

| Version | Location | Lines | Status |
|---------|----------|-------|--------|
| V3.2.1 | Hardcoded in `src/lib/system-prompt.ts` | 382 | FALLBACK — used when no personal_prompt |
| V3.2.6 | File: `KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_6.md` | ~400 | ACTIVE — used as base for personal_prompt |
| V3.2.2–V3.2.5 | `KarnatakaAI/11_DDLR_App/` (archived) | — | Historical — test results in MASTER_CONTEXT |

Quality history: V3.2.1 = 76/100 avg → V3.2.4 = 87.2 → V3.2.6 = 89.2 avg, 91 on Machohalli

---

## 12. AUTHENTICATION AND SECURITY

### Auth method: Supabase Bearer token
Every API route starts the same way:
```
1. Get Authorization header
2. Extract Bearer token
3. Call supabase.auth.getUser(token)
4. If invalid → 401 error, reject request
5. Use authUser.id for all DB queries (NOT the userId from request body)
   This prevents IDOR attacks (officer A accessing officer B's data)
```

### IDOR protection in export-docx
The download route additionally checks: `if (userId !== user.id) → 403 Forbidden`
This means userId in the request body must match the authenticated user.

### Rate limiting
- 10 orders per user per calendar day (IST midnight reset)
- Counted by querying `orders` table
- If DB check fails: **ALLOW** and log warning (fail-open — customer experience > strict protection)

### Credit deduction is atomic
The credit deduction uses: `.gte('credits_remaining', 1)` in the WHERE clause.
This prevents race conditions where two concurrent requests both see 1 credit and both deduct.

---

## 13. TWO GENERATION ROUTES — DIFFERENCES

Understanding which route is used when:

| Feature | Old Route `/api/generate-order` | New Pipeline `/api/pipeline/generate` |
|---------|--------------------------------|--------------------------------------|
| Input | Text typed by officer | Case PDF + Officer answers |
| File upload | None | PDF via Vision read |
| Reference source | smart-context.ts (scored ranking) | buildPrompt.ts (newest-first) |
| Demo fallback | YES — 5 hardcoded excerpts | NO — blocks with error |
| Minimum refs check | NO | YES — 5 required |
| Streaming | NO — returns full response | YES — SSE word-by-word |
| Self-audit | `runGuardrails()` in route | `auditOrder()` in pipeline |
| Correction loop | NO | YES — 1 correction attempt |
| Save orders | At generation (verified: false) | At download (verified: true) |
| PII redaction | YES (piiRedactor.ts) | YES (piiRedactor.ts) |
| Rate limit | 5/day (old constant in old route) | 10/day (updated April 12) |
| Sarvam path | YES for all types | YES for withdrawal + suo_motu only |
| Personal prompt | NO | YES — uses profiles.personal_prompt |

---

## 14. GAPS AND WEAKNESSES — BRUTALLY HONEST

| # | Gap | Severity | What breaks |
|---|-----|----------|-------------|
| 1 | `/app/my-references` is 404 on VPS | CRITICAL | Officers cannot upload references. Cannot reach training. Entire style-learning feature unreachable from UI. |
| 2 | `generate-prompt` is not auto-triggered | HIGH | Officers who upload 5+ files do NOT get a personal prompt automatically. Must be manually triggered. No UI button confirmed working. |
| 3 | `case_type_id` never set on upload | MEDIUM | Case-type-specific reference filtering never works. Fallback always runs. |
| 4 | personal_prompt not updated on new uploads | HIGH | If officer uploads 10 more files, their personal_prompt stays stale until manually regenerated. |
| 5 | V3.2.6 in personal_prompt depends on file path | HIGH | If `/root/aadesh-ai/KarnatakaAI/...` path doesn't exist on VPS, falls back silently to V3.2.1. Lower quality. No error shown. |
| 6 | `training_status` is fake metric | LOW | Shows 100% after 20 files regardless of quality. Misleads officer about readiness. |
| 7 | Two routes in production simultaneously | MEDIUM | Old route still works. Parts of the app may call old route. Inconsistent behavior. |
| 8 | `is_active` column queried but never set | LOW | smart-context.ts first query always returns nothing. Minor inefficiency. |
| 9 | Old route's orders table insert: no prompt_version, no input_tokens | LOW | Quality tracking incomplete for orders from old route. |
| 10 | DOCX uses `docx` npm package (not docxtpl) | MEDIUM | Blueprint says docxtpl for Kannada. Code uses `docx` instead. May have rendering differences. |
| 11 | Self-audit guardrail score (0-4) ≠ quality score (0-100) | CLARITY | Officers see "3/4 guardrails passed" which sounds different from the 89/100 quality scores in testing. |
| 12 | Token estimate uses 1 char = 0.25 tokens | MEDIUM | Kannada ≈ 14 tokens/word, not 4 chars. Token estimates may undercount. Could hit 200K limit unexpectedly. |
| 13 | No React ErrorBoundary | MEDIUM | Any JS error in pipeline = white screen. No graceful error display. |
| 14 | Credit refund can fail silently | HIGH | If both RPC and UPDATE fail, officer loses a credit with no recourse. Logged but not alerted in real time. |

---

## 15. FLOW DIAGRAM — NEW PIPELINE (visual summary)

```
OFFICER'S BROWSER                    SERVER (VPS)              EXTERNAL
                                                              
[Upload PDF] ──────────────────────► /api/pipeline/vision-read
                                          │
                                     Claude Sonnet 4.6 Vision
                                     reads PDF → JSON output
                                          │
◄──────────────────────────────────── { caseSummary, questions }
                                          
[Answer 4-5 questions] ───────────────────────────────────────
                                          
[Click Generate] ──────────────────► /api/pipeline/generate
                                          │
                                     Auth check ✓
                                     Rate limit check ✓ (10/day IST)
                                     Profile load ✓
                                     Credit check ✓ (≥1)
                                     References load ✓ (≥5)
                                     Credit deduct ✓
                                     PII redact ✓
                                     buildPrompt() ✓
                                          │
                                     Claude Sonnet 4.6 API ◄── Anthropic (US)
                                     (streaming, 120s timeout)
                                          │
◄──── chunks arrive word by word ─────────┘
                                          
[Review generated order]                  
                                          
[Click Download] ──────────────────► /api/pipeline/export-docx
                                          │
                                     Generate DOCX (Noto Sans Kannada)
                                     Save to Storage bucket "files"
                                     Save to orders table (verified: true)
                                     Create signed URL (60s)
                                          │
◄──── Download link ───────────────────────┘
                                          
[Officer saves .docx → signs → submits to court]
```

---

## 16. COST PER ORDER (from MASTER_CONTEXT.md)

| Scenario | Cost |
|----------|------|
| First order in session (cache cold) | ~₹34 (~$0.34) |
| Orders 2-5 in same session (cache warm) | ~₹19 (~$0.19) |
| Blended average | **~₹24/order** |
| With 25% regeneration buffer | ~₹30/order worst case |
| If correction loop triggers | +₹6-8 |

**Current API balance:** ~$26.55 (~16 full test runs remaining)

---

*Document created: April 12, 2026*
*Based on direct code reading — not documentation, not assumptions*
*Files read: 14 source files + 5 context markdown files*
