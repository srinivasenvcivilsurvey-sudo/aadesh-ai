# Codebase Audit Report — Aadesh AI
**Date:** 2026-03-29 | **Auditor:** Claude Code | **Version:** Commit 264b15e

## Summary

| Metric | Value |
|--------|-------|
| Source files | 65 (.ts + .tsx) |
| Lines of code | 6,854 |
| Pages | 24 (static + dynamic) |
| API routes | 5 (generate-order, orders, download, razorpay, auth/callback) |
| Components | 12 custom + shadcn/ui |
| Lib modules | 9 (sarvam, guardrails, smart-context, rateLimit, i18n, system-prompt, types, supabase/*, context/*) |

## Architecture

| Layer | Tech | Status |
|-------|------|--------|
| Frontend | Next.js 15.5.7 + React 19 + Tailwind | LIVE |
| State | GlobalContext (user/credits) + LanguageContext (EN/KN) | WORKING |
| AI | Sarvam 105B via api.sarvam.ai | WORKING |
| Auth | Supabase Auth (email/password + MFA) | WORKING |
| Storage | Supabase Storage (files bucket) | WORKING |
| Database | Supabase PostgreSQL (profiles, orders, references, transactions, audit_log) | SQL READY, needs manual run |
| Payments | Razorpay (4 packs) | INTEGRATED |
| Deploy | DigitalOcean VPS, PM2, Nginx | LIVE at 165.232.176.181 |

## File Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page (LanguageProvider)
│   ├── layout.tsx               # Root layout (metadata, theme, analytics)
│   ├── globals.css              # Global styles, govt-document, print, credit colors
│   ├── auth/ (login, register, forgot-password, 2fa, verify-email, reset-password)
│   ├── app/ (dashboard, generate, train, my-orders, storage, billing, user-settings)
│   ├── api/ (generate-order, orders, download, razorpay, auth/callback, health)
│   └── legal/ (privacy, terms)
├── components/ (AppLayout, AuthAwareButtons, HowItWorks, LandingPage, Toast, TrainingStatusBar, ...)
└── lib/ (sarvam.ts, guardrails.ts, smart-context.ts, rateLimit.ts, i18n.ts, system-prompt.ts, context/*, supabase/*)
```

## Key Features Audit

| Feature | Files | Status |
|---------|-------|--------|
| Language toggle (EN/KN) | LanguageContext, i18n.ts, all pages | COMPLETE |
| Training page | /app/train, TrainingStatusBar | COMPLETE |
| Smart-context (5 ref selection) | smart-context.ts, generate-order route | COMPLETE |
| Auto-recovery (3 retries) | sarvam.ts | COMPLETE |
| 4 Guardrails | guardrails.ts | COMPLETE |
| Credit system | generate-order route, profiles table | COMPLETE |
| My Orders (card layout) | /app/my-orders, /api/orders | COMPLETE |
| Transfer mode | /app/user-settings | COMPLETE |
| Audit log (DPDP) | download route, audit_log table | COMPLETE |
| Demo mode | smart-context.ts (5 pre-loaded refs) | COMPLETE |
| Auto-save editor | /app/generate (10s debounce) | COMPLETE |
| Print support | globals.css @media print, Print button | COMPLETE |
| Offline detection | generate page, WifiOff banner | COMPLETE |
| Mobile bottom nav | AppLayout | COMPLETE |
| Toast notifications | Toast.tsx, app layout | COMPLETE |

## Code Quality

- TypeScript: 0 errors (strict mode)
- Build: 24 pages compiled, 0 warnings from our code
- NFKC normalization: Applied to all Kannada text I/O
- Error messages: All user-facing errors in Kannada
- No hardcoded API keys (all via env vars)
- Rate limiting: 10 requests/minute/user
- Input validation: 10K char max, type whitelist
