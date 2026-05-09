# AADESH AI — BLUEPRINT v8.1 ADDENDUM
# Date: April 4, 2026
# Status: ACTIVE — Apply on top of Blueprint v8.0
# Author: Claude (CTO) + Srinivas T (Founder)

---

## PURPOSE

This addendum patches Blueprint v8.0 with 5 technology discoveries from the April 3-4, 2026 technology scan. It does NOT replace v8.0 — it sits alongside it as targeted upgrades.

Think of v8.0 as the house blueprint. This addendum adds earthquake bolts, better wiring, and a security alarm system.

---

## DISCOVERY 1: SONNET 4.6 — 1M CONTEXT WINDOW (GA)

### What Changed
- Claude Sonnet 4.6 now supports **1M token context window** at standard pricing
- **No beta header required** (unlike Sonnet 4.5 which needed context-1m-2025-08-07)
- Sonnet 4.5 1M context **retiring April 30, 2026** — must migrate before then
- Web search and code execution now **generally available** (no beta header)

### Blueprint Impact: FOUNDATION CHANGE

**BEFORE (v7.4 / v8.0 fallback):**
PDF → OCR → Text extraction → Embeddings (Vyakyarth) → pgvector storage → 3-stage RAG retrieval → Top-5 reference selection → Generation
- 8 Python files
- pgvector database required
- Embedding API calls — cost per document
- Complex retrieval logic

**AFTER (v8.1):**
Upload 20 reference orders → Concatenate as text → Include in system prompt → Sonnet 4.6 reads all 20 orders in 1M context → Generates new order
- 0 pipeline files
- No embeddings database
- No vector search
- No RAG code
- One API call with large context

### Why This Works (Math)
- Average Banu order: ~600 words = ~6,000 tokens (Kannada uses ~10 tokens/word)
- 20 reference orders: 20 x 6,000 = ~120,000 tokens
- System prompt V3.2.1: ~4,500 tokens
- Case input + instructions: ~2,000 tokens
- **Total context needed: ~127,000 tokens**
- **Sonnet 4.6 capacity: 1,000,000 tokens**
- **Usage: ~13% of available context** — massive headroom

### Cost Impact with Prompt Caching
| Item | Without Caching | With Caching (2nd+ order) |
|------|----------------|--------------------------|
| 120K reference tokens (input) | Rs 30/order | Rs 3/order (cache read = 10% cost) |
| Case input + system prompt | Rs 1.5/order | Rs 1.5/order |
| Output (~600 words) | Rs 7.5/order | Rs 7.5/order |
| **Total** | **Rs 39/order** | **Rs 12/order** |

Cache read = 90% cheaper than normal input. Pays for itself after just 1 reuse.

### What to Change in v8.0
1. Architecture Pipeline — Remove all references to RAG, embeddings, pgvector
2. Infrastructure — Remove pgvector extension from Supabase requirements
3. Cost Model — Remove embedding API costs
4. Model Strategy — Add: "Must use Sonnet 4.6 (not 4.5) for 1M context after April 30"
5. Reference Order Handling — "Store as plain text. On generation, fetch all, concatenate, include in API call."

---

## DISCOVERY 2: COMPACTION API (Beta)

### What Changed
- Anthropic launched **Compaction API** in beta on Opus 4.6
- Server-side context summarization — effectively infinite conversations
- Client-side compaction available in Python and TypeScript SDKs

### Blueprint Impact: PHASE 1 UPGRADE
- Relevant for interactive Q&A workflow (officer answers clarifying questions)
- Not needed now. Current single-turn generation doesn't need this.
- Evaluate in Phase 1 when we add clarifying questions workflow.

---

## DISCOVERY 3: CLAUDE AGENT SDK v0.1.54

### What Changed
- Python SDK for building autonomous AI agents using Claude Code capabilities
- Built-in tools: file reading, bash execution, editing
- Custom tools via @tool decorator
- Session persistence, auto-compaction, sub-agents
- v0.1.54 released April 2, 2026

### Blueprint Impact: PHASE 1 EVALUATION
Could replace ~500 lines of Next.js API routes with ~50 lines of Python.

| Approach | Code Lines | Ease |
|----------|-----------|------|
| Current (Next.js API routes) | ~500 lines | 6/10 |
| Agent SDK (Python) | ~50 lines | 8/10 |

**Key constraint:** Requires Anthropic API key (not Max subscription). We already use OpenRouter, so not a new cost.

**Decision:** Build PoC in Phase 1. If 80%+ reliable and 50%+ less code, consider switching. SDK is v0.1.x (alpha) — don't use in production yet.

---

## DISCOVERY 4: SARVAM CHANAKYA (Competitor Update)

### What Changed
- Sarvam AI launched **Chanakya** vertical on March 29, 2026
- Secure, air-gapped AI for government and defense
- 22 Indian languages including Kannada
- On-premise deployment — data never leaves government network
- Sarvam raising **$250-300 million** from NVIDIA, HCLTech, Accel
- Open-sourced Sarvam-30B and Sarvam-105B under Apache 2.0

### Strategic Position
Sarvam Chanakya = Platform (like Android OS)
Aadesh AI = Application (like a specific app on Android)
They are NOT the same thing. Chanakya provides the AI engine. We provide the DDLR-specific solution.
Best case: Aadesh AI RUNS ON Chanakya for air-gapped government offices. Partner, not competitor.

### Action Items
1. Monitor Sarvam Startup Program response (submitted March 28)
2. If approved: Explore building Aadesh AI on top of Chanakya
3. If rejected: Continue with Claude Sonnet 4.6 (scores 100/100)

---

## DISCOVERY 5: KARNATAKA RESPONSIBLE AI COMMITTEE

### What Changed
- Committee formed March 12, 2026
- Chair: Kris Gopalakrishnan (Infosys Co-founder)
- Co-chair: N. Manjula (Secretary, Dept of IT)
- Members: IBM, Accenture, Wipro, IIIT Bangalore, NASSCOM
- Interim report due: ~May 12, 2026 (60 days)
- Final recommendations: ~June 12, 2026 (90 days)

### What They Will Produce
1. Responsible AI policy framework for Karnataka
2. Risk classification system for AI in governance
3. AI procurement guidelines and vendor due diligence
4. Transparency requirements — citizens informed when interacting with AI
5. Human review mechanisms and grievance redressal
6. Independent audit requirements

### Compliance Checklist for Aadesh AI

| Requirement | Our Status | Gap? |
|------------|-----------|------|
| Transparency — Citizens know AI involved | PARTIAL | Add "AI-assisted draft" label |
| Human oversight — Officer reviews before signing | DONE | Already in workflow |
| Grievance redressal | NOT BUILT | Add feedback button |
| Data governance — DPDP alignment | PARTIAL | Add retention policy |
| No discriminatory profiling | DONE | Document for audit |
| Independent audit trail | NOT READY | Log full prompt + response |
| Vendor due diligence docs | NOT READY | Prepare compliance pack |

### Why Proactive Compliance Helps Us
Being proactively compliant BEFORE the policy drops = competitive advantage.
When Karnataka announces requirements, most companies need 3-6 months.
Aadesh AI: "We already comply. Here is our documentation."
Result: FIRST approved AI tool for DDLR offices.

---

## DECISIONS LOG

| # | Decision | Rationale | Date |
|---|---------|-----------|------|
| D-8.1.1 | Remove RAG pipeline from architecture | 1M context makes RAG unnecessary for <=20 reference orders | April 4, 2026 |
| D-8.1.2 | Do NOT adopt Agent SDK yet | Alpha quality. Current system scores 100/100. | April 4, 2026 |
| D-8.1.3 | Do NOT implement Compaction API yet | Only needed for multi-turn Q&A (not built yet) | April 4, 2026 |
| D-8.1.4 | Treat Chanakya as potential partner | We can be an app ON their platform | April 4, 2026 |
| D-8.1.5 | Prepare for Karnataka RAI compliance before May 12 | First-mover advantage | April 4, 2026 |

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| v8.0 | April 3, 2026 | Full multi-tenant architecture, 20+ office expansion |
| v8.0 Addendum | April 3, 2026 | 9 gaps fixed, DPDP compliance, competitor research |
| **v8.1 Addendum** | **April 4, 2026** | **5 tech discoveries: 1M context, Compaction API, Agent SDK, Sarvam Chanakya, Karnataka RAI Committee** |

---

*This document patches Blueprint v8.0. Read both together for complete picture.*
*Next update: After Karnataka RAI Committee interim report (~May 12, 2026)*
