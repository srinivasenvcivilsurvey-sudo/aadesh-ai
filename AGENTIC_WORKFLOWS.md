# Agentic Workflows — Aadesh AI
**Date:** 2026-03-29

## Current Agents (Implemented)

### 1. Smart-Context Agent (`smart-context.ts`)
- **Trigger:** Every order generation
- **Logic:** Query user's references → score by type match + keyword overlap → select top 5 → inject as context into Sarvam API
- **Fallback:** If no user refs → use 5 pre-loaded demo references
- **Token budget:** Max 40K chars (~10K tokens) for context portion
- **Output:** `SmartContextResult` with excerpts, refsUsed, totalRefs, source

### 2. Auto-Recovery Agent (`sarvam.ts`)
- **Trigger:** Sarvam API failure
- **Logic:** Attempt 1 (full context) → 3s wait → Attempt 2 (full context) → Attempt 3 (reduced 50% context)
- **Output:** OrderGenerationResponse or Kannada error message
- **Never exposes:** Raw API errors, status codes, stack traces

### 3. Quality Assurance Agent (`guardrails.ts`)
- **Trigger:** After every order generation
- **4 Checks:**
  1. Section completeness (75% threshold)
  2. Anti-transliteration (28-word English blacklist)
  3. Fact preservation (number/case matching)
  4. Word count (550-750 range)
- **Output:** GuardrailReport with per-check pass/fail + summary

### 4. Auto-Save Agent (client-side, `generate/page.tsx`)
- **Trigger:** 10 seconds of edit inactivity
- **Logic:** Debounced save of edited order text
- **Status:** idle → saving → saved indicator

### 5. Rate Limiter Agent (`rateLimit.ts`)
- **Trigger:** Every API request
- **Logic:** Sliding window, 10 requests/minute/user, in-memory Map
- **Cleanup:** Stale entries purged every 5 minutes

## Planned Agents (Phase 1A)

### 6. OCR Agent (Sarvam Vision)
- Input: Scanned PDF or JPG/PNG
- Process: Sarvam Vision API → extract Kannada text → NFKC normalize
- Auto-detect Nudi encoding → convert to Unicode

### 7. Self-Correction Agent
- After generation, send output back to LLM with checklist
- Check: all sections present, no English, facts match, word count
- If fails: auto-regenerate with corrections

### 8. Smart Routing Agent
- Classify case complexity (simple/complex)
- Simple → Sarvam 105B (FREE)
- Complex → Claude Sonnet 4.6 via OpenRouter (₹12)

### 9. Training Analysis Agent
- After 8+ files uploaded, hold back 2-3 random orders
- Generate test order using remaining refs
- Compare AI output vs original
- Report readiness score

## Agent Architecture Pattern

```
User Input
    ↓
Rate Limit Agent → if blocked → 429 Kannada error
    ↓
Smart-Context Agent → select 5 refs → build context
    ↓
Sarvam API (with auto-recovery)
    ↓
Quality Agent (4 guardrails) → pass/warn
    ↓
Auto-Save Agent → client-side persistence
    ↓
Audit Log Agent → fire-and-forget DPDP log
    ↓
User sees output + guardrail panel
```
