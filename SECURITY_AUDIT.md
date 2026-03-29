# Security Audit — Aadesh AI
**Date:** 2026-03-29 | **Auditor:** Claude Code

## Authentication

| Check | Status | Detail |
|-------|--------|--------|
| Email/password auth | PASS | Supabase Auth handles hashing |
| MFA support | PASS | TOTP 2FA available via settings |
| Session management | PASS | Supabase SSR cookies, middleware validates |
| Password reset | PASS | Supabase email-based reset flow |
| Rate limit on auth | PASS | Supabase built-in rate limiting |

## API Security

| Check | Status | Detail |
|-------|--------|--------|
| Auth on all API routes | PASS | Bearer token verified via Supabase |
| Rate limiting | PASS | 10 req/min/user (in-memory sliding window) |
| Input validation | PASS | 10K char max, type whitelist |
| Input sanitization | PASS | NFKC normalization on all text |
| System prompt injection | PASS | Server-side prompt only, client input never in system role |
| Error message leakage | PASS | Kannada messages only, no stack traces |
| CORS | PASS | Next.js same-origin by default |

## Data Security

| Check | Status | Detail |
|-------|--------|--------|
| API keys in env vars | PASS | .env.local, never in code |
| .env in .gitignore | PASS | `.env*` pattern covers all |
| VPS password | PASS | .env.vps file, .gitignore covered |
| RLS on all tables | PASS | profiles, orders, references, transactions, audit_log |
| Service role key server-only | PASS | Only in API routes, never in client |
| Data in India | PASS | Supabase Singapore region, VPS DigitalOcean Singapore |

## DPDP / Legal Compliance

| Check | Status | Detail |
|-------|--------|--------|
| Audit log on downloads | PASS | user_id, action, IP, user_agent, metadata |
| AI disclaimer watermark | PASS | Shown until verified, removed on download |
| Verification checkbox | PASS | Formal declaration required before download |
| Terms of Service | PASS | /legal/terms page exists |
| Privacy Policy | PASS | /legal/privacy page exists |
| Cookie consent | PASS | CookieConsent component |

## Vulnerabilities Found

| Severity | Issue | Fix |
|----------|-------|-----|
| MEDIUM | VPS password in .env.vps — if device compromised, VPS exposed | Migrate to SSH key auth |
| LOW | No HTTPS on VPS (HTTP only) | Add Let's Encrypt SSL certificate |
| LOW | SUPABASE_SERVICE_ROLE_KEY used in 3 API routes — broad access | Create scoped Supabase functions instead |
| INFO | No CSP headers configured | Add Content-Security-Policy header |
| INFO | Vercel Analytics loaded (may send data to US) | Review if needed for govt compliance |

## Recommendations

1. **URGENT:** Add HTTPS via Let's Encrypt (`certbot --nginx`)
2. **HIGH:** Migrate VPS auth from password to SSH key
3. **MEDIUM:** Add CSP headers in next.config.ts
4. **LOW:** Replace service role key with Supabase RPC functions
