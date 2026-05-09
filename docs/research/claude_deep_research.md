# Prompt caching for Claude Sonnet 4.6 on OpenRouter: the complete developer guide

Claude Sonnet 4.6, released February 17, 2026, fully supports prompt caching through OpenRouter — but the experience is noticeably less reliable than the direct Anthropic API, especially for multi-turn conversations. OpenRouter passes through Anthropic's native caching at identical per-token pricing (cache reads at **$0.30/M tokens**, a 90% discount), supports the 1-hour TTL that fits your 15–30 minute use case, and offers provider sticky routing to keep caches warm. However, multiple GitHub issues from early 2026 document real failures: cache_control metadata not propagating past system prompts, sticky routing breaking on provider fallback, and the 1-hour TTL being silently ignored in certain configurations. For 120K tokens of cached Kannada text, expect **3–5× more tokens than equivalent English**, making caching even more cost-critical but mechanically identical. Below is a point-by-point answer to each of your ten questions, drawn from OpenRouter documentation, Anthropic's official specs, GitHub issues, and developer community reports.

---

## 1. Both automatic and explicit caching are supported, with caveats

OpenRouter supports **both** modes of Anthropic prompt caching for Sonnet 4.6. **Automatic caching** places a single `cache_control` field at the top level of the request body, and the system auto-applies the breakpoint to the last cacheable block. **Explicit caching** places `cache_control` directly on up to **4 individual content blocks** for fine-grained control over what gets cached.

The critical caveat: automatic caching (top-level `cache_control`) only works when requests route to the **Anthropic provider directly**. OpenRouter's documentation states explicitly that "Amazon Bedrock and Google Vertex AI currently do not support top-level `cache_control` — when it is present, OpenRouter will only route to the Anthropic provider and exclude Bedrock and Vertex endpoints." Explicit per-block breakpoints, by contrast, work across all Anthropic-compatible providers including Bedrock and Vertex.

For the automatic mode, the request looks like this:
```json
{
  "model": "anthropic/claude-sonnet-4.6",
  "cache_control": { "type": "ephemeral" },
  "messages": [...]
}
```

For explicit control, you place `cache_control` on individual content blocks within multi-part messages. OpenRouter's AI SDK provider supports this via `providerOptions.openrouter.cacheControl` at both message and part levels.

---

## 2. Latency drops from ~11.5 seconds to ~2.4 seconds on a 100K cached prompt

Anthropic's own benchmark — their canonical example of a **100K-token book prompt** — shows TTFT dropping from **11.5 seconds to 2.4 seconds** with a cache hit, a **79% reduction**. Anthropic claims up to **85% latency reduction** for long prompts more broadly. An academic evaluation ("Don't Break the Cache," arXiv 2601.06007) tested prompt caching across 500+ agent sessions and found Claude Sonnet 4.5 delivered consistent TTFT improvements of **20.9% to 22.9%** across all caching strategies with 10K-token system prompts. For prompts exceeding **150K tokens**, independent testing by Redis found approximately **67% faster TTFT**.

OpenRouter adds approximately **15ms of latency overhead** once the cache is warm, per an OpenRouter employee posting on Hacker News: "We add about 15ms of latency once the cache is warm (e.g. on subsequent requests)." This overhead is negligible relative to model inference time.

For your specific scenario of 100K–130K tokens of cached context, expect:

| Metric | Without caching | With cache hit |
|---|---|---|
| TTFT (estimated) | ~10–15 seconds | ~2–4 seconds |
| Cost per request (input only) | $0.30–$0.39 | $0.03–$0.04 |
| OpenRouter overhead | — | ~15ms additional |

The large variance reflects that exact latency depends on server load, provider routing, and whether the request hits Anthropic's first-party infrastructure versus Bedrock or Vertex.

---

## 3. Sticky routing works in theory but developers report real cache misses

OpenRouter's **provider sticky routing** remembers which provider served a cached request and routes subsequent requests for the same model to the same provider. It tracks at the **account level, per model, and per conversation** — conversations are identified by hashing the first system message and first non-system message in each request. OpenRouter's documentation states that "sticky routing only activates when the provider's cache read pricing is cheaper than regular prompt pricing, ensuring you always benefit from cost savings."

Developer complaints exist. In GitHub issue sst/opencode #1245, a developer reported that "OpenRouter seems to cache the system message and maybe the first message, but then never updates what is cached as conversations grow," making it "an order of magnitude more expensive than Anthropic." The core frustration: cost savings remain constant rather than growing with conversation length. Three specific failure modes break sticky routing:

- Specifying `provider.order` manually **disables sticky routing entirely**
- If the sticky provider becomes unavailable, the automatic fallback triggers a **cold cache on the new provider**
- OpenRouter "expires caches more aggressively" when account credits run low
- Changing the first system or first user message **breaks the conversation hash**, routing to a different provider

---

## 4. Yes, 1-hour TTL is supported — but verify it works in your integration

OpenRouter supports **two TTL values** for Anthropic prompt caching. The default 5-minute TTL uses `"cache_control": { "type": "ephemeral" }`, while the 1-hour TTL uses `"cache_control": { "type": "ephemeral", "ttl": "1h" }`. The 1-hour TTL costs **2× base input price** for cache writes ($6.00/M tokens for Sonnet 4.6) versus 1.25× ($3.75/M) for the 5-minute TTL. Cache reads cost the same **$0.30/M tokens** regardless of TTL tier. Each cache hit refreshes the TTL at no additional write cost, so for your use case of officers taking 15–30 minutes between orders, the 1-hour TTL comfortably covers the gap.

The economics break even quickly: a cache write at the 1-hour rate pays for itself after just **two cache reads** (saving $2.70/M per read versus $6.00/M write cost). For the 5-minute TTL, a single read pays for the write.

**Important caveat**: One GitHub issue (openclaw/openclaw #16848) reported that `prompt_cache_ttl` was **silently ignored** by OpenRouter — "no error, no cache write, nothing." A 3-way verification script with 6-minute delays past the default TTL confirmed the parameter had no effect in that case. This may be an integration-specific bug rather than a platform-wide issue, but it warrants explicit testing in your setup. Monitor the `usage.prompt_tokens_details.cached_tokens` field in responses to verify cache hits are actually occurring.

---

## 5. Sonnet 4.6 requires exactly 2,048 tokens minimum for caching

The minimum cacheable token count is **model-specific**, and for Claude Sonnet 4.6 it is **2,048 tokens**. This is documented identically by both Anthropic and OpenRouter. The full table:

| Model | Minimum cacheable tokens |
|---|---|
| Claude Sonnet 4.6 | **2,048** |
| Claude Sonnet 4.5, Sonnet 4, Sonnet 3.7 | 1,024 |
| Claude Opus 4.6, Opus 4.5, Haiku 4.5 | 4,096 |
| Claude Haiku 3.5 | 2,048 |

If your prompt falls below the threshold, caching **fails silently** — no error is returned, but both `cache_creation_input_tokens` and `cache_read_input_tokens` will be 0 in the response. One GitHub issue (anthropics/anthropic-sdk-python #1194) noted that documentation previously stated 1,024 tokens for Sonnet models, but empirical testing showed 2,048 was required for some models. For Sonnet 4.6 specifically, **2,048 is the confirmed number** from both Anthropic's current docs and OpenRouter's model page. Your 100K–130K token context vastly exceeds this threshold, so this is a non-issue for your use case.

---

## 6. Claude Code is the flagship example at 100K+ cached context

The most prominent production application is **Claude Code**, Anthropic's own coding agent, which is architecturally built around prompt caching. System prompts alone consume ~4,000 tokens, and sessions routinely process hundreds of thousands of tokens with **>90% cache hit rates**. Anthropic's Claude Code team "declares SEVs when cache hit rates drop" below target. Without caching, a 100-turn Opus coding session costs **$50–100** in input tokens; with caching, the same session costs **$10–19**. One developer on Hacker News reported monthly usage of "0.2M input, 0.6M output, 10M cache create, 311M cache read" — a cache read-to-write ratio of **31:1**.

For customer support applications, blog posts detail economics similar to your use case: a RAG-based bot with a **50K-token product manual** processing 1,000 queries/day drops from **$4,545/month (uncached) to $500/month (cached)** — an 89% reduction. Anthropic's canonical demo uses a 100K-token copy of *Pride and Prejudice* for multi-question literary analysis, showing the 11.5s → 2.4s TTFT improvement.

No public case studies specifically document 100K+ cached context through **OpenRouter** (as opposed to the direct API). Most large-context production deployments appear to use the Anthropic API directly, likely because of the caching reliability issues documented in Question 3.

---

## 7. At least five documented bug categories affect OpenRouter caching in 2025–2026

Developer reports surface five distinct categories of problems:

**Cache_control not propagating past system prompts.** GitHub issue OpenRouterTeam/ai-sdk-provider #35 documents that despite trying all three metadata namespaces, only system prompt caching worked through the AI SDK. User/assistant message caching did not propagate.

**Caching never updates as conversations grow.** In sst/opencode #1245, a developer found OpenRouter "never updates what is cached" beyond the first message, making it significantly more expensive than direct Anthropic for long conversations.

**Dynamic content silently breaks the cache.** Anthropic requires **exact byte-for-byte prefix matches**. Timestamps, session IDs, or dynamically-generated content in system prompts invalidate the entire cache. One developer in openclaw/openclaw #19534 saw 170K-token contexts being fully cache-written every turn with zero cache reads, costing **$35/day instead of $9/day**.

**Cost tracking tools miss cache write tokens.** Issue openclaw/openclaw #18440 documents that in-app cost trackers show near-zero cost during cache misses because `cacheWriteInputTokens` falls back to 0 for OpenRouter — the code only checks Anthropic/Bedrock metadata formats, not OpenRouter's `usage_response.prompt_tokens_details.cache_write_tokens` field.

**JSON key ordering invalidates caches.** Swift and Go serialize JSON with randomized key ordering by default. If tool schemas are serialized differently between requests, the entire cached prefix is invalidated. The Claude Code team documented this as a root cause of unexpected cache misses.

---

## 8. Direct Anthropic API is more reliable; OpenRouter adds convenience and fallback

The pricing is functionally identical: both charge **$3/$15 per MTok** for Sonnet 4.6, with cache reads at **$0.30/M** and 5-minute cache writes at **$3.75/M**. OpenRouter's only markup is a **5.5% surcharge on credit purchases** (not per-request), making $100 of API usage cost $105.50 total.

| Aspect | Anthropic Direct | OpenRouter |
|---|---|---|
| Per-token pricing | $3/$15 MTok | $3/$15 MTok (pass-through) |
| Platform fee | None | 5.5% on credit purchase |
| Automatic caching | Full support, all endpoints | Only when routed to Anthropic directly |
| Cache reliability | Consistently high | Multiple reports of inconsistency past system prompts |
| Latency overhead | Baseline | ~15ms additional |
| Multi-provider fallback | None | Auto-fallback (but breaks cache) |
| Minimum tokens (Sonnet 4.6) | 2,048 | 2,048 (same) |

The consensus across GitHub issues and community discussion is clear: **for cache-critical production workloads, the direct Anthropic API is more reliable**. OpenRouter's value proposition is multi-provider fallback and unified API access, but this same routing flexibility introduces cache invalidation risk. If caching reliability is mission-critical, use the direct API. If you need provider redundancy and can tolerate occasional cache misses, OpenRouter works but requires explicit monitoring of `cached_tokens` in responses.

---

## 9. Kannada text costs more tokens but caching behavior is mechanically identical

Prompt caching treats all tokens identically regardless of language — there is no special behavior, different pricing tier, or altered mechanism for non-English text. However, Kannada (and other Indic scripts) **tokenize extremely inefficiently** in Claude's BPE tokenizer. Research benchmarks show Indic languages require approximately **4–5× more tokens** than equivalent English content in Claude, with some estimates suggesting ~0.16 English-equivalent words per token for Hindi/Indic scripts.

For your 120K tokens of Kannada text, the practical implications are:

- **Same caching mechanism**: Cache writes, reads, TTL, and breakpoints work identically
- **Same per-token pricing**: $0.30/M for cache reads, $3.75/M or $6.00/M for cache writes
- **Higher absolute cost**: Since Kannada text uses ~4× more tokens for equivalent semantic content, the total dollar cost is proportionally higher
- **Easier to meet minimum threshold**: The 2,048-token minimum for Sonnet 4.6 is reached with substantially less Kannada text (~400–500 words) versus English (~1,500 words)
- **Greater absolute savings**: Cache hits save proportionally more money because the baseline token count is higher

Anthropic does **not publicly release** its tokenizer for Claude 3+ models. To verify exact token counts for your Kannada content, use the `client.messages.count_tokens()` API endpoint before committing to a caching strategy.

---

## 10. The 1M context window and prompt caching work together with no special configuration

Claude Sonnet 4.6 launched with a **1M-token context window** at standard pricing — no long-context surcharge applies. Anthropic's announcement states: "Prompt caching and batch processing discounts apply at standard rates across the full context window." A 900K-token request is billed at the same per-token rate as a 9K-token request. OpenRouter's documentation confirms that "extended context is enabled based on model capabilities" automatically — no manual beta headers are required.

The only configuration needed is the standard `cache_control` parameter for caching. There is no separate "enable extended context" flag or special API parameter to combine the two features. The previous long-context pricing premium that applied to Sonnet 4/4.5 (which doubled costs above ~200K tokens) has been **eliminated for the 4.6 models**. The 1M context beta for older Sonnet 4.5/4 models is being retired April 30, 2026.

Anthropic also implements **automated context compaction** that algorithmically summarizes older conversational turns as you approach context limits, which can interact with caching if the compacted content differs from the cached prefix. For your use case of 120K tokens of static context, this should not be a concern since you are well within the 1M limit.

---

## Conclusion

OpenRouter provides a functional but imperfect pass-through for Sonnet 4.6 prompt caching. The **1-hour TTL at $6.00/M write cost** directly addresses your 15–30 minute gap between officer requests, breaking even after just two cache reads. For 120K tokens of Kannada context, expect roughly **$0.036 per cached request** (versus $0.36 uncached) — a 90% savings that compounds significantly at scale. The minimum threshold of 2,048 tokens is a non-issue at your context size, and the 1M window requires zero special configuration.

The key risk is **cache reliability through OpenRouter**: at least three independent GitHub issues document caching failures beyond system prompts, and the direct Anthropic API remains measurably more consistent. If your application tolerates occasional cache misses with graceful cost degradation, OpenRouter's sticky routing and multi-provider fallback are worth the 5.5% credit surcharge and ~15ms latency. If cache hits are mission-critical for cost control, route directly to Anthropic and implement your own fallback logic. Whichever path you choose, monitor `cached_tokens` in every response and alert on sudden drops — silent cache invalidation from dynamic content, JSON key reordering, or provider failover is the most commonly reported production surprise.