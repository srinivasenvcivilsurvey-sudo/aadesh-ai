# DOUBT 3 — SYNTHESIS REPORT
# Prompt Caching + OpenRouter: Does It Work?
# Date: April 4, 2026
# Sources: Perplexity, Claude Deep Research

---

## VERDICT: YES it works. Some gotchas to handle.

### Quick Answer to All 10 Questions

| # | Question | Answer | Both Agree? |
|---|---------|--------|------------|
| 1 | Does OpenRouter support prompt caching? | YES — both automatic and explicit | YES |
| 2 | Real latency at 100K-130K cached? | Cold: ~11.5s → Cached: ~2.4s (79% faster) | YES |
| 3 | Does sticky routing keep cache warm? | YES but "best effort" — cache misses happen | YES |
| 4 | Can we use 1-hour TTL? | YES — "ttl": "1h" supported | YES |
| 5 | Minimum tokens for caching? | Sonnet 4.6 = 2,048 tokens minimum | YES |
| 6 | Real apps using 100K+ cached context? | Yes — book Q&A, agent sessions, code repos | YES |
| 7 | Known bugs? | YES — 3 specific issues found | YES |
| 8 | Direct API vs OpenRouter? | Direct is more reliable. OpenRouter adds ~15ms. | YES |
| 9 | Kannada text caching difference? | NO difference — caching is token-based, language-agnostic | YES |
| 10 | 1M context + caching together? | YES — works without special configuration | YES |

### Cost Math for Aadesh AI (Confirmed)

| Scenario | Input Cost | Output Cost | Total per Order |
|----------|-----------|-------------|----------------|
| First order (cache write, 1hr TTL) | Rs 4.80 (120K × $6/M) | Rs 7.50 | **Rs 12.30** |
| 2nd-5th order (cache read) | Rs 0.30 (120K × $0.30/M) | Rs 7.50 | **Rs 7.80** |
| Average across 5-order session | | | **Rs 8.70** |

At Rs 500/order price → **Rs 491 gross profit per order (98.3% margin)**

### 3 Known Bugs to Handle

| Bug | Source | Our Fix |
|-----|--------|---------|
| 1-hour TTL silently ignored in some configs | Claude DR (GitHub issue) | Test explicitly. Monitor cached_tokens in response. |
| Sticky routing breaks when provider.order is set manually | Both sources | Don't set provider.order. Let OpenRouter auto-route. |
| Cache only covers system message, not growing conversation | Claude DR (GitHub issue) | Use explicit cache breakpoints on reference orders block. |

### Architecture Decision: Direct API vs OpenRouter

| Factor | Direct Anthropic API | OpenRouter |
|--------|---------------------|-----------|
| Cache reliability | Higher — no intermediary | "Best effort" sticky routing |
| Latency overhead | None | ~15ms (negligible) |
| Cost | Same token pricing | Same + tiny OpenRouter margin |
| Multi-model routing | Manual | Automatic (Sarvam + Sonnet) |
| We already use | No | YES — already set up |

**CTO Decision: Stay on OpenRouter for now.** We already have it working. The 15ms overhead is nothing. If we see cache miss problems, switch to direct API later.

### Implementation Plan for Prompt Caching

| Step | What | When |
|------|------|------|
| 1 | Add cache_control to reference orders block (explicit breakpoint) | When building v8.x app |
| 2 | Set TTL to 1 hour for officer sessions | Same time |
| 3 | Monitor cached_tokens in every API response | From day 1 |
| 4 | If cache miss rate > 20%, evaluate direct Anthropic API | Phase 1 |
| 5 | Keep reference orders as first content block (before case input) | Architecture rule |

### Key Technical Detail for Claude Code

When implementing, the API call should look like:
1. System prompt (cached — rarely changes)
2. Reference orders block with cache_control (cached — changes only when officer uploads new orders)
3. Case input (NOT cached — changes every order)

This way, steps 1+2 are cached (120K tokens at 10% cost) and only step 3 (2K tokens) is full price.

**Bottom line: Prompt caching makes our 1M context approach AFFORDABLE.
Rs 8.70 average cost per order. Rs 500 price. 98% margin. This works.**
