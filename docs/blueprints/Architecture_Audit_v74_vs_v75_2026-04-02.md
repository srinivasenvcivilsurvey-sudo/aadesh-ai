# DDLR AI Drafting — Architecture Audit Report
**Date:** April 2, 2026
**Author:** CTO (Cowork)
**For:** Srinivasa T (Founder)

---

## Executive Summary

Blueprint v7.4.1 (complex 19-stage RAG pipeline) should be REPLACED by Blueprint v7.5 (simple 6-stage PDF → Claude Vision → Questions → Generate pipeline).

**Evidence:** Two real DDLR orders scored 100/100 using Claude Projects PDF workflow. Current aadesh-ai.in scores 62/100.

---

## Detailed Comparison

| Metric | v7.4.1 (Current Blueprint) | v7.5 (Proven by Real Orders) |
|--------|---------------------------|------------------------------|
| Quality Score | 62/100 | **100/100** |
| Input Method | Form/text/OCR | Full PDF upload |
| Document Reading | Sarvam OCR → fact extraction → RAG | Claude Vision reads entire PDF |
| Ambiguity Handling | None (AI guesses) | 5 clarifying questions |
| Knowledge Base | Jina v3 embeddings → pgvector → 3-stage RAG | 576 orders in Claude context window |
| Generation | Multi-model routing (Sarvam/Sonnet/Gemini) | Claude single call |
| Validation | 4-layer external validation engine | Self-audit loop |
| Pipeline Complexity | 19 stages, 8 custom Python files | 6 stages, mostly API calls |
| Cost per Order | ₹0-12 | ₹15-20 |
| Setup Time | ~2 weeks | ~3-4 days |

---

## Proof: 100/100 Orders

1. **SuoMotu 229/2025-26** (Madappanahalli Sy.107) — ~900 words, 7-point court opinion
2. **Appeal 22/2025-26** (Nagaruru Sy.4 V2) — ~750 words, GPA holder, Mojini app citation

Both generated via: PDF upload → Claude reads everything → asks 5 questions → officer answers → perfect order generated.

---

## What Survives from v7.4.1

| Component | Decision | Reason |
|-----------|----------|--------|
| 3 DOCX templates | KEEP | Same templates work in v7.5 |
| PATCH E5 (outcome gate) | KEEP | Still needed for quality control |
| PATCH E6 (PDF upload) | KEEP | Core of v7.5 input method |
| ocr_pipeline.py | ARCHIVE | Claude reads PDFs directly |
| ingest.py | ARCHIVE | No RAG needed |
| three_stage_rag.py | ARCHIVE | No RAG needed |
| fact_extractor.py | ARCHIVE | Replaced by clarifying questions |
| validation_engine.py | ARCHIVE | Replaced by self-audit |
| precedent_checker.py | MAYBE KEEP | Useful for Phase 2 |
| generation_engine.py | PARTIAL | Bible cache logic reusable |

---

## Recommended Action Plan

| Step | Task | Owner | Timeline |
|------|------|-------|----------|
| 1 | Approve v7.5 pivot | Srinivas | Immediate |
| 2 | Archive v7.4.1 pipeline files | Claude Code | 30 min |
| 3 | Build PDF → Claude Vision endpoint | Claude Code | 1 day |
| 4 | Build clarifying questions UI | Claude Code | 1 day |
| 5 | Build generate → self-audit → docxtpl | Claude Code | 1 day |
| 6 | Test with Banu's 2 proven cases | Banu + Claude Code | 1 day |
| 7 | Deploy to aadesh-ai.in | Claude Code | 4 hours |

---

## Cost Analysis & Warning

At ₹15-20/order (Claude Sonnet), ₹24,000/year pricing creates a loss.

**Mitigation options:**
1. Smart routing: Simple → Sarvam FREE, Complex → Claude ₹15
2. Raise price to ₹48,000/year
3. Anthropic volume discount at 50+ offices
4. Claude Haiku 4.5 for simple cases (~₹3-5/order)

---

## Technology Scan (April 2026)

- Claude Agent SDK v0.2.87 (TS) / v0.1.53 (Python) — production-ready
- Claude Vision reads scanned PDFs natively in 1M context window
- Structured Outputs — JSON questions/facts eliminate parsing bugs
- Claude Haiku 4.5 — potential cost reducer at ₹3-5/order
- Sarvam Mayura v2 — still viable as free fallback for simple cases

---

## Recommendation

**ADOPT BLUEPRINT v7.5 IMMEDIATELY.** The evidence is clear — the simple PDF workflow produces dramatically better results (100 vs 62) with less complexity. Start AAD-21 task list from v7.5 blueprint in Notion.
