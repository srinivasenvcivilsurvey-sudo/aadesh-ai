<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Research the current state of AI tools for Indian legal document

drafting/generation as of early 2026:

1. List ALL known AI tools (commercial or open-source) that generate
legal documents in Indian regional languages (especially Kannada,
Hindi, Tamil, Telugu).
2. Specifically search for:
    - LexLegis.ai (Indian legal AI)
    - Sarvam AI Chanakya (government AI vertical)
    - CaseIQ / CaseMine / Manupatra AI features
    - Any AI tool used by Indian revenue officers or Tahsildars
    - Any AI tool for generating "Sarakari Kannada" (government Kannada)
3. Search GitHub for open-source repos related to:
    - Indian legal document generation
    - Kannada NLP / Kannada text generation
    - Indian court order drafting AI
    - Land revenue document automation India
    - "DDLR" OR "Tahsildar" OR "land revenue" AND "AI" OR "automation"
4. Search for any government-built digital tools used in Karnataka
land revenue offices:
    - Bhoomi (land records system)
    - Kaveri (registration system)
    - Mojini (survey system)
    - Any AI or automation layer on top of these systems
5. What AI4Bharat and IIT Madras are building for Indic language NLP —
any legal/government document focus?
6. Any Indian startups that raised funding for government document
AI in 2024-2026?
7. User reviews and real-world feedback for any of these tools —
are they actually working or just demos?
8. Any MCP servers, Claude Skills, or open-source plugins specifically
for Indian legal document work?

Provide links to GitHub repos, product websites, and user feedback
where available. Distinguish between "working products" vs
"research papers/demos."

I found a small but real set of Indian legal AI products, plus a much larger ecosystem of demos, research repos, and workflow plugins. The strongest “working product” signals right now are Lexlegis.ai, Sarvam AI’s Chanakya, and the AI features inside established legal research platforms like Manupatra and CaseMine, while most GitHub items are prototypes or domain-specific assistants rather than production-grade drafting systems.[^1][^2][^3][^4][^5]

## Working products

| Tool | What it does | Regional-language support | Status |
| :-- | :-- | --: | :-- |
| Lexlegis.ai | Indian-law research, summaries, drafting; public site says it has AI-driven research, document analysis, and drafting tools [^1][^6] | Not clearly advertised as Kannada/Hindi/Tamil/Telugu drafting on public pages I found [^1][^6] | Working product |
| Sarvam AI Chanakya | Government/regulated-sector AI stack for secure, on-prem, air-gapped deployments; built on Sarvam’s Indian-language models [^3][^7][^8] | 22 Indian languages are claimed in coverage of Chanakya [^7] | Working enterprise vertical, not a legal-drafting product per se |
| Manupatra AI | Demoed AI query on judgments and compare-judgments tools [^4] | No public evidence found of regional-language document generation in the results I searched | Working product with AI features |
| CaseMine | Legal research platform with AI/citation-analysis positioning and firm-data workflows [^5][^9] | No clear public evidence found of regional-language drafting | Working product with AI features |

## Regional-language drafting

I did not find a public Indian legal AI tool that clearly and explicitly advertises full legal-document generation in Kannada, Hindi, Tamil, and Telugu across all of those languages as of early 2026. The closest broad language coverage I found is Sarvam’s 22-language model stack, but that is framed as sovereign/institutional AI rather than a legal drafting product.[^7][^8]

For “Sarakari Kannada,” I did not find a dedicated AI product with that exact focus. What I did find is a lot of Indic-language infrastructure from AI4Bharat and IIT Madras that could support such a product, but it is not itself a government Kannada drafting tool.[^10][^11][^12]

## Government and revenue-office tools

Karnataka’s core land systems remain Bhoomi, Kaveri, and Mojini, and recent 2025–2026 reporting says the state is planning or rolling out AI-enabled upgrades such as Kaveri 3.0, Bhoomi 8.0, and a GIS-based Karnataka Land Stack that integrates Bhoomi, Mojini, Kaveri, e-Swathu, and e-Aasthi. I did not find evidence in the searched sources that these systems already expose a public AI drafting layer for Tahsildars or revenue officers; the public reporting is about digitisation, integration, and workflow modernization rather than automated legal drafting.[^13][^14][^15]

## Open-source GitHub repos

| Repo / project | Relevance | Status |
| :-- | :-- | :-- |
| `goru001/nlp-for-kannada` | Kannada NLP language models/classifiers [^16] | Research/open-source |
| `AI4Bharat/indicnlp_catalog` | Catalog of Indic NLP resources [^17][^18] | Research infrastructure |
| `Exploration-Lab/HLDC` | Hindi Legal Documents Corpus (912,568 docs) for downstream NLP/IR [^19] | Research corpus |
| `Mamlesh18/Legal-Document-Automation-Tool` | India-focused legal document assistant [^20] | Prototype/demo repo |
| `PritK99/Legal-Documentation-Assistant` | AI-powered legal documentation for India [^21] | Prototype/demo repo |
| `llSourcell/InstantLegalDotAI` | Legal document generator [^22] | Generic demo |
| `Land-Registry/LandRegistry-Frontend` | Blockchain land-records prototype for India [^23] | Prototype |
| `vrii14/Land-Registration-with-Blockchain` | Land registration prototype for India [^24] | Prototype |

I did not find a clearly production-ready open-source repo specifically for Indian court-order drafting AI or DDLR/Tahsildar land-revenue order generation. The repos I found cluster around corpora, NLP foundations, or generic document automation rather than government-grade drafting workflows.[^19][^20][^21]

## AI4Bharat and IIT Madras

AI4Bharat is explicitly focused on open-source datasets, tools, models, and applications for Indian languages, including generation, translation, ASR, and speech synthesis. Its IndicNLP resources and corpora are foundational rather than legal-specific, though they are directly relevant if you want to build legal/government drafting in Kannada, Hindi, Tamil, or Telugu.[^25][^26][^11][^10]

IIT Madras also hosts Indic TTS and related Indic language work, but the public material I found does not show a dedicated legal-document-generation line of products from IITM itself. In practical terms, these are enabling technologies, not end-user legal drafting systems.[^12][^10]

## Funding and startups

From the searched sources, Lexlegis.ai and Sarvam AI are the clearest Indian startup stories with visible scaling or funding-related momentum in 2024–2026; Sarvam’s Chanakya coverage mentions discussions with NVIDIA and HCLTech about growth capital, while Lexlegis has public launch/expansion coverage and a 2026 on-device legal intelligence announcement. I did not find a strong list of multiple 2024–2026 Indian startups specifically raising money for government-document AI in the searched sources, so this area looks more like emerging pilot activity than a crowded market.[^27][^28][^3][^7]

## Real-world feedback

The most concrete “real-world feedback” I found is mostly demo-style evidence: Manupatra has public AI demo videos, and a lot of GitHub projects describe intent and features but do not show institutional deployment or user adoption data. Lexlegis has stronger product claims and media coverage, but the public sources I found still do not provide independent user-review volume or verified adoption metrics.[^2][^28][^4][^29][^20][^21][^1]

## MCP servers and plugins

I found multiple Indian-law MCP/plugin efforts for Claude and AI clients, including an “Indian law plugin” with specialist agents and protocols, an Indian legal assistant MCP server described on LinkedIn, and an eCourts MCP server for case access and summaries. These are promising for legal workflows, but they are clearly community/open-source or creator-led tools rather than official government systems.[^30][^31][^32][^33]

If you want, I can turn this into a sharper spreadsheet-style deliverable next: **tool name, URL, language support, drafting ability, status, and my confidence rating**.
<span style="display:none">[^34][^35][^36][^37][^38][^39][^40][^41][^42][^43][^44][^45][^46][^47][^48][^49][^50][^51][^52][^53][^54][^55][^56][^57][^58][^59][^60]</span>

<div align="center">⁂</div>

[^1]: https://lexlegis.ai

[^2]: https://www.artificiallawyer.com/2024/08/27/india-joins-legal-specific-llm-movement-with-lexlegis-ai/

[^3]: https://economictimes.com/tech/technology/sarvam-ais-new-vertical-chanakya-to-address-problems-of-national-consequence/articleshow/129882533.cms

[^4]: https://www.youtube.com/watch?v=CYyBztH8Pvo

[^5]: https://www.casemine.com

[^6]: https://lexlegis.ai/about/

[^7]: https://www.newsbytesapp.com/news/business/sarvam-ai-launches-chanakya-to-deliver-secure-ai-for-government/tldr

[^8]: https://www.youtube.com/watch?v=NL_S7L6i3EY

[^9]: https://www.casemine.com/blog/best-legal-research-tools-2026-india-ai

[^10]: https://ai4bharat.iitm.ac.in

[^11]: https://wsai.iitm.ac.in/blogs/leveling-up-nlp4-indian-langs/

[^12]: https://www.iitm.ac.in/donlab/indictts

[^13]: https://realty.economictimes.indiatimes.com/news/industry/karnataka-to-roll-out-ai-based-kaveri-3-0-registration-system-gis-land-stack-under-budget-2026/129193299

[^14]: https://propnewstime.com/getdetailsStories/MjczOTI=/karnataka-to-launch-ai-driven-kaveri-3-0-and-gis-land-stack-for-property-registration

[^15]: https://indianexpress.com/article/cities/bangalore/karnataka-bhoomi-8-kaveri-3-land-records-budget-2026-10568042/

[^16]: https://github.com/goru001/nlp-for-kannada

[^17]: https://github.com/AI4Bharat/indicnlp_catalog

[^18]: https://ai4bharat.github.io/indicnlp_catalog/

[^19]: https://github.com/Exploration-Lab/HLDC

[^20]: https://github.com/Mamlesh18/Legal-Document-Automation-Tool

[^21]: https://github.com/PritK99/Legal-Documentation-Assistant

[^22]: https://github.com/llSourcell/InstantLegalDotAI

[^23]: https://github.com/Land-Registry/LandRegistry-Frontend

[^24]: https://github.com/vrii14/Land-Registration-with-Blockchain

[^25]: https://indicnlp.ai4bharat.org/pages/indicnlp-resources/

[^26]: https://indicnlp.ai4bharat.org/pages/home/

[^27]: https://www.tribuneindia.com/news/business/lexlegis-ai-introduces-local-on-desk-ai-legal-intelligence-powered-by-nvidia-dgx-spark-and-nvidia-nemotron/

[^28]: https://www.newswire.ca/news-releases/lexlegis-ai-transforms-legal-research-with-ai-in-india-and-is-set-to-expand-globally-870019939.html

[^29]: https://www.theweek.in/wire-updates/business/2024/08/22/dcm24-lexlegis.ai.html

[^30]: https://www.linkedin.com/posts/brahm-sareen_aiagents-contractdrafting-playbooks-activity-7382240973906571264-At92

[^31]: https://github.com/swarochish/indian-law-plugin

[^32]: https://mcpmarket.com/zh/server/ecourts

[^33]: https://mcpmarket.com/server/indian-law

[^34]: https://punemirror.com/technology/ai/sarvam-ai-chanakya-secure-air-gapped-ai/

[^35]: https://www.varindia.com/news/Sarvam-launches-‘Chanakya’-for-secure,-high-stakes-AI-applications

[^36]: https://scitechanddigital.news/2024/08/22/lexlegis-ai-transforms-legal-research-with-ai-in-india-and-is-set-to-expand-globally/

[^37]: https://github.com/topics/kannada-nlp

[^38]: https://github.com/dhruvsinha/Natural-Language-Processing-for-Indic-Languages

[^39]: https://gist.github.com/thammegowda/7124c766f57c24ef5f7a7f1d996aa4f0

[^40]: https://github.com/nijdarshan/democratizing-ai-kannada

[^41]: https://github.com/sudhanvabharadwaj/Kannada-Language-Detection-Translation-System

[^42]: https://github.com/roshal-moraes/named_entity_recognition_kannada

[^43]: https://github.com/The-Origin-Labs/landate

[^44]: https://github.com/TilakD/Kannada-Natural-Language-Processing---Deep-Learning

[^45]: https://ai4bharat.iitm.ac.in/resources/

[^46]: https://www.scribd.com/document/969435546/nl16

[^47]: https://arxiv.org/abs/2005.00085

[^48]: https://github.com/AI4Bharat/indicnlp.ai4bharat.org/blob/master/content/pages/home.md

[^49]: https://arxiv.org/html/2411.00727v1

[^50]: https://www.reddit.com/r/ClaudeAI/comments/1r4evfs/i_built_a_plugin_that_gives_claude_code_deep/

[^51]: https://github.com/evolsb/claude-legal-skill

[^52]: https://mcpmarket.com/tools/skills/legal-opinion-drafter-for-indian-law

[^53]: https://www.legitquest.com/act/maharashtra-land-revenue-qualification-for-conferral-of-powers-of-assistant-or-deputy-collector-or-tahsildar-rules-1968/C967

[^54]: https://www.linkedin.com/pulse/claude-code-skills-unleashed-your-complete-guide-legal-anand-j-rai-f4fic

[^55]: https://supremetoday.ai/issue/how-to-file-complaint-against-tahsildar-\&-rdo

[^56]: https://open.substack.com/pub/novehiclesinthepark/p/anthropics-open-source-legal-skills?r=3wpgsc

[^57]: https://www.youtube.com/watch?v=E41oIIz2qYs

[^58]: https://app.draftbotpro.com/doc/179460986

[^59]: https://findskill.ai/courses/legal-professionals/

[^60]: https://www.pulsemcp.com/servers/gh-rithik-cmyk-ecourts-india

