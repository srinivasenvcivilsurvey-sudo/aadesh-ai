# AADESH AI -- CODEBASE AUDIT REPORT

**Date:** 2026-03-29
**Auditor:** Claude Code (Opus 4.6)
**Scope:** Full Next.js 15 SaaS application at `aadesh-ai/nextjs/`
**Codebase Size:** ~65 source files, ~6,500 lines of application code

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Frontend Audit](#2-frontend-audit)
3. [Backend Audit](#3-backend-audit)
4. [Database Audit](#4-database-audit)
5. [Security Audit](#5-security-audit)
6. [Code Quality](#6-code-quality)
7. [Performance](#7-performance)
8. [Recommendations](#8-recommendations)

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | ^15.4.8 |
| Runtime | React | ^19.0.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS + CSS variables | ^3.4.1 |
| UI Library | Radix UI (dialog, alert-dialog, slot) | Various |
| Auth & DB | Supabase (SSR + Browser clients) | ^2.47.10 |
| AI Backend | Sarvam AI (sarvam-m model, direct HTTP) | Custom integration |
| Payments | Razorpay (direct API) | Custom integration |
| Documents | docx (npm) for DOCX generation | ^9.6.1 |
| Charts | Recharts | ^2.15.0 |
| Markdown | react-markdown | ^9.0.3 |
| Analytics | Google Analytics via @next/third-parties | ^15.1.5 |
| Icons | lucide-react | ^0.469.0 |
| Deployment | Docker (standalone output) | node:20-alpine |

### 1.2 Folder Structure

```
src/
  app/
    layout.tsx              -- Root layout (theme, GA, cookies)
    page.tsx                -- Landing page (/)
    globals.css             -- Theme CSS variables + Tailwind
    api/
      auth/callback/route.ts   -- OAuth callback handler
      generate-order/route.ts  -- AI order generation endpoint
      orders/route.ts          -- Order history listing
      download/route.ts        -- DOCX/PDF generation & download
      razorpay/route.ts        -- Payment creation & verification
    app/
      layout.tsx            -- Authenticated app shell
      page.tsx              -- Dashboard
      generate/page.tsx     -- Order generation form
      my-orders/page.tsx    -- Order history list
      billing/page.tsx      -- Credit purchase (Razorpay)
      storage/page.tsx      -- File management
      table/page.tsx        -- Task/todo management
      train/page.tsx        -- AI training (file upload)
      upload/page.tsx       -- Legacy upload page
      user-settings/page.tsx -- Password, MFA, transfer
    auth/
      layout.tsx            -- Auth page split layout
      login/page.tsx        -- Email + SSO login
      register/page.tsx     -- Registration
      forgot-password/page.tsx
      reset-password/page.tsx
      verify-email/page.tsx
      2fa/page.tsx          -- MFA verification
    legal/
      layout.tsx            -- Legal page layout
      page.tsx              -- Legal index
      [document]/page.tsx   -- Dynamic legal doc renderer
  components/
    AppLayout.tsx           -- Sidebar + header + mobile nav
    AuthAwareButtons.tsx    -- Auth-aware CTA buttons
    Confetti.tsx            -- Task completion animation
    Cookies.tsx             -- Cookie consent banner
    HomePricing.tsx         -- Landing page pricing section
    HowItWorks.tsx          -- Landing page 3-step section
    LandingPage.tsx         -- Full landing page
    LegalDocument.tsx       -- Markdown legal doc renderer
    LegalDocuments.tsx      -- Legal document list
    MFASetup.tsx            -- TOTP MFA enrollment
    MFAVerification.tsx     -- MFA code verification
    SSOButtons.tsx          -- GitHub/Google/Facebook/Apple SSO
    Toast.tsx               -- Toast notification provider
    TrainingStatusBar.tsx   -- Training progress indicator
    ui/                     -- shadcn/ui primitives
      alert.tsx, alert-dialog.tsx, button.tsx, card.tsx,
      dialog.tsx, input.tsx, textarea.tsx
  lib/
    context/
      GlobalContext.tsx      -- Auth user + credits state
      LanguageContext.tsx     -- Kannada/English locale state
    supabase/
      client.ts             -- Browser-side Supabase client
      server.ts             -- SSR Supabase client
      middleware.ts          -- Session refresh middleware
      serverAdminClient.ts   -- Service-role admin client
      unified.ts            -- SassClient wrapper class
    guardrails.ts           -- 4 zero-cost quality checks
    i18n.ts                 -- ~250 Kannada/English string pairs
    pricing.ts              -- Pricing tier definitions
    rateLimit.ts            -- In-memory rate limiter
    sarvam.ts               -- Sarvam AI API integration
    smart-context.ts        -- Reference order selection agent
    system-prompt.ts        -- V3.2.1 master system prompt (382 lines)
    types.ts                -- Supabase generated types
    utils.ts                -- cn() helper, random string
  middleware.ts             -- Root middleware (session check)
```

### 1.3 Route Map

| Route | Type | Auth Required | Purpose |
|-------|------|---------------|---------|
| `/` | Page | No | Landing page with pricing, features, CTA |
| `/auth/login` | Page | No | Email + SSO login |
| `/auth/register` | Page | No | Account creation |
| `/auth/forgot-password` | Page | No | Password reset request |
| `/auth/reset-password` | Page | No | Password reset form |
| `/auth/verify-email` | Page | No | Email verification notice |
| `/auth/2fa` | Page | No | MFA TOTP verification |
| `/app` | Page | Yes | Dashboard (stats, quick actions) |
| `/app/generate` | Page | Yes | Order generation form + result |
| `/app/my-orders` | Page | Yes | Generated orders list |
| `/app/billing` | Page | Yes | Razorpay credit packs |
| `/app/storage` | Page | Yes | File management |
| `/app/table` | Page | Yes | Task/todo management |
| `/app/train` | Page | Yes | Training file upload |
| `/app/upload` | Page | Yes | Legacy order upload |
| `/app/user-settings` | Page | Yes | Profile settings |
| `/legal/[document]` | Page | No | Legal docs (privacy, terms, refund) |
| `/api/auth/callback` | API GET | No | OAuth callback |
| `/api/generate-order` | API POST | Yes | AI order generation |
| `/api/orders` | API GET | Yes | Order history listing |
| `/api/download` | API POST | Yes | DOCX/PDF download |
| `/api/razorpay` | API POST/PUT | Yes | Payment create + verify |

---

## 2. FRONTEND AUDIT

### 2.1 Page Components

#### Landing Page (`/`)
- **LandingPage.tsx** (312 lines): Full marketing page with hero, stats, trust signals, features grid, pricing, and footer.
- Well-structured with section anchors (`#how-it-works`, `#features`, `#pricing`).
- **AuthAwareButtons.tsx**: Dynamically shows "Dashboard" for logged-in users or "Try Free / Login" for anonymous visitors. Handles two variants (`nav` and `primary`).
- Uses `useLanguage()` hook wrapped in try/catch to handle being outside LanguageProvider.

#### Dashboard (`/app`)
- 240 lines. Shows personalized greeting (time-based, locale-aware), stats cards (orders generated, credits remaining, files uploaded), first-time user CTA, credit warning, training status, and quick action links.
- Fetches file count from Supabase storage on mount.

#### Generate Order (`/app/generate`)
- 503 lines. Largest page component. Handles order type selection (appeal/suo_motu), file upload, case details textarea, AI generation with elapsed timer, editable result with auto-save, guardrail status panel, verification checkbox, download (DOCX/PDF), print, and regenerate.
- **Offline detection** via `navigator.onLine` event listeners.
- **Auto-save**: Debounced 10-second timer on edited text (currently simulated, not persisted to DB).

#### My Orders (`/app/my-orders`)
- 403 lines. Paginated order list with search, sort (date/score), order preview cards, view modal, download, and regenerate actions.
- **Issue**: `handleView()` uses the client-side Supabase instance to query `orders` table directly, using `as never` type casts extensively to bypass TypeScript. This bypasses RLS if the table has it, or fails if it does not.

#### Billing (`/app/billing`)
- 223 lines. 4 pricing packs with Razorpay checkout integration. Loads Razorpay SDK dynamically via script injection.
- Payment flow: Create order (POST /api/razorpay) -> Open Razorpay checkout -> Verify payment (PUT /api/razorpay) -> Credits added.

#### Train AI (`/app/train`)
- 507 lines. Dedicated training page with drag-and-drop file upload, file processing pipeline visualization (received -> extracted -> type detected -> stored), training status bar, uploaded files table, and delete confirmation.
- Auto-detects order type from filename.
- 10MB file size limit, 50 file cap.
- Processing steps are **simulated** with `setTimeout` -- text extraction does not actually happen client-side.

#### Upload Orders (`/app/upload`)
- 248 lines. Legacy upload page. Similar to train page but simpler -- no processing pipeline visualization, 50MB limit, accepts only .docx and .pdf.
- **Redundancy**: This page overlaps significantly with `/app/train`. Consider consolidating.

#### Storage (`/app/storage`)
- 330 lines. General file management with upload, download (signed URLs), share (24h signed URLs), and delete. Features drag-and-drop and share dialog with copy-to-clipboard.
- No file type restrictions.
- Uses Radix Dialog and AlertDialog for modals.

#### Table/Tasks (`/app/table`)
- 317 lines. Full CRUD task management with filter (all/active/completed), create dialog, mark as done (with confetti animation), and delete.
- **Concern**: This appears to be a boilerplate/template feature unrelated to DDLR order drafting. It uses a `todo_list` table which is the only table defined in the generated types.

#### User Settings (`/app/user-settings`)
- 249 lines. Password change, MFA setup (via MFASetup component), and transfer mode (archives references and resets training when caseworker transfers offices).
- Transfer mode properly archives data rather than deleting it.

### 2.2 State Management

| State Domain | Implementation | Scope |
|-------------|---------------|-------|
| Auth user + credits | GlobalContext (React Context) | `/app/*` tree |
| Language preference | LanguageContext + localStorage | App-wide |
| Page-local state | useState hooks | Per-page |
| Supabase session | Cookie-based (via @supabase/ssr) | Browser |

**No external state management library** (Redux, Zustand, etc.). All state is React-native. This is appropriate for the current complexity level.

**Issue**: GlobalContext fetches profile data once on mount and relies on `refreshProfile()` being called manually. There is no real-time subscription or polling. If credits are deducted in another tab, the UI will be stale.

### 2.3 Internationalization (i18n)

- Custom implementation in `src/lib/i18n.ts` with ~250 string pairs in Kannada (`kn`) and English (`en`).
- Helper function `t(stringObj, locale)` returns the correct string.
- Locale stored in localStorage and managed by LanguageContext.
- **Coverage**: Good for navigation, dashboard, generate, pricing, training, and upload pages. Some pages (storage, table, forgot-password, reset-password) have hardcoded English strings.
- **Pattern inconsistency**: Some components use `t(strings.xxx, locale)`, others use inline `locale === 'kn' ? '...' : '...'` ternaries. Both patterns work but the mixed approach makes maintenance harder.

### 2.4 Accessibility

**Issues found:**

1. **No skip-to-content link** on any page.
2. **Sidebar mobile overlay**: The backdrop uses `onClick` but no keyboard/escape handler.
3. **User dropdown**: Opens/closes on click but no keyboard trap or `Escape` to close. No `role="menu"` or `aria-expanded`.
4. **Order type buttons** in generate page: Use `<button>` (good) but no `role="radio"` or `aria-checked` for the radio-group pattern.
5. **File upload zones**: Use `<label>` wrapping a hidden `<input>` (good pattern), but no `aria-label` or `aria-describedby` for the drop zone state.
6. **Color-only indicators**: Credit count uses green/yellow/red colors (`credit-green`, `credit-yellow`, `credit-red`) without additional text or icon to convey severity for color-blind users.
7. **Focus management**: No visible focus ring management beyond Tailwind defaults. Government users may rely on keyboard navigation.
8. **Language**: `<html lang="kn">` is set globally, which is correct for the primary audience but may cause issues for the English locale. Consider toggling this value with locale.

---

## 3. BACKEND AUDIT

### 3.1 API Routes

#### POST `/api/generate-order` (195 lines)
**Auth**: Bearer token -> `supabase.auth.getUser()` verification.
**Rate limiting**: In-memory sliding window (10 req/min per user).
**Input validation**: orderType must be "appeal" or "suo_motu", caseDetails max 10,000 chars.
**Flow**:
1. Authenticate user
2. Check rate limit
3. Validate input
4. Verify Sarvam API key exists
5. Check credits > 0 (via service-role admin client)
6. Fetch smart-context references
7. Build enriched input with context block
8. Call Sarvam API (with 3-attempt auto-recovery)
9. Run 4 guardrails on output
10. Save order to `orders` table
11. Deduct 1 credit from `profiles` table
12. Return order + metadata + guardrails

**Issues**:
- **Race condition on credit deduction (CRITICAL)**: The credit check and deduction are not atomic. Two concurrent requests could both pass the `credits_remaining > 0` check and both deduct, potentially bringing credits negative. The deduction uses a read-then-write pattern (fetch current credits, subtract 1, update). This should use a Postgres function or `rpc` call with atomic decrement.
- **Extra query for total_orders_generated**: Line 149-154 makes a separate SELECT query inside the UPDATE to get `total_orders_generated`. This is unnecessary -- use a Postgres increment operation or a database function.
- **Error handling on save**: If order save fails, the response still returns success. This means the user sees the order but it may not be in their history. Acceptable for MVP but should log an alert.

#### GET `/api/orders` (84 lines)
**Auth**: Bearer token verification.
**Pagination**: Page/limit with max 50 per page.
**Sorting**: Configurable sort field and direction.
**Search**: ilike filter on `input_text`.

**Issues**:
- **SQL injection via sort field**: `sortBy` from user input is passed directly to `.order(sortBy, ...)`. A malicious user could pass any column name. Should whitelist allowed sort fields.
- Uses service-role admin client for all DB queries, bypassing RLS entirely.

#### POST `/api/download` (195 lines)
**Auth**: Bearer token verification.
**Formats**: DOCX (functional) and PDF (falls back to DOCX due to Kannada font rendering issues).
**Audit logging**: Fires async audit log entry to `audit_log` table (fire-and-forget).
**DOCX generation**: Uses `docx` npm package with Noto Sans Kannada font, header detection for Kannada section markers, court header centering, and proper page margins.

**Issues**:
- **PDF is misleading**: The PDF button generates a DOCX file with a `.docx` content-type header, even though the user clicks "PDF". The tooltip mentions this, but the behavior is confusing.
- **No file size limits**: Large `orderText` payloads have no size limit (only the generation input has a 10K char limit, but the user can edit the output to any length).
- **Admin client fallback**: Line 52 falls back to anon key if service role key is missing: `process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`. This silently degrades security if the env var is missing.

#### POST/PUT `/api/razorpay` (185 lines)
**POST**: Creates a Razorpay order for a selected pack.
**PUT**: Verifies payment signature (HMAC SHA256) and adds credits via `rpc('add_credits')`.

**Issues**:
- **No idempotency**: If the PUT verification is called twice with the same payment ID, credits could be added twice. Should check if the `razorpay_payment_id` already exists in `transactions` before adding credits.
- **Razorpay key ID exposed to client**: The POST response includes `keyId` which is intentional (Razorpay requires it client-side) but should be validated as the public key only.
- **Error message leaks** in POST catch block (line 92): `error.message` is returned directly to the client, which could expose internal Razorpay error details.

#### GET `/api/auth/callback` (34 lines)
Standard OAuth callback. Exchanges code for session, checks MFA level, redirects accordingly. Clean implementation.

### 3.2 Auth Flow

| Step | Implementation |
|------|---------------|
| Registration | Email/password via Supabase Auth + email verification |
| Login | Email/password + SSO (configurable providers) |
| MFA | TOTP-based 2FA with enrollment and verification |
| Session management | Cookie-based via `@supabase/ssr` |
| Protected routes | Middleware redirects unauthenticated `/app/*` requests to login |
| Password reset | Supabase built-in flow with email link |
| OAuth | GitHub, Google, Facebook, Apple (configurable via env) |

**Overall**: Authentication is well-implemented with multiple layers (email verification, MFA support, OAuth options). The middleware properly checks auth state on every request to `/app/*`.

### 3.3 Error Handling

**API routes**: All use try/catch with error logging and Kannada-localized error messages returned to the client. Internal details are not leaked (with the exception noted in the Razorpay route).

**Client-side**: Error state is managed per-page via `useState('error')`. Errors are displayed using the Alert component. Network errors from Supabase and API calls are caught and translated to Kannada where possible.

**Issue**: No centralized error boundary component. A React Error Boundary at the layout level would prevent full-page crashes.

### 3.4 Rate Limiting

- **Implementation**: In-memory `Map<string, number[]>` with sliding window.
- **Limits**: 10 requests per minute per user.
- **Cleanup**: Background `setInterval` every 5 minutes to prevent memory leak.
- **Scope**: Only applied to `/api/generate-order`.

**Issues**:
- **Not persistent**: Rate limits reset on server restart. In a multi-instance deployment, each instance has its own rate limit state. Should use Redis or Supabase for distributed rate limiting if scaling horizontally.
- **Missing on other routes**: `/api/orders`, `/api/download`, and `/api/razorpay` have no rate limiting. A user could spam download requests or order listings.

---

## 4. DATABASE AUDIT

### 4.1 Supabase Schema (Inferred from Code)

The generated types file (`types.ts`) only defines `todo_list`. All other tables are accessed via raw queries with `as never` type casts, indicating they were created manually and the types were never regenerated.

**Tables inferred from API code:**

| Table | Columns (inferred) | Used By |
|-------|-------------------|---------|
| `profiles` | id, credits_remaining, total_orders_generated, training_level, training_score, total_references, updated_at | generate-order, dashboard |
| `orders` | id, user_id, case_type, input_text, generated_order, score, model_used, verified, created_at | generate-order, orders list |
| `references` | id, user_id, extracted_text, detected_type, word_count, is_active, created_at | smart-context, user-settings |
| `transactions` | user_id, razorpay_order_id, razorpay_payment_id, pack_name, amount_inr, credits_added, status | razorpay |
| `audit_log` | user_id, action, ip_address, user_agent, metadata | download |
| `todo_list` | id, owner, title, description, done, done_at, urgent, created_at | table page |

**Database functions:**
- `add_credits(user_uuid, amount)` -- atomic credit addition (used in payment verification)

### 4.2 RLS Policies

**Cannot be fully audited** without access to the Supabase dashboard, but observations from code:

- **Most API routes use service-role admin client**, which bypasses RLS entirely. This is a deliberate design choice (server-side operations) but means RLS is not a defense layer for backend operations.
- **Client-side queries** (from the browser) use the anon key and should be subject to RLS. The `todo_list` queries, file operations, and order viewing from `my-orders/page.tsx` all run client-side.
- **Issue**: `my-orders/page.tsx` line 107-111 queries the `orders` table directly from the client with `as never` casts. If RLS is not configured to restrict `orders` to `user_id = auth.uid()`, any authenticated user could read any order.

### 4.3 Data Flow

```
User Input -> POST /api/generate-order
  -> Auth check (Supabase)
  -> Rate limit (in-memory)
  -> Credit check (profiles table via admin client)
  -> Smart-context fetch (references table OR storage files OR demo refs)
  -> Sarvam API call (3 attempts with auto-recovery)
  -> Guardrail checks (regex/string, no API cost)
  -> Save to orders table (admin client)
  -> Deduct credit from profiles (admin client)
  -> Return order + metadata to client
```

---

## 5. SECURITY AUDIT

### 5.1 Authentication

| Aspect | Status | Notes |
|--------|--------|-------|
| Password authentication | GOOD | Via Supabase Auth |
| Email verification | GOOD | Required before login |
| MFA (TOTP) | GOOD | Optional 2FA with QR enrollment |
| OAuth/SSO | GOOD | Configurable providers via env var |
| Session management | GOOD | Cookie-based via @supabase/ssr middleware |
| Protected routes | GOOD | Middleware redirects unauthenticated users |
| Password reset | GOOD | Email-based with secure link |

### 5.2 Input Validation

| Endpoint | Validation | Assessment |
|----------|-----------|------------|
| generate-order | orderType whitelist, caseDetails max 10K chars | GOOD |
| orders | Pagination limits capped at 50 | GOOD, but sort field not whitelisted |
| download | format whitelist (docx/pdf), orderText + format required | GOOD, but no size limit on orderText |
| razorpay POST | packId whitelist | GOOD |
| razorpay PUT | All fields required, signature verification | GOOD |

### 5.3 API Key Management

| Key | Storage | Exposure Risk |
|-----|---------|--------------|
| SUPABASE_URL | NEXT_PUBLIC_ env var | Intentionally public |
| SUPABASE_ANON_KEY | NEXT_PUBLIC_ env var | Intentionally public (Supabase design) |
| SUPABASE_SERVICE_ROLE_KEY | Server-only env var | GOOD -- never in client code |
| SARVAM_API_KEY | Server-only env var | GOOD -- never in client code |
| RAZORPAY_KEY_ID | Server-only env var (returned in API response for client SDK) | Acceptable -- Razorpay requires this |
| RAZORPAY_KEY_SECRET | Server-only env var | GOOD -- only used for signature verification |
| GOOGLE_TAG | NEXT_PUBLIC_ env var | Intentionally public |

### 5.4 XSS / CSRF

- **XSS**: React's JSX auto-escaping provides baseline protection. No `dangerouslySetInnerHTML` usage found. The `react-markdown` component in legal documents could be a vector if user content were rendered, but legal docs come from static files in `/public/terms/`.
- **CSRF**: API routes use Bearer token authentication (not cookies), which is inherently CSRF-resistant. The Supabase middleware uses cookie-based sessions for page routing, but mutations go through token-authenticated API calls.
- **Content injection**: The `ilike` search filter in the orders API could theoretically be manipulated for SQL pattern attacks, but Supabase's parameterized queries prevent SQL injection.

### 5.5 DPDP Compliance

| Requirement | Status | Implementation |
|-------------|--------|---------------|
| Data collection notice | PARTIAL | Cookie consent banner exists, but privacy notice needs review |
| Consent for processing | GOOD | Terms acceptance checkbox on registration |
| Audit trail | GOOD | `audit_log` table captures downloads with IP, user agent, metadata |
| Data minimization | GOOD | Generated orders only store input + output, no excess collection |
| Right to erasure | PARTIAL | Transfer mode archives data but no full account deletion feature |
| Data stored in India | DEPENDS | Supabase region not verified in code; should be ap-south-1 |
| Encryption at rest | DEPENDS | Supabase provides this by default, but should verify |

### 5.6 Additional Security Concerns

1. **Service role key fallback** in download route: Line 52 falls back to anon key if service role is missing. This could silently bypass audit logging.
2. **No CORS configuration**: Next.js API routes accept requests from any origin by default. Should add explicit CORS headers for production.
3. **No Content Security Policy (CSP)**: The app loads Razorpay SDK dynamically and has Google Analytics. A CSP header would provide defense-in-depth against script injection.
4. **Password policy**: Minimum 6 characters enforced in reset-password page, but not on the registration page (relies on Supabase defaults).
5. **File upload security**: No virus scanning or content validation on uploaded files. Files are stored as-is in Supabase Storage.
6. **`console.log(user)` in storage/page.tsx line 54**: Leaks user object to browser console. Should be removed.

---

## 6. CODE QUALITY

### 6.1 TypeScript Usage

| Aspect | Assessment |
|--------|-----------|
| Strict mode | ENABLED in tsconfig.json |
| Generic types | Supabase client properly typed with Database generic |
| Explicit `any` | Only in justified places (SassClient constructor due to Supabase SDK type mismatch) |
| `as never` casts | **EXCESSIVE** -- used 12+ times in client-side Supabase queries to bypass missing table types |
| Interface definitions | Good practice in generate page (GuardrailResult, OrderMetadata, etc.) |
| Return types | Not always explicit, relying on inference |

**Critical issue**: The `types.ts` file only contains `todo_list` table definitions. All other tables (`profiles`, `orders`, `references`, `transactions`, `audit_log`) are queried with `as never` type casts throughout the codebase. This eliminates all type safety for the core business tables. Running `supabase gen types typescript` would fix this.

### 6.2 Error Handling Patterns

- API routes: Consistent try/catch with error logging and localized error responses.
- Client pages: Consistent `useState('error')` pattern with Alert component display.
- Missing: No React Error Boundary. No global error handler for unhandled promise rejections.

### 6.3 Dead Code / Redundancy

| Item | Location | Issue |
|------|----------|-------|
| Upload page | `/app/upload/page.tsx` | Functionally overlaps with `/app/train/page.tsx`. Both upload files to the same storage bucket. |
| Table/Tasks page | `/app/table/page.tsx` | Unrelated boilerplate feature (todo list). Not part of the DDLR domain. |
| `generatePdf()` function | `download/route.ts` | Returns a DOCX file, not a PDF. The function exists only to call `generateDocx()`. |
| `PricingService` class | `pricing.ts` | Defined but only imported by `HomePricing.tsx`. The billing page defines its own pack array instead of using this service. |
| `generateRandomString()` | `utils.ts` | Not imported anywhere in the codebase. |
| `createServerAdminClient()` | `serverAdminClient.ts` | Defined but never imported. API routes create admin clients inline using `createClient()` from `@supabase/supabase-js`. |
| `Confetti` component | Used only in `table/page.tsx` | Would be dead code if table page is removed. |

### 6.4 Type Safety Gaps

1. The `SassClient` class in `unified.ts` wraps Supabase operations but its `getSupabaseClient()` method exposes the raw client, breaking encapsulation. Components use it to make arbitrary queries that bypass the wrapper.
2. Several components use `Error | unknown` as catch types, which is redundant (`unknown` already includes `Error`).
3. The `GlobalContext` User type defines `credits_remaining` and `total_orders_generated` as required numbers, but the profile fetch defaults to 3 credits if profile is null -- this could mask a missing profile record.

### 6.5 Code Consistency

- **Indentation**: Mix of 2-space and 4-space indentation across files. `unified.ts`, `storage/page.tsx`, and `table/page.tsx` use 4 spaces; most other files use 2 spaces.
- **Import style**: Some files use named imports, others use default imports inconsistently.
- **Error messages**: Login and register pages localize errors to Kannada. Forgot-password and reset-password pages use only English error messages.
- **File naming**: All page files are `page.tsx` (Next.js convention). Components use PascalCase (good).

---

## 7. PERFORMANCE

### 7.1 Bundle Size Considerations

| Dependency | Size Impact | Notes |
|-----------|------------|-------|
| recharts | ~500KB (tree-shakeable) | Only used for potential charting (not seen in current pages) |
| docx | ~200KB | Server-side only (DOCX generation in API route) |
| lucide-react | Tree-shakeable | Individual icon imports -- good practice |
| react-markdown | ~60KB | Used in legal document rendering |

**Note**: `recharts` is listed as a dependency but does not appear to be imported anywhere in the current codebase. It should be removed to reduce bundle size.

### 7.2 Lazy Loading

- **Not implemented**: All page components load eagerly. No `React.lazy()` or `next/dynamic` usage found.
- **Opportunity**: The generate page (503 lines) and my-orders page (403 lines) could benefit from code splitting, especially the result display section which is conditionally rendered.
- **Razorpay SDK**: Already lazy-loaded via dynamic script injection (good).

### 7.3 Caching

| Resource | Cached? | Notes |
|----------|---------|-------|
| Supabase session | Yes | Cookie-based with middleware refresh |
| User profile | No | Fetched on every GlobalProvider mount |
| File list | No | Fetched on every page mount |
| Orders list | No | Fetched on every page mount |
| Locale preference | Yes | localStorage |
| API responses | No | No Cache-Control headers set on API routes |

**Issue**: The system prompt (`DEFAULT_SYSTEM_PROMPT`) is computed once at module load time via `buildSystemPrompt()`. This is correctly cached as a module-level constant. However, if officer profiles are ever personalized, this would need to become dynamic.

### 7.4 Server-Side Rendering

- Root layout is a server component (no `'use client'`).
- All `/app/*` pages are client components (`'use client'`).
- Landing page is a client component (needed for auth-aware buttons and language toggle).
- **Opportunity**: The landing page's static content (features, stats, trust signals) could be server-rendered with only the interactive parts (auth buttons, language toggle) as client components. This would improve initial load time and SEO.

### 7.5 Docker & Deployment

- Standalone output mode configured in `next.config.ts` (good for Docker).
- Multi-stage Dockerfile with proper layer caching (deps -> build -> run).
- Non-root user (`nextjs`) in production container (good security practice).
- `HOSTNAME=0.0.0.0` for proper container networking.

---

## 8. RECOMMENDATIONS

### Priority 1: CRITICAL (Fix before production)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | **Race condition on credit deduction** | Users could generate orders without paying | Replace read-then-write pattern in `generate-order/route.ts` with an atomic Postgres function: `deduct_credit_if_available(user_uuid)` that decrements credits and returns the new balance in a single transaction |
| 2 | **Payment idempotency missing** | Double-crediting on duplicate payment verification | Add a unique constraint on `razorpay_payment_id` in the `transactions` table, and check for existing records before calling `add_credits` |
| 3 | **Regenerate Supabase types** | All core tables lack type safety, ~12 `as never` casts | Run `supabase gen types typescript` to generate proper types for profiles, orders, references, transactions, and audit_log tables |
| 4 | **Sort field injection in orders API** | Potential information disclosure or errors | Whitelist allowed sort fields: `const ALLOWED_SORTS = ['created_at', 'score', 'case_type']` and validate `sortBy` against it |
| 5 | **Remove `console.log(user)` in storage page** | User data leaked to browser console | Delete line 54 in `storage/page.tsx` |

### Priority 2: HIGH (Fix before scaling)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 6 | **Distributed rate limiting** | Rate limits ineffective with multiple server instances | Replace in-memory Map with Redis or Supabase-based rate limiting |
| 7 | **Add React Error Boundary** | Unhandled errors crash the entire app | Add an ErrorBoundary component at the `/app/layout.tsx` level with a Kannada-localized error recovery UI |
| 8 | **Add CSP headers** | Script injection defense-in-depth | Configure Content-Security-Policy in `next.config.ts` headers |
| 9 | **Auto-save should persist to DB** | Users lose edits if they navigate away | Connect the auto-save logic in `generate/page.tsx` to a PATCH endpoint that updates the `orders` table |
| 10 | **Remove unused dependencies** | Bundle size waste | Remove `recharts` from package.json if not used. Also remove `generateRandomString` from utils.ts |

### Priority 3: MEDIUM (Improve before public launch)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 11 | **Consolidate upload and train pages** | User confusion, duplicated code | Remove `/app/upload/` and direct all file upload to `/app/train/` |
| 12 | **Remove or hide table/tasks page** | Unrelated feature confuses DDLR users | Remove `/app/table/` from navigation, or repurpose it as a case tracker |
| 13 | **Consistent i18n pattern** | Maintenance difficulty | Replace all inline `locale === 'kn' ? ... : ...` with `t()` calls from i18n.ts |
| 14 | **Localize auth pages fully** | English-only forgot-password and reset-password pages | Add Kannada strings for forgot-password, reset-password, verify-email pages |
| 15 | **PDF generation** | Users expect PDF but get DOCX | Implement server-side PDF generation with embedded Noto Sans Kannada font, or clearly communicate that PDF is not yet available |
| 16 | **Use PricingService everywhere** | Pricing data defined in 3 places (pricing.ts, billing page, razorpay route) | Consolidate to a single source of truth |
| 17 | **Use serverAdminClient.ts** | Server admin client module exists but is unused | Refactor API routes to import from `serverAdminClient.ts` instead of creating admin clients inline |
| 18 | **Accessibility improvements** | Government users may need keyboard nav | Add skip-to-content, proper ARIA roles for sidebar/dropdown, focus management, and non-color indicators |

### Priority 4: LOW (Nice-to-have)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 19 | **Add API response caching** | Repeated order list fetches | Add appropriate Cache-Control headers and SWR/React Query for client-side caching |
| 20 | **Lazy load heavy page sections** | Initial bundle size | Use `next/dynamic` for generate result section and my-orders view modal |
| 21 | **Server-render landing page** | SEO and initial load | Convert static sections of LandingPage to server components |
| 22 | **Add health check endpoint** | Deployment monitoring | Add `/api/health` route that checks DB connectivity |
| 23 | **Standardize code formatting** | Code readability | Run Prettier across the codebase to standardize indentation to 2 spaces |
| 24 | **Add unit tests** | Regression prevention | Add tests for guardrails.ts, smart-context.ts, sarvam.ts, and rateLimit.ts |
| 25 | **Add account deletion** | DPDP compliance | Add a "Delete my account" option in user settings that removes all personal data |

---

## SUMMARY

The Aadesh AI Next.js codebase is a well-structured SaaS application with solid fundamentals: proper auth flow, sensible route organization, bilingual UI, zero-cost quality guardrails, and a clean deployment pipeline. The major architectural decisions (Supabase for auth+DB, Sarvam for AI, Razorpay for payments) are appropriate for an India-focused government SaaS product.

**Key strengths:**
- Complete auth flow with email, OAuth, MFA, and password reset
- Bilingual Kannada/English UI with ~250 string pairs
- 4 zero-cost guardrails (section completeness, anti-transliteration, fact preservation, word count)
- Smart-context agent that selects relevant reference orders
- 3-attempt auto-recovery on AI API failures
- Proper Docker setup with standalone output and non-root user
- Audit logging for DPDP compliance

**Key weaknesses:**
- Race condition on credit deduction (the most critical bug)
- Missing payment idempotency
- Supabase types not regenerated (12+ `as never` casts eliminate type safety)
- Sort field not whitelisted in orders API
- Several dead code artifacts (unused pages, unreferenced functions, unused dependency)

The 5 Priority 1 items should be addressed before any production deployment. The application is otherwise in a solid state for an early-stage SaaS product.

---

*Report generated by Claude Code (Opus 4.6) on 2026-03-29.*
*Total source files analyzed: 65 | Total lines read: ~6,500*
