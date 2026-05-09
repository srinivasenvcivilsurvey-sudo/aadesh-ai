# Prompt Caching for Claude Sonnet 4.6 via OpenRouter (April 2026)

## Executive Overview

OpenRouter fully supports Anthropic’s prompt caching for Claude Sonnet 4.6, including both automatic (top‑level) and explicit `cache_control` usage, with minimum cacheable length of 2,048 tokens and cache TTLs of 5 minutes or 1 hour. For large contexts around 100k tokens, Anthropic’s own benchmarks and third‑party tests show time‑to‑first‑token (TTFT) reductions of roughly 70–80% when the entire prefix is cached, and these gains apply through OpenRouter because it forwards Anthropic cache semantics and pricing.[^1][^2][^3][^4][^5][^6]

Sticky routing on OpenRouter keeps conversations pinned to the same Anthropic backend where possible, but it is explicitly documented as “best effort,” so cache misses will still occur on provider failover or when prompts differ before the cache breakpoint; real‑world reports show both significant savings when configured correctly and confusion or bugs when client libraries misplace `cache_control` fields or route to non‑Anthropic providers. Prompt caching is language‑agnostic (it operates on tokens, not semantics), so caching 120k tokens of Kannada text behaves and bills the same as English at a given token count. Sonnet 4.6’s 1M‑token context window can be combined with caching without special configuration, and is one of the main intended use cases for Anthropic’s caching design.[^7][^8][^9][^10][^11][^12][^6][^13][^1]

***

## 1. Support in OpenRouter for Sonnet 4.6 (automatic and explicit)

OpenRouter’s prompt‑caching guide lists Claude Sonnet 4.6 among the models that support both automatic and explicit prompt caching. For Anthropic Claude models, OpenRouter exposes two mechanisms:[^1]

- **Automatic caching (top‑level `cache_control`)**: Add a single `cache_control` object at the root of the request (alongside `model` and `messages`); the router and Anthropic then automatically choose the last cacheable block and advance the cache breakpoint as the conversation grows.[^1]
- **Explicit cache breakpoints (per‑block `cache_control`)**: Attach `cache_control` to individual content blocks (e.g. a `text` block containing a long reference doc) to precisely control what gets cached; Anthropic supports up to four explicit breakpoints per request, which OpenRouter passes through.[^14][^1]

The OpenRouter docs specify that automatic top‑level `cache_control` is supported only when routing to Anthropic’s native endpoint; if that field is present, OpenRouter restricts routing to Anthropic and excludes Bedrock and Vertex to ensure compatibility. For explicit, per‑block cache markers, OpenRouter can route to Anthropic, Bedrock, or Vertex, because those intermediaries support Anthropic‑style `cache_control` on individual blocks.[^1]

Third‑party ecosystem docs (Agno, n8n, Spring AI) note that OpenRouter can be used as a unified endpoint while still enabling Anthropic prompt caching by passing `cache_control` through the OpenRouter provider options, further confirming end‑to‑end support.[^15][^16][^17]

**Bottom line:** Sonnet 4.6 via OpenRouter supports both automatic (top‑level) and explicit prompt caching, as long as requests are routed to Anthropic providers that advertise cache_control support.

***

## 2. Real‑world latency at 100k–130k cached context

### Benchmarked 100k‑token example (Anthropic API)

Anthropic’s public prompt‑caching announcement and subsequent analyses provide a concrete 100,000‑token benchmark:

- **Chatting with a 100k‑token book (cold request, no cache):** time to first token ≈ 11.5 seconds.[^5][^6][^18]
- **Same 100k‑token prefix with a warm cache:** time to first token ≈ 2.4 seconds, a ~79% reduction in latency and ~90% reduction in cost for cached input tokens.[^6][^18][^5]

These numbers were published for Claude 3.5 Sonnet, but they reflect Anthropic’s general caching implementation (KV‑cache reuse on identical prefixes), which is shared by later Sonnet 4.x models, including 4.6.[^11][^6]

### Long‑context latency scaling and caching impact

Independent long‑context experiments for Claude Opus 4.6 and Sonnet 4.6 report that:

- At **500k+ tokens of cold context**, initial TTFT can exceed 30 seconds as the model performs a full prefill over the entire input.[^9][^10]
- With a **warm cache**, additional turns at the same context size “only add a few seconds” of extra latency, because the model reuses cached KV tensors rather than recomputing them.[^10][^9]

A general latency/cost study by Ngrok notes that for “long enough” prompts, prompt caching can reduce TTFT by up to **85%** when the entire input prefix is cached. These results are consistent with Anthropic’s own 100k book example and other third‑party guides that tabulate ~70–80% latency reductions for 50k–100k token contexts.[^19][^11][^6]

### OpenRouter‑specific observations

OpenRouter does not publish separate latency numbers for Anthropic versus direct Anthropic API, but its Sonnet 4.6 model pages and cost calculators show similar TTFT metrics (on the order of 1–2 seconds at typical context sizes) and explicitly expose cache read/write pricing, indicating that Anthropic’s caching behavior and economics are preserved. Because OpenRouter forwards requests to Anthropic and operates caching at the provider level, TTFT improvements from caching on 100k–130k contexts should mirror the Anthropic benchmarks when:[^20][^21]

- The entire 100k–130k context lies before a cache breakpoint and remains byte‑identical between calls.
- Provider routing keeps the conversation stuck to the same Anthropic backend (see §3 on sticky routing).

### Caveats from developer feedback

Developers have reported cases where **prompt caching appears to give little or no latency improvement**, even though cache reads are recorded, especially at mid‑range context sizes (20k–180k). In these reports, TTFT stayed around 3–4 seconds regardless of whether the content was cached, suggesting that network overhead, provider queueing, and model loading can dominate latency when the cached prefix is not extremely large or the provider is under high load.[^22][^23]

**Practical expectation at 100k–130k tokens:** when using Sonnet 4.x with a fully cached 100k‑token prefix, real‑world TTFT is typically observed to drop from ~10–12 seconds into the low‑single‑digit seconds (≈2–4 seconds), assuming stable infrastructure and a warm cache. This range is derived from Anthropic’s official 100k book example and corroborating third‑party measurements, and should hold when accessing Sonnet 4.6 through OpenRouter as long as routing and cache configuration are correct.[^9][^11][^5][^6]

***

## 3. Provider sticky routing and cache warmth on OpenRouter

OpenRouter’s prompt‑caching guide describes **provider sticky routing** as a core feature for keeping caches warm:[^1]

- After a request that uses prompt caching, OpenRouter records which provider handled it.
- Subsequent requests for the *same model and conversation* are routed to that same provider, so long as doing so is cheaper than recomputing without cache reads.
- Sticky routing is tracked at the **account + model + conversation** granularity, where a conversation is keyed by a hash of the first system/developer message and the first non‑system message.

The docs emphasize that sticky routing is **best‑effort**:

- If the sticky provider becomes unavailable or unhealthy, OpenRouter will fail over to another provider, which will not have the cached KV state, resulting in a cold recompute and cache miss.[^8][^1]
- Sticky routing is **disabled** when the client specifies an explicit `provider.order` or other routing options that override automatic provider choice.[^24][^1]

### Real‑world developer feedback

Several public issues and discussions highlight practical behaviors:

- Zed’s issue tracker notes that OpenRouter “makes a best‑effort to continue routing to the same provider to make use of the warm cache,” but will fall back to other providers when necessary, reinforcing that sticky routing is not a hard guarantee.[^8]
- Reddit and SillyTavern users report inconsistent cache hits when routing to Claude models via OpenRouter, with advice to pin the provider to Anthropic and avoid Bedrock/Vertex for caching, since their cache semantics and support can differ.[^25][^13]
- Other posts describe caching behavior as “a bit random” over long sessions, suggesting that TTL expiry, prefix changes (e.g., lorebook insertion), or provider failover can cause unanticipated cache misses even when caching is nominally enabled.[^26][^25]

**Conclusion:** OpenRouter’s sticky routing greatly increases cache hit probability for a given conversation, but it cannot guarantee cache warmth. For high‑stakes workflows, it is prudent to:

- Prefer Anthropic as the primary provider and disable fallbacks when caching is critical.[^13][^24]
- Keep the initial system + first user messages stable to maintain conversation identity.

***

## 4. Cache TTL and 1‑hour sessions on OpenRouter

OpenRouter’s Anthropic section explicitly documents two TTLs:[^1]

- **5‑minute TTL (default):** `"cache_control": { "type": "ephemeral" }`
- **1‑hour TTL:** `"cache_control": { "type": "ephemeral", "ttl": "1h" }`

These mirror Anthropic’s own API, which states that automatic caching uses a 5‑minute TTL by default, with an optional 1‑hour TTL at a higher write price. OpenRouter further clarifies pricing for Anthropic cache operations:[^27][^6]

- **5‑minute TTL cache writes:** billed at 1.25× base input token price.
- **1‑hour TTL cache writes:** billed at 2× base input token price.
- **Cache reads:** billed at 0.1× base input token price, regardless of TTL.[^3][^1]

Community tooling (e.g., n8n’s OpenRouter Claude node proposals) explicitly expose a TTL choice between 5 minutes and 1 hour, confirming that 1‑hour TTL works end‑to‑end when using OpenRouter as the gateway. Long‑context practitioners also note that 1‑hour TTL is useful when users may pause for tens of minutes between turns, as it avoids repeated expensive cache rewrites.[^28][^15][^3]

**Relevance to your use case:** for officers who may take 15–30 minutes between orders, configuring `ttl: "1h"` on cacheable segments (or at the top level for automatic caching) is specifically designed to keep the static context warm for the entire working session.

***

## 5. Minimum token count for caching (Sonnet 4.6)

OpenRouter’s Anthropic section includes a per‑model **minimum cacheable prompt length** table:[^1]

- **Claude Sonnet 4.6:** 2,048 tokens minimum.
- **Claude Sonnet 4.5 / Sonnet 4 / Sonnet 3.7:** 1,024 tokens minimum.
- **Claude Opus 4.6 / 4.5 & Haiku 4.5:** 4,096 tokens minimum.

Independent guides on Anthropic prompt caching agree with these thresholds, listing 2,048 tokens as the Sonnet 4.6 minimum and 1,024 tokens for earlier Sonnet models, while emphasizing that prompts shorter than the model‑specific threshold will **not** be cached even if `cache_control` is present.[^2][^4]

Earlier Anthropic docs for Claude 3.x stated a 1,024‑token minimum for Sonnet 3.5/3.7, which likely explains conflicting older sources. For Sonnet 4.6 specifically, the current OpenRouter and ecosystem documentation consistently point to **2,048 tokens** as the minimum for caching to activate.[^29][^30][^4][^1]

***

## 6. Real‑world 100k+ cached context with Sonnet 4.6 via OpenRouter

As of April 2026, there are **few public, quantitative case studies** that explicitly combine all three of: Sonnet 4.6, 100k+ cached context, and OpenRouter as the gateway. Most detailed 100k+ caching benchmarks are either:

- Anthropic‑direct API examples (e.g., the 100k book benchmark in Anthropic’s own prompt‑caching announcement).[^5][^6]
- General Claude Code 400k‑token session analyses that focus on Anthropic’s hosted IDE (Claude Code) rather than OpenRouter.[^4][^28]

That said, several indicators show that **OpenRouter is used in practice for long‑context Sonnet 4.x workloads with caching**:

- OpenRouter’s Anthropic model pages and cost tools advertise 1M‑token context, cache read/write pricing, and long‑context use cases for Sonnet 4.6, implying production‑style workloads in the 100k–1M token range.[^31][^32][^20]
- OpenRouter’s February Release Spotlight mentions that long‑context generations (100k–1M tokens) are “surging” and highlights Sonnet 4.6 benchmarks, suggesting significant user traffic at those sizes.[^33]
- Developer posts and videos on Sonnet 4.6 frequently mention OpenRouter as one of the primary ways to access the model for 1M‑context coding and agent workflows, though they rarely publish raw TTFT numbers.[^34][^35]

Given that OpenRouter forwards Anthropic’s caching semantics and pricing almost transparently, the performance characteristics observed in Anthropic’s own 100k–400k token caching benchmarks (e.g., 79% TTFT reduction at 100k, high cache hit rates in long Claude Code sessions) should apply when those same prompts are sent via OpenRouter with Anthropic as the provider. However, there is currently no widely cited, open‑source benchmark specifically titled “100k+ cached context with Sonnet 4.6 via OpenRouter,” so any expectations must extrapolate from Anthropic‑direct measurements.[^4][^6][^9]

***

## 7. Bugs, issues, and gotchas reported for Anthropic caching via OpenRouter

### Provider and endpoint mismatches

Several issues arise from attempting to enable caching on models or providers that do not support it:

- In the Roo Code tracker, enabling prompt caching for certain OpenRouter‑proxied models results in `404 No endpoints found that support cache control`, indicating that the selected provider (e.g., OpenAI‑backed route or a non‑Anthropic provider) did not advertise `cache_control` support.[^36][^37]
- Reddit users report “You do not have access to explicit prompt caching” errors when trying to enable caching via OpenRouter, usually traced to account‑level access or routing to providers that do not yet expose Anthropic’s explicit caching.[^38]

**Mitigation:** ensure that `provider.order` prioritizes Anthropic and that `require_parameters` or similar flags are used so OpenRouter only chooses providers that support `cache_control`.[^13][^24]

### Misplaced `cache_control` in nested content

Anthropic’s schema requires that `cache_control` be at the same level as `type` in a content block (e.g., a `text` or `file` block), which can conflict with how some OpenAI‑compatible SDKs or OpenRouter adapters nest file content.[^7][^14]

A GitHub issue in the `ai-sdk-provider` repository shows prompt caching “not working” for Anthropic models via OpenRouter until the developer writes a custom `fetchWithCaching` wrapper that:

- Parses the outgoing request body.
- Walks each message’s `content` array.
- For `file` type content where OpenRouter has nested `file.file_data`, manually inserts `cache_control: { type: 'ephemeral' }` alongside `type` so that Anthropic’s backend sees it properly.[^7]

Without this fix, Anthropic never recorded cache writes/reads even though the high‑level SDK appeared to be setting caching options, because the markers ended up at the wrong nesting level.[^7]

### Dynamic prefixes and lorebooks

Multiple SillyTavern/OpenRouter threads describe prompt caching not working when **dynamic prefix content** (e.g., lorebooks, world‑info, automatic metadata) inserts tokens before the cache breakpoint, thereby invalidating cache keys between turns.[^25][^13]

Users report that caching starts working reliably once they:

- Stabilize the prefix (system prompt + static context) and move dynamic insertions to later in the prompt.
- Disable or reconfigure features that mutate the cached portion of the context between messages.[^25]

### TTL expiry and perceived randomness

Because Anthropic’s standard cache TTL is 5 minutes (unless 1‑hour TTL is explicitly configured), long pauses between user messages can silently expire caches. Some users interpret this as “random” caching behavior over multi‑hour sessions, especially when combined with provider failover.[^27][^28]

OpenRouter’s own docs reiterate that caches are ephemeral and that sticky routing is best‑effort, which aligns with reports of occasional cache misses even in otherwise stable sessions.[^26][^8][^1]

***

## 8. Direct Anthropic API vs OpenRouter for prompt caching

### Semantic behavior and cache hit mechanics

Anthropic’s prompt caching semantics are defined at the API level: exact prefix matching up to a cache breakpoint, TTL‑based expiry (5 minutes or 1 hour), and up to four explicit cache breakpoints per request. OpenRouter explicitly forwards these semantics and does not implement its own Anthropic‑specific caching layer; instead, it configures routing to providers that support Anthropic’s `cache_control` and adds sticky routing on top.[^39][^14][^27][^1]

This means that **cache hit logic and latency improvements should be identical** between direct Anthropic and Anthropic‑via‑OpenRouter **when**:

- The request body received by Anthropic is the same (same `system`, `tools`, `messages`, `cache_control` placement).
- Both are routed to Anthropic’s native endpoint (not Bedrock/Vertex variants).[^14][^1]

### Pricing differences

Direct Anthropic pricing for Sonnet 4.6 lists base input at 3.00 per million tokens and output at 15.00 per million tokens, with cache write/read multipliers of 1.25× and 0.1× respectively (and 2× for 1‑hour TTL cache writes). OpenRouter’s model pricing tables for `openrouter/anthropic/claude-sonnet-4.6` show the same base prices and explicitly list cache read/write prices, suggesting that OpenRouter passes through Anthropic’s pricing (possibly adding its own margin in some cases, but still exposing the underlying multipliers).[^40][^21][^3][^20][^31]

In practice:

- **Direct Anthropic:** simplest and sometimes slightly cheaper if using Anthropic exclusively and not benefiting from OpenRouter‑level promotions or bundled pricing.
- **OpenRouter:** may offer access to multiple Anthropic providers (Anthropic, Bedrock, Vertex) with effective pricing per provider, plus a unified routing and billing layer.[^41][^1]

### Reliability and cache hit rates

Pros of direct Anthropic for caching:

- No intermediate router; fewer moving parts, so fewer potential routing misconfigurations.
- Full control over beta headers, 1M context toggles, and new caching features as soon as they ship.[^27][^14]

Pros of OpenRouter:

- Provider sticky routing that tries to keep long‑context conversations pinned to the same Anthropic backend, improving cache hit probability while still offering failover.[^1]
- Unified logging of `cached_tokens` and `cache_write_tokens` via the `prompt_tokens_details` usage field, accessible from a single activity log across providers.[^1]

Cons of OpenRouter for caching:

- Additional complexity in routing configuration (provider order, fallbacks, require_parameters) that can accidentally route to non‑Anthropic or non‑caching endpoints, yielding cache misses or 404 errors on `cache_control`.[^36][^13]

**Net:** in a well‑configured setup that pins Anthropic as provider and passes `cache_control` correctly, cache hit rates and latency benefits should be very similar between direct Anthropic and OpenRouter. OpenRouter introduces extra flexibility and observability at the cost of additional configuration surface area.

***

## 9. Kannada (non‑English) text and caching behavior/pricing

Prompt caching operates at the **token sequence** level, not at the level of human language semantics. Anthropic and OpenRouter describe caching in terms of input tokens, KV tensors, and hashed prompt prefixes, with no special cases for languages.[^39][^11][^6][^14]

Key implications for 120k tokens of Kannada context:

- **Behavior:** As long as the tokenized prefix up to the cache breakpoint is identical between calls, it will cache and hit just like English text, regardless of the underlying script (Kannada, Devanagari, Latin, etc.).[^11][^14]
- **Pricing:** Billing for base input tokens, cache writes, and cache reads is always denominated in token counts; there is no separate pricing tier by language.[^3][^20]
- **Practical difference:** Depending on the tokenizer, the *number* of tokens required to encode a given amount of Kannada text may differ from English (e.g., more tokens per character), so “120k tokens” of Kannada may represent fewer visible characters or words than 120k English tokens, but the caching rules and economics are identical.[^6][^11]

No documentation or public discussion as of April 2026 suggests any language‑dependent behavior in Anthropic or OpenRouter prompt caching.

***

## 10. Using prompt caching with the 1M context window

Anthropic’s Sonnet 4.6 and Opus 4.6 support a **1M token context window**, initially in beta and then generally available for certain tiers, specifically to enable whole‑codebase and multi‑document workloads. Long‑context guides emphasize that prompt caching is the **primary cost and latency optimization** at 200k–1M token contexts, storing KV tensors for huge prefixes so that subsequent turns avoid full recomputation.[^12][^42][^21][^10][^9]

OpenRouter’s model tables and calculators list `openrouter/anthropic/claude-sonnet-4.6` with a 1,000,000‑token max input and separate cache read/write pricing, indicating that both features (1M context and caching) are available simultaneously through the gateway.[^32][^20][^31]

No special configuration flags are required at the OpenRouter layer beyond:

- Using a Sonnet 4.6 model entry that exposes the 1M context window.[^21][^20]
- Structuring prompts so that the long, stable portion of the 1M context lies before a cache breakpoint and remains unchanged between calls.[^9][^14]
- Optionally specifying `ttl: "1h"` on cacheable segments if long idle gaps between turns are expected.[^3][^1]

Developers experimenting with 1M context report that while cold TTFT at 500k–1M tokens can be 30–60+ seconds, cached turns bring this down to only a few additional seconds on top of normal generation latency, making the combination of 1M context and caching central to making such workloads practical.[^43][^10][^9]

***

## Practical design recommendations for your workflow

Based on current documentation and field reports, the following patterns are recommended for building a Sonnet 4.6 + OpenRouter workflow with 100k–120k Kannada legal context:

- **Target 2,048+ stable tokens in the cached prefix.** Ensure that your system prompt plus static officer/department instructions and any shared legal boilerplate exceed Sonnet 4.6’s minimum and are placed before the cache breakpoint.[^4][^1]
- **Use top‑level automatic caching for officer‑specific conversations.** Add `"cache_control": { "type": "ephemeral", "ttl": "1h" }` at the request root so that Anthropic automatically tracks the cache breakpoint as orders accumulate.[^27][^1]
- **Pin Anthropic as provider and keep prefixes stable.** In OpenRouter, configure `provider.order` with Anthropic first and consider disabling fallbacks for critical sessions; avoid inserting dynamic data (timestamps, random IDs, lorebooks) before the cache breakpoint.[^24][^13][^25]
- **Monitor `prompt_tokens_details` for cache health.** Use OpenRouter’s activity logs or `/api/v1/generation` to verify `cached_tokens` and `cache_write_tokens` behavior in production.[^1]
- **Plan for TTL gaps.** If officers may pause longer than 5 minutes, always use the 1‑hour TTL and design UI flows that keep user input relatively frequent (e.g., structured steps, confirmations) to avoid unintentional cold restarts.[^28][^3]

These patterns align with Anthropic’s and OpenRouter’s documented behaviors and with field reports from developers building long‑context, cached Sonnet workflows.

---

## References

1. [Prompt Caching | Reduce AI Model Costs with OpenRouter](https://openrouter.ai/docs/guides/best-practices/prompt-caching) - Reduce your AI model costs with OpenRouter's prompt caching feature. Learn how to cache and reuse re...

2. [Designing for Prompt Cache Hits: How to Save 90% on LLM Input ...](https://www.tokenoptimize.dev/guides/designing-for-prompt-cache-hits) - Prompt cache reads cost 10x less than regular input tokens. Learn how to structure your prompts to m...

3. [Claude Sonnet 4.6 in Production: Capability, Safety, and ...](https://caylent.com/blog/claude-sonnet-4-6-in-production-capability-safety-and-cost-explained) - Prompt caching is still the highest-leverage cost optimization for repeated large context. Cache rea...

4. [Claude Code cache hit rate increased to 95% - WentuoAI API](https://blog.wentuo.ai/en/claude-code-prompt-caching-token-optimization-reduce-input-cost-guide-en.html)

5. [Anthropic's Prompt Caching for Claude Models Cuts Costs, Latency](https://www.ainews.com/p/anthropic-s-prompt-caching-for-claude-models-cuts-costs-latency) - Anthropic’s prompt caching for Claude models reduces costs by up to 90% & latency by up to 85%. Now ...

6. [Prompt caching with Claude](https://www.claude.com/blog/prompt-caching) - Claude caches frequently used context between API calls, reducing costs and latency for long prompts...

7. [Prompt caching for Anthropic is not working even with the new options](https://github.com/OpenRouterTeam/ai-sdk-provider/issues/35) - We have tried adding the following in three different versions: providerOptions: { openrouter: { // ...

8. [AI: Zed does not use OpenRouter's cache feature for ...](https://github.com/zed-industries/zed/issues/37528) - Summary Zed does not use OpenRouter's cache feature for supported models Description Steps to trigge...

9. [Claude Code: 1M Context Power](https://www.verdent.ai/guides/claude-code-1m-context-window) - Prompt caching is your primary cost and latency optimization lever at long context. The cache stores...

10. [Claude Code 1M Context Window: Cost, Limits, and When to ...](https://www.claudecodecamp.com/p/claude-code-1m-context-window) - For Long Sessions, Stick to 200K. Claude Opus 4.6 and Sonnet 4.6 now support a 1 million token conte...

11. [Prompt caching: 10x cheaper LLM tokens, but how?](https://ngrok.com/blog/prompt-caching/) - A far more detailed explanation of prompt caching than anyone asked for.

12. [Claude Sonnet 4.6 Deep Dive: Opus-Level Intelligence at Sonnet Pricing](https://www.linkedin.com/pulse/claude-sonnet-46-deep-dive-opus-level-intelligence-pricing-steven-cen-z6sxc) - Quick answer: Claude Sonnet 4.6, released by Anthropic on February 17, 2026, is a hybrid-reasoning A...

13. [Prompt Caching Isn't Working : r/SillyTavernAI - Reddit](https://www.reddit.com/r/SillyTavernAI/comments/1pqzwis/prompt_caching_isnt_working/) - On openrouter, make sure you're setting the preferred provider to Anthropic. Vertex and bedrock supp...

14. [See more](https://docs.claude.com/en/docs/build-with-claude/prompt-caching?wtime=812s)

15. [Add Prompt Caching Support for Anthropic Models in OpenRouter ...](https://community.n8n.io/t/add-prompt-caching-support-for-anthropic-models-in-openrouter-chat-model-node/247039) - OpenRouter Chat Model The idea is: Add prompt caching configuration to the OpenRouter Chat Model nod...

16. [OpenRouter - Agno](https://docs.agno.com/models/providers/gateways/openrouter/overview) - Use OpenRouter unified API with Agno agents.

17. [Prompt Caching Support in Spring AI with Anthropic Claude](https://spring.io/blog/2025/10/27/spring-ai-anthropic-prompt-caching-blog) - In their announcement, a 100K ... For additional information, see the Spring AI Anthropic documentat...

18. [What to know about Claude's prompt caching feature - TechTalks](https://bdtechtalks.substack.com/p/what-to-know-about-claudes-prompt) - Claude's new prompt caching feature enables you to considerably cut the costs of using the LLM and m...

19. [How to Use Prompt Caching in Claude API: Complete 2026 Guide ...](https://www.aifreeapi.com/en/posts/claude-api-prompt-caching-guide) - Master Claude API prompt caching with this comprehensive guide. Get production-ready code examples i...

20. [Claude Sonnet 4.6 Pricing & Specs | AI Models | CloudPrice](https://cloudprice.net/models/openrouter%2Fanthropic%2Fclaude-sonnet-4.6) - Compare Claude Sonnet 4.6 AI model pricing, specifications, and capabilities. View input/output toke...

21. [claude-sonnet-4.6 Cost Calculator - OpenRouter | Bifrost - Maxim AI](https://www.getmaxim.ai/bifrost/llm-cost-calculator/provider/openrouter/model/claude-sonnet-4.6)

22. [Help! Prompt caching is giving worse latency](https://www.reddit.com/r/ClaudeAI/comments/1oiq1li/help_prompt_caching_is_giving_worse_latency/) - Help! Prompt caching is giving worse latency

23. [Understanding how to optimize LLMs - AI with Aish - Substack](https://aishwaryasrinivasan.substack.com/p/understanding-how-to-optimize-llms) - Decoding the Delays: Time to First Token (TTFT) and Inter-Token Latency (ITL) ... Claude Sonnet 4.6:...

24. [Provider Routing | OpenRouter](https://openrouter.ai/docs/provider-routing?amp=&amp=) - Route requests across multiple providers

25. [[Help Needed] Claude Prompt Caching Not Working on OpenRouter](https://www.reddit.com/r/SillyTavernAI/comments/1o3rrv1/help_needed_claude_prompt_caching_not_working_on/) - My goal is to reduce API costs by using the built-in prompt caching feature with Claude on OpenRoute...

26. [If you have issues with prompt caching and you don't know why](https://www.reddit.com/r/SillyTavernAI/comments/1p60ib4/if_you_have_issues_with_prompt_caching_and_you/) - Did about 6 hours leaving it on and cross-checking with openrouter its a bit random. Idk if its an e...

27. [Prompt caching - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) - Claude API Documentation

28. [How Prompt Caching Actually Works in Claude Code](https://www.claudecodecamp.com/p/how-prompt-caching-actually-works-in-claude-code) - I ran four experiments against the Anthropic API to understand prompt caching. ... If you're 100K to...

29. [How and When to Use Anthropic's Prompt Caching Feature (with code examples)](https://www.youtube.com/watch?v=_0uiiJfsBPI) - 🚀 Gumroad Link to Assets in Video: https://bit.ly/3SQ2iDi
👉🏼Join the Early AI-dopters Community: htt...

30. [Prompt caching - Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching?s=09)

31. [OpenRouter Models - LLM Cost Calculator | Bifrost - Maxim AI](https://www.getmaxim.ai/bifrost/llm-cost-calculator/provider/openrouter) - openrouter/anthropic/claude-sonnet-4.6 · OpenRouter · Chat · $3.00 · $15.00 · 1000k ... $60.00 · 200...

32. [Anthropic Models on OpenRouter](https://openrouter.ai/anthropic) - Access 25 Anthropic models on OpenRouter including Claude Sonnet 4.6, Claude Opus 4.6, and Claude Op...

33. [February Release Spotlight - OpenRouter](https://openrouter.ai/announcements/february-release-spotlight) - See an example with Claude Sonnet 4.6. Benchmarks Screen Capture ... See what's trending for 100K–1M...

34. [Anthropic Releases Sonnet 4.6 with 1M Token Context Window](https://www.linkedin.com/posts/jdfetterly_anthropic-released-sonnet-46-and-it-comes-activity-7429613798753320960-qVdK) - 9,809 followers. 3d. Report this post; Close menu. The new Claude Sonnet 4.6 is live now on OpenRout...

35. [Claude Sonnet 4.6: The Best AI Coding Model Ever! 1M ... - YouTube](https://www.youtube.com/watch?v=enoBTzLziEs) - ... OpenRouter: https://openrouter.ai/... Arena: https://arena.ai/ In ... 1M Context, Cheap, & More!...

36. [Prompt Caching switch broken · Issue #2917 · RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code/issues/2917) - App Version Version: 3.14.0 API Provider OpenRouter Model Used 04 Mini High Actual vs. Expected Beha...

37. [❌ Caching 404 on Open Router Gemini2.5 · Issue #2913 · RooVetGit/Roo-Code](https://github.com/RooVetGit/Roo-Code/issues/2913) - App Version Version: 3.14.0 API Provider OpenRouter Model Used gem2.5-exp Actual vs. Expected Behavi...

38. ["You do not have access to explicit prompt caching" error using OpenRouter](https://www.reddit.com/r/RooCode/comments/1jce90r/you_do_not_have_access_to_explicit_prompt_caching/) - "You do not have access to explicit prompt caching" error using OpenRouter

39. [Prompt Caching | OpenRouter](https://openrouter.ai/docs/prompt-caching) - Optimize LLM cost by up to 90%

40. [Claude Sonnet 4.6](https://www.anthropic.com/claude/sonnet) - Pricing for Sonnet 4.6 starts at $3 per million input tokens and $15 per million output tokens, with...

41. [Anthropic - OpenRouter](https://openrouter.ai/provider/anthropic) - Browse models provided by Anthropic

42. [1 million context window is now generally available for Claude Opus ...](https://www.reddit.com/r/ClaudeAI/comments/1rsubm0/1_million_context_window_is_now_generally/) - 1 million context window is now generally available for Claude Opus 4.6 and Claude Sonnet 4.6. ... 1...

43. [Prompt Caching - Mechanics, Guarantees, and Failure Modes](https://www.linkedin.com/pulse/prompt-caching-mechanics-guarantees-failure-modes-sanjay-basu-phd-iyiqf) - I've seen teams enable Anthropic's prompt caching, instrument their ... For a 100K token context, th...

