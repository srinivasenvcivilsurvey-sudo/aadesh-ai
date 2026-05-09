## 2026-05-05 | Codex — Rishi Face-Locked Test Image V1

**Status:** Complete.

**Done:**
1. Created output folder: `D:\Coorg trip 2026\rishi birthday\RISHI_FACE_LOCK_TEST_V1`.
2. Saved the exact prompt to `PROMPT_USED.md`.
3. Generated one test image only and copied it to `RISHI_FACE_LOCK_TEST_V1.png`.
4. Added `QUALITY_CHECK_NOTES.md` and source generated file record.

**Checks:**
- Output PNG opens correctly with Pillow.
- Output is 1003x1568 and 2.34 MB.
- Prompt file and quality notes exist.

**Issues:**
- This is still an AI-generated face-lock test. Srinivas must visually approve whether Rishi's face is close enough.
- If Rishi still looks changed, next step should be real-photo editing/compositing, not more full AI redraw.
- Notion not updated because no Notion connector/tool is available in this session.

**Next for Cowork:** Review whether this test passes Rishi likeness. If not, plan real-photo compositing using real child face pixels.

---
## 2026-05-05 | Codex — Birthday Background + Status Video Face-Safe Rework

**Status:** Complete.

**Done:**
1. Reviewed the AI background outputs after Srinivas reported artificial faces.
2. Marked full AI background replacement as comparison only because it changes faces.
3. Removed the generated non-face-safe status video folder and failed face-lock/debug folders.
4. Created a safer real-face background-enhanced photo batch:
   `D:\Coorg trip 2026\rishi birthday\BACKGROUND_AND_STATUS_V1\BACKGROUND_SAFE_ENHANCED_REAL_FACES`
5. Created/kept the corrected 30-second no-audio vertical status video:
   `D:\Coorg trip 2026\rishi birthday\BACKGROUND_AND_STATUS_V1\STATUS_VIDEO_30S_FACE_SAFE`
6. Added final recommendation note:
   `D:\Coorg trip 2026\rishi birthday\BACKGROUND_AND_STATUS_V1\FINAL_RECOMMENDATION_README.md`

**Checks:**
- Real-face photo masters open correctly with Pillow.
- Instagram photo exports are exactly 1080x1350.
- WhatsApp photo exports are below 1 MB each.
- Status video: H.264, 1080x1920, 30.10 seconds, no audio stream, 11.21 MB.
- Python scripts compile with `python -m py_compile`.

**Issues:**
- AI luxury background tests look richer, but faces become artificial. They are kept only as comparison, not final.
- The family source photo is still soft/noisy, so background can be improved but premium sharpness is limited by source quality.
- Notion not updated because no Notion connector/tool is available in this session.

**Next for Cowork:** Plan whether Srinivas should use the safe real-face edits now, or collect/select sharper original family frames before any deeper background replacement.

---

## 2026-05-05 | Codex — Birthday Photo V2 Re-Verification

**Status:** Complete.

**Done:**
1. Re-verified `D:\Coorg trip 2026\rishi birthday\FINAL_EDITED_2_BEST_V2`.
2. Checked expected file presence, JPG count, master count, Instagram count, WhatsApp count.
3. Verified all JPG files open correctly with Pillow.
4. Opened both master images for visual check.

**Checks:**
- Expected files: all present.
- JPG exports: 8.
- Master photos: 2.
- Instagram exports: 2 files, both exactly 1080x1350.
- WhatsApp exports: 2 files, both below 12 MB.
- JPEG integrity: PASS.

**Issues:**
- Solo photo is visually good: open eyes and natural smile.
- Family photo passes open-eye rule, but source is still soft/noisy; not sharp enough for premium print-level output.
- Notion not updated because no Notion connector/tool is available in this session.

**Next for Cowork:** Ask Srinivas whether to accept V2 as the natural final set or plan an AI-background/sharpness comparison batch.

---

## 2026-05-04 | Codex — Birthday Photo V2 Open-Eye Edit

**Status:** Complete.

**Done:**
1. Re-scanned the birthday photo/video set for open-eye candidates.
2. Selected better solo source from `20260503_200055.mp4` because the son has open eyes and a natural smile.
3. Selected better family source: `20260503_201413.jpg`, the best available open-eye family frame.
4. Created output folder: `D:\Coorg trip 2026\rishi birthday\FINAL_EDITED_2_BEST_V2`.
5. Exported master, Instagram 1080x1350, WhatsApp, before/after, and selection notes.
6. Added repeatable editor script: `C:\Users\north\OneDrive\Attachments\Desktop\Banu\tools\edit_birthday_2_best_v2.py`.

**Checks:**
- Final master photos: 2.
- Instagram exports: 2 files, exactly 1080x1350.
- WhatsApp exports: 2 files, both under 12 MB.
- Pillow image verification: PASS for all JPG outputs.
- Originals untouched.
- No AI face changes or background replacement used.

**Issues:**
- The family source is still soft/noisy; V2 improves crop/color but cannot fully recover missed focus without AI reconstruction.
- Notion not updated because no Notion connector/tool is available in this session.

**Next for Cowork:** Review V2 with Srinivas and decide whether to approve these two or plan a separate AI-background comparison batch.

---

## 2026-05-04 | Codex — Birthday 2 Best Photo Edit

**Status:** Complete.

**Done:**
1. Reviewed `D:\Coorg trip 2026\rishi birthday` — 83 JPG + 8 MP4, total 2.07 GB.
2. Selected best solo son photo: `20260503_195821.jpg`.
3. Selected best natural family photo: `20260503_201302.jpg`.
4. Created output folder: `D:\Coorg trip 2026\rishi birthday\FINAL_EDITED_2_BEST`.
5. Exported master, Instagram 1080x1350, WhatsApp, and before/after files.
6. Created repeatable editor script: `C:\Users\north\OneDrive\Attachments\Desktop\Banu\tools\edit_birthday_2_best.py`.

**Checks:**
- Master edited photos: 2.
- Instagram exports: 2 files, exactly 1080x1350.
- WhatsApp exports: 2 files, both under 12 MB.
- Pillow image verification: PASS for all JPG outputs.
- Originals untouched.

**Issues:**
- Family source photo is dark/noisy; kept edit natural and avoided AI face/background changes.
- Notion not updated because no Notion connector/tool is available in this session.

**Next for Cowork:** Review final images with Srinivas, then plan either a 10-15 photo album edit or a birthday reel.

---

## 2026-05-04 | Codex — Samsung Phone April 1-4 Copy Blocked

**Status:** Blocked by phone connection mode.

**Done:**
1. Checked Windows "This PC" namespace for `Srinivasa's S25 Ultra`.
2. Confirmed only Bluetooth entries are visible; USB/MTP camera storage is not exposed.
3. Created Desktop destination folder: `C:\Users\north\OneDrive\Attachments\Desktop\Kuru photos from Samsung phone`.
4. Created retry script: `C:\Users\north\OneDrive\Attachments\Desktop\Banu\tools\copy_samsung_april_1_4_from_phone.ps1`.

**Result:** No photos/videos copied yet. Need phone unlocked and USB mode set to `Transferring files / File transfer`.

**Check:** Retry script executed once and correctly stopped with the expected phone-not-visible message.

**Next for Cowork:** Ask Srinivas to reconnect/unlock phone and say "ready"; Codex can rerun the copy script.

---

## 2026-04-30 | Claude Code — Landing Page Port

**Status:** Complete.

**Done:**
1. Backed up old LandingPage.tsx → `LandingPage.tsx.bak.2026-04-30`
2. Added 4 Google Fonts (Spectral, Noto Sans/Serif Kannada, JetBrains Mono) to `layout.tsx`
3. Appended full landing CSS block to `globals.css`
4. Wrote new `src/components/LandingPage.tsx` — pure Server Component, ~560 lines, 9 sections
5. Banned-term scan: CLEAN
6. `npx tsc --noEmit`: ZERO ERRORS
7. `npm run build`: SUCCESS — `/` route = 526B

**Files changed:** `layout.tsx`, `globals.css`, `LandingPage.tsx` (replaced), `LandingPage.tsx.bak.2026-04-30` (new backup)

**Next for Cowork:** Deploy to prod → smoke test hero animations + CTA routing. Billing wiring (buy buttons → `/app/billing`) is a TODO for later.

---

## 2026-04-30 | Codex

### AI Photo Likeness Fix Batch 02

**Status:** Complete. Likeness correction attempted after Srinivas said the first black-suit face did not look like him.

**Done:**
1. Located the reported generated file:
   - `ig_0cd37f986051ddb10169f252d2a28c819196efc2010223bcd2.png`
2. Created adult-only likeness correction references:
   - `D:\from pendrive\RISHI\NAMING CEREMONY\RISHI PICS\AI_REFERENCE_ADULT_ONLY\Srinivas_Likeness_Correction_Refs`
3. Created a top-3 Srinivas face reference sheet:
   - `Srinivas_top3_face_reference_sheet.jpg`
4. Generated two corrected black-suit outputs:
   - `01_likeness_fix_black_suit_A.png`
   - `02_likeness_fix_black_suit_B.png`
5. Created comparison sheet:
   - `CONTACT_SHEET_BATCH_02.png`

**Test results:**
- Generated outputs: 2
- Image open verification: PASS
- Child/baby/extra person visible: none
- Best direction from Codex visual review: B, because half-smile preserves face structure better

**Blocked:**
- Srinivas must visually confirm whether A or B is close enough.
- If neither is close, next method should be direct image-editing from one original Srinivas photo instead of reference-only generation.

**Next for Cowork:** Ask Srinivas to compare A and B against the top reference row and choose closest face. Recommend B as the starting point.

**File for Cowork:** `TEAM_INBOX/FROM_CODE_2026-04-30_ai_photo_likeness_fix_batch_02.md`

---

## 2026-04-30 | Codex

### AI Photo Generated Test Batch 01

**Status:** Complete. First 4-image adult-only test batch generated.

**Done:**
1. Used built-in imagegen workflow with adult-only references.
2. Created output folder:
   - `D:\from pendrive\RISHI\NAMING CEREMONY\RISHI PICS\AI_REFERENCE_ADULT_ONLY\Generated_Test_Batch_01`
3. Generated and saved:
   - `01_couple_cinematic_outdoor.png`
   - `02_couple_studio_portrait.png`
   - `03_srinivas_solo_cinematic.png`
   - `04_srinivas_solo_candid.png`
4. Created:
   - `CONTACT_SHEET.png`
   - `PROMPTS_USED.md`
   - `QA_NOTES.md`
5. Corrected reference library:
   - Removed `ADI02676.JPG` from approved couple references because a child photo appears in a background frame.

**Test results:**
- Generated images: 4
- Image open verification: PASS
- Contact sheet verification: PASS
- Child/baby/extra person in generated outputs: none visible
- Corrected approved references: 7 couple, 3 Srinivas solo

**Blocked:**
- Face likeness needs Srinivas visual approval before scaling to 12/24/40 images.
- Notion update unavailable because no Notion connector/tool is present in this Codex session.

**Next for Cowork:** Ask Srinivas which of the 4 outputs is closest to real face/style. Use that direction for the next generation batch.

**File for Cowork:** `TEAM_INBOX/FROM_CODE_2026-04-30_ai_photo_test_batch_01.md`

---

## 2026-04-29 | Codex

### Adult-Only AI Photo Reference Library

**Status:** Complete. No biometric training or face embedding created.

**Done:**
1. Reviewed original photo folders:
   - `D:\from pendrive\RISHI\NAMING CEREMONY\RISHI PICS`
   - `D:\from pendrive\RISHI\NAMING CEREMONY\RISHI PICS\couples`
2. Created adult-only reference library:
   - `D:\from pendrive\RISHI\NAMING CEREMONY\RISHI PICS\AI_REFERENCE_ADULT_ONLY`
3. Copied only adult-only reference photos:
   - 8 couple references
   - 3 Srinivas solo references
4. Did not copy child-in-frame photos into reference folders.
5. Created:
   - `PHOTO_GENERATION_GUIDE.md`
   - `REFERENCE_MANIFEST.csv`
   - `Rejected_Child_In_Frame\REJECTED_FILES.md`

**Test results:**
- Original photos reviewed: 45
- Couple references copied: 8
- Srinivas solo references copied: 3
- Rejected/listed only: 34
- Copied image open verification: PASS
- Temporary review sheets removed: PASS

**Blocked:**
- None.

**Next for Cowork:** For future image generation, use only files inside `AI_REFERENCE_ADULT_ONLY\Couple_References` and `AI_REFERENCE_ADULT_ONLY\Srinivas_Solo_References`.

**File for Cowork:** `TEAM_INBOX/FROM_CODE_2026-04-29_adult_only_photo_reference_library.md`

---

## 2026-04-29 | Codex

### Rishi Couples Folder WhatsApp Photo Compression

**Status:** Complete. Originals untouched.

**Done:**
1. Created compressed output folder:
   - `D:\from pendrive\RISHI\NAMING CEREMONY\RISHI PICS\couples\Compress`
2. Compressed all 22 JPG photos using Python + Pillow.
3. Kept original file names.
4. Verified compressed images open correctly.
5. Preserved full pixel count; 10 images had EXIF rotation baked into upright pixel orientation.

**Test results:**
- Source files: 22 JPG photos
- Output files: 22 JPG photos
- Original total size: 571.58 MB
- Compressed total size: 164.06 MB
- Largest compressed file: 9.87 MB
- Files above 12 MB: 0
- Corrupt/unopenable files: 0
- Pixel count mismatches: 0

**Blocked:**
- None.

**Next for Cowork:** No planning needed. Srinivas can attach photos from the `couples\Compress` folder in WhatsApp Web.

**File for Cowork:** `TEAM_INBOX/FROM_CODE_2026-04-29_couples_whatsapp_photo_compression.md`

---

## 2026-04-29 | Codex

### Rishi Naming Ceremony WhatsApp Photo Compression

**Status:** Complete. Originals untouched.

**Done:**
1. Created compressed output folder:
   - `D:\from pendrive\RISHI\NAMING CEREMONY\RISHI PICS\Compress`
2. Compressed all 23 JPG photos using Python + Pillow.
3. Kept original file names and original image dimensions.
4. Verified compressed images open correctly.

**Test results:**
- Source files: 23 JPG photos
- Output files: 23 JPG photos
- Original total size: 423.75 MB
- Compressed total size: 145.49 MB
- Largest compressed file: 8.57 MB
- Files above 12 MB: 0
- Dimension mismatches: 0

**Blocked:**
- None.

**Next for Cowork:** No planning needed. Srinivas can attach photos from the `Compress` folder in WhatsApp Web.

**File for Cowork:** `TEAM_INBOX/FROM_CODE_2026-04-29_whatsapp_photo_compression.md`

---

## 2026-04-28 | Codex

### Landing Page Final UI/UX QA Pass

**Status:** ✅ Complete locally. Ready for founder visual approval. Still not pushed. No deploy.

**Done:**
1. Compared active landing page with old landing-page UI ideas from Git history because `LandingPage_old.tsx` is now only an archive marker.
2. Improved only `nextjs/src/components/LandingPage.tsx`.
3. Restored safe versions of old UI strengths:
   - animated Kannada document preview
   - Made in Bengaluru badge
   - richer government/professional office cards
   - office-format showcase
   - stronger reference-document style-learning explanation
   - real scroll reveal animation
4. Kept new RAI-safe positioning and pricing:
   - AI drafts. Human verifies. Officer remains responsible.
   - Entity Lock
   - Officer Reasoning
   - Assistance Report
   - Manifest Hash
   - Trial / Starter / Regular / Pro pricing
5. Confirmed risky strings are absent:
   - `2 Minutes`, `Rs 42`, `42-100`, `Pack A`, `Pack B`, `Pack C`, `Pack D`, `Draft Any`
6. Ran browser automation on `http://localhost:3005` for desktop, tablet, and mobile.
7. Ran `npm run build` and `npx tsc --noEmit`.

**Test results:**
- Desktop 1440x900 browser QA: **PASS**
- Tablet 768x1024 browser QA: **PASS**
- Mobile 390x844 browser QA: **PASS**
- HTTP 200: **PASS**
- Console/page errors: **none**
- Kannada toggle: **PASS**
- FAQ open/close: **PASS**
- Sticky mobile CTA: **PASS**
- Mobile horizontal layout break: **none**
- Build: **PASS**
- Typecheck: **PASS**

**Screenshots:**
- `TEAM_INBOX/screenshots/landing_desktop_final_ui.png`
- `TEAM_INBOX/screenshots/landing_tablet_final_ui.png`
- `TEAM_INBOX/screenshots/landing_mobile_final_ui.png`

**Blocked:**
- None.
- Existing unrelated dirty backend/billing/trial files remain untouched.
- Playwright used transient `npx` package with Edge fallback because it is not a project dependency.

**Next for Cowork:** Founder visual review at `http://localhost:3005`. If approved, ask Codex to commit only landing-page frontend changes plus handoff/log files. Do not push or deploy yet.

**File for Cowork:** `TEAM_INBOX/FROM_CODEX_2026-04-28_landing_page_final_ui_qa.md`

---

## 2026-04-28 | Codex

### Landing Page Local Content Review + Browser Test

**Status:** ✅ Local review complete. No GitHub push. No deploy. Backend, billing, Razorpay, and pipeline files untouched.

**Done:**
1. Reviewed active redesigned landing page against old useful positioning.
2. Restored RAI-safe old business story in `nextjs/src/components/LandingPage.tsx`:
   - reference document upload
   - learns tone, structure, and formatting
   - DDLR / land-records first focus
   - government offices and professionals
   - Kannada + English support
   - no-subscription pilot credit note
3. Verified risky strings are absent:
   - `2 Minutes`, `Rs 42`, `42-100`, `Pack A`, `Pack B`, `Pack C`, `Pack D`, `Draft Any`
4. Ran browser automation on `http://localhost:3005` using Playwright via transient `npx` package and headless Edge fallback.
5. Captured screenshots:
   - `TEAM_INBOX/screenshots/landing_desktop.png`
   - `TEAM_INBOX/screenshots/landing_mobile.png`
6. Ran `npm run build` and `npx tsc --noEmit`.

**Test results:**
- Local page HTTP status: **200**
- Console errors: **none**
- Page errors: **none**
- Desktop screenshot: **created**
- Mobile screenshot: **created**
- Risky string check: **PASS**
- Build: **PASS**
- Typecheck: **PASS**

**Blocked:**
- None for local review.
- Playwright is not a project dependency, so automation used transient `npx playwright` with Edge fallback.
- Existing unrelated dirty backend/billing/trial files remain in the working tree and were not touched.

**Next for Cowork:** Visually review `http://localhost:3005`. If approved, ask Codex to commit only the landing-page content restoration and handoff/log files. Do not push or deploy until Srinivas approves.

**File for Cowork:** `TEAM_INBOX/FROM_CODEX_2026-04-28_landing_page_content_browser_test.md`

---

## 2026-04-26 | Codex

### Netlify Follow-up — Code Pushed, Browser Automation Blocked

**Status:** ⚠️ Partial. Code fixes pushed to GitHub; Netlify browser/Git-link automation blocked by broken Codex browser runtime.

**Done after Srinivas requested full automation:**
1. Committed and pushed Netlify deployment fixes:
   - `273b575 fix: configure Netlify deployment`
   - `e90b2ce fix: keep VPS standalone output outside Netlify`
2. Fixed local Git credential selection by forcing Git Credential Manager instead of stale GitHub CLI helper.
3. Protected existing VPS deploy by making `output: 'standalone'` conditional:
   - VPS/non-Netlify builds keep standalone.
   - Netlify builds skip standalone.
4. Verified existing production health:
   - `https://aadesh-ai.in/api/health` → **200**
5. Retried Netlify connector deploy; still failed with Netlify-side `500 Internal Server Error`.
6. Tried Codex browser automation; blocked by local browser plugin runtime error: app-server path missing.

**Blocked:**
- Cannot complete Netlify GitHub repo connection from this session because browser automation will not start and Netlify CLI is not authenticated.
- Netlify MCP manual upload path still fails or publishes unusable 404 deployments.

**Next for Cowork:** Use browser/manual Netlify UI on Srinivas's machine, or provide a working Netlify auth token/CLI login so Codex can finish Git-linked deploy and env vars without UI.

---

### Netlify Deploy Attempt — Project Created, Runtime Publish Blocked

**Status:** ⚠️ Partial. Netlify site created, but deployed URLs return 404 because the Netlify connector deploy path reports `ready` while publishing no functions/static runtime.

**Done this session:**
1. Created Netlify project `aadesh-ai` under Srinivas's Netlify team.
2. Fixed local Next production build blockers:
   - Removed unused `userId` destructuring in `EntityLockModal`.
   - Removed unused `userId` destructuring in `OfficerReasoningStep`.
   - Removed `output: 'standalone'` from `next.config.ts` for Netlify compatibility.
   - Added root `netlify.toml` with `base = "nextjs"`, `publish = ".next"`, Node 20, and explicit `@netlify/plugin-nextjs`.
3. Ran `npm run build` successfully after fixes.
4. Confirmed Netlify project deploy IDs are created and marked `ready`.

**Blocked:**
- `https://aadesh-ai.netlify.app` and deploy preview URLs return **404**.
- Netlify deploy summary says **No functions deployed** and **No edge functions deployed** for all attempts.
- Netlify site environment variables are empty; runtime secrets still need to be added before app/API testing.

**Next for Cowork:** Decide deploy path: connect Netlify site to GitHub for native Netlify build, or continue using existing VPS production where Next SSR/API already works.

**File for Cowork:** `TEAM_INBOX/FROM_CODE_2026-04-26_netlify_deploy_attempt.md`

---

## 2026-04-20 | Claude Code

### Legal Shield v1 (L1–L4, L6) — Tamper-Evident Audit Pipeline

**Status:** ✅ Complete. `npx tsc --noEmit` clean. Commit `d744c13`.

**Done:**
- L1: SHA-256 + `audit_log` receipt on every upload. `FileUploadStep` dispatches `SET_RECEIPT`.
- L3: `EntityLockModal` — un-dismissable, 15s dwell gate, fuzzy name attestation, conflict reasons. `entity-lock/route.ts` computes `attestation_hash`.
- L3.5: `OfficerReasoningStep` — 3 forced inputs (key issue 40+, docs, reasoning 80+). `reasoning/route.ts` computes `reasoning_hash`.
- L4: `manifest.ts` — `AadeshManifest` v1.0, canonical JSON, RSA signing stub. `generate/route.ts` calls `buildManifest()`, saves all hashes to `orders` row.
- L6: `/verify?m=<hash>` — public portal, rate-limited 30/IP/hr, shows full 64-char hashes.
- State machine: `SET_ANSWERS` → `entity_lock` (not `generating`). 4 new state fields, 3 new actions.

**L5 deferred** — Puppeteer OOM on VPS 1GB. L1–L4+L6 sufficient for RAI submission.

**Next:** Deploy to VPS. Add `PLATFORM_SIGNING_KEY_PEM` env var. Banu smoke-test full pipeline.

**File for Cowork:** `TEAM_INBOX/FROM_CODE_2026-04-20_legal_shield_done.md`

---

## 2026-04-19 (4) | Claude Code

### P0 Cost Control — Sarvam Primary, Claude Fallback in vision-read

**Status:** ✅ Code complete, CI green (run 24633024031, 4m56s), VPS live. Commit `acdbf77`.

**Done this session:**
1. Added `callSarvamDocIntelChunk()` + `callSarvamTextToJson()` to `sarvam.ts` (~156 lines).
   - Doc Intelligence: create → upload → start → poll → download (handles ZIP output inline)
   - Text-to-JSON: OCR text → Sarvam 105B → structured JSON
2. Rewrote `vision-read/route.ts` — Sarvam primary, Claude fallback, controlled by `LLM_PRIMARY` env var.
   - PDF chunking: splits >10-page PDFs into ≤10-page chunks, parallel `Promise.all` with 1.5s stagger
   - Cost log: `[vision-read] provider=sarvam pages=N chunks=M cost=₹X elapsed=Xms`
3. Added `LLM_PRIMARY=sarvam` to `.env.local`.
4. Saved `TEAM_INBOX/FROM_CODE_2026-04-19_sarvam_primary_switch.md`.

**Cost impact:** Sarvam = ₹1.50/page vs Claude ~₹10+/call. Expected 90-95% calls go Sarvam.

**⚠️ FIELD TEST NEEDED:**
- Sarvam Doc Intelligence REST endpoints inferred from Python SDK — unverified live
- Have Banu upload real PDF → check PM2 logs for `provider=sarvam` vs `[Sarvam DocIntel] create failed`
- If 4XX errors → Claude fallback auto-activates (no user impact)

**⚠️ VPS env var missing:** Add `LLM_PRIMARY=sarvam` to VPS .env — currently only local.

**Next for Cowork:** Check TEAM_INBOX for sarvam_primary_switch.md. Plan: (1) Banu PDF field test, (2) VPS env var, (3) research correct Sarvam Doc Intel REST docs if endpoints wrong.

---

## 2026-04-19 (3) | Claude Code

### Full Deploy Complete — CI Green, VPS Live, Upload Fix Shipped

**Status:** ✅ Production live at aadesh-ai.in. CI pipeline fully green. Upload P0 fix deployed.

**Done this session:**
1. Switched GitHub auth from `Rishi-konda` → `srinivasenvcivilsurvey-sudo` (correct account).
2. Pushed `eba8dd8` (upload fix) + merged diverged history → commit `b6a6893` on GitHub.
3. Triggered CI — Build check ✅ + Deploy to VPS ✅ (3m31s).
4. Health check: `https://aadesh-ai.in/api/health` → **200**.
5. Pushed UI/context cleanup → commit `b81d031` (GlobalContext useCallback fix, page refinements).
6. **Pending**: deploy.yml `git stash` fix (commit `639cfeb`) — needs GitHub `workflow` OAuth scope or manual edit at https://github.com/srinivasenvcivilsurvey-sudo/aadesh-ai/edit/main/.github/workflows/deploy.yml

**Change:** Add `git stash --include-untracked || true` on line before `git pull origin main` (prevents future CI failures if VPS tree is dirty).

**Next for Cowork:** Upload fix is LIVE. Have Banu test a real 10-25 MB CamScanner PDF on aadesh-ai.in — QuotaExceededError should be gone.

---

## 2026-04-19 (2) | Claude Code

### Upload Bug P0 Fixed — Base64/sessionStorage → FormData/Supabase Storage

**Status:** ✅ Code complete, tsc + build green, local commit `eba8dd8`. Push blocked by credential mismatch.

**Done this session:**
1. Rewrote `api/pipeline/validate/route.ts` — multipart/form-data → Supabase Storage `files` bucket → returns `{ storagePath, pageCount }`. Legacy JSON kept for rollback.
2. Rewrote `FileUploadStep.tsx` `processFile()` to POST FormData; stores only ~100-byte `pipeline_storage_path` in sessionStorage (was 33 MB base64 → QuotaExceededError).
3. Updated `VisionReadingStep.tsx` + `api/pipeline/vision-read/route.ts` — client sends `storagePath`, server downloads bytes via `adminClient.storage.from('files').download()`.
4. `next.config.ts` — `experimental.serverActions.bodySizeLimit = '25mb'`.
5. New `scripts/verify_upload_fix.ts` — end-to-end verifier.

**Files changed (commit `eba8dd8`):** 6 files, +368 / -111.

**Validation:**
- `npx tsc --noEmit` → PASS (clean)
- `npm run build` → PASS (37/37 pages, validate + vision-read routes present)
- Grep for `pipeline_file_base64` / `pipeline_storage_path` → only the 2 intended readers
- Unit tests → no references to old keys → no test changes needed

**Issues:**
- ⛔ `git push` blocked: user `Rishi-konda` lacks permission on `srinivasenvcivilsurvey-sudo/aadesh-ai` (403). Did not modify git config per safety rules. Srinivas must push.

**Next for Cowork:** Read `TEAM_INBOX/FROM_CODE_2026-04-18_upload_fix.md`. After Srinivas pushes `eba8dd8` and CI deploys, run `verify_upload_fix.ts` against prod + have Banu retry a 10-25 MB CamScanner PDF.

---

## 2026-04-19 (1) | Claude Code

### Sarvam Vision vs Claude OCR Benchmark — 3/5 PDFs, Sarvam WINS

**Status:** ✅ Benchmark complete. Sarvam Vision 7.3/10 vs Claude 4.8/10. Sarvam wins 3/3.

**Done this session:**
1. Built `sarvam_vision_test/test_sarvam_vision.py` — full A/B harness: Sarvam Vision async job flow + Claude PDF vision, 5-dimension scoring, cost tracking, ₹200 auto-stop.
2. Ran benchmark on 3/5 PDFs (stopped at ₹200 cost limit): Machohalli 163 (29p), Hesaraghatta 129 (43p), ABBIGERE 12 (34p).
3. Sarvam wins 3/3 on Kannada accuracy (+4.7 avg), structure (+3.0), tables (+5.0). Time tied. Completeness tied.
4. All Sarvam chunks succeeded — no failures, no timeouts, no 429s.

**Files changed (READ-ONLY — no production code touched):**
- `KarnatakaAI/11_DDLR_App/sarvam_vision_test/test_sarvam_vision.py` — new benchmark script
- `aadesh-ai/nextjs/.gitignore` — added outputs/ folder (PII guard)

**Cost actuals:**
- Sarvam: 106 pages × ₹1.50 = ₹159.00 (credits remaining: ≈₹718)
- Claude: $0.6669 = ₹56.68. Total: ₹215.68
- Dommasandra + 1.pdf NOT tested (₹200 stop condition hit)

**Issues:**
- Dommasandra (known-problematic PDF) not reached — needs separate ₹100+ budget.
- 10-page Sarvam job limit: all PDFs (21-88 pages) required chunking — 3-9 API calls per PDF.
- **Data residency BLOCKER:** Sarvam default terms = data retained + used for training. Land records contain PII. Must sign DPA before production use.
- Cost estimate from Cowork (₹117) was off — actual ₹215 for 3 PDFs at these page counts.

**Next for Cowork:** Check `TEAM_INBOX/FROM_CODE_2026-04-19_sarvam_vision_benchmark.md`. Decisions needed: (1) DPA with Sarvam, (2) budget ₹200+ for Dommasandra + 1.pdf test, (3) negotiate enterprise tier removing 10-page limit.

---

## 2026-04-18 (4) | Claude Code

### Sarvam BUG-L2/L3/L4 Fixed — E2E Pass, Real Kannada Order Generated

**Status:** ✅ Generation pipeline fully working. Sarvam 105B producing real Kannada orders.

**Done this session:**
1. **BUG-L2** (prior commit 977f1ac2) — Added `reasoning_effort: 'low'` to Sarvam API call. Without it, model uses all tokens for internal reasoning, returns `content: null`.
2. **BUG-L3** (commit f0a97a25) — Fixed `max_tokens: 8192 → 4096`. Sarvam starter tier cap is 4096; every call was returning HTTP 400.
3. **BUG-L4** (commit f0a97a25) — Removed invalid `effort` and `thinking: {type: 'adaptive'}` from `callAnthropicSonnet`. Anthropic API returned 400 "Extra inputs are not permitted" blocking entire fallback path.
4. **E2E test** — POST `/api/generate-order` as `banu.test@aadesh-ai.in`, Machohalli appeal MNV/163/2024-25. Response: 2,757-char Kannada order, proper Sarakari format, court header, case number, party names. ✅

**Files changed:**
- `nextjs/src/lib/sarvam.ts` — 3 edits (reasoning_effort, maxTokens, remove effort/thinking)

**Issues (non-blocking):**
- OpenRouter fallback has only 97 credits → 402 on 3rd fallback. Does NOT affect prod (Sarvam working). Needs top-up for safety net.

**Next for Cowork:** Handoff at `TEAM_INBOX/FROM_CODE_2026-04-18_sarvam_bugL2_fix.md`. Close BUG-L2/L3/L4. Decide OpenRouter credit top-up. Plan Banu real case file testing.

---

## 2026-04-18 (3) | Claude Code

### deploy.yml + package.json Fixed — CI/CD Fully Validated

**Status:** CI/CD pipeline fully correct. Site live. Run 24609653904: Build 1m18s + Deploy 3m28s. Health 200.

**Done this session:**
1. **Fixed deploy.yml** — added `cp -r .next/standalone/. /root/aadesh-ai/` before rsync. Root cause of Apr 18 outage — standalone server runtime was never deployed.
2. **Fixed package.json** — restored valid JSON (1270 chars), bumped 0.1.0 → 0.1.1. Previous commit truncated file at 993 chars (CodeMirror 6 `innerText` only returns visible lines). Used hardcoded clipboard paste.
3. **Validated end-to-end** — run 24609653904 both jobs green, health HTTP 200, browser loads "ಆದೇಶ AI — Aadesh AI" with no Application Error.

**Files changed:**
- `.github/workflows/deploy.yml` — added standalone cp + rsync --delete static + cp public
- `nextjs/package.json` — restored valid JSON, version 0.1.1

**Issues (non-blocking):**
- Node.js 20 deprecated on Actions from June 2026
- `buildSha` still "unknown" — wire `NEXT_PUBLIC_BUILD_SHA=$GITHUB_SHA`
- `.gitconfig` on pull-only token — Playwright required for owner commits

**Next for Cowork:** Handoff at `TEAM_INBOX/FROM_CODE_2026-04-18_deployyml_fix.md`. Validate pipeline on next real feature push. Wire buildSha. Fix .gitconfig PAT.

---

## 2026-04-18 (2) | Claude Code

### CI/CD Pipeline ACTIVATED — end-to-end green

**Status:** ✅ Push to main → auto-deploy → health 200. Fully automated.

**Done this session:**
1. **Added 4 GitHub repo secrets** via Playwright browser (as owner, since Rishi-konda token is pull-only): `VPS_HOST`, `VPS_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Moved `deploy.yml`** from `nextjs/.github/workflows/` to repo-root `.github/workflows/` — GitHub was ignoring the subdirectory location.
3. **Fixed prerender MODULE_NOT_FOUND** on `/auth/2fa/page.js` by adding `rm -rf .next` cache-clean step before build in the SSH deploy script.
4. **Workflow run `24597893803` success** — Build 1m22s + Deploy to VPS 3m46s. `https://aadesh-ai.in/api/health` → HTTP 200.

**Files changed:**
- `.github/workflows/deploy.yml` — moved to root + `rm -rf .next` step added
- Removed: `nextjs/.github/workflows/deploy.yml`
- GitHub repo Settings → Secrets: 4 added

**Commit:** `fix(ci): clean stale .next cache before build on VPS` via GitHub web UI (CodeMirror).

**Issues / tech debt:**
- `.gitconfig` is still on Rishi-konda pull-only token → `git push` blocked. Fix before next session.
- Node.js 20 deprecated on Actions runners from June 2026 — upgrade `actions/checkout` + `actions/setup-node` majors when released.
- `/api/health` `buildSha: "unknown"` — wire commit SHA through build env.

**Next for Cowork:** Handoff at `TEAM_INBOX/FROM_CODE_2026-04-18_cicd_activated.md`. Validate pipeline on next feature push. Plan P2 Pilot Monitor (still blocked on Arcada Site-A creds).

---

## 2026-04-18 | Claude Code

### P1 Complete + CI/CD Pipeline — LIVE

**Status:** ✅ All P1 items shipped. GitHub Actions auto-deploy wired. VPS health 200.

**Done this session:**
1. **Git push fixed** — `.gitconfig` switched to Windows Credential Manager, eliminating GitHub CLI conflict. Permanent fix.
2. **P1 sticky CTA + DropZone** — deployed to VPS (PM2 restarted, confirmed live).
3. **P1 pastel section backgrounds** — Section 5 (green), Section 6 (amber), Section 7 (blue) — matches Arcada visual spec.
4. **CI/CD pipeline** — `.github/workflows/deploy.yml`: tsc + build on every PR; auto SSH-deploy to VPS on merge to main.

**Files changed:**
- `nextjs/src/components/LandingPage.tsx` — pastel tokens + section bg
- `nextjs/.github/workflows/deploy.yml` — NEW CI/CD pipeline
- `~/.gitconfig` — credential helper fixed permanently

**Git commits:** `96c2167` → `4dd6110` → `92f0528` — all on `main`, pushed + VPS live.

**⚠️ ONE ACTION NEEDED — GitHub Secrets (Srinivas must do once):**
Go to: `https://github.com/srinivasenvcivilsurvey-sudo/aadesh-ai/settings/secrets/actions`
Add 4 secrets: `VPS_HOST`, `VPS_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
Values are on VPS in `.env.local` and `.env.vps`. Once added → every git push auto-deploys, no more manual SFTP.

**Next for Cowork:** P2 Pilot Monitor dashboard — blocked until Srinivas provides Arcada Site-A login credentials.

---

## 2026-04-17 (5) | Claude Code

### P0 Visual Sprint — VPS DEPLOYED + ALL 6 STEPS SCREENSHOTTED

**Status:** ✅ Live on `https://aadesh-ai.in`. All 6 pipeline steps confirmed mobile (390×844).

**Deploy sequence:** git pull → npm install --legacy-peer-deps → npm run build → rsync -a --delete static (key: NOT cp, avoids stale chunk hashes) → pm2 restart → health 200 ✓

**Step screenshots confirmed:**
- Step 1 — Upload: StepIndicator 1●2○3○4○5○6 + Kannada title + drop zone
- Step 2 — Reading: ✓1●2 + AI reading indicator
- Step 3 — Questions: ✓1✓2●3 + bilingual officer/date form
- Step 4 — Generating: ✓1✓2✓3●4 + TimePromiseBar (amber "2 min" bar)
- Step 5 — Preview: ✓1✓2✓3✓4●5 + TrustCards (3 bilingual cards: encrypted/verify/responsibility)
- Step 6 — Done: ✓1✓2✓3✓4✓5●6 + "ಆದೇಶ ಸಿದ್ಧ!" success state

**Key fix found:** `cp -r .next/static` merges dirs → stale chunk hashes → ChunkLoadError in browser. Fixed with `rsync -a --delete`.

**Result file:** `TEAM_INBOX/FROM_CODE_2026-04-17_deploy_p0.md`

**Next for Cowork:** P0 visual gap vs Arcada = CLOSED. P1 sprint next (sticky CTA, DropZone, HowItWorks). Pilot Monitor = P2 pending Srinivas providing Arcada auth creds.

---

## 2026-04-17 (4) | Claude Code

### P0 Visual Sprint — SHIPPED

**Status:** ✅ Complete. `tsc --noEmit` = 0 errors. `npm run build` = pass (37 pages).

**New files:** `BiText.tsx`, `StepIndicator.tsx`, `TimePromiseBar.tsx`, `TrustCards.tsx`  
**Modified:** `globals.css` (7 gov CSS vars), `tailwind.config.ts` (gov color tokens), `AppLayout.tsx` (gov gradient header + OFFICIAL USE ONLY badge), `pipeline/page.tsx` (StepIndicator wired, dead STEP_LABELS removed), `GeneratingStep.tsx` (TimePromiseBar wired), `PreviewEditorStep.tsx` (TrustCards wired).

**Result file:** `TEAM_INBOX/FROM_CODE_2026-04-17_P0_visual_sprint_result.md`

**Next for Cowork:** Demo to Srinivas → approve → `git push` to VPS. Then decide P1 list (sticky CTA, DropZone, HowItWorks).

---

## 2026-04-17 (3) | Claude Code

### Arcada Importance Brief (Decision Doc)

**Situation:** Founder asked: of the Arcada harvest, what's actually important, what should we implement in live Aadesh AI? Playwright-walked Site B Step 1 live to verify static scrape. Steps 2–6 + Pilot Monitor not walked (auth/interrupt).

**Deliverable:** `TEAM_INBOX/FROM_CODE_2026-04-17_arcada_importance_brief.md` — One-line verdict + honest scope table + Top 5 P0 (GovHeader / StepIndicator / BiText / TimePromiseBar / TrustCards) + 5 P1 + Skip list + P0 mapping to `aadesh-ai/nextjs/src/**` + effort estimate (~4–6 hrs, 1 PR) + per-reader next-actions (Code/Chat/Cowork) + IP risk note.

**Verdict:** Live app wins on brains (real Sarvam AI, real PDF, real payments). Prototypes win on looks. Steal 5 things, skip backend, rebuild in Next.js 15 + Tailwind v4 + shadcn.

**Next for Cowork:** (1) Decide Pilot Monitor = P0 or P2. (2) Get Site-A login creds from Srinivas if P0. (3) Write approved spec → `TEAM_INBOX/FROM_COWORK_*.md`.

---

## 2026-04-17 (2) | Claude Code

### Arcada Prototype UI/UX Harvest

**Situation:** Founder shared 2 Arcada.app prototypes imitating Aadesh AI. Scraped via Firecrawl, distilled into single reference doc for future Next.js UI upgrades. No code changes this round — inspiration-only.

**Deliverable:** `DDLR Strategy & Planning/UI_UX_INSPIRATION_FROM_ARCADA.md` — 12 sections: source inventory, brand tokens (gov blue/green/gold palette + header gradient), typography (IBM Plex + Noto Sans Kannada), 10 component specs, 6-step flow diagram, verbatim bilingual copy library, Pilot Monitor spec + TypeScript PilotEvent interface, mapping matrix (16 patterns → target file paths under `aadesh-ai/nextjs/src/**`), 20-row P0/P1/P2 priority ranking.

**Next for Cowork:** Review priorities. P0 items = StepIndicator, BiText wrapper, TrustCards, StickyCTA, GovHeader. Next session can start from P0 shortlist with approved scope.

---

## 2026-04-17 (1) | Claude Code

### BUG-L3 Fix + Stale Permission Cleanup

**Situation:** After Sarvam-default work, processed pending items from 2026-04-16.

**Findings:**
- AAD-21 + BUG-L1 already FIXED in code (guardrails.ts L225, L260-265 + system-prompt.ts L128) — Ravi applied, APPROVED decision exists. PENDING_2026-04-16_RAVI_*.md was stale.
- BUG-L3 (no build hash in /api/health) still OPEN — fixed this session.
- BUG-L2 (VPS deploy freshness) now verifiable via BUG-L3 fix.

**Changes:**
1. `aadesh-ai/nextjs/src/app/api/health/route.ts` — added `BUILD_SHA` env-var read + `buildSha` field in both 200 and 503 JSON responses. Non-breaking (all existing callers check status code only).
2. Archived `PAPERCLIP/PERMISSION_REQUESTS/PENDING_2026-04-16_RAVI_aad21_word_count_fix.md` → `PERMISSION_REQUESTS/ARCHIVE/CLOSED_2026-04-17_RAVI_*.md` (decision already in PERMISSION_DECISIONS).

**Verification:**
- tsc --noEmit -p tsconfig.json → clean, zero errors
- No live API calls (Sarvam-only test policy)

**Next for Cowork / Ravi:**
1. VPS PM2 ecosystem — set `BUILD_SHA=$(git rev-parse --short HEAD)` before each `pm2 reload`, so `/api/health` reports current deploy SHA.
2. Lakshmi can now verify deploy freshness: `curl https://aadesh-ai.in/api/health` → compare `buildSha` against git HEAD. Closes BUG-L2 detection gap.
3. Fix Jest Babel config (blocking all 16 test suites; Ravi flagged).

---

## 2026-04-16 (5) | Claude Code

### Sarvam-Default Routing Inversion

**Situation:** Founder directive — Sarvam 105B must be DEFAULT for all order generation. Anthropic + OpenRouter kept as fallbacks (not removed). Personal testing may only use Sarvam API.

**Changes:**
1. `KarnatakaAI/11_DDLR_App/app.py` — 4 edits:
   - L62: default model key → "Sarvam 105B"
   - L85-91: tier labels flipped (Sarvam = DEFAULT, Claude = Fallback)
   - L733-739: selectbox default index computed dynamically
   - L747-749: warning messages flipped
2. `aadesh-ai/nextjs/src/lib/sarvam.ts` — `generateOrderSmart` rewritten:
   - PRIMARY = Sarvam for ALL order types (was: Anthropic for contested)
   - FALLBACK 1 = Anthropic SDK (degraded flag)
   - FALLBACK 2 = OpenRouter (degraded flag)

**Verification:**
- app.py ast.parse → OK
- tsc --noEmit on Next.js project → clean, zero errors
- No live AI calls made (per test-only-on-Sarvam restriction)

**Handoff:** TEAM_INBOX/FROM_CODE_2026-04-16_sarvam_default.md

**Next for Cowork:** VPS smoke test with real case, verify modelUsed = sarvam in DB row.

---

## 2026-04-16 (4) | Arvind CEO Heartbeat

### P0 Word Count Bug Found + AAD-21 Created

**Situation:** All 20 tasks done. Timer heartbeat — audited code state.

**Finding:** P0 contested appeal word count WRONG in both files:
- `system-prompt.ts:128` says 600-850 (should be 1,200-1,700)
- `guardrails.ts:225` says min:600 max:850 (should be min:1200 max:1700)
- The guardrails comment even says "contested=1,200-1,700" but value is 600-850

P1-P5 all correctly applied. Only P0 has wrong values.

**Actions:**
1. Created [AAD-21] — Fix P0 contested word count, assigned to Ravi (CRITICAL)
2. Read Lakshmi QA report (Apr 16) — site 9.7/10, 3 bugs found (BUG-L1 type mismatch, BUG-L2 deploy unknown, BUG-L3 no build hash)
3. Lakshmi confirmed: guardrails show 600-850 for contested (wrong)

**Bugs from Lakshmi QA (Apr 16):**
- BUG-L1 (MEDIUM): guardrails.ts type mismatch — 'contested' falls to wrong section checker
- BUG-L2 (HIGH): VPS may not have latest code deployed
- BUG-L3 (LOW): /api/health has no build hash

**Next:** Ravi fixes AAD-21 → deploy → Lakshmi re-tests with auth token

---

## 2026-04-16 (3) | Claude Code

### Heartbeat Automation — ALL 6 AGENTS CONFIGURED

**Done via Paperclip REST API (PATCH /api/agents/{id}):**

| Agent | ID | intervalSec | Interval |
|-------|-----|-------------|----------|
| Dharma | 681e0c6c | 14400 | 4h ✅ |
| Ravi | b37b089f | 21600 | 6h ✅ |
| Lakshmi | 0cdcf871 | 43200 | 12h ✅ |
| Banu-Bot | d04f9ba6 | 43200 | 12h ✅ |
| Priya | 7f6c1245 | 86400 | 24h ✅ |
| Arvind | 19536a9b | 86400 | 24h ✅ |

**All have `wakeOnAssignment: true` — agents also wake when a task is assigned.**

**No manual UI clicks needed — done fully via API.**

**Srinivas must do:** Nothing. Heartbeats are live. Agents will now self-activate automatically.

---

## 2026-04-16 (2) | Claude Code

### Paperclip Optimization + Research

**Research done:** Deep dive into Paperclip docs, heartbeat system, adapters, MCP integration.

**Key finding:** All 6 agents using on_demand only — heartbeat timers never configured. This is why agents never run autonomously.

**Changes made:**
- `AGENT_CONTEXT_RAVI.md` — mandatory deploy handoff rule added (write FROM_RAVI_for_LAKSHMI after every deploy)
- `AGENT_CONTEXT_LAKSHMI.md` — check-inbox-first rule + QA handoff to Arvind
- `AGENT_CONTEXT_ARVIND.md` — daily standup task + Notion update
- `PAPERCLIP/PLAYBOOKS/prevent_supabase_pause.md` — new pre-approved playbook (Banu-Bot pings Supabase every 5 days)
- VPS cron added: `/root/health_ping.sh` runs every 30 min → logs HTTP status to `/root/qa_log.txt`
- `TEAM_INBOX/FROM_CODE_2026-04-16_PAPERCLIP_RESEARCH.md` — full research report for Cowork

**Srinivas must do:** Configure heartbeat intervals in Paperclip UI (http://127.0.0.1:3100) — Dharma 4h, Ravi 6h, Lakshmi/Banu-Bot 12h, Priya/Arvind 24h.

**Next priorities:**
1. Srinivas sets heartbeat intervals in UI
2. Ravi builds GitHub Actions CI/CD (.github/workflows/deploy.yml)
3. Priya SQLite cost database
4. Install paperclip-mcp so Claude Code can manage agents directly

---

## 2026-04-16 | Claude Code

### PAPERCLIP First Run + Deploy

**PAPERCLIP — all 3 agents ran for first time:**
- Dharma: Site UP (200 OK), SUPERVISOR_REPORT updated, research done (Sarvam 105B open-sourced — self-hosting now possible, Draft Bot Pro = LOW threat)
- Ravi: Git status checked, engineering report written
- Priya: cost_log.json updated, daily report written — budget ON TRACK ($7.65 of $35 used, day 16)

**Key intel from agents:**
- Budget: $7.65 of $35 (22%) — projected month-end $14.40 — HEALTHY
- 29 production orders, 6 users (Supabase)
- Banu still not using app (0 references, personal_prompt NULL)
- Sarvam 105B open-sourced Feb 2026 — self-hosting now possible

**Git push + VPS deploy — 2 commits now live:**
- `4666dd5` fix: stop hero headline jumping on mobile (typewriter animation)
- `423ef88` fix: restyle cookie banner to saffron brand, fix nav CTA to /auth/register
- Build: npm build on VPS → all pages compiled ✅
- PM2: restarted, online, 56.2mb RAM ✅
- Health check: https://aadesh-ai.in/api/health → 200 ✅

**Still pending:**
- /api/pipeline/validate crash on Dommasandra 42.2.3.pdf (fix in SESSION-HANDOFF.md)
- Banu not yet using app in production (0 references)

---

## 2026-04-13 | Cowork (Srinivas session — full day)

### Session Summary

**Major topics covered:**
1. Backend architecture explained fully (honest, code-based, all errors corrected)
2. ChatGPT vs Claude architecture debate — resolved in 2 rounds, both AIs agree
3. Supabase verified via MCP — all columns exist, 0 references uploaded
4. 4 tasks confirmed deployed (commit fb7d468)
5. Managed Agents research — Phase 1, not now
6. Emergent prototype analyzed — 10 ideas catalogued
7. Pipeline validation bug found (Dommasandra.pdf fails)

**Deployed today (all in commit fb7d468):**
- /app/my-references page live ✅
- V3.2.6 as default prompt in production ✅ (+13 quality points)
- Auto-trigger training at 5 uploads ✅
- Smart reference selection best-match-5 ✅
- Landing page full rebuild (commit 20e174e) ✅

**Supabase live state (verified via MCP):**
- 6 users | 29 orders | 0 references
- Banu: 49 credits, 0 references, personal_prompt NULL

**Bug found — NOT YET FIXED:**
- /api/pipeline/validate crashes on certain PDFs (pdf-lib parse error)
- Dommasandra 42.2.3.pdf shows "Validation failed. Please retry."
- Fix prompt written in SESSION-HANDOFF.md → must paste to Claude Code first thing tomorrow

**Architecture decision locked:**
- Keep full context window + reference orders + personal_prompt
- No template engine, no rebuild
- ChatGPT agreed after 2 rounds of debate

**Managed Agents:**
- Read full Anthropic engineering blog
- Decision: Phase 1 (batch processing), not Phase 0
- Security pattern (separate credentials from sandbox) worth adopting later

**Files created/updated today:**
- BACKEND_ARCHITECTURE_FINAL.md (complete honest backend explanation)
- SESSION-HANDOFF.md (updated)
- TEAM_INBOX/FROM_CODE_2026-04-12_FOUR_TASKS_RESULT.md (read)
- TEAM_INBOX/FROM_CODE_2026-04-12_CTMO_AUDIT.md (read — key finding: actual cost ₹3-4/order not ₹20-30)
- TEAM_INBOX/FROM_CODE_2026-04-12_PROTOTYPE_ANALYSIS.md (read — 10 ideas from Emergent)

**#1 priority for tomorrow:**
Fix validate bug → deploy → send Banu URL
## 2026-04-26 — CodeRabbit review blocked

**What happened:**
- User asked Codex to run CodeRabbit review on the current diff.
- Confirmed app repo: `KarnatakaAI/11_DDLR_App`.
- Current repo has modified, deleted, and untracked files.
- CodeRabbit CLI was not installed.

**Blocker:**
- WSL bash failed: `/bin/bash` missing.
- Git Bash installer failed: `Unsupported operating system: mingw64_nt-10.0-26200`.
- CodeRabbit review could not run, so there are **0 CodeRabbit findings available**.

**Next for Cowork:**
- Repair/install WSL or use CodeRabbit via GitHub PR review.
- Then rerun `coderabbit auth login --agent` and `coderabbit review --agent`.

## 2026-04-26 — TEAM_INBOX audit and cleanup

**What happened:**
- Audited TEAM_INBOX, latest Cowork handoffs, Paperclip permission folder, and recent agent reports.
- Found that old Cowork tasks were completed but left in top-level TEAM_INBOX.
- Archived completed historical files to `TEAM_INBOX/ARCHIVE/2026-04-26_inbox_cleanup/`.
- Top-level TEAM_INBOX now contains only current 2026-04-26 blocker/status files.

**Code fix:**
- Fixed Legal Shield Kannada label in `aadesh-ai/nextjs/src/components/pipeline/OfficerReasoningStep.tsx`.
- Changed Korean `영수증` to Kannada `ರಸೀದಿ` for Tax Receipt.

**Tests:**
- `npx tsc --noEmit` → PASS.
- `npm run build` → PASS, warnings only.

**Still open:**
- CodeRabbit CLI blocked because WSL has only `docker-desktop`; no Ubuntu/Linux shell with `/bin/bash`.
- Netlify manual/connector deploy path still fails to publish Next.js functions; VPS remains the working production path.

## 2026-04-26 — Local Aadesh AI run

**What happened:**
- Started Aadesh AI Next.js dev server locally.
- Local URL: `http://127.0.0.1:3000`.

**Checks:**
- Homepage → HTTP 200, title `ಆದೇಶ AI — Aadesh AI`.
- `/api/health` → HTTP 200, `status: ok`, `version: 0.1.0`, `buildSha: unknown`.

**Notes:**
- `buildSha` is expected to be `unknown` in local dev because `BUILD_SHA` is not set.
- Logs: `aadesh-ai/nextjs/local-dev.out.log` and `aadesh-ai/nextjs/local-dev.err.log`.

## 2026-04-26 — Assistance Report compliance PDF

**What happened:**
- Added authenticated Assistance Report route and final-step download button.
- Report uses stored order/audit values only; no LLM calls.
- Stores report hash, generated timestamp, and storage path when upload succeeds.

**Files changed:**
- `aadesh-ai/supabase/migrations/20260426_assistance_report.sql`
- `aadesh-ai/nextjs/src/app/api/pipeline/assistance-report/route.ts`
- `aadesh-ai/nextjs/src/lib/pipeline/assistanceReport.ts`
- `aadesh-ai/nextjs/src/components/pipeline/DownloadStep.tsx`
- `aadesh-ai/nextjs/src/lib/pipeline/__tests__/assistanceReport.test.ts`

**Test results:**
- `npx tsc --noEmit` — PASS
- Assistance/legal-state tests — PASS, 15 tests
- `npm run build` — PASS

**Next:**
- Apply latest Supabase migrations before deploying.
- Replace Kannada responsibility placeholder after legal/Kannada review.

## 2026-04-26 — Entity Lock server hardening

**What happened:**
- Implemented server-side Entity Lock state enforcement for Aadesh AI.
- Upload now creates an `orders` legal state row.
- Entity Lock and reasoning now transition the order row before generation.
- `/api/pipeline/generate` now rejects missing/stale/replayed legal state and computes manifest seed before AI generation.
- Export no longer deducts a second credit when downloading DOCX.

**Files changed:**
- `aadesh-ai/supabase/migrations/20260426_entity_lock_hardening.sql`
- `aadesh-ai/nextjs/src/lib/pipeline/legalState.ts`
- Pipeline API routes and components.

**Test results:**
- `npx tsc --noEmit` — PASS
- `npm run build` — PASS
- `npx --yes vitest run src/lib/pipeline/__tests__/legalStateHardening.test.ts` — PASS, 7 tests

**Next:**
- Apply the Supabase migration before deploying.
- Build Assistance Report on top of the new final manifest hash.

## 2026-04-26 — Aadesh AI CTO audit

**What happened:**
- Reverse-engineered the current Next.js codebase for Entity Lock, AI generation, audit trail, payments, storage, and deployment assumptions.
- Saved detailed handoff: `TEAM_INBOX/FROM_CODEX_2026-04-26_aadesh_cto_audit.md`.

**Main findings:**
- Entity Lock exists but generation can be called directly without server-side attestation verification.
- Assistance Report is missing.
- Credit charging appears duplicated between generation and DOCX export.
- Prompt caching shape is mostly good, but prompt version/default model are inconsistent.

**Next:**
- Fix server-side Legal Shield enforcement and Assistance Report before RAI submission.

## 2026-04-26 — Landing page audit

**What happened:**
- Audited local landing page visually and via `LandingPage.tsx`.
- Checked Kannada and English states.

**Main findings:**
- Pricing is inconsistent: hero `Rs 42-100/order`, pricing cards `₹109-142/order`, calculator `₹50/order`.
- Sticky bottom CTA covers content on narrow viewports.
- Hero is too tall; CTA/proof can fall below first viewport.
- English mode still shows Kannada support line as the main subtitle.
- Header lacks a visible login link.
- Positioning is broad; strongest wedge should stay Karnataka land-record/revenue drafting.

**Next:**
- Lock pricing truth, then redesign hero/sticky CTA/copy.

## 2026-04-26 — Coordination protocol added

**What happened:**
- Added `TEAM_INBOX/FROM_CODE_2026-04-26_coordination_protocol.md`.
- Defines how Cowork, Claude Code, and GPT Codex should coordinate through TEAM_INBOX.

**Next:**
- Cowork should lock pricing and landing-page positioning before any builder changes `LandingPage.tsx`.

## 2026-04-26 — Coordination naming clarified

**What happened:**
- Accepted Claude's naming proposal.
- New Codex handoffs should use `FROM_CODEX_*`.
- Claude/Cowork instructions to Codex should use `FROM_CLAUDE_*`.
- Added `TEAM_INBOX/FROM_CODEX_2026-04-26_for_claude_first_task.md`.

**First requested Claude task:**
- Lock landing-page pricing truth before redesign.

## 2026-04-27 — Production deployment checklist prepared

**What happened:**
- Created `TEAM_INBOX/FROM_CODEX_2026-04-27_deployment_smoke_checklist.md`.
- Covered Supabase migration order, SQL verification, VPS PM2 deploy commands, smoke tests, direct API bypass tests, credit test, Assistance Report test, rollback plan, logs, and final RAI pass/fail criteria.

**Files changed:**
- `TEAM_INBOX/FROM_CODEX_2026-04-27_deployment_smoke_checklist.md`
- `TEAM_LOG.md`

**Tests:**
- Not run. Checklist-only task.

**Next:**
- Cowork should review the deployment window and confirm the production operator who will run the checklist.

## 2026-04-27 — Post-deploy audit failed

**What happened:**
- Audited production VPS, live endpoints, compiled route presence, PM2 logs, and Supabase column availability.

**Result:**
- FAIL. Production is not running the compliance commits.

**Evidence:**
- VPS source is still at `e90b2ce`, not `c345bf6`.
- `/api/pipeline/assistance-report` returns `404`.
- Compiled Assistance Report route is missing.
- Supabase `orders.state` column does not exist.
- PM2 logs show repeated Next.js Server Action deployment mismatch errors.

**Files changed:**
- `TEAM_INBOX/FROM_CODEX_2026-04-27_post_deploy_audit.md`
- `TEAM_LOG.md`

**Next:**
- Apply Supabase migrations, deploy `c345bf6` or newer, rebuild/restart PM2, then re-run audit.

## 2026-04-28 — Landing page RAI-safe redesign

**What happened:**
- Rewrote `aadesh-ai/nextjs/src/components/LandingPage.tsx`.
- Backed up old component as `aadesh-ai/nextjs/src/components/LandingPage_old.tsx`.
- Repositioned landing page as Karnataka-first, human-in-the-loop Kannada government order drafting assistant.
- Added compliance pipeline, Entity Lock, Officer Reasoning, Assistance Report, Manifest Hash, pilot pricing, FAQ, and mobile sticky CTA.

**Files changed:**
- `aadesh-ai/nextjs/src/components/LandingPage.tsx`
- `aadesh-ai/nextjs/src/components/LandingPage_old.tsx`
- `TEAM_INBOX/FROM_CODEX_2026-04-28_landing_page_rai_redesign.md`
- `TEAM_LOG.md`

**Tests:**
- `npm run build` passed.
- `npx tsc --noEmit` passed after build regenerated `.next/types`.
- Live component grep passed for removed risky strings.

**Issues:**
- Browser/dev-server smoke check was blocked by Windows/OneDrive `.next` readlink errors. Build/typecheck passed.
- Existing unrelated dirty files remain untouched.

**Next:**
- Cowork should review legal tone and decide whether the old backup component should stay in `src/components` or move to archive before production deploy.

## 2026-04-28 — Landing page commit verified, push blocked

**What happened:**
- Verified active `aadesh-ai/nextjs/src/components/LandingPage.tsx` contains none of the requested old risky strings.
- Created local commit `72e24b3`.
- Attempted to push `main` to GitHub.

**Commit:**
- `72e24b3 feat: redesign landing page for RAI-safe Karnataka positioning`

**Files changed in commit:**
- `aadesh-ai/nextjs/src/components/LandingPage.tsx`
- `aadesh-ai/nextjs/src/components/LandingPage_old.tsx`

**Build result:**
- `npm run build` passed after removing stale generated `.next` artifacts.

**Typecheck result:**
- `npx tsc --noEmit` passed.

**Push status:**
- FAILED.
- GitHub returned `403`: permission denied to `Rishi-konda` for `srinivasenvcivilsurvey-sudo/aadesh-ai`.
- SSH also failed with `Permission denied (publickey)`.
- `gh` is not logged in.

**Important note:**
- Local `main` is ahead of `origin/main` by 4 commits.
- Push requires logging in with a GitHub account that has write access to the repo.

**Next:**
- Srinivas/Cowork should authenticate GitHub on this machine with repo write access, then run `git push origin main`.

## 2026-04-28 — Landing page local preview running

**What happened:**
- Started local preview server for visual review.
- Current commit is `72e24b3`.
- Did not push to GitHub.
- Did not deploy to VPS.

**Local URL:**
- `http://localhost:3005`

**Checks:**
- Active `LandingPage.tsx` has no matches for old risky strings using `Select-String`.
- `rg` was unavailable due Windows access denied.
- Server returned HTTP `200` on port `3005`.

**Issues:**
- First dev attempt hit a generated `.next` OneDrive/readlink error.
- Removed generated `.next` only, then dev server started successfully on `3005`.

**Next:**
- Srinivas should visually review `http://localhost:3005`.
- Do not push or deploy until visual approval.


## 2026-05-05 | Codex — Rishi Real Face Composite V1

**Status:** Complete as a test batch; rejected as final output.

**Done:**
1. Created/updated output folder: `D:\Coorg trip 2026\rishi birthday\RISHI_REAL_FACE_COMPOSITE_V1`.
2. Built real-pixel compositing script: `C:\Users\north\OneDrive\Attachments\Desktop\Banu\tools\create_rishi_real_face_composite_v1.py`.
3. Tested both generated birthday backgrounds with real Rishi face pixels from:
   - `D:\Coorg trip 2026\rishi birthday\20260503_195505.jpg`
   - `D:\Coorg trip 2026\rishi birthday\IMG_20260503_200944.jpg`
4. Saved comparison contact sheet: `D:\Coorg trip 2026\rishi birthday\RISHI_REAL_FACE_COMPOSITE_V1\RISHI_FACE_COMPOSITE_CONTACT_SHEET.jpg`.
5. Added rejection/recommendation notes: `D:\Coorg trip 2026\rishi birthday\RISHI_REAL_FACE_COMPOSITE_V1\REAL_FACE_COMPOSITE_NOTES.md`.

**Checks:**
- Script compiles with `python -m py_compile`.
- Contact sheet opens correctly: 520x3740, 0.61 MB.
- Sample output opens correctly: 1122x1402, 0.53 MB.

**Issues:**
- Visual quality is not final: seams, doubled child face edges, or source background patches remain.
- Root cause: the best close reference has part of Rishi's face blocked; the full solo reference is lower resolution and has bright glare.
- More full AI generation is not recommended because it keeps changing Rishi's face.
- Notion not updated because no Notion connector/tool is available in this session.

**Next for Cowork:** Plan a real-photo-first final workflow: enhance the best original family photo directly, or use manual Photoshop/GIMP layer masking for background upgrade while preserving all faces.

---
## 2026-05-06 | Codex — Anniversary Resort Edited 5

**Status:** Complete.

**Done:**
1. Created output folder: `D:\Coorg trip 2026\Resort Camera\FINAL_ANNIVERSARY_EDITED_5`.
2. Built repeatable editor script: `C:\Users\north\OneDrive\Attachments\Desktop\Banu\tools\edit_anniversary_resort_5.py`.
3. Edited 5 selected anniversary resort photos in natural premium style.
4. Exported master, Instagram, WhatsApp, and before-after versions for each selected photo.
5. Added `SELECTION_NOTES.md` and `FINAL_CONTACT_SHEET.jpg`.

**Checks:**
- Script compiles with `python -m py_compile`.
- 5 master JPGs created and open correctly.
- 5 Instagram JPGs created at exactly 1080x1350.
- 5 WhatsApp JPGs created and all are below 1 MB.
- 5 before-after comparison JPGs created.

**Issues:**
- Source photos are low-light phone JPEGs, so the final quality is limited by original noise/haze.
- No AI face redraw or AI background replacement was used.
- Notion not updated because no Notion connector/tool is available in this session.

**Next for Cowork:** Plan a 30-second anniversary status video from the two resort clips if Srinivas wants the next batch.

---
