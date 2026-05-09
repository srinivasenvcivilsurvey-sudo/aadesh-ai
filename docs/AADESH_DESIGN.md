# AADESH AI — DESIGN.md
# Version: 1.0 | Created: April 12, 2026
# Purpose: Drop this file in the project root. Claude Code reads it and generates
# consistent Aadesh AI UI automatically — no need to repeat design rules in every prompt.
# Rule: ALL UI built for Aadesh AI must follow this file exactly.

---

## 1. BRAND IDENTITY

**Product:** Aadesh AI (ಆದೇಶ AI)
**Tagline:** Your AI drafter. Learns your style. Works in 2 minutes.
**Tagline (Kannada):** ನಿಮ್ಮ AI ಬರಹಗಾರ. ನಿಮ್ಮ ಶೈಲಿ ಕಲಿತು 2 ನಿಮಿಷದಲ್ಲಿ ದಾಖಲೆ ತಯಾರಿಸುತ್ತದೆ.
**Made in:** Bengaluru, Karnataka, India
**Target users:** Karnataka government officers + private professionals

**Personality:** Trustworthy, local, warm, government-grade, bilingual
**NOT:** Corporate, foreign, playful, dark, complex

---

## 2. COLOR PALETTE

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Saffron (primary) | #E97B3B | CTAs, highlights, active states, brand accent |
| Saffron Dark | #BF360C | Hover states on primary buttons |
| Navy (trust) | #1A237E | Government headers, office labels, formal text |
| Navy Dark | #0D1559 | Hover states on navy elements |

### Karnataka Tricolor (ribbon only)
| Position | Color | Hex |
|----------|-------|-----|
| Left | Saffron | #E97B3B |
| Center | White | #FFFFFF |
| Right | Green | #138808 |
Use ONLY for the top ribbon on government document cards. Never as a general design element.

### Neutral Palette
| Name | Hex | Usage |
|------|-----|-------|
| Cream | #FFF7F0 | Page backgrounds, hero sections |
| Peach | #FDF1E8 | Section backgrounds, card backgrounds |
| Warm White | #FFFCFA | Document card backgrounds |
| Charcoal | #1F2937 | Body text |
| Mid Gray | #6B7280 | Secondary text, labels |
| Light Gray | #F3F4F6 | Borders, dividers |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success Green | #1D9E75 | Completed states, live indicators, accuracy |
| Warning Amber | #F9A825 | Gold seal, caution states |
| Error Red | #DC2626 | Errors only |
| Info Blue | #185FA5 | Informational badges |

### Background Hierarchy
1. Page background: #FFF7F0 (warm cream) OR white
2. Section alternating: #FDF1E8 (peach) for every other section
3. Card surface: #FFFFFF with 0.5px border #F3E5D8
4. Government document card: #FFFCFA with border #F3E5D8

---

## 3. TYPOGRAPHY

### Font Stack
```css
/* Kannada text — MANDATORY */
font-family: 'Noto Sans Kannada', 'Noto Sans', sans-serif;

/* English text — UI */
font-family: 'Inter', 'Noto Sans', -apple-system, sans-serif;

/* Government document body (inside order preview) */
font-family: 'Noto Serif Kannada', 'Noto Serif', serif;
```

### Type Scale
| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Display H1 | 32–36px | 500 | Hero headline only |
| H1 | 28px | 500 | Page titles |
| H2 | 22px | 500 | Section titles |
| H3 | 18px | 500 | Card titles |
| H4 | 15px | 500 | Sub-section titles |
| Body | 14px | 400 | General content |
| Small | 12px | 400 | Labels, captions |
| Micro | 10–11px | 500 | Tags, badges, metadata |

### Bilingual Rule (MANDATORY)
Every heading on public-facing pages (landing, onboarding) MUST have a Kannada line below the English line.
```
English line: font-size: 20px, font-weight: 500, color: #1F2937
Kannada line: font-size: 14px, font-weight: 400, color: #6B7280, margin-top: 3px
```
Exception: Inside the app (post-login dashboard, pipeline) — bilingual is optional per component.

---

## 4. SPACING & LAYOUT

### Grid
- Max content width: 1200px (desktop), 680px (landing page), full-width (app)
- Gutter: 24px (desktop), 16px (mobile)
- Section padding: 5rem 1.5rem (desktop), 3rem 1rem (mobile)

### Spacing Scale (use multiples of 4px)
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

### Border Radius
| Element | Radius |
|---------|--------|
| Buttons | 8px |
| Cards | 12px |
| Pills/badges | 20px (full pill) |
| Inputs | 8px |
| Document card | 12px |
| Seal (circle) | 50% |

---

## 5. COMPONENTS

### Primary Button
```css
background: #E97B3B;
color: white;
padding: 11px 26px;
border-radius: 8px;
font-size: 14px;
font-weight: 500;
border: none;
cursor: pointer;
/* Hover: */ background: #BF360C;
/* Active: */ transform: scale(0.98);
```
CTA text pattern: "Action — ಕನ್ನಡ ಅನುವಾದ →"
Example: "Try 3 free orders — ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ →"

### Secondary Button
```css
background: transparent;
border: 0.5px solid #D1D5DB;
color: #1F2937;
padding: 11px 26px;
border-radius: 8px;
```

### Card
```css
background: #FFFFFF;
border: 0.5px solid #F3E5D8;
border-radius: 12px;
padding: 16px 20px;
/* No box-shadow on default cards */
/* Exception: document preview card gets shadow-2xl */
```

### Government Document Card (special component)
```css
background: #FFFCFA;
border: 0.5px solid #F3E5D8;
border-radius: 12px;
/* Top ribbon: 4px height, Karnataka tricolor gradient */
/* Header: Navy label left, status pill right */
/* Body: Noto Serif Kannada, 13px, line-height 1.85 */
/* Seal: bottom-right, rotated -8deg, gold border, animated pop-in */
```

### Navigation Bar
```css
background: white;
border-bottom: 0.5px solid #F3F4F6;
position: sticky; top: 0; z-index: 50;
padding: 12px 20px;
/* Logo: "ಆದೇಶ AI" font-size 15px font-weight 500 */
/* Nav links: 12px, color #6B7280 */
/* CTA button: saffron, small size (12px, padding 6px 16px) */
```

### Input Field
```css
border: 0.5px solid #D1D5DB;
border-radius: 8px;
padding: 10px 14px;
font-size: 14px;
/* Focus: border-color #E97B3B, outline none */
/* Label: 13px, font-weight 500, margin-bottom 6px */
/* Bilingual label: English (13px 500) + Kannada (11px 400 #6B7280) */
```

### Badge / Pill
```css
/* Default */
background: #F3F4F6; color: #374151;
padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;

/* Brand (saffron) */
background: #FAEEDA; color: #854F0B;

/* Success */
background: #E1F5EE; color: #0F6E56;

/* Government office label */
background: #DBEAFE; color: #1E3A8A;

/* Private professional */
background: #EDE9FE; color: #5B21B6;
```

### Live Indicator Pill
```css
display: inline-flex; align-items: center; gap: 6px;
background: #F9FAFB; border: 0.5px solid #F3F4F6;
border-radius: 20px; padding: 4px 14px; font-size: 12px;
/* Green dot: width 6px, height 6px, border-radius 50%, background #1D9E75, animation pulse */
```

### Progress Bar (training readiness)
```css
/* Track */ background: #F3F4F6; height: 6px; border-radius: 3px;
/* Fill */ background: #E97B3B; border-radius: 3px;
/* Labels: left=tier name, right=percentage, font-size 11px */
```

---

## 6. ANIMATION PRINCIPLES

### General Rules
- Duration: 300–500ms for UI transitions, 700ms for reveal animations
- Easing: ease-out for entrances, ease-in-out for loops
- No jarring animations — government users expect calm, professional UI

### Approved Animations
| Animation | Usage | Duration |
|-----------|-------|----------|
| Fade + slide up (24px) | Section reveal on scroll | 700ms ease-out |
| Typewriter line-by-line | Document preview demo | 440ms per line |
| Float (translateY 0→-5px→0) | Floating badges | 3s ease-in-out infinite |
| Scale pop (0.6→1.0) | Seal appearance | 400ms ease-out |
| Blink (opacity 1→0) | Cursor, live dot | 1s steps(2) infinite |
| Count up | Live statistics counter | 1800ms easeOutCubic |

### 3D Document Preview (special)
```css
/* Main card */ transform: rotateX(3deg) rotateY(0deg);
/* Hover */ transform: rotateX(1deg) rotateY(-3deg) translateZ(8px);
/* Shadow layers: 2 cards behind at translateZ(-30px) and translateZ(-60px) */
perspective: 900px on parent container
```

---

## 7. ICONS

Use **Lucide React** exclusively. Size: 16px (inline), 20px (button), 24px (feature icon).
Stroke width: 1.5px default.

Key icons in use:
- Upload: `Upload`
- AI/Brain: `BrainCircuit`
- Document: `FileCheck2`, `FileText`
- Government: `Landmark`
- Legal/Scale: `Scale`
- Lock/Verify: `Lock`, `ShieldCheck`
- Location: `MapPin`
- Sparkle: `Sparkles`
- Check: `Check`

---

## 8. GOVERNMENT DOCUMENT ANATOMY

Every generated order preview must follow this structure:
```
[Karnataka Tricolor Ribbon — 4px]
[Header: Office Name (Navy, 9px uppercase) | Status Pill]
[Body: Noto Serif Kannada]
  ಸಂ: [case number] | ದಿನಾಂಕ: [date]
  [blank line]
  ವಿಷಯ: [subject heading — Navy, bold]
  [body paragraphs — 13px, line-height 1.85]
  [blank line]
  ಆದೇಶ: [decision heading — Navy, bold]
  [decision text]
  [blank line]
  [signatory line — 10px, italic, gray]
[Verified Seal — bottom right, rotated -8deg, gold border]
```

AI Draft Watermark (shown before officer verifies):
```css
display: inline-block;
background: #FAEEDA; color: #854F0B;
font-size: 10px; font-weight: 500;
padding: 2px 8px; border-radius: 3px;
content: "AI ಕರಡು — ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ ಬಾಕಿ"
```

---

## 9. PAGE-SPECIFIC RULES

### Landing Page
- Background: warm cream #FFF7F0
- Hero: centered, max-width 480px content
- Sections alternate: cream → peach → cream
- "Made in Bengaluru 🇮🇳" badge: saffron pill, always in hero
- No dark sections on landing page
- Footer: white bg, light border-top, small text, 3 links: Privacy / Terms / Contact

### App (Post-login)
- Background: #F9FAFB (light gray — different from landing)
- Sidebar nav (desktop) OR bottom tab nav (mobile)
- Cards: white with subtle border
- Orange accent for active/selected states only

### Pipeline (6-step wizard)
- Progress dots: gray (inactive) → saffron fill (active) → green check (done)
- Each step: full-width white card, centered content
- Step numbers: saffron circle, 34px diameter

### Government Document Preview (Step 5)
- Exactly follows Government Document Anatomy above
- Full government letterhead visible
- Watermark visible until officer clicks "I have verified"

---

## 10. DO NOT DO LIST

- ❌ No dark mode (government officers use bright office monitors)
- ❌ No gradients except Karnataka tricolor ribbon
- ❌ No box shadows except document preview card
- ❌ No animations faster than 300ms or jarring/bouncy effects
- ❌ No English-only headings on landing page (always bilingual)
- ❌ No fake statistics or placeholder numbers in production
- ❌ No personal names (no Banu, no Srinivas, no team names) on public pages
- ❌ No blue-primary design (that reads as generic SaaS — our primary is saffron)
- ❌ No Comic Sans, Roboto, or generic system fonts for Kannada text (use Noto Sans Kannada)
- ❌ No DDLR-specific terms on universal landing page (keep it generic until onboarding)

---

## 11. KANNADA TEXT RULES (MANDATORY for all UI)

- Always use NFKC normalization for any Kannada text in code
- Font: Noto Sans Kannada (UI), Noto Serif Kannada (document body)
- Line height: minimum 1.7 for Kannada text (characters are taller)
- Never mix English words inside Kannada sentences without a space
- Standard Sarakari terms (never anglicize):
  - ಮೇಲ್ಮನವಿದಾರರು (not ಅಪೀಲ್‌ದಾರರು)
  - ಎದುರುದಾರರು (not ರೆಸ್ಪಾಂಡೆಂಟ್)
  - ಆದೇಶ (not ಆರ್ಡರ್)
  - ದಿನಾಂಕ (not ಡೇಟ್)
  - ಸಂಖ್ಯೆ (not ನಂಬರ್)

---

*This DESIGN.md was created for Aadesh AI on April 12, 2026.*
*Update this file whenever brand decisions change.*
*Claude Code reads this file at the start of every UI task.*
