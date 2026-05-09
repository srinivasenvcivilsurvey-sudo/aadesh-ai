# AADESH AI — BLUEPRINT v8.0 ADDENDUM
# Date: April 3, 2026 (Late Night Review)
# Purpose: Gaps found + Office expansion roadmap

---

## GAPS FOUND IN BLUEPRINT v8.0 (Fresh Eyes Review)

### GAP 1: Product scope too narrow
**Problem:** Section A says "land revenue caseworker" — excludes BBMP, BDA, Sub-Registrar
**Fix:** Change to "Any Karnataka government officer who generates formal Kannada orders"

### GAP 2: Office types incomplete
**Problem:** Only lists DDLR / AC / Tahsildar / DC
**Fix:** Add full office hierarchy (see Section P below)

### GAP 3: No way to add case types AFTER onboarding
**Problem:** Case types only defined during setup Step 6
**Fix:** Add "Manage case types" in Settings page. User can add/edit/remove case types anytime.

### GAP 4: No admin dashboard for US (Srinivas)
**Problem:** No way to monitor usage, quality, revenue, user growth
**Fix:** Add /admin route with:
  - Total users by office type, district
  - Orders generated per day/week/month
  - Average ratings by district
  - Revenue tracking
  - Global pool health (patterns count, coverage)
  - API cost tracking

### GAP 5: File format support too limited
**Problem:** Only mentions PDF and DOCX upload
**Fix:** Accept: PDF, DOCX, JPG, JPEG, PNG, TIFF
  - Images: Convert to PDF first (many caseworkers take phone photos)
  - Scanned images are common in rural offices

### GAP 6: Mobile-first UX not detailed
**Problem:** Blueprint mentions "mobile-first" but no specifics
**Fix:** Add:
  - Camera capture directly from phone (no scanner needed)
  - WhatsApp-style bottom navigation
  - Large touch targets (48px minimum)
  - Offline mode indicator
  - Low-bandwidth optimization (compress images before upload)

### GAP 7: Pricing tiers not defined for v8.0
**Problem:** Just says "₹500/order" — no credit packs
**Fix:** Keep existing 4 packs from v7.5:
  - Pack A: ₹499 (5 orders) — Trial
  - Pack B: ₹999 (15 orders) — Monthly
  - Pack C: ₹1,999 (40 orders) — Quarterly
  - Pack D: ₹4,999 (120 orders) — Annual
  - FREE: 3 demo orders (global mode only)

### GAP 8: No referral/growth mechanism
**Problem:** No way for Banu to invite other officers
**Fix:** Add referral system:
  - Each user gets unique invite link
  - Referrer gets 5 free credits when referred user completes first order
  - "Share with colleague" button in app

### GAP 9: Transfer mode missing from v8.0
**Problem:** v7.5 had "I have transferred" feature — not in v8.0
**Fix:** Add to v8.0:
  - When officer transfers to new taluk/district
  - Archives old references (never deletes)
  - Updates district/taluk in profile
  - Keeps credits and account
  - Training status resets (new office = new style needed)
  - Old bible archived, new bible starts fresh

---

## SECTION P: OFFICE EXPANSION ROADMAP (NEW)

### The Big Picture

Aadesh AI is not just for land revenue. ANY Karnataka government office that
generates formal Kannada orders can use it. The architecture is already
designed for this — the caseworker defines their own case types and uploads
their own references. We just need to KNOW which offices exist and what
document types they handle.

### Phase 1 (NOW — April 2026): Land Revenue Offices

| Office | Full Name | Document Types |
|--------|-----------|---------------|
| DDLR | Deputy Director of Land Records | Appeals, suo motu reviews, RTC corrections |
| AC | Assistant Commissioner | Appeals, revenue disputes, land conversion |
| Tahsildar | Taluk-level revenue officer | Podi, mutations, RTC updates, land surveys |
| Special DC | Special Deputy Commissioner | Special cases, referred appeals |
| DC | Deputy Commissioner | Final appeals, policy orders |

**Target:** 31 districts × ~5 taluks avg = ~155 offices
**Users per office:** 1-3 caseworkers
**Total Phase 1 potential:** ~300-500 users

### Phase 2 (July 2026): Urban Local Bodies

| Office | Full Name | Document Types |
|--------|-----------|---------------|
| **BBMP** | Bruhat Bengaluru Mahanagara Palike | Property tax orders, building violation notices, trade license orders, zonal commissioner orders |
| **City Corporations** | Mysore/Hubli-Dharwad/Mangalore/etc. | Same as BBMP but for other cities |
| **CMC/TMC** | City/Town Municipal Councils | Municipal orders, tax notices, NOCs |
| **GP** | Gram Panchayat | Village-level orders, land use permissions |

**Why BBMP is high priority:**
- Largest city corporation in Karnataka
- 8 zones × multiple wards = massive order volume
- Officers handle building violations, encroachments, tax disputes
- Currently ALL manual drafting — huge pain point
- BBMP orders follow similar structure: header → facts → findings → order

**Target Phase 2:** ~200-300 additional users

### Phase 3 (October 2026): Development Authorities + Registration

| Office | Full Name | Document Types |
|--------|-----------|---------------|
| **BDA** | Bangalore Development Authority | Site allotment orders, layout approval orders, NOCs |
| **MUDA** | Mysore Urban Development Authority | Same as BDA for Mysore |
| **KIADB** | Karnataka Industrial Area Development Board | Industrial land allotment, lease orders |
| **Sub-Registrar** | Property Registration Office | Registration-related orders, refusal orders |
| **Survey Dept** | Karnataka Survey Settlement & Land Records | Survey dispute orders, boundary decisions |

**Target Phase 3:** ~100-200 additional users

### Phase 4 (January 2027): Other Government Departments

| Office | Full Name | Document Types |
|--------|-----------|---------------|
| **RTO** | Regional Transport Office | Vehicle-related orders, license decisions |
| **Labor Dept** | Labor Commissioner Office | Labor dispute orders, compliance notices |
| **PWD** | Public Works Department | Contract orders, work completion certificates |
| **Forest Dept** | Karnataka Forest Department | Forest land orders, encroachment notices |
| **Education** | Dept of Public Instruction | Transfer orders, disciplinary orders |
| **Police** | Karnataka Police | Administrative orders (not FIRs) |

**Target Phase 4:** ~500+ users

### Total Addressable Market (Karnataka only)

| Phase | Offices | Users | Monthly Orders (est.) | Revenue (est.) |
|-------|---------|-------|----------------------|----------------|
| Phase 1 | Revenue (5 types) | 300-500 | 1,500-2,500 | ₹7.5-12.5 lakh |
| Phase 2 | Urban bodies (4 types) | 200-300 | 1,000-1,500 | ₹5-7.5 lakh |
| Phase 3 | Development (5 types) | 100-200 | 500-1,000 | ₹2.5-5 lakh |
| Phase 4 | Other depts (6 types) | 500+ | 2,500+ | ₹12.5+ lakh |
| **TOTAL** | **20+ office types** | **1,100-1,500+** | **5,500-7,000+** | **₹27.5-37.5 lakh/mo** |

**Annual revenue potential (Karnataka only): ₹3.3-4.5 crore**

### Why the architecture ALREADY supports this

The v8.0 architecture was designed from day 1 for this expansion:

| Feature | Why it enables expansion |
|---------|------------------------|
| User defines own case types | We don't need to know BBMP case types — BBMP officers define them |
| User uploads own references | We don't need BBMP reference orders — officers upload their own |
| Dynamic system prompt | Adapts automatically to any office type |
| Global pool by office_type | BBMP officers help other BBMP officers, not mixed with DDLR |
| Training meter | Works identically for any office |
| District/taluk selection | Already covers all Karnataka |

**The ONLY thing we add per phase:**
1. Add office type to the dropdown (e.g., "BBMP")
2. Optionally add suggested case type defaults per office
3. Marketing to that office category

**Zero code changes for each new office type.**

---

## SECTION Q: UPDATED OFFICE TYPE DROPDOWN (NEW)

Replace Step 2 in onboarding:

```
Step 2: Select your department

Category 1 — Revenue Department
  ├── DDLR (Deputy Director of Land Records)
  ├── AC (Assistant Commissioner)
  ├── Tahsildar
  ├── Special DC (Special Deputy Commissioner)
  └── DC (Deputy Commissioner)

Category 2 — Urban Local Bodies [Phase 2]
  ├── BBMP (Bruhat Bengaluru Mahanagara Palike)
  ├── City Corporation
  ├── CMC / TMC (City/Town Municipal Council)
  └── Gram Panchayat

Category 3 — Development Authorities [Phase 3]
  ├── BDA (Bangalore Development Authority)
  ├── MUDA / Other UDA
  ├── KIADB
  ├── Sub-Registrar
  └── Survey Department

Category 4 — Other Departments [Phase 4]
  ├── RTO
  ├── Labor Department
  ├── PWD
  ├── Forest Department
  ├── Education Department
  └── Other: _____________ (custom entry)

"Other" option allows ANY government office to try — we learn
what offices exist from user registrations.
```

---

## SECTION R: DATABASE SCHEMA UPDATE

Add to profiles table:
```sql
department_category  TEXT  -- 'revenue' | 'urban' | 'development' | 'other'
office_custom_name   TEXT  -- If "Other" selected, user types office name
referral_code        TEXT UNIQUE  -- Auto-generated, e.g., "BANU-7K2M"
referred_by          TEXT  -- Referral code of who invited them
```

Add new table:
```sql
-- Track referrals
CREATE TABLE referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID REFERENCES profiles(id),
  referred_id     UUID REFERENCES profiles(id),
  referral_code   TEXT NOT NULL,
  credits_awarded BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SECTION S: COMPLETE CHECKLIST — NOTHING MISSED

Cross-checking everything discussed today:

| Discussion Topic | In Blueprint? | Status |
|-----------------|--------------|--------|
| Multi-office (DDLR/AC/Tahsildar/DC) | ✅ Section B | Done |
| Multi-district (all 31 Karnataka) | ✅ Section B | Done |
| Per-user case type definitions | ✅ Section B | Done |
| Per-user reference upload | ✅ Section B Phase 2 | Done |
| Training readiness meter | ✅ Section B Phase 2 | Done |
| Dynamic system prompt | ✅ Section F | Done |
| Personal bible auto-generation | ✅ Section B + E | Done |
| User accuracy rating | ✅ Section B Phase 3 Step 7 | Done |
| Edit tracking | ✅ Section H | Done |
| Global knowledge pool | ✅ Section G | Done |
| Demo mode (zero files) | ✅ Section G | Done |
| DPDP compliance | ✅ Section G + J | Done |
| AI confidence score | ✅ Section B Phase 3 Step 6 | Done |
| Self-audit loop | ✅ Section E Step 6 | Done |
| DOCX generation | ✅ Section E Step 8 | Done |
| Cost model | ✅ Section I | Done |
| Risk mitigations (7 risks) | ✅ Section J | Done |
| Build sequence (15 tasks) | ✅ Section K | Done |
| BBMP office expansion | ✅ Addendum Section P | **NEW** |
| BDA office expansion | ✅ Addendum Section P | **NEW** |
| Sub-Registrar expansion | ✅ Addendum Section P | **NEW** |
| Full office type dropdown | ✅ Addendum Section Q | **NEW** |
| Admin dashboard for Srinivas | ✅ Addendum Gap 4 | **NEW** |
| Camera capture (phone photos) | ✅ Addendum Gap 5 | **NEW** |
| Multiple image format support | ✅ Addendum Gap 5 | **NEW** |
| Pricing packs | ✅ Addendum Gap 7 | **NEW** |
| Referral system | ✅ Addendum Gap 8 | **NEW** |
| Transfer mode | ✅ Addendum Gap 9 | **NEW** |
| Mobile-first UX details | ✅ Addendum Gap 6 | **NEW** |
| Manage case types after setup | ✅ Addendum Gap 3 | **NEW** |

**Total: 31 items checked. 0 items missing.**

---

# END OF ADDENDUM
# Blueprint v8.0 + this addendum = COMPLETE specification
