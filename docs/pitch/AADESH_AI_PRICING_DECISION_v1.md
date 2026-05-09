# Aadesh AI — Launch Pricing Decision

**Decided:** April 27, 2026
**Decided by:** Srinivasa T (Founder)
**Status:** LOCKED — do not change without revisiting this document
**Document version:** 1.0

---

## The decision

| Pack | Orders | Price | Effective ₹/order | Launch? |
|---|---|---|---|---|
| **Trial** | 1 order | Free | Free | ✅ Yes |
| **Starter** | 3 orders | ₹999 | ₹333 | ✅ Yes |
| **Regular** | 5 orders | ₹1,499 | ₹300 | ✅ Yes |
| **Pro** | 10 orders | ₹2,499 | ₹250 | ✅ Yes |
| ~~Bulk~~ | 25 orders | ₹4,999 | ₹200 | ⏳ Hidden until validated |
| ~~Power~~ | 50 orders | ₹8,999 | ₹180 | ⏳ Hidden until validated |

---

## Rationale

### Why 3 launch tiers + 1 free order, not more

1. **Avoid bulk-pack abuse before real cost data exists.** Without 20-30 production orders tracked, we don't know real per-order cost with confidence. A 50-order pack at ₹180/order could be loss-making if real cost is ₹200/order. Smaller packs cap the downside per transaction.

2. **Reduce decision friction for first users.** First users are government caseworkers, not SaaS buyers. Six pricing options creates analysis paralysis. Three tiers + free trial is easy to explain over WhatsApp.

3. **Preserve the upsell ladder.** Bulk and Power packs are not deleted — they're hidden. Once production data confirms real cost stays below ₹100/order, unlock them in this order: Bulk first, monitor for 1 month, then Power.

### Why this beats Option A (5+ tiers from launch)

Option A maximises ARPU on paper. But:

| Risk | Why it matters at launch |
|---|---|
| One Pro user using Opus heavily for complex PDFs | Could turn ₹2,499 into a loss-making transaction |
| One Bulk user sharing login with 5 colleagues | ₹4,999 becomes ₹999/user effective — not what we modeled |
| Support burden compounds with pack size | A confused Pro user takes 30 min to onboard, not 5 |

These risks are containable with smaller packs. Cap maximum loss exposure per transaction at ₹2,499.

---

## Approved marketing language

**Use this:**
> "Human drafters usually cost ₹1,000–₹2,000 per order. Aadesh pilot packs reduce the effective cost to ₹250–₹333 per order."

**Do NOT use this:**
> ~~"Orders start at ₹500"~~

Anchoring users to a fake single-order price creates expectation problems if Bulk/Power launch later at lower per-order rates.

---

## Conditions to unlock Bulk pack (₹4,999 / 25 orders)

All four must be true before Bulk is enabled in Razorpay:

1. **20-30 paid orders generated and tracked** in Financial Model Sheet 12 (Live Cost Tracker)
2. **Real per-order cost is known and stable** (confirmed below ₹100/order across at least 2 weeks)
3. **No bulk-pack abuse pattern observed** (no single account generating 30+ orders/month with multiple distinct device fingerprints)
4. **Support burden manageable** — average support time per order under 5 minutes

---

## Conditions to unlock Power pack (₹8,999 / 50 orders)

1. Bulk pack has been live for at least 1 month
2. At least 5 Bulk pack purchases observed
3. Real per-order cost confirmed below ₹80/order
4. No abuse incidents from Bulk users

---

## Margin sanity check at locked prices

At current production cost estimate (₹56/order all-in including AI + buffer):

| Pack | Per-order revenue | All-in cost | Contribution per order | Margin |
|---|---|---|---|---|
| Starter ₹999/3 | ₹333 | ₹120 | ₹213 | **64%** |
| Regular ₹1,499/5 | ₹300 | ₹119 | ₹181 | **60%** |
| Pro ₹2,499/10 | ₹250 | ₹117 | ₹133 | **53%** |

All three launch packs have healthy margins above 50%. Free trial absorbs ₹56 cost per signup; conversion rate of 30% means CAC from API burn alone is ~₹187/user.

Full math in `AADESH_AI_FINANCIAL_MODEL_v3.xlsx` Sheet 5 ("LAUNCH PRICING MARGIN VERIFICATION" block).

---

## Action items from this decision

| # | Action | Owner | When |
|---|---|---|---|
| 1 | Update Razorpay live store: pause Pack A/B/C/D, add Trial/Starter/Regular/Pro | Founder + Claude Code | Within 48 hours |
| 2 | Update aadesh-ai.in pricing page to match new packs | Claude Code | After Razorpay update |
| 3 | Update MASTER_CONTEXT.md with locked pricing | Claude (this document is the source) | This turn |
| 4 | Notify Banu of new pricing (his account stays free for pilot) | Founder | Before next paid order |
| 5 | First 10 paid orders → fill Sheet 12 Live Cost Tracker | Founder | As orders happen |
| 6 | Review pricing on June 1, 2026 | Founder + Claude | After 30 days of live pricing |

---

## When to revisit this decision

Revisit if any of these happen:

- [ ] Real per-order cost exceeds ₹100/order for 7+ consecutive days
- [ ] Refund rate exceeds 10%
- [ ] Conversion rate from free trial below 15%
- [ ] Pro pack accounts show signs of login sharing (3+ devices per account)
- [ ] Anthropic raises API prices materially
- [ ] First 10 paying users have not signed up by June 30, 2026

If any of the above triggers, open this document, document the issue at the bottom, and re-decide.

---

## Decision history

| Date | Decision | Notes |
|---|---|---|
| April 27, 2026 | Initial pricing decision (this document) | Trial + Starter + Regular + Pro launched. Bulk + Power hidden. |

---

*This document is the source of truth for Aadesh AI pricing. It supersedes any pricing in handbook, marketing copy, or financial model. When those documents disagree with this one, this one wins.*
