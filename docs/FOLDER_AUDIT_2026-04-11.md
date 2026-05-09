# BANU FOLDER — COMPLETE PROJECT AUDIT
# Date: April 11, 2026
# Purpose: Map every project, every folder, with status and priority

---

## DISCOVERY SUMMARY

**3 DISTINCT PROJECTS FOUND:**

| # | Project | Folder | Status | Priority |
|---|---------|--------|--------|----------|
| 1 | **Aadesh AI SaaS (main)** | `aadesh-ai/nextjs/` | Live at aadesh-ai.in | 🔴 ACTIVE |
| 2 | **Aadesh AI (Kiro build)** | `kiro/aadesh-ai/nextjs/` | Complete pipeline built by Kiro AI | 🔴 CRITICAL FIND |
| 3 | **AutoCAD Survey Tool** | `autocad-mcp/` + `tippani_prototype/` | Working prototype | 🟡 SEPARATE |

**TESTING ENVIRONMENT:**
| - | Local test tool | `KarnatakaAI/11_DDLR_App/` | Used for quality scoring | 🔴 ACTIVE |

---

## PROJECT 1: Aadesh AI Main App
**Folder:** `aadesh-ai/nextjs/`
**Status:** Live at aadesh-ai.in

**What exists:**
- Full Next.js 15 app with auth, billing, UI
- Direct Anthropic SDK (migrated April 10)
- `src/lib/sarvam.ts` — AI generation logic
- `src/app/api/generate-order/` — main route
- NO pipeline components (FileUpload, Vision, Questions, Preview, Download)
- NO PII redaction
- NO Entity Lock screen

---

## PROJECT 2: Aadesh AI Kiro Build ⭐ MAJOR DISCOVERY
**Folder:** `kiro/aadesh-ai/nextjs/`
**What is Kiro:** Amazon's AI coding tool (like Cursor). Used to build from spec.

**This folder has the COMPLETE pipeline already built:**

### Pipeline Library (`src/lib/pipeline/`):
| File | What it does | Status |
|------|-------------|--------|
| `piiRedactor.ts` | Masks names/survey numbers before API | ✅ Built |
| `buildPrompt.ts` | Assembles prompt with cache_control | ✅ Built |
| `auditOrder.ts` | 4-guardrail quality check | ✅ Built |
| `rateLimiter.ts` | 5 orders/day per user | ✅ Built |
| `withRetry.ts` | Auto-retry on rate limits | ✅ Built |
| `logCacheMetrics.ts` | Cache monitoring | ✅ Built |
| `pipelineReducer.ts` | State machine | ✅ Built |
| `validateAnswers.ts` | Input validation | ✅ Built |
| `sarvamGenerate.ts` | Sarvam fallback | ✅ Built |
| `types.ts` | TypeScript types | ✅ Built |
| `errorLogger.ts` | Self-hosted logging | ✅ Built |

### API Routes (`src/app/api/pipeline/`):
| Route | What it does | Status |
|-------|-------------|--------|
| `/pipeline/validate` | File type + page count check | ✅ Built |
| `/pipeline/vision-read` | Claude Vision reads PDF | ✅ Built |
| `/pipeline/generate` | SSE streaming order generation | ✅ Built |
| `/pipeline/export-docx` | DOCX download with footer | ✅ Built |
| `/pipeline/migrate` | DB schema migration | ✅ Built |
| `/health` | UptimeRobot endpoint | ✅ Built |

### UI Components (`src/components/pipeline/`):
| Component | What it does | Status |
|-----------|-------------|--------|
| `FileUploadStep.tsx` | PDF upload with validation | ✅ Built |
| `VisionReadingStep.tsx` | Progress while AI reads | ✅ Built |
| `QuestionsStep.tsx` | Clarifying questions UI | ✅ Built |
| `GeneratingStep.tsx` | Live streaming generation | ✅ Built |
| `PreviewEditorStep.tsx` | Edit + Entity Lock checkbox | ✅ Built |
| `DownloadStep.tsx` | DOCX download trigger | ✅ Built |

### Also found in kiro/aadesh-ai/:
| File | What it is | Action needed |
|------|-----------|--------------|
| `KARNATAKA_RAI_SUBMISSION_DRAFT.md` | Complete RAI submission letter | ✅ READY TO SEND |
| `ANTHROPIC_DPA_EMAIL_DRAFT.md` | Email to privacy@anthropic.com | ✅ READY TO SEND |
| `PHASE0_GAPS.md` | Known gaps in pipeline | Read before merging |
| `SECURITY_AUDIT.md` | Security findings | Read before deploying |

### Kiro Spec (`kiro/.kiro/specs/generation-pipeline/`):
| File | Content |
|------|---------|
| `requirements.md` | 22 detailed requirements with acceptance criteria |
| `tasks.md` | 33 implementation tasks (all marked ✅ done) |
| `design.md` | Architecture design document |

---

## PROJECT 3: AutoCAD Survey Tool
**Folders:** `autocad-mcp/` + `KarnatakaAI/tippani_prototype/`
**What it is:** Tool to digitize land survey sketches into AutoCAD DXF format
**Status:** Working prototype (DXF files exist)
**Relevance to Aadesh AI:** NONE. Completely separate project.
**Action:** Keep. Don't merge. Don't delete.

---

## TESTING ENVIRONMENT (not a separate project)
**Folder:** `KarnatakaAI/11_DDLR_App/`
**What it is:** Local test scripts for quality scoring
**Action:** Keep active. Run tests here before deploying.

---

## IMPORTANT DOCUMENTS FOUND IN KIRO FOLDER

### 1. Karnataka RAI Submission — READY TO SEND
**File:** `kiro/aadesh-ai/KARNATAKA_RAI_SUBMISSION_DRAFT.md`
**Status:** Complete draft. Just needs a date added.
**Deadline:** May 12, 2026 (31 days away)
**Action:** Copy to main aadesh-ai folder. Send to RAI Committee before May 12.

### 2. Anthropic DPA Email — READY TO SEND
**File:** `kiro/aadesh-ai/ANTHROPIC_DPA_EMAIL_DRAFT.md`
**Status:** Complete draft email to privacy@anthropic.com
**Action:** Srinivas sends this email NOW. Takes 5 minutes.

---

## WHAT TO DO WITH THE KIRO BUILD

The Kiro build has the COMPLETE pipeline that we spent weeks designing in the blueprint.
Before merging into the main app, we need to:

1. **Read `kiro/.kiro/specs/generation-pipeline/design.md`** — understand architecture
2. **Read `kiro/aadesh-ai/PHASE0_GAPS.md`** — what's missing
3. **Read `kiro/aadesh-ai/SECURITY_AUDIT.md`** — what security issues exist
4. **Compare Kiro app vs Main app** — find differences
5. **Test Kiro pipeline locally** — run `npm test` in kiro/aadesh-ai/nextjs
6. **Merge the pipeline files** into main app (not replace the whole app)

**This is weeks of saved work. The pipeline Claude Code was going to build is already done.**

---

## FOLDER HEALTH SUMMARY

| Folder | Type | Keep? | Action |
|--------|------|-------|--------|
| `aadesh-ai/nextjs/` | Main production app | ✅ YES | Deploy this |
| `kiro/aadesh-ai/nextjs/` | Kiro-built pipeline | ✅ YES | Mine for code, merge pipeline |
| `kiro/aadesh-ai/*.md` | Important drafts | ✅ YES | Send RAI + DPA emails |
| `KarnatakaAI/11_DDLR_App/` | Test environment | ✅ YES | Keep for testing |
| `KarnatakaAI/10_Cloud_Project_Bengaluru_South/` | Reference orders | ✅ YES | Use for generation |
| `KarnatakaAI/SAMPLE_CASE_INPUT/` | Test PDFs | ✅ YES | Use for testing |
| `KarnatakaAI/01_Source_Data/` | 516 originals | ✅ READ ONLY | Never modify |
| `autocad-mcp/` | AutoCAD project | ✅ YES | Separate project |
| `KarnatakaAI/tippani_prototype/` | Tippani DXF | ✅ YES | Separate project |
| `DDLR Strategy & Planning/` | Strategy docs | ✅ YES | v9.2.2 is active |
| `_BACKUP_RAW_BANU_ORIGINALS/` | Raw originals | ✅ READ ONLY | Never touch |
| `DEEP_RESEARCH/` | Research done | 🟡 ARCHIVE | Move to _archive |
| `everything-claude-code/` | Examples | 🟡 ARCHIVE | Move to _archive |
| `KarnatakaAI/02_System_Prompts/` | Old prompts | 🟡 ARCHIVE | V3.2.2 is active |
| `KarnatakaAI/03_Test_Results/` to `08_*/` | Old outputs | 🟡 ARCHIVE | Already done |
| `SESSION_LOG/` | Session history | ✅ KEEP | Reference |
| `TEAM_INBOX/` | Bridge folder | ✅ KEEP | Active |

---
*Audit completed: April 11, 2026 by Cowork*
