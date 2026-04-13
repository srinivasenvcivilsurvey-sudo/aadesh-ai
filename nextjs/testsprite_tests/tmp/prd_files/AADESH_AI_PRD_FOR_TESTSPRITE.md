# Aadesh AI (ಆದೇಶ AI) — Product Requirements Document
## For TestSprite QA Testing

**App URL:** https://aadesh-ai.in  
**Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase Auth, Sarvam AI  
**Test Account:** banu.test@aadesh-ai.in / Banu@Aadesh2026 (20 credits)

---

## WHAT THIS APP DOES

Aadesh AI is a SaaS web app for Karnataka (India) government caseworkers.
It generates formal legal orders in Kannada language (Sarakari Kannada) for land-record offices.
Caseworkers upload sample orders, AI learns their drafting style, then generates new orders from minimal input.

---

## PAGES & FEATURES TO TEST

### 1. Landing Page (`/`)
- Page must load with Kannada text "ಆದೇಶ AI" visible
- Language toggle button visible (switches between English and Kannada)
- "Get Started" / "ಪ್ರಾರಂಭಿಸಿ" CTA button must be visible and clickable
- Pricing section must be visible
- "Made in Bengaluru" badge visible
- No broken images or console errors

### 2. Sign Up Page (`/auth/register`)
- Email field, Password field, Full Name field all present
- Google OAuth button visible: "Google ನೊಂದಿಗೆ ಮುಂದುವರಿಸಿ" (Continue with Google)
- Empty form submission must show validation error
- Invalid email format must show error in Kannada
- Successful signup must redirect to email verification page

### 3. Login Page (`/auth/login`)
- Email and password fields present
- Google sign-in button visible and properly styled (icon + text aligned)
- Correct credentials (banu.test@aadesh-ai.in / Banu@Aadesh2026) must log in successfully
- After login: redirect to /app/dashboard
- Wrong password must show Kannada error message
- "Forgot password" link present

### 4. Dashboard (`/app/dashboard`)
- Must load after login (no redirect loop)
- Personalized greeting visible (ಶುಭ ಪ್ರಭಾತ / ಶುಭ ಮಧ್ಯಾಹ್ನ / ಶುಭ ಸಂಜೆ based on time of day)
- Credit balance shows "20" for Banu's account
- Credits display color: green if >5, yellow if 2–5, red if <2
- Training status bar visible (shows training level 0–4)
- Sidebar navigation visible with these items: Dashboard, Generate Order, My Orders, AI Training, Credits/Billing, Settings
- Mobile bottom navigation visible when viewport is 375px wide

### 5. Generate Order Page (`/app/generate`)
- All input fields present: Case Number, Survey Number, Village Name, Appellant Name, Order Type
- Input placeholders must show examples in Kannada
- "ಆದೇಶ ರಚಿಸಿ" (Generate Order) button present
- Submit with test data must call AI and return Kannada text output
- Output must contain Kannada characters (not English)
- Word count of output must be ≥ 300 words
- After generation: credit balance must decrease by 1 (from 20 to 19)
- Guardrails panel must be visible showing quality checks
- Auto-save textarea must be editable (not read-only)
- Timer/loading indicator must appear during generation (up to 60 seconds)

### 6. DOCX Download (`/api/download`)
- After order is generated, "DOCX ಡೌನ್‌ಲೋಡ್" button must be visible
- Clicking download must trigger file download
- Downloaded file must be .docx format
- File must contain Kannada text (Noto Sans Kannada font)

### 7. My Orders Page (`/app/my-orders`)
- Page must load and show order history
- Each order card must show: case number, date, word count, order type
- View button on each card must open the order
- Search input must be present
- Sort options must be present

### 8. AI Training Page (`/app/train`)
- Drag-and-drop upload area must be visible
- Supported formats: .docx, .pdf, .txt
- Training status bar shows 4 levels: Untrained → Basic → Good → Expert
- File count visible after upload
- Upload progress indicator with ETA must appear during upload

### 9. Billing / Credits Page (`/app/billing`)
- Current credit balance shown correctly (19 after one generation)
- 4 recharge packs visible with prices in Indian Rupees
- Razorpay payment button present
- Language toggle must work on this page (known previous bug — must be fixed)
- Pricing section text must switch language when toggle is clicked

### 10. Settings Page (`/app/settings`)
- User profile information visible and editable
- Transfer Mode section present with "I have transferred" button
- Confirmation dialog appears when transfer is clicked
- Language preference toggle works

### 11. Language Toggle (EN ↔ ಕನ್ನಡ)
- Toggle must work on ALL pages
- Landing page: all text switches language
- Dashboard: greeting and labels switch language
- Generate page: input placeholders switch language
- Billing page: pricing text switches language (was broken bug — must be fixed)
- Toggle state must persist across page navigation

### 12. Mobile Responsiveness
- Viewport: 375×812 pixels (iPhone SE)
- Landing page: no horizontal scroll, all text readable
- Dashboard: mobile bottom navigation bar visible (WhatsApp-style, 5 tabs)
- Generate page: form usable, all fields accessible
- Sidebar must be hidden on mobile (replaced by bottom nav)
- Buttons must be minimum 48px height on mobile

---

## CRITICAL USER FLOWS (End-to-End)

### Flow A: New User Onboarding
1. Visit https://aadesh-ai.in
2. Click "Get Started"
3. Sign up with email
4. Verify email
5. Land on Dashboard
6. See "2 free demo orders" CTA
7. Click Generate Order
8. Fill form, generate, see Kannada output
9. Download DOCX

### Flow B: Returning User Generate Order
1. Visit https://aadesh-ai.in
2. Login with email/password
3. Dashboard shows credits and training level
4. Navigate to Generate Order
5. Fill: Case Number, Village, Survey Number, Appellant
6. Click Generate (wait up to 60s)
7. See Kannada order (300–750 words)
8. Edit in auto-save textarea
9. Download DOCX
10. Credit balance decreases by 1

### Flow C: Training Upload
1. Login
2. Go to AI Training page
3. Upload a .docx file (any government order sample)
4. See progress bar
5. File count increases
6. Training level bar updates

---

## WHAT MUST NOT HAPPEN (Known Previous Bugs — Must Stay Fixed)

- PDF download must NOT replace Kannada with "????" characters (was broken, now returns DOCX)
- Billing page language toggle must NOT be hardcoded to Kannada only
- Payment flow: Razorpay verification must NOT return 401 (was missing Authorization header)
- Credits must be added after payment (RPC param names were wrong — now fixed)
- Console must NOT show Vercel Analytics errors (was removed)
- Verify email page must be bilingual (was English-only)

---

## TECH NOTES FOR TESTSPRITE

- App uses Supabase Auth (JWT cookies, Nginx proxy_buffer_size 16k required)
- API timeout: 60 seconds for AI generation (Sarvam 105B model)
- All Kannada text uses NFKC Unicode normalization
- Next.js standalone mode — deployed on DigitalOcean VPS with PM2 + Nginx
- Google OAuth callback: https://aadesh-ai.in/auth/callback
- App has rate limiting: 10 requests/minute per user

---

## PASS CRITERIA

| Area | Pass Threshold |
|------|---------------|
| All 12 pages load | 100% |
| Login/Signup flow | Must work |
| Generate Order (core feature) | Must produce Kannada output ≥300 words |
| DOCX Download | Must trigger file download |
| Language toggle | Must work on all pages |
| Mobile nav | Must show on 375px viewport |
| Credit deduction | Must decrease by 1 after generation |
