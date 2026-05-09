# SARVAM DPA REQUEST — Email Draft (ready to send)

**To:** developer@sarvam.ai
**CC:** (optional) support@sarvam.ai
**From:** Srinivasa T <srinivas.t@aadesh-ai.in>  (use whichever address you want on record)
**Subject:** Data Processing Agreement request — Aadesh AI (Karnataka govt land-revenue drafting SaaS) — DPDP compliance

**Send by:** April 22, 2026 (48 hours from now)

---

## WHY THIS EMAIL MATTERS

On April 19, 2026 we switched our primary OCR pipeline from Claude Vision to Sarvam Document Intelligence. Sarvam's default Privacy Policy (August 2024 version, verified today) states: *"May use Input and Output to train and improve product."*

This means: every Karnataka caseworker PDF currently flowing through aadesh-ai.in — containing citizen names, Aadhaar-linked identities, survey numbers, and quasi-judicial case content — is potentially being retained by Sarvam and may be used for model training.

This is a DPDP Act 2023 exposure + a Karnataka RAI Committee classification risk. We need a signed DPA with zero-retention and no-training clauses before May 5, 2026 (our RAI submission deadline).

---

## THE EMAIL BODY

Subject: Data Processing Agreement request — Aadesh AI (Karnataka govt land-revenue drafting SaaS) — DPDP compliance

Dear Sarvam AI Developer Relations team,

I am writing on behalf of Aadesh AI (https://aadesh-ai.in), a production SaaS platform that assists Karnataka government officers in drafting formal land-revenue orders in Kannada. We currently use Sarvam Document Intelligence as our primary OCR engine and Sarvam 105B as a default generation model. Our 90-day spend to date is ₹122.17 and our current credit balance is ₹718.

Our use case involves processing case documents from Karnataka land-revenue offices, which contain personally identifiable information (citizen names, addresses, land ownership details, survey numbers) that qualify as Personal Data under the Digital Personal Data Protection Act, 2023 (DPDP).

Before we scale beyond our current pilot user, and before our May 5, 2026 submission to the Karnataka Responsible AI Committee (chaired by Shri Kris Gopalakrishnan), we require a written Data Processing Agreement from Sarvam AI that explicitly confirms the following:

1. **Zero data retention** — Case document contents submitted via Sarvam Document Intelligence and Sarvam 105B APIs are not retained beyond the minimum processing window required to return the API response.

2. **No training use** — Customer Inputs and Outputs (as defined in Sarvam's current Terms of Use) are NOT used, directly or indirectly, to train, fine-tune, or evaluate any Sarvam model, including but not limited to Sarvam Vision, Sarvam 105B, Sarvam 30B, Sarvam Akshar, Chanakya, and Arya.

3. **Data residency** — All processing and any transient storage of our Inputs and Outputs occurs within the geographical territory of India.

4. **Sub-processors** — A current list of Sarvam's sub-processors who may have access to our data, along with their jurisdictions.

5. **Breach notification** — Commitment to notify us in writing within 72 hours of any data breach that may have exposed our Inputs or Outputs, as required under DPDP Act Section 8(6).

6. **Termination rights** — Our right to delete all associated data within 30 days of terminating our Sarvam account, with written confirmation of deletion.

We understand these terms may differ from Sarvam's standard self-serve policy and that enterprise-tier arrangement may be required. If so, please let us know the minimum commit, pricing, and onboarding timeline. We are willing to move to Pro or Business tier if required to secure these terms.

Our submission to the Karnataka RAI Committee is on May 5, 2026. A DPA signed or a written commitment in principle before that date is critical for our classification as a "medium-risk, human-in-the-loop" system under the committee's forthcoming framework. A delay past May 5 may force us to revert to a non-Indian model provider, which would be commercially and strategically unwanted for both parties.

Please reply with:
(a) confirmation that the six items above are acceptable in principle,
(b) draft DPA text (or link to your standard enterprise DPA), and
(c) the commercial tier we would need to be on to execute this.

Happy to get on a short call this week if that moves this faster.

Best regards,

Srinivasa T
Founder, Aadesh AI
https://aadesh-ai.in
Bengaluru, India
+91-XXXXXXXXXX  [add phone before sending]

---

## AFTER SENDING

1. Save a copy of the sent email to `DDLR Strategy & Planning/SARVAM_DPA_SENT_2026-04-XX.eml`
2. Set a calendar reminder for April 27 (5 days) — if no reply, escalate via Sarvam founder LinkedIn or Twitter
3. If Sarvam responds with a standard enterprise DPA: forward to Claude (Cowork) immediately for review before signing
4. If Sarvam refuses no-training in writing: switch Aadesh AI back to Claude Vision primary within 24 hours. Sarvam becomes fallback only, not primary.

---

## FALLBACK PLAN (if no DPA by April 28)

- Switch `LLM_PRIMARY` back to `claude` in VPS `.env.local`
- Redeploy (PM2 restart with --update-env)
- Document decision in MASTER_CONTEXT under "April 28 — DPA fallback executed"
- Proceed with RAI submission citing Anthropic DPA only, note Sarvam relationship as "ongoing"

— Cowork (Claude Chat), 2026-04-20
