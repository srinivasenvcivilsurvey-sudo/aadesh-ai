# Test Coverage Analysis — aadesh-ai

_Date: 2026-06-04 · Scope: `nextjs/` application_

## TL;DR

The project has **18 test files (~1,920 lines)**, all concentrated in a single
directory: `nextjs/src/lib/pipeline/__tests__/`. They cover the pure business
logic of ~11 pipeline modules reasonably well (good use of property-based
testing). However, there are three structural problems:

1. **The tests cannot be run as-is.** `vitest` and `fast-check` are imported by
   every test but are **not in `package.json`**, there is **no `test` script**,
   and **no CI job runs them**. Coverage is effectively unverified.
2. **~6 test files re-implement the logic inline** instead of importing the real
   source, so they test a *copy* that silently drifts from production code.
3. **Entire layers have zero coverage**: all 18 API route handlers, all ~35 React
   components (no render tests), and the largest/most critical libs
   (`sarvam.ts` 782 LOC, `system-prompt.ts`, `guardrails.ts`, `self-correction.ts`,
   `smart-context.ts`, `pricing.ts`, `manifest.ts`, all of `supabase/`).

---

## Current state

### What is tested (real, import-based coverage)
These pipeline modules are imported and exercised directly — the good part:

| Module | Test |
|---|---|
| `pipelineReducer.ts` | `pipelineReducer.property.test.ts` |
| `validateAnswers.ts` | `validateAnswers.property.test.ts`, `validate.property.test.ts` |
| `withRetry.ts` | `withRetry.property.test.ts` |
| `rateLimiter.ts` | `rateLimiter.test.ts` |
| `piiRedactor.ts` | `piiRedactor.property.test.ts` |
| `legalState.ts` | `legalStateHardening.test.ts` |
| `buildPrompt.ts` | `buildPrompt.property.test.ts` |
| `auditOrder.ts` (+ `guardrails.ts` transitively) | `auditOrder.property.test.ts` |
| `assistanceReport.ts` | `assistanceReport.test.ts` |
| `sarvamGenerate.ts` (constant only — shallow) | `integration.test.ts` |

### What only *looks* tested (inline / mirrored logic — false confidence)
These files declare `import { describe } from 'vitest'` but **do not import the
code they claim to test**. The logic is copy-pasted into the test:

- `parseCaseSummary.property.test.ts` — *"Inline the parseCaseSummary logic...
  (mirrors the route implementation)"*. The real one lives in
  `app/api/pipeline/vision-read/route.ts`.
- `exportDocx.property.test.ts` — mirrors the export-docx route logic.
- `wordCount.property.test.ts`, `simplifiedPath.property.test.ts`,
  `logCacheMetrics.property.test.ts`, `smoke.test.ts` — re-declare functions/
  constants locally (e.g. the `ALLOWED_MIME_TYPES` set is duplicated).
- `assistanceReport.test.ts` partly asserts by `readFileSync`-ing route **source
  text** and pattern-matching it — brittle and bypasses execution entirely.
- `components.unit.test.ts` re-declares the accepted-MIME set instead of
  importing it from `FileUploadStep.tsx`.

These pass even if the real implementation changes — they protect a fork of the
code, not the code.

### What is completely untested

**All 18 API routes** (no handler is ever imported or invoked):
`generate-order`, `pipeline/generate`, `pipeline/validate`, `pipeline/vision-read`,
`pipeline/export-docx`, `pipeline/entity-lock`, `pipeline/reasoning`,
`pipeline/migrate`, `pipeline/assistance-report`, `download`, `orders`,
`auth/callback`, `health`, `razorpay`, `razorpay/webhook`, `trial/grant`,
`references/upload`, `references/generate-prompt`.
This matters because the graph report flags `POST()` as the #1 "god node"
(33 edges) and `GET()` as #6 — the most connected, highest-risk code has the
least coverage.

**Largest / highest-value untested libs:**
| File | LOC | Why it matters |
|---|---|---|
| `sarvam.ts` | 782 | Core LLM client; biggest single file in the codebase |
| `system-prompt.ts` | 349 | Drives generation quality (the 42→83 QA story) |
| `guardrails.ts` | 283 | 5 exported quality gates — only indirectly hit |
| `manifest.ts` | 237 | Pipeline manifest/orchestration |
| `smart-context.ts` | 181 | Context selection / smart routing |
| `legalState.ts` extras, `self-correction.ts` | 145 | Self-correction pass (a known Phase-0 gap) |
| `pricing.ts` | 133 | Money — credit/recharge math, zero tests |
| `pdf-kannada.ts` | 118 | Known-broken PDF path (flagged in graph) |
| `ipRateLimiter.ts` | 44 | Abuse / anomaly defense |

**All ~35 React components** — `components.unit.test.ts` tests only extracted
pure logic; there is no jsdom/`@testing-library/react` render test for any
component, including the multi-step pipeline UI (`FileUploadStep`,
`PreviewEditorStep`, `QuestionsStep`, `VisionReadingStep`, `DownloadStep`,
`PipelineErrorBoundary`, MFA flows).

**All Supabase glue** (`client.ts`, `server.ts`, `middleware.ts`,
`serverAdminClient.ts`, `unified.ts`) — including auth `middleware()`, which
gates every request.

---

## Recommended improvements (prioritized)

### P0 — Make the suite real and runnable
1. **Add the test toolchain.** Add `vitest`, `fast-check`, `@vitest/coverage-v8`
   to `devDependencies`; add a `vitest.config.ts` (with a `jsdom` environment for
   component tests and a `@` path alias); add `"test"`, `"test:watch"`,
   `"test:coverage"` scripts to `package.json`.
2. **Wire CI.** Add a GitHub Actions job that runs `lint` + `test` on PRs.
   Today nothing prevents a broken test from merging.
3. **De-duplicate mirrored tests.** Refactor `parseCaseSummary`, the export-docx
   logic, the `ALLOWED_MIME_TYPES` set, `countWords`, etc. into importable
   modules and have both the route/component **and** the test import the single
   source of truth. Delete the `readFileSync` source-grep assertions.

### P1 — Cover the highest-risk, highest-connectivity code
4. **API route handlers.** Add handler-level tests (mock Supabase + the LLM
   client) for at least `generate-order`, `pipeline/generate`, `pipeline/validate`,
   `download`, and `razorpay/webhook`. Assert: auth rejection, rate-limit
   behavior, credit deduction *only on success*, and error → no-charge paths.
   (The credit-deduction invariants in `integration.test.ts` are currently
   simulated with local booleans — point them at the real handler.)
5. **`guardrails.ts` directly.** Unit-test all five exports
   (`checkSectionCompleteness`, `checkAntiTransliteration`,
   `checkFactPreservation`, `checkWordCount`, `runGuardrails`) — these are the
   quality gates behind the QA-score work.
6. **`pricing.ts`.** It's money. Test pack math, currency/rounding, and credit
   conversion with property tests for "never negative / never over-credit".

### P2 — Broaden and harden
7. **`sarvam.ts` / `system-prompt.ts` / `smart-context.ts`.** Extract pure
   helpers (prompt assembly, token estimation, model routing) and unit-test them;
   mock the network boundary for the client itself.
8. **Component render tests** with `@testing-library/react` for the pipeline
   step components and `PipelineErrorBoundary` (error fallback actually renders).
9. **Auth `middleware()`** and Supabase clients — at least redirect/allow logic
   and admin-client guard rails.
10. **Add a coverage gate** (e.g. fail under ~70% on `src/lib`) once the suite
    runs, and track it over time.

### Quick wins
- Co-locate or clearly separate route/component tests from the single
  `__tests__` folder so coverage maps to the layer being tested.
- The existing property-based style (`fast-check`) is a strength — extend it to
  `pricing.ts` and `guardrails.ts` rather than only example-based tests.
