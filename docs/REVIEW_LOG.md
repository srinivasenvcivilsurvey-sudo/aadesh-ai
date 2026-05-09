# Review Log

## 2026-04-26 — Netlify Deploy Attempt

**What went wrong:** The Netlify connector created deploys marked `ready`, but smoke checks showed both the production URL and deploy preview URL returned 404. The deploy summary consistently said no functions were deployed.

**Lesson:** For Next.js apps with API routes, a Netlify deploy is not complete until URL smoke checks pass and the deploy summary shows the expected Next runtime/functions. A `ready` deploy state alone is not enough.

**Rule to apply next time:** After any Netlify deploy, verify both `/` and `/api/health`, then inspect deploy summary for functions before calling the deploy successful.
