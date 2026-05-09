# Aadesh AI — Business Concept

*One document. Plain English. No jargon. Read in ten minutes.*

**Live at:** [aadesh-ai.in](https://aadesh-ai.in)
**Founder:** Srinivasa T (Bengaluru)
**First pilot user:** Banu, DDLR caseworker, Bangalore South
**Document date:** April 26, 2026

---

## Contents

1. The bet, in one line
2. The problem we solve
3. Who pays for it, and why
4. The product — a personal whiteboard
5. Step-by-step user flow
6. The technology behind it
7. The legal compliance design
8. The business model
9. Where we are today
10. The competitive landscape
11. The roadmap
12. The honest risks
13. Glossary

---

## 1. The bet, in one line

> **A Karnataka land-records caseworker is already paying ₹1,000–₹2,000 in cash to a private drafter for every legal order he writes. Aadesh AI does the same job in minutes for ₹500, in his own drafting style, with a legal audit trail that protects the officer who signs it.**

That is the entire thesis. Everything else in this document explains how that sentence becomes a business.

---

## 2. The problem we solve

A DDLR (District Deputy Land Records) caseworker in Karnataka writes between **20 and 60 legal orders a month**. For one single order, here is what happens today:

| Step | Who does it | Time | Cost to the caseworker |
|---|---|---|---|
| 1. Receive scanned case file (40–60 pages) | Caseworker | — | — |
| 2. Read everything, pull out the facts that matter | Caseworker | 1–2 hours | mental load |
| 3. Cross-check survey numbers, village names, party names across pages (they often disagree) | Caseworker | 30–60 min | mental load |
| 4. Ask a senior officer about tricky points | Caseworker + senior | variable | political capital |
| 5. **Hand the file to a private "drafter" to write the Kannada legal order** | Drafter | 1–2 days | **₹1,000–₹2,000 from his own pocket** |
| 6. Get the draft typed and formatted | Typist | 1–2 hours | small fee |
| 7. Review, get officer's signature, issue order | Caseworker + officer | — | — |

**Total per order:** 3–6 hours of attention spread over 2–3 days, plus **₹1,000–₹2,000 in cash that comes out of the caseworker's salary**.

This is not a hypothetical pain. **The drafter market has existed in Karnataka revenue offices for decades.** We are not inventing demand. We are replacing the drafter — not the officer, not the typist.

---

## 3. Who pays for it, and why

This is the most important table in this whole document. **Get this wrong and the business model collapses.**

| Question | Answer |
|---|---|
| Who is the buyer? | The individual caseworker (DDLR, Tahsildar, ADLR, AC, or DC). |
| Whose money? | His own pocket. He is already spending it on private drafters today. |
| Does the department approve the purchase? | **No.** This is a personal subscription, like Netflix or ChatGPT. |
| Who signs the final order? | The officer, exactly as today. **Aadesh never signs.** |
| What does the officer think about it? | He sees a faster, cleaner draft. He still controls the decision. He is happier, not threatened. |
| Is this B2B or B2C? | **B2C, individual subscription.** Not government procurement — at least not yet. |

**The implication:** we do not need permission from the Karnataka government to start selling. We need permission from one caseworker. If he says yes and pays ₹500 instead of ₹1,500 to the drafter, we have a customer. Repeat 30 times and we are at break-even.

---

## 4. The product — a personal whiteboard

The cleanest analogy: **Aadesh AI is a personal whiteboard for the officer.**

A whiteboard is private. Only he uses it. He erases his old notes when he changes offices. Nobody else sees what is on it.

Concretely, that means:

1. Each officer creates his own login.
2. He uploads **20 of his own past, finalized orders.** The AI reads them and learns *his* drafting style — the way he opens orders, the legal phrases he uses, the section order, the way he closes.
3. From now on, when he uploads a new case, the AI drafts the order in **his** style — not in some generic AI style.
4. If he transfers to a new office, he deletes his old data and re-trains the AI on his new orders. Like wiping a whiteboard.
5. Nobody else sees his data. It is not a shared department system.

This personal-whiteboard design is the moat. A generic chatbot can write a Kannada legal order. It cannot write *this officer's* Kannada legal order. **That is what the customer pays for.**

---

## 5. Step-by-step user flow

Here is exactly what happens when a caseworker uses Aadesh AI for one order:

```
1. Caseworker logs into aadesh-ai.in
                ↓
2. Uploads case PDF (typically 40–60 scanned pages)
                ↓
3. AI reads the PDF and extracts the key facts:
   – party names
   – survey numbers and sub-divisions
   – village, taluk, district
   – case number and date
   – relief sought
                ↓
4. ENTITY LOCK SCREEN appears (unskippable)
   "Are these facts correct? Is anything wrong?
    Are there conflicts between pages?"
                ↓
5. Caseworker fixes anything wrong, types his own
   name as legal attestation
                ↓
6. AI asks 2–3 clarifying questions
   (e.g. "Is this a partition or a transfer order?")
                ↓
7. AI generates a full Kannada legal order in
   the officer's own drafting style
                ↓
8. Caseworker edits the draft in the browser
                ↓
9. Downloads as a .docx Word file
                ↓
10. Officer signs the printed copy. Order is issued.
                ↓
11. Aadesh saves an ASSISTANCE REPORT PDF —
    a receipt that proves the human verified
    every fact, with cryptographic hashes.
```

Total time: **15–25 minutes**, instead of 3–6 hours plus a private drafter.

---

## 6. The technology behind it

We chose the simplest stack that works. Every choice has a business reason.

| Layer | What we use | Why we picked it |
|---|---|---|
| Website | Next.js | Fast to build, runs on a small server, easy to maintain. |
| Hosting (today) | DigitalOcean Bangalore VPS | India-located, low cost for the pilot. **Note:** not MeitY-empanelled, so we will need to migrate to AWS Mumbai or Azure Pune before any government procurement deal. |
| Database | Supabase Mumbai | Stores orders, logs, payments. We are also setting up a self-hosted version because of the February 2026 India DNS block. |
| AI brain | Anthropic Claude (Sonnet) | Best Kannada quality on the market. Gemini 2.5 was tested and rejected — its content filter blocks Kannada entirely. Sarvam AI is now a competitor, not a partner, after their ₹247 crore government funding. |
| Cost optimisation | Anthropic prompt caching | Our 18,800-character system prompt is sent as one cached block. **Cuts cost per order by ~80%.** This is why we never split the prompt into multiple AI calls. |
| Payments | Razorpay | UPI + credit packs. Standard for Indian SaaS. Reports all transactions to GSTN monthly, so we register for GST when revenue crosses ₹15 lakh. |
| Output format | docxtpl + NFKC normalisation | Generates clean Sarakari Kannada `.docx` files that open correctly in MS Word and Nudi. |

**What we deliberately removed:** RAG pipelines, embeddings, vector databases. Claude's 200,000-token context window can hold all 20 reference orders directly. Less code, fewer failure points, lower cost. **One contiguous cached prompt is the architecture.**

---

## 7. The legal compliance design

Karnataka has a Responsible AI (RAI) Committee. There is a submission deadline of **May 12, 2026**, and the product must be classified as **human-in-the-loop**, never as autonomous AI. If we are classified wrong, the product can be banned.

To prove human-in-the-loop, we built six compliance layers. Plain-English explanation of each:

| # | Layer | What it does | Why it matters |
|---|---|---|---|
| 1 | **Entity Lock** | An unskippable screen that forces the human to verify the extracted facts before AI generates anything. | Proves the human checked the facts. |
| 2 | **Officer Reasoning Block** | Captures *why* the officer decided what he decided, in his own words. | Proves the human applied his mind, not just his eyes. |
| 3 | **Audit Log** | Server-side record of every step, every hash, every timestamp. | Proves the chain of custody if the order is ever challenged. |
| 4 | **Assistance Report PDF** | A receipt attached to every order showing what the AI did and what the human verified. | Public-facing proof of human authorship. |
| 5 | **Manifest Hash** | A SHA-256 cryptographic fingerprint of input PDF + output order + officer attestation, sealed before generation. | Proves nothing was tampered with after the fact. |
| 6 | **Digital Signature** | Aadhaar eSign or DSC signature on the manifest hash. | Court-grade proof of identity. *Deferred for the May launch — can ship in Phase 1.* |

**The legal effect:** if an Aadesh-drafted order ever goes to court, **the officer who signed it is the legal author.** Not the AI. Not Aadesh. This shifts BNS forgery liability away from us and onto the human signatory — exactly the same way it works today with private human drafters.

---

## 8. The business model

**Pricing:** credit/recharge packs. One order = one credit. Charged at successful download (not at AI generation, so failed drafts don't cost the user money).

| Phase | Price per order | Reason |
|---|---|---|
| Phase 1 (now) | Free or very low | Build trust with the first 10–30 caseworkers. Get them to talk to other caseworkers. |
| Phase 2 | **₹500 per order** | About one-third the cost of a private drafter. Enough margin to grow. |
| Phase 3 | ₹400 with bulk packs | Loyalty pricing once we have repeat users. |

**Unit economics, rough numbers per order:**

| Item | Cost |
|---|---|
| Anthropic Claude API (with caching, 25% regen buffer) | ~₹18–20 |
| Hosting and database share | ~₹2 |
| Payment processing (Razorpay) | ~₹10 |
| **Total cost per order** | **~₹30** |
| **Phase 2 price** | **₹500** |
| **Gross margin** | **~94%** |

**Break-even:** roughly **30 active paying caseworkers** at Phase 2 prices.

**Two-track go-to-market:**

1. **Track 1 (now):** Individual caseworkers buy credits with their own money. Word of mouth across districts. No procurement, no tendering, no committee.
2. **Track 2 (later):** Once enough individuals use it, departments will procure for whole offices. This requires MeitY-empanelled hosting (AWS Mumbai or Azure Pune), GST registration, and proper invoicing.

**We do not chase Track 2 first. We earn Track 2 by winning Track 1.**

---

## 9. Where we are today (April 26, 2026)

| Metric | Status |
|---|---|
| Live website | aadesh-ai.in — yes, live |
| Registered users | 6 |
| Test orders generated | 29 |
| Paying users | **0** |
| Active pilot user | Banu (DDLR Bangalore South) |
| System prompt version | V3.2.6 / V3.2.7, ~18,800 characters |
| Quality benchmark (best test config) | 98 / 100 against finalised officer orders |
| Quality benchmark (live app) | 78 – 85 / 100 (gap is closing) |
| Compliance layers fully built | 3 of 6 |
| Days to RAI submission deadline | **16** |

This is honest. We have a product, we have one real user, and we have not yet earned a single rupee.

---

## 10. The competitive landscape

| Who | What they do | Why we still have a shot |
|---|---|---|
| **Private human drafters** | Today's status quo | Slower, more expensive, no audit trail, no consistency between orders. We replace them, not the officer. |
| **Lexlegis** | Legal AI for lawyers | Built for litigation work, not for government drafting in Kannada. Different buyer, different product. |
| **Sarvam AI** | India-funded large language model | Generic infrastructure, not workflow-specific. They are a tool we *could* use; we are a product the user *wants* to use. |
| **Generic ChatGPT / Claude** | Anyone can paste a case file into a chatbot | No Entity Lock, no audit trail, no Kannada style learning, no legal scaffolding. The officer who uses ChatGPT is legally exposed. We make him safe. |

**Our moat is not the AI.** The AI is rented from Anthropic. **Our moat is the workflow + the personal drafting style + the audit trail that protects the officer.** A competitor who shows up next year has to rebuild trust officer by officer.

---

## 11. The roadmap

### Phase 0 — Now to May 5, 2026 (RAI submission prep)
- Patch the API bypass on `/api/pipeline/generate` so Entity Lock cannot be skipped
- Make the Entity Lock a hard server-side gate, not just a UI screen
- Ship the Assistance Report PDF (minimum viable version)
- One single source of truth for the prompt version (currently drifts across 3 versions in code)
- Be demo-ready for the RAI committee on May 12

### Phase 1 — May to August 2026 (commercial pilot)
- Self-hosted Supabase (the India DNS block in February 2026 is real)
- Get to **30 paying caseworkers** — break-even
- GST registration when revenue crosses ₹15 lakh
- Aadhaar eSign integration on the manifest hash

### Phase 2 — September 2026 onward (scale)
- Migrate to MeitY-empanelled hosting (AWS Mumbai or Azure Pune)
- First department-level procurement deal (Track 2)
- Workflow monitoring at scale (n8n or equivalent)
- Expansion beyond DDLR to Tahsildar, AC, and DC offices

---

## 12. The honest risks

A short list of what could kill us:

1. **Quality of the Kannada draft.** Hashes prove nothing if the draft itself is wrong. Our biggest real test is not the RAI committee — it is whether Banu's officer happily signs the AI-drafted order without rewriting half of it.
2. **Single AI vendor dependency.** We depend on Anthropic. If they go down or change pricing or block Indian traffic, we are exposed. Mitigation: keep an OpenRouter fallback warm.
3. **The May 12 deadline is real.** Missing it can mean classification as autonomous AI, which can mean the product gets banned in Karnataka.
4. **Zero paying users today.** Six testers and one Banu is not product-market fit. It is a strong signal, not proof.
5. **A bigger competitor with capital.** Sarvam AI now has ₹247 crore. Lexlegis has incumbent legal relationships. We have to move faster than they can copy.
6. **Hosting empanelment gap.** DigitalOcean is fine for individuals. The day a department wants to procure, we have 60 days to migrate or we lose the deal.
7. **Regulatory drift.** The DPDP Act, BNS forgery provisions, and RAI guidelines are all young and untested with AI-generated government orders. The rules can change.

---

## 13. Glossary

For anyone new to this domain:

| Term | Plain meaning |
|---|---|
| **DDLR** | District Deputy Land Records officer. The role our pilot user Banu serves. |
| **Tahsildar** | Block-level revenue officer in the Karnataka land administration. |
| **ADLR / AC / DC** | Other Karnataka land-revenue ranks above and around DDLR. |
| **Sarakari Kannada** | The formal Kannada legal/government dialect used in official orders. |
| **Entity Lock** | The unskippable screen that forces the human to verify facts before the AI drafts anything. Our most important compliance feature. |
| **Manifest hash** | A digital fingerprint (SHA-256) that proves the input, output, and human attestation were not tampered with. |
| **RAI Committee** | Karnataka's Responsible AI committee. Classifies AI products as human-in-the-loop or autonomous. |
| **BNS** | Bharatiya Nyaya Sanhita — the successor to the Indian Penal Code, including forgery provisions. |
| **Human-in-the-loop** | An AI system where a human approves the final output. This is the classification we need. |
| **MeitY-empanelled** | Government-of-India-approved cloud hosting. Required for any government procurement deal. |
| **Prompt caching** | Anthropic's technology that lets a long, fixed system prompt be stored and reused cheaply. Cuts our per-order cost by ~80%. |
| **Track 1 / Track 2** | Track 1 = individual caseworker subscriptions. Track 2 = department-level procurement deals. |

---

*Last updated: April 26, 2026.*
*Maintained by: Srinivasa T, founder, with Claude (Anthropic) as CTO co-pilot.*
