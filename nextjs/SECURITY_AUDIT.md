# SECURITY AUDIT REPORT -- Aadesh AI (Next.js)

**Date:** 2026-03-29
**Auditor:** Claude Code (Automated Security Review)
**Scope:** Full client + server codebase under `src/`, Dockerfile, environment configuration
**Application:** Aadesh AI -- SaaS AI order drafting for Karnataka land-record offices
**Stack:** Next.js 14 (App Router), Supabase Auth + DB, Razorpay Payments, Sarvam AI API

---

## EXECUTIVE SUMMARY

The application demonstrates a **solid security foundation** with several things done correctly: JWT-based auth on every API route, Razorpay HMAC signature verification, rate limiting, input length validation, Kannada-localized error messages that avoid leaking server internals, and MFA support via TOTP. However, the audit identified **5 Critical**, **4 High**, **6 Medium**, and **5 Low** severity findings that must be addressed before production deployment to government offices.

---

## 1. AUTHENTICATION & AUTHORIZATION

### 1.1 What is done correctly

| Area | Implementation | File |
|------|---------------|------|
| Middleware route protection | All `/app/*` routes redirect unauthenticated users to `/auth/login` | `src/middleware.ts`, `src/lib/supabase/middleware.ts` |
| JWT validation on API routes | Every API route (`generate-order`, `orders`, `razorpay`, `download`) validates Bearer token via `supabase.auth.getUser(token)` | All `route.ts` files |
| MFA support | TOTP-based 2FA enrollment, challenge-verify flow, AAL2 enforcement on login | `src/components/MFASetup.tsx`, `src/components/MFAVerification.tsx` |
| OAuth SSO | Configurable providers (GitHub, Google, Facebook, Apple) via env var | `src/components/SSOButtons.tsx` |
| Password reset flow | Standard email-based reset with session verification | `src/app/auth/reset-password/page.tsx` |
| Middleware uses `getUser()` | Correctly uses `getUser()` (server-side JWT verification) rather than `getSession()` (client-side, spoofable) | `src/lib/supabase/middleware.ts:36` |

### 1.2 Findings

**[C-01] CRITICAL -- Race condition in credit deduction allows double-spend**
- **File:** `src/app/api/generate-order/route.ts:144-157`
- **Issue:** Credits are read, then decremented in a separate UPDATE. Between READ and UPDATE, a concurrent request can pass the credit check and generate a free order. The `total_orders_generated` re-fetch inside the update compounds the race.
- **Fix:** Use an atomic SQL function: `SELECT deduct_credit_if_available(user_id)` that returns true/false in a single transaction. The `add_credits` RPC exists for Razorpay -- create a matching `deduct_credit` RPC.

**[H-01] HIGH -- No password complexity enforcement beyond Supabase default**
- **File:** `src/app/auth/register/page.tsx`, `src/app/auth/reset-password/page.tsx:43`
- **Issue:** Password minimum is only 6 characters (Supabase default). Government systems should require 8+ characters with mixed case/digits. The reset password page explicitly says "at least 6 characters".
- **Fix:** Add client-side validation for 8+ chars, one uppercase, one digit. Configure Supabase Auth to enforce the same server-side.

**[M-01] MEDIUM -- `getSession()` used in client-side code for token extraction**
- **File:** `src/app/app/generate/page.tsx:135`, `src/app/app/billing/page.tsx:61`, `src/app/app/my-orders/page.tsx:53`
- **Issue:** Client pages use `getSession()` to extract `access_token` for API calls. While the API routes properly re-verify with `getUser(token)`, the session data on the client is theoretically tamper-susceptible. This is an acceptable pattern since the API re-verifies, but should be noted.
- **Fix:** No immediate fix needed -- the API-side `getUser()` is the true gate. Document this as intentional.

**[L-01] LOW -- `console.log('totpFactors:', totpFactors)` leaks MFA factor data in browser console**
- **File:** `src/components/MFAVerification.tsx:34`
- **Issue:** Debug log that could expose factor IDs.
- **Fix:** Remove or guard with `process.env.NODE_ENV === 'development'`.

---

## 2. API SECURITY

### 2.1 What is done correctly

| Area | Implementation | File |
|------|---------------|------|
| Rate limiting | 10 requests/minute per user, sliding window, stale cleanup | `src/lib/rateLimit.ts` |
| Input length cap | 10,000 character max on case details | `src/app/api/generate-order/route.ts:8` |
| Input validation | `orderType` whitelist (`appeal`, `suo_motu`), required fields check | `src/app/api/generate-order/route.ts:41-60` |
| API timeout | 60-second AbortController on Sarvam calls | `src/lib/sarvam.ts:40` |
| Error message sanitization | Kannada user-facing messages, no stack traces leaked | All `route.ts` catch blocks |
| Pagination limits | `Math.min(limit, 50)` prevents unbounded queries | `src/app/api/orders/route.ts:25` |

### 2.2 Findings

**[C-02] CRITICAL -- Sort column injection via query parameter**
- **File:** `src/app/api/orders/route.ts:27`
- **Issue:** `const sortBy = searchParams.get('sort') || 'created_at'` is passed directly to `.order(sortBy, ...)`. An attacker can supply any column name, potentially including non-existent columns (causing errors that reveal schema info) or columns they should not sort by.
- **Fix:** Whitelist allowed sort columns:
  ```typescript
  const ALLOWED_SORTS = ['created_at', 'score', 'case_type'];
  const sortBy = ALLOWED_SORTS.includes(searchParams.get('sort') || '')
    ? searchParams.get('sort')!
    : 'created_at';
  ```

**[H-02] HIGH -- Rate limiting is per-process, not shared**
- **File:** `src/lib/rateLimit.ts`
- **Issue:** In-memory `Map` rate limiter resets on every server restart and is not shared across multiple Node.js instances. An attacker who knows this can wait for a restart or, if running multiple instances behind a load balancer, bypass limits entirely.
- **Fix:** For single-VPS deployment (current), this is acceptable. Before scaling to multiple instances, migrate to Redis-backed rate limiting (e.g., `@upstash/ratelimit`).

**[M-02] MEDIUM -- Search parameter passed to `ilike()` without sanitization**
- **File:** `src/app/api/orders/route.ts:45`
- **Issue:** `query = query.ilike('input_text', \`%${search}%\`)`. While Supabase's PostgREST parameterizes queries (preventing SQL injection), the `%` and `_` wildcards in the user input are not escaped. A user can craft patterns like `%_%_%_%_%_` to cause expensive LIKE scans.
- **Fix:** Escape LIKE-special characters: `search.replace(/%/g, '\\%').replace(/_/g, '\\_')`.

**[M-03] MEDIUM -- No rate limiting on download/orders/razorpay endpoints**
- **File:** `src/app/api/download/route.ts`, `src/app/api/orders/route.ts`, `src/app/api/razorpay/route.ts`
- **Issue:** Rate limiting is only applied to the `generate-order` endpoint. The `download` and `razorpay` endpoints are unprotected, allowing potential abuse (e.g., repeated downloads to stress server-side DOCX generation, or rapid Razorpay order creation).
- **Fix:** Apply `checkRateLimit()` to all endpoints, with different limits per endpoint (e.g., 30/min for reads, 5/min for Razorpay).

**[L-02] LOW -- File upload has no server-side type validation**
- **File:** `src/lib/supabase/unified.ts:55-58`, `src/app/app/train/page.tsx:82-86`
- **Issue:** File extension validation is client-side only. The `uploadFile()` method in `SassClient` sanitizes the filename but does not validate the MIME type. A malicious file with a renamed extension (e.g., `.exe` renamed to `.docx`) would be stored.
- **Fix:** Add server-side MIME type validation via a Supabase Storage policy or a pre-upload check endpoint.

---

## 3. DATA PROTECTION

### 3.1 What is done correctly

| Area | Implementation | File |
|------|---------------|------|
| Service role isolation | `SUPABASE_SERVICE_ROLE_KEY` used only in server-side API routes, never exposed to client | `src/lib/supabase/serverAdminClient.ts` |
| User data scoping | All queries filter by `user_id = user.id` | All API routes |
| DPDP audit log | Download actions logged with IP, user agent, metadata | `src/app/api/download/route.ts:49-60` |
| File path scoping | Files stored under `userId/filename` preventing cross-user access | `src/lib/supabase/unified.ts:57` |
| Signed URLs with expiry | File sharing uses time-limited signed URLs | `src/lib/supabase/unified.ts:70-76` |
| Session no-persist for admin | Admin client disables session persistence | `src/lib/supabase/serverAdminClient.ts:14-15` |

### 3.2 Findings

**[C-03] CRITICAL -- Service role key fallback to anon key in download route**
- **File:** `src/app/api/download/route.ts:51`
- **Issue:** `process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` -- if the service role key is missing, the code silently falls back to the anon key. This would bypass RLS policies, and the audit log insert may fail silently. More importantly, the `||` fallback masks a critical configuration error.
- **Fix:** Fail explicitly if the service role key is missing:
  ```typescript
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  ```

**[C-04] CRITICAL -- Database types are out of sync with actual schema**
- **File:** `src/lib/types.ts`
- **Issue:** The generated Supabase types only contain `todo_list` table. Tables like `profiles`, `orders`, `references`, `transactions`, and `audit_log` are not in the type definitions. This means all queries to these tables use `as never` casts throughout the codebase (visible in `my-orders/page.tsx`, `user-settings/page.tsx`), bypassing TypeScript's type safety. Wrong column names or missing fields will only be caught at runtime.
- **Fix:** Run `npx supabase gen types typescript` to regenerate types from the live schema. This will enable compile-time validation of all queries.

**[H-03] HIGH -- No RLS policies verifiable from codebase**
- **Issue:** All API routes use the service role client (which bypasses RLS) for database operations. While this works when the server correctly filters by `user_id`, it means there is **zero defense-in-depth** at the database layer. If a bug in any route omits the `.eq('user_id', user.id)` filter, all user data is exposed.
- **Fix:** Implement RLS policies on `orders`, `profiles`, `references`, `transactions`, and `audit_log` tables:
  ```sql
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (user_id = auth.uid());
  ```
  Then use the SSR client (with anon key + user session) for read operations, reserving the admin client only for writes that need to bypass RLS (like credit deduction).

**[M-04] MEDIUM -- Client-side direct access to orders table**
- **File:** `src/app/app/my-orders/page.tsx:107-111`
- **Issue:** The `handleView` function queries the `orders` table directly from the client using the user's session client. Without RLS policies (see H-03), and since the type system is broken (see C-04), this query relies entirely on the client SDK to enforce access control, which it does via RLS. But if RLS is not configured, any authenticated user could read any order.
- **Fix:** Either ensure RLS is properly configured, or fetch full order text through a dedicated API endpoint that enforces ownership checks.

**[M-05] MEDIUM -- Audit log is fire-and-forget**
- **File:** `src/app/api/download/route.ts:54-60`
- **Issue:** The audit log insert uses `.then()` without `await`, meaning audit failures are logged to console but never block the operation. For DPDP compliance, audit logs should be reliably written.
- **Fix:** `await` the audit log insert, or use a database trigger to guarantee audit trail.

---

## 4. CLIENT-SIDE SECURITY

### 4.1 What is done correctly

| Area | Implementation | File |
|------|---------------|------|
| No `dangerouslySetInnerHTML` | Zero instances found in entire codebase | All `.tsx` files |
| No `eval()` or `innerHTML` | Zero instances found | All `.tsx` files |
| Minimal localStorage | Only language preference (`aadesh-ai-locale`) stored | `src/lib/context/LanguageContext.tsx` |
| Sensitive data not in state | API keys never touch client; tokens come from Supabase auth | All client components |
| Input type enforcement | Email fields use `type="email"`, password fields use `type="password"` | All auth pages |

### 4.2 Findings

**[L-03] LOW -- User email displayed without HTML encoding**
- **File:** `src/components/AppLayout.tsx:150`, `src/components/AppLayout.tsx:159`
- **Issue:** `user?.email` is rendered directly in JSX. React auto-escapes this, so there is no XSS risk. However, if the email contains special characters, display could be unexpected.
- **Fix:** No action needed (React handles escaping). Just a note for awareness.

**[L-04] LOW -- `console.log(user)` in storage page leaks user object to browser console**
- **File:** `src/app/app/storage/page.tsx:54`
- **Issue:** Debug log that prints the full user object including `id`, `email`, `credits_remaining`.
- **Fix:** Remove or guard with development-only check.

---

## 5. INFRASTRUCTURE SECURITY

### 5.1 What is done correctly

| Area | Implementation | File |
|------|---------------|------|
| Standalone Docker build | Multi-stage Dockerfile, runs as non-root `nextjs` user | `Dockerfile` |
| Env vars for all secrets | API keys loaded via `process.env`, never hardcoded | All files |
| Server-only modules | `sarvam.ts` comment warns against client-side import | `src/lib/sarvam.ts:2` |
| `NEXT_PUBLIC_` prefix discipline | Only public-safe values use the `NEXT_PUBLIC_` prefix | All env usage |

### 5.2 Findings

**[C-05] CRITICAL -- No security headers (CSP, HSTS, X-Frame-Options) configured**
- **File:** `next.config.ts`
- **Issue:** The Next.js config contains only `output: 'standalone'`. There are no security headers configured. This means:
  - No `Content-Security-Policy` -- allows inline scripts, external resource loading
  - No `X-Frame-Options` -- allows clickjacking
  - No `Strict-Transport-Security` -- no HSTS enforcement
  - No `X-Content-Type-Options` -- allows MIME sniffing
  - No `Referrer-Policy` -- may leak URLs to third parties
  - No `Permissions-Policy` -- allows all browser APIs
- **Fix:** Add security headers in `next.config.ts`:
  ```typescript
  const nextConfig: NextConfig = {
    output: 'standalone',
    async headers() {
      return [{
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://www.google-analytics.com;" },
        ],
      }];
    },
  };
  ```

**[H-04] HIGH -- No `.env.example` or `.env.template` with documentation**
- **Files:** `.env.example`, `.env.template` (both exist but appear empty or contain no variable names)
- **Issue:** The env files found by search appear to contain no documented variables. The required variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SARVAM_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_PRODUCTNAME`, `NEXT_PUBLIC_THEME`, `NEXT_PUBLIC_GOOGLE_TAG`, `NEXT_PUBLIC_SSO_PROVIDERS`) are spread across the codebase with no central documentation.
- **Fix:** Create a documented `.env.example` listing all required variables with placeholder values and explanations.

**[M-06] MEDIUM -- No CORS configuration**
- **File:** `next.config.ts`
- **Issue:** No explicit CORS policy is configured. While Next.js API routes by default only accept same-origin requests when deployed, the absence of explicit configuration means any misconfiguration (e.g., adding `Access-Control-Allow-Origin: *` in a reverse proxy) would go unnoticed.
- **Fix:** Add explicit CORS headers in API routes or in `next.config.ts` for production.

---

## 6. PAYMENT SECURITY

### 6.1 What is done correctly

| Area | Implementation | File |
|------|---------------|------|
| Razorpay HMAC verification | SHA-256 signature check: `order_id|payment_id` | `src/app/api/razorpay/route.ts:134-141` |
| Auth on both POST and PUT | Payment creation AND verification both require Bearer token | `src/app/api/razorpay/route.ts:16-20, 101-115` |
| Pack ID whitelist | Only `pack_a` through `pack_d` accepted | `src/app/api/razorpay/route.ts:35-39` |
| Server-side price control | Pack amounts defined server-side, not client-controlled | `src/app/api/razorpay/route.ts:6-11` |
| Credit addition via RPC | Uses `add_credits` SQL function for atomic operation | `src/app/api/razorpay/route.ts:152-155` |
| Transaction recording | Every successful payment recorded in `transactions` table | `src/app/api/razorpay/route.ts:163-171` |

### 6.2 Findings

**[H-05] HIGH -- No idempotency check on payment verification**
- **File:** `src/app/api/razorpay/route.ts:99-185`
- **Issue:** The PUT endpoint does not check whether a `razorpay_payment_id` has already been processed. If the same verified payment is submitted twice (via replay attack or client retry), credits are added twice.
- **Fix:** Before adding credits, check: `SELECT count(*) FROM transactions WHERE razorpay_payment_id = $1`. If count > 0, return success without adding credits.

**[M-07] MEDIUM -- Razorpay `key_id` exposed to client**
- **File:** `src/app/api/razorpay/route.ts:87`
- **Issue:** `keyId: razorpayKeyId` is sent to the client to initialize the Razorpay checkout widget. This is **expected and required** by Razorpay's integration flow (the key_id is a public identifier). However, it should be documented as intentional to avoid confusion during future audits.
- **Fix:** No code change needed. Add a comment: `// keyId is a public identifier, required by Razorpay client SDK`.

**[L-05] LOW -- Error message leaks Razorpay error text in catch block**
- **File:** `src/app/api/razorpay/route.ts:92`
- **Issue:** `error: error instanceof Error ? error.message : 'Failed to create order'` may include Razorpay API error details in the response.
- **Fix:** Use a generic error message: `'Payment initiation failed. Please try again.'`

---

## 7. FINDINGS TABLE

| # | Severity | Category | Description | File | Status |
|---|----------|----------|-------------|------|--------|
| C-01 | **CRITICAL** | Auth/Data | Race condition in credit deduction allows double-spend | `api/generate-order/route.ts:144` | Open |
| C-02 | **CRITICAL** | API | Sort column injection via unsanitized query param | `api/orders/route.ts:27` | Open |
| C-03 | **CRITICAL** | Data | Service role key silently falls back to anon key | `api/download/route.ts:51` | Open |
| C-04 | **CRITICAL** | Data | Database types out of sync (only `todo_list`), all queries use `as never` | `lib/types.ts` | Open |
| C-05 | **CRITICAL** | Infra | No security headers (CSP, HSTS, X-Frame-Options, etc.) | `next.config.ts` | Open |
| H-01 | HIGH | Auth | Password minimum only 6 chars, no complexity rules | `auth/register/page.tsx` | Open |
| H-02 | HIGH | API | In-memory rate limiter not shared across instances | `lib/rateLimit.ts` | Open |
| H-03 | HIGH | Data | No verifiable RLS policies; all routes use service role | All API routes | Open |
| H-04 | HIGH | Infra | No documented `.env.example` with required variables | `.env.example` | Open |
| H-05 | HIGH | Payment | No idempotency check on payment verification (replay risk) | `api/razorpay/route.ts:99` | Open |
| M-01 | MEDIUM | Auth | `getSession()` used client-side for token extraction | `generate/page.tsx:135` | Acceptable |
| M-02 | MEDIUM | API | LIKE wildcards not escaped in search parameter | `api/orders/route.ts:45` | Open |
| M-03 | MEDIUM | API | No rate limiting on download/orders/razorpay endpoints | `api/download/route.ts` | Open |
| M-04 | MEDIUM | Data | Client-side direct query to orders table (needs RLS) | `my-orders/page.tsx:107` | Open |
| M-05 | MEDIUM | Data | Audit log is fire-and-forget (DPDP compliance risk) | `api/download/route.ts:54` | Open |
| M-06 | MEDIUM | Infra | No explicit CORS configuration | `next.config.ts` | Open |
| M-07 | MEDIUM | Payment | Razorpay `key_id` sent to client (expected but undocumented) | `api/razorpay/route.ts:87` | Acceptable |
| L-01 | LOW | Auth | Debug log leaks MFA factor data to browser console | `MFAVerification.tsx:34` | Open |
| L-02 | LOW | API | No server-side MIME type validation for file uploads | `unified.ts:55` | Open |
| L-03 | LOW | Client | User email rendered directly (React auto-escapes) | `AppLayout.tsx:150` | Acceptable |
| L-04 | LOW | Client | `console.log(user)` leaks user object in storage page | `storage/page.tsx:54` | Open |
| L-05 | LOW | Payment | Error message may leak Razorpay API error details | `api/razorpay/route.ts:92` | Open |

---

## 8. PRIORITIZED RECOMMENDATIONS

### Immediate (Before Production Launch)

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 1 | **C-05** Add security headers in `next.config.ts` | 30 min | Blocks clickjacking, XSS, MIME sniffing |
| 2 | **C-01** Create atomic `deduct_credit` SQL function | 1 hr | Prevents free order generation via race condition |
| 3 | **C-02** Whitelist sort columns in orders API | 15 min | Prevents column name injection |
| 4 | **C-03** Remove anon key fallback in download route | 10 min | Prevents silent RLS bypass |
| 5 | **H-05** Add idempotency check on payment verification | 30 min | Prevents double credit addition |
| 6 | **C-04** Regenerate Supabase types | 15 min | Enables compile-time query validation |

### Short-Term (Within 1 Sprint)

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 7 | **H-03** Implement RLS policies on all tables | 2 hr | Defense-in-depth for data isolation |
| 8 | **H-01** Enforce 8+ char password with complexity | 30 min | Meets government security standards |
| 9 | **M-02** Escape LIKE wildcards in search input | 15 min | Prevents expensive DB scans |
| 10 | **M-03** Add rate limiting to all API endpoints | 1 hr | Prevents abuse of download/payment APIs |
| 11 | **M-05** Await audit log insert for DPDP compliance | 10 min | Ensures reliable audit trail |
| 12 | **H-04** Create documented `.env.example` | 30 min | Prevents deployment misconfigurations |

### Before Scaling

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 13 | **H-02** Migrate rate limiter to Redis | 2 hr | Required for multi-instance deployment |
| 14 | **M-04** Route all DB access through API endpoints | 4 hr | Eliminates client-side direct DB access |
| 15 | **M-06** Add explicit CORS configuration | 30 min | Prevents cross-origin abuse |
| 16 | **L-02** Add server-side MIME type validation | 1 hr | Prevents malicious file upload |

### Cleanup (Non-Urgent)

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 17 | **L-01** Remove MFA debug console.log | 5 min | Prevents factor ID leakage |
| 18 | **L-04** Remove `console.log(user)` | 5 min | Prevents user data leakage |
| 19 | **L-05** Sanitize Razorpay error messages | 10 min | Prevents API detail leakage |

---

## 9. ENVIRONMENT VARIABLES INVENTORY

All environment variables referenced in the codebase:

| Variable | Prefix | Exposure | Used In |
|----------|--------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_` | Client + Server | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_` | Client + Server | All Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | None | Server only | `serverAdminClient.ts`, all API routes |
| `SARVAM_API_KEY` | None | Server only | `api/generate-order/route.ts` |
| `RAZORPAY_KEY_ID` | None | Server only (sent to client for checkout) | `api/razorpay/route.ts` |
| `RAZORPAY_KEY_SECRET` | None | Server only | `api/razorpay/route.ts` |
| `NEXT_PUBLIC_PRODUCTNAME` | `NEXT_PUBLIC_` | Client | `auth/layout.tsx` |
| `NEXT_PUBLIC_THEME` | `NEXT_PUBLIC_` | Client | `layout.tsx` |
| `NEXT_PUBLIC_GOOGLE_TAG` | `NEXT_PUBLIC_` | Client | `layout.tsx` |
| `NEXT_PUBLIC_SSO_PROVIDERS` | `NEXT_PUBLIC_` | Client | `SSOButtons.tsx` |

**Assessment:** Environment variable naming follows correct conventions. Server secrets do NOT have `NEXT_PUBLIC_` prefix. No secrets are hardcoded in source files.

---

## 10. THINGS DONE WELL

Credit where it is due -- the following security practices are implemented correctly and should be maintained:

1. **Consistent auth pattern** -- Every API route follows the same Bearer token pattern with `getUser()` verification. This is the correct approach.
2. **Middleware route guard** -- The middleware correctly uses `getUser()` (not `getSession()`) and redirects unauthenticated users from `/app/*`.
3. **Razorpay signature verification** -- Correct HMAC-SHA256 implementation matching Razorpay's documentation.
4. **Error message localization** -- User-facing errors are in Kannada with no server internals leaked. This is excellent for the target audience.
5. **Input validation on generate endpoint** -- Length cap, type whitelist, required field checks are all present.
6. **MFA support** -- Full TOTP enrollment and verification flow with AAL2 enforcement.
7. **Non-root Docker user** -- Dockerfile creates and switches to a `nextjs` user with UID 1001.
8. **NFKC normalization** -- All Kannada text is normalized before processing, preventing Unicode canonicalization attacks.
9. **Guardrails system** -- Post-generation quality checks (section completeness, anti-transliteration, fact preservation, word count) add a quality gate.
10. **Signed URLs for file sharing** -- Files are shared via time-limited signed URLs rather than direct access.

---

## APPENDIX: FILES AUDITED

```
src/middleware.ts
src/lib/supabase/client.ts
src/lib/supabase/middleware.ts
src/lib/supabase/server.ts
src/lib/supabase/serverAdminClient.ts
src/lib/supabase/unified.ts
src/lib/rateLimit.ts
src/lib/guardrails.ts
src/lib/sarvam.ts
src/lib/smart-context.ts
src/lib/types.ts
src/lib/pricing.ts
src/lib/context/GlobalContext.tsx
src/lib/context/LanguageContext.tsx
src/app/api/auth/callback/route.ts
src/app/api/generate-order/route.ts
src/app/api/orders/route.ts
src/app/api/razorpay/route.ts
src/app/api/download/route.ts
src/app/auth/login/page.tsx
src/app/auth/register/page.tsx
src/app/auth/forgot-password/page.tsx
src/app/auth/reset-password/page.tsx
src/app/auth/verify-email/page.tsx
src/app/auth/2fa/page.tsx
src/app/auth/layout.tsx
src/app/app/layout.tsx
src/app/app/page.tsx
src/app/app/generate/page.tsx
src/app/app/billing/page.tsx
src/app/app/my-orders/page.tsx
src/app/app/storage/page.tsx
src/app/app/train/page.tsx
src/app/app/user-settings/page.tsx
src/app/layout.tsx
src/components/AppLayout.tsx
src/components/MFASetup.tsx
src/components/MFAVerification.tsx
src/components/SSOButtons.tsx
next.config.ts
Dockerfile
.env.local / .env.example / .env.template
```

---

*Report generated 2026-03-29 by Claude Code automated security audit.*
*This audit covers application-level code. It does NOT cover Supabase dashboard configuration (RLS policies, auth settings, storage policies), network infrastructure, DNS/SSL configuration, or the VPS hosting environment. A separate infrastructure audit is recommended before production launch.*
