/**
 * POST /api/pipeline/generate
 * Generates a Sarakari Kannada order draft using Claude Sonnet with SSE streaming.
 * SSE event types: 'chunk' | 'done' | 'error' | 'correction'
 */

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { buildPrompt, type OfficerProfile, type ReferenceOrder } from '@/lib/pipeline/buildPrompt';
import { auditOrder, buildCorrectionInstruction } from '@/lib/pipeline/auditOrder';
import { withRetry, isRateLimit } from '@/lib/pipeline/withRetry';
import { logCacheMetrics } from '@/lib/pipeline/logCacheMetrics';
import { sarvamGenerate, SARVAM_MODEL_ID } from '@/lib/pipeline/sarvamGenerate';
import { redactPII, reInjectPII } from '@/lib/pipeline/piiRedactor';
import { checkDailyLimit, formatResetTime } from '@/lib/pipeline/rateLimiter';
import { logError, logException } from '@/lib/pipeline/errorLogger';
import { validateEnv } from '@/lib/validateEnv';
import { checkIpLimit } from '@/lib/ipRateLimiter';
import type { CaseSummary, OfficerAnswers } from '@/lib/pipeline/types';

const GENERATION_MODEL = 'claude-sonnet-4-6';
const PROMPT_VERSION = 'V3.2.6'; // FIX 2026-04-12: Updated; personal_prompt overrides when available
const MAX_TOKENS = 8192;
const GENERATION_TIMEOUT_MS = 120_000;
const SIMPLE_CASE_TYPES = ['withdrawal', 'suo_motu'];
const VALID_CASE_TYPES = ['contested_appeal', 'withdrawal', 'suo_motu', 'appeal', 'contested'];

export async function POST(request: NextRequest): Promise<Response> {
  // FIX C9: IP rate limit BEFORE auth — prevents unauthenticated flood reaching AI calls
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '0.0.0.0';
  const ipCheck = checkIpLimit(ip);
  if (!ipCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests', retryAfterMs: ipCheck.retryAfterMs }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)),
        },
      }
    );
  }

  // ── Auth: validate Bearer token (IDOR fix — use token identity, not body.userId) ──
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: 'Unauthorized' })}\n\n`,
      { status: 401, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }
  const token = authHeader.split(' ')[1];
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user: authUser }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !authUser) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: 'Unauthorized' })}\n\n`,
      { status: 401, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }
  const authenticatedUserId = authUser.id;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      let creditDeducted = false;
      let generationSuccessful = false; // FIX C5: track success to avoid spurious refund
      let resolvedUserId = '';

      try {
        validateEnv();

        const body = await request.json();
        const { caseType, caseSummary, officerAnswers, sessionOrderCount = 1 } = body as {
          caseType: string;
          caseSummary: CaseSummary;
          officerAnswers: OfficerAnswers;
          sessionOrderCount?: number;
        };
        const selectedModel = officerAnswers.selectedModel ?? 'sarvam';

        resolvedUserId = authenticatedUserId;
        const userId = authenticatedUserId;

        if (!caseType || !caseSummary || !officerAnswers) {
          send('error', { message: 'ಅಗತ್ಯ ಮಾಹಿತಿ ಕಾಣೆಯಾಗಿದೆ / Required fields missing' });
          controller.close();
          return;
        }

        if (!VALID_CASE_TYPES.includes(caseType)) {
          send('error', { message: 'ಅಮಾನ್ಯ ಪ್ರಕರಣ ಪ್ರಕಾರ / Invalid case type' });
          controller.close();
          return;
        }

        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        const sarvamKey = process.env.SARVAM_API_KEY;

        if (!anthropicKey && !sarvamKey) {
          send('error', { message: 'ಸರ್ವರ್ ಕಾನ್ಫಿಗರೇಶನ್ ದೋಷ / Server configuration error' });
          controller.close();
          return;
        }

        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ── Rate limit check ──────────────────────────────────────────────────
        const rateLimit = await checkDailyLimit(userId, adminClient);
        if (!rateLimit.allowed) {
          const resetTime = formatResetTime(rateLimit.resetAt);
          send('error', {
            message: `ಇಂದು ಗರಿಷ್ಠ 10 ಆದೇಶಗಳ ಮಿತಿ ತಲುಪಿದೆ. ${resetTime} ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. / Daily limit of 10 orders reached. Try again after ${resetTime}.`,
            code: 'RATE_LIMIT_DAILY',
            ordersToday: rateLimit.ordersToday,
            resetAt: rateLimit.resetAt,
          });
          controller.close();
          return;
        }

        // ── Load profile (includes personal_prompt for per-user personalization) ──
        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select('credits_remaining, officer_name, designation, district, salutation, full_name, personal_prompt, training_status')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          await logError({
            message: 'Could not load profile for generation',
            route: '/api/pipeline/generate',
            userId,
            severity: 'ERROR',
            metadata: { error: profileError?.message },
          });
          send('error', { message: 'ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ / Could not load profile' });
          controller.close();
          return;
        }

        if ((profile.credits_remaining ?? 0) < 1) {
          send('error', {
            message: 'ಕ್ರೆಡಿಟ್‌ಗಳು ಖಾಲಿಯಾಗಿವೆ. ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ / No credits remaining. Please recharge.',
            code: 'NO_CREDITS',
          });
          controller.close();
          return;
        }

        // ── Fetch reference orders — smart scored selection (top 5 best match) ──
        // FIX 2026-04-12: Fetch up to 20, score by keyword overlap with case,
        // sort score DESC + uploaded_at DESC, take top 5 (not latest 8).
        type RefRow = { id: string; extracted_text: string; case_type_id: string; uploaded_at: string };
        let references: RefRow[] = [];

        const { data: userRefs } = await adminClient
          .from('references')
          .select('id, extracted_text, case_type_id, uploaded_at')
          .eq('user_id', userId)
          .order('uploaded_at', { ascending: false })
          .limit(20);

        if (userRefs && userRefs.length > 0) {
          // Score each reference by keyword overlap with the current case
          const keywords = extractKeywords(caseSummary);
          const scored = (userRefs as RefRow[]).map(ref => {
            const text = ref.extracted_text.toLowerCase();
            const score = keywords.reduce(
              (acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0),
              0
            );
            return { ref, score };
          });

          // Sort: highest score first, then most recent as tiebreaker
          scored.sort((a, b) =>
            b.score - a.score ||
            new Date(b.ref.uploaded_at).getTime() - new Date(a.ref.uploaded_at).getTime()
          );

          // Log top 3 for observability in pm2 logs
          const top3 = scored.slice(0, 3);
          console.log(
            `[ref-select] User ${userId} — scored ${userRefs.length} refs, keywords: ${keywords.length}, ` +
            `top3: ${top3.map(s => `${s.ref.id.slice(-6)}:${s.score}`).join(', ')}`
          );

          references = scored.slice(0, 5).map(s => s.ref);
        } else {
          // Fallback: try case-type-specific defaults
          const { data: defaultRefs } = await adminClient
            .from('references')
            .select('id, extracted_text, case_type_id, uploaded_at')
            .eq('user_id', userId)
            .eq('case_type_id', caseType)
            .order('uploaded_at', { ascending: false })
            .limit(5);
          references = (defaultRefs ?? []) as RefRow[];
          if (references.length === 0) {
            console.log(`User ${userId} has no uploaded references — using default system prompt`);
          }
        }

        // ── Guard: partial uploads (1-4) are suspicious — block with guidance ──
        // 0 refs = new user, system prompt only — allowed
        // 1-4 refs = incomplete upload set — block and guide
        // 5+ refs = personalized generation — allowed
        if (references.length > 0 && references.length < 5) {
          console.log('Blocked generation: partial references', references.length);
          send('error', {
            message: `${references.length} ಉಲ್ಲೇಖ ಆದೇಶಗಳು ಕಂಡಿವೆ. ಕನಿಷ್ಠ 5 ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ / Found ${references.length} reference orders. Upload minimum 5 to continue.`,
            code: 'INSUFFICIENT_REFERENCES',
            referencesFound: references.length,
          });
          controller.close();
          return;
        }

        // ── Atomic credit deduction — only after all validations pass ────────
        const { data: updateResult, error: deductError } = await adminClient
          .from('profiles')
          .update({
            credits_remaining: (profile.credits_remaining ?? 1) - 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .gte('credits_remaining', 1)
          .select('credits_remaining')
          .single();

        if (deductError || !updateResult) {
          send('error', {
            message: 'ಕ್ರೆಡಿಟ್‌ಗಳು ಖಾಲಿಯಾಗಿವೆ / No credits remaining',
            code: 'NO_CREDITS',
          });
          controller.close();
          return;
        }
        creditDeducted = true;

        // ── Get personal prompt from profile ─────────────────────────────────
        const personalPrompt = (profile as Record<string, unknown>).personal_prompt as string | undefined;

        const officerProfile: OfficerProfile = {
          officerName: profile.officer_name ?? profile.full_name ?? officerAnswers.officerName,
          designation: profile.designation ?? 'ಕ.ಆ.ಸೇ',
          district: profile.district ?? '',
          salutation: profile.salutation ?? 'ಶ್ರೀ/ಶ್ರೀಮತಿ',
        };

        const isSimplePath = SIMPLE_CASE_TYPES.includes(caseType.toLowerCase());

        // ── PII Redaction ─────────────────────────────────────────────────────
        const caseContentText = JSON.stringify({ caseSummary, officerAnswers });
        const { redacted: redactedContent, map: piiMap } = redactPII(caseContentText);

        let redactedCaseSummary: CaseSummary = caseSummary;
        let redactedAnswers: OfficerAnswers = officerAnswers;
        try {
          const parsed = JSON.parse(redactedContent) as { caseSummary: CaseSummary; officerAnswers: OfficerAnswers };
          redactedCaseSummary = parsed.caseSummary;
          redactedAnswers = parsed.officerAnswers;
        } catch {
          await logError({
            message: 'PII redaction JSON parse failed — using original content',
            route: '/api/pipeline/generate',
            userId,
            severity: 'WARNING',
          });
        }

        // ── Generate ──────────────────────────────────────────────────────────
        let generatedText = '';
        let cachedTokens = 0;
        let inputTokens = 0;
        let outputTokens = 0;
        let modelUsed = GENERATION_MODEL;

        // ── Route to selected AI provider ─────────────────────────────────────
        if (selectedModel === 'sarvam') {
          // Sarvam 105B — free, default
          if (!sarvamKey) {
            send('error', { message: 'Sarvam API key not configured / Sarvam API ಕೀ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ' });
            controller.close();
            return;
          }
          // FIX C1: use redacted data for Sarvam (same as Anthropic path)
          // FIX A2: wrap in try/catch — fall back to Anthropic if Sarvam fails
          try {
            const sarvamResult = await sarvamGenerate(
              redactedCaseSummary, redactedAnswers, officerProfile, sarvamKey, personalPrompt
            );
            const { result: sarvamReinjected, anomalies: sarvamAnomalies } = reInjectPII(sarvamResult.content, piiMap);
            generatedText = sarvamReinjected;
            if (sarvamAnomalies.length > 0) {
              await logError({
                message: `PII re-injection anomaly (Sarvam): ${sarvamAnomalies.join(', ')}`,
                route: '/api/pipeline/generate',
                userId,
                severity: 'WARNING',
                metadata: { anomalies: sarvamAnomalies },
              });
              generatedText += ['', '---', 'NOTE: Manual replacement needed:', sarvamAnomalies.join(', '), '---'].join('\n');
            }
            modelUsed = SARVAM_MODEL_ID;
            // FIX M6: fake progressive streaming — send in word-groups with delay
            // (Sarvam returns full text at once; this gives visual streaming UX)
            {
              const WORDS_PER_CHUNK = 5;
              const CHUNK_DELAY_MS = 20;
              const words = generatedText.split(' ');
              for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
                const slice = words.slice(i, i + WORDS_PER_CHUNK).join(' ');
                const textChunk = (i > 0 ? ' ' : '') + slice;
                send('chunk', { text: textChunk });
                if (i + WORDS_PER_CHUNK < words.length) {
                  await new Promise(r => setTimeout(r, CHUNK_DELAY_MS));
                }
              }
            }
          } catch (sarvamErr) {
            // FIX A2: Sarvam down → fall back to Anthropic if key available
            if (!anthropicKey) throw sarvamErr;
            await logError({
              message: `Sarvam failed, falling back to Anthropic: ${sarvamErr instanceof Error ? sarvamErr.message : String(sarvamErr)}`,
              route: '/api/pipeline/generate',
              userId,
              severity: 'WARNING',
              metadata: { error: sarvamErr instanceof Error ? sarvamErr.message : String(sarvamErr) },
            });
            send('status', { message: 'Sarvam AI ಸಮಸ್ಯೆ — Claude AI ಬಳಸುತ್ತಿದ್ದೇವೆ / Sarvam issue — switching to Claude AI' });
            const fallbackResult = await generateWithClaude(
              anthropicKey, officerProfile, references ?? [],
              redactedCaseSummary, redactedAnswers, send, personalPrompt
            );
            const { result: reinjected, anomalies } = reInjectPII(fallbackResult.text, piiMap);
            generatedText = reinjected;
            cachedTokens = fallbackResult.cachedTokens;
            inputTokens = fallbackResult.inputTokens;
            outputTokens = fallbackResult.outputTokens;
            modelUsed = GENERATION_MODEL;
            if (anomalies.length > 0) {
              generatedText += ['', '---', 'NOTE: Manual replacement needed:', anomalies.join(', '), '---'].join('\n');
            }
          }

        } else if (selectedModel === 'anthropic') {
          // Anthropic Claude Sonnet
          if (!anthropicKey) {
            send('error', { message: 'Anthropic API key not configured / Anthropic API ಕೀ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ' });
            controller.close();
            return;
          }
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Generation timeout after 120 seconds')), GENERATION_TIMEOUT_MS)
          );
          const result = await Promise.race([
            generateWithClaude(anthropicKey, officerProfile, references ?? [], redactedCaseSummary, redactedAnswers, send, personalPrompt),
            timeoutPromise,
          ]);
          const { result: reinjected, anomalies } = reInjectPII(result.text, piiMap);
          generatedText = reinjected;
          cachedTokens = result.cachedTokens;
          inputTokens = result.inputTokens;
          outputTokens = result.outputTokens;
          if (anomalies.length > 0) {
            await logError({
              message: `PII re-injection anomaly: ${anomalies.length} placeholder(s): ${anomalies.join(', ')}`,
              route: '/api/pipeline/generate',
              userId,
              severity: 'WARNING',
              metadata: { anomalies },
            });
            generatedText += ['', '---', 'NOTE: Manual replacement needed:', anomalies.join(', '), '---'].join('\n');
          }

        } else if (selectedModel === 'openrouter') {
          // OpenRouter — Claude Sonnet via OpenAI-compatible API
          const openrouterKey = process.env.OPENROUTER_API_KEY;
          if (!openrouterKey) {
            send('error', { message: 'OpenRouter API key not configured / OpenRouter API ಕೀ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ' });
            controller.close();
            return;
          }
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Generation timeout after 120 seconds')), GENERATION_TIMEOUT_MS)
          );
          const result = await Promise.race([
            generateWithOpenRouter(openrouterKey, officerProfile, references ?? [], redactedCaseSummary, redactedAnswers, send, personalPrompt),
            timeoutPromise,
          ]);
          const { result: reinjected, anomalies } = reInjectPII(result.text, piiMap);
          generatedText = reinjected;
          inputTokens = result.inputTokens;
          outputTokens = result.outputTokens;
          modelUsed = result.modelUsed;
          if (anomalies.length > 0) {
            generatedText += ['', '---', 'NOTE: Manual replacement needed:', anomalies.join(', '), '---'].join('\n');
          }

        } else {
          send('error', { message: 'AI ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ / AI service unavailable' });
          controller.close();
          return;
        }

        if (!generatedText.trim()) {
          send('error', { message: 'ಆದೇಶ ರಚನೆ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Generation failed. Please retry.' });
          controller.close();
          return;
        }

        // ── Self-audit ────────────────────────────────────────────────────────
        let auditResult = await auditOrder(generatedText, caseSummary, caseType);

        if (auditResult.failures.length > 0 && anthropicKey && !isSimplePath) {
          const correctionInstruction = buildCorrectionInstruction(auditResult);
          const correctedResult = await regenerateWithCorrection(
            anthropicKey, officerProfile, references ?? [],
            redactedCaseSummary, redactedAnswers, correctionInstruction, personalPrompt
          );
          if (correctedResult) {
            const { result: reinjectedCorrection, anomalies: correctionAnomalies } = reInjectPII(correctedResult, piiMap);
            if (correctionAnomalies.length > 0) {
              await logError({
                message: `PII re-injection anomaly in correction: ${correctionAnomalies.join(', ')}`,
                route: '/api/pipeline/generate',
                userId,
                severity: 'WARNING',
                metadata: { anomalies: correctionAnomalies },
              });
            }
            generatedText = reinjectedCorrection;
            auditResult = await auditOrder(generatedText, caseSummary, caseType);
            send('correction', { text: generatedText });
          }
        }

        // ── Log cache metrics ─────────────────────────────────────────────────
        logCacheMetrics(userId, cachedTokens, sessionOrderCount);

        // ── Done ──────────────────────────────────────────────────────────────
        generationSuccessful = true; // FIX C5: mark success before sending to client
        send('done', {
          guardrailScore: auditResult.score,
          cachedTokens,
          modelUsed,
          creditsRemaining: updateResult.credits_remaining,
          promptVersion: PROMPT_VERSION,
          inputTokens: inputTokens || null,
          outputTokens: outputTokens || null,
        });

        // FIX M7: persist order to DB so it appears in my-orders and is never lost
        await adminClient.from('orders').insert({
          user_id: userId,
          case_type: caseType,
          generated_order: generatedText,
          score: auditResult.score,
          model_used: modelUsed,
          version_number: 1,
        }).then(({ error: orderError }) => {
          if (orderError) {
            // Non-fatal: log but don't fail — user already has the generated text
            logError({
              message: `Failed to persist order to DB: ${orderError.message}`,
              route: '/api/pipeline/generate',
              userId,
              severity: 'WARNING',
              metadata: { error: orderError.message },
            });
          }
        });

        controller.close();
      } catch (err) {
        // FIX C5: only refund if credit was deducted AND generation did NOT succeed
        // (avoids spurious refund when stream close fires after client already received 'done')
        if (creditDeducted && !generationSuccessful && resolvedUserId) {
          await refundCredit(resolvedUserId, createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          ));
        }

        await logException(err, {
          route: '/api/pipeline/generate',
          userId: resolvedUserId || undefined,
        });

        const message = isRateLimit(err)
          ? 'ದಯವಿಟ್ಟು 30 ಸೆಕೆಂಡ್ ನಿರೀಕ್ಷಿಸಿ / Please wait 30 seconds and try again.'
          : err instanceof Error && err.message.includes('timeout')
            ? 'ಆದೇಶ ರಚನೆ ಸಮಯ ಮೀರಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Generation timed out. Please retry.'
            : 'ಆದೇಶ ರಚನೆ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ / Generation failed. Please retry.';
        try {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ message })}\n\n`)
          );
        } catch { /* stream may already be closed */ }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ── Keyword extractor for smart reference scoring ────────────────────────────

function extractKeywords(cs: CaseSummary): string[] {
  const rawParts = [
    ...(cs.keyFacts ?? []),
    cs.parties?.petitioner ?? '',
    cs.parties?.respondent ?? '',
    cs.reliefSought ?? '',
  ];
  const combined = rawParts.join(' ');
  // Split into words; keep Kannada unicode (ಅ-ಿ range) and alphanumeric; skip short words
  return combined
    .split(/\s+/)
    .map(w => w.replace(/[^\u0C00-\u0C7F\w]/g, '').trim())
    .filter(w => w.length > 3);
}

// ── Credit refund ─────────────────────────────────────────────────────────────

async function refundCredit(userId: string, adminClient: SupabaseClient): Promise<void> {
  try {
    const { error } = await adminClient.rpc('increment_credits', {
      user_uuid: userId,
      amount: 1,
    });

    if (error) {
      const { data: p } = await adminClient
        .from('profiles')
        .select('credits_remaining')
        .eq('id', userId)
        .single();
      if (p) {
        await adminClient
          .from('profiles')
          .update({ credits_remaining: (p.credits_remaining ?? 0) + 1 })
          .eq('id', userId);
      }
    }

    await logError({
      message: `Credit refunded for user ${userId} due to generation failure`,
      route: '/api/pipeline/generate',
      userId,
      severity: 'INFO',
    });
  } catch (refundErr) {
    await logError({
      message: `CRITICAL: Credit refund FAILED for user ${userId}. Manual resolution required.`,
      stack: refundErr instanceof Error ? refundErr.stack : undefined,
      route: '/api/pipeline/generate',
      userId,
      severity: 'ERROR',
      metadata: { refundFailed: true },
    });
  }
}

// ── Claude generation with SSE streaming ─────────────────────────────────────

async function generateWithClaude(
  apiKey: string,
  profile: OfficerProfile,
  references: ReferenceOrder[],
  caseSummary: CaseSummary,
  answers: OfficerAnswers,
  send: (event: string, data: unknown) => void,
  personalPrompt?: string
): Promise<{ text: string; cachedTokens: number; inputTokens: number; outputTokens: number }> {
  const client = new Anthropic({ apiKey });
  const { messages } = buildPrompt(profile, references, caseSummary, answers, personalPrompt);

  let fullText = '';
  let cachedTokens = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  // Bug 13 fix: use 30s delay to match the 30-second countdown shown in GeneratingStep UI
  await withRetry(async () => {
    fullText = '';

    const stream = await client.messages.stream({
      model: GENERATION_MODEL,
      max_tokens: MAX_TOKENS,
      messages: messages as Parameters<typeof client.messages.stream>[0]['messages'],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullText += chunk.delta.text;
        send('chunk', { text: chunk.delta.text });
      }
    }

    const finalMessage = await stream.finalMessage();
    const usage = finalMessage.usage as {
      cache_read_input_tokens?: number;
      input_tokens?: number;
      output_tokens?: number;
    };
    cachedTokens = usage.cache_read_input_tokens ?? 0;
    inputTokens = usage.input_tokens ?? 0;
    outputTokens = usage.output_tokens ?? 0;
  }, 3, 30_000); // 30s delay matches UI countdown

  return { text: fullText, cachedTokens, inputTokens, outputTokens };
}

// ── OpenRouter generation (Claude Sonnet via OpenAI-compatible API) ──────────

async function generateWithOpenRouter(
  apiKey: string,
  profile: OfficerProfile,
  references: ReferenceOrder[],
  caseSummary: CaseSummary,
  answers: OfficerAnswers,
  send: (event: string, data: unknown) => void,
  personalPrompt?: string
): Promise<{ text: string; inputTokens: number; outputTokens: number; modelUsed: string }> {
  const OPENROUTER_MODEL = 'anthropic/claude-sonnet-4-6';

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://aadesh-ai.in',
      'X-Title': 'Aadesh AI',
    },
  });

  const { messages } = buildPrompt(profile, references, caseSummary, answers, personalPrompt);

  // Convert to OpenAI message format
  const openaiMessages = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content.map(c => c.text).join(''),
  }));

  let fullText = '';
  let inputTokens = 0;
  let outputTokens = 0;

  const stream = await client.chat.completions.create({
    model: OPENROUTER_MODEL,
    max_tokens: MAX_TOKENS,
    messages: openaiMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      fullText += delta;
      send('chunk', { text: delta });
    }
    if (chunk.usage) {
      inputTokens = chunk.usage.prompt_tokens ?? 0;
      outputTokens = chunk.usage.completion_tokens ?? 0;
    }
  }

  return { text: fullText, inputTokens, outputTokens, modelUsed: OPENROUTER_MODEL };
}

// ── Regeneration with correction (no streaming) ───────────────────────────────

async function regenerateWithCorrection(
  apiKey: string,
  profile: OfficerProfile,
  references: ReferenceOrder[],
  caseSummary: CaseSummary,
  answers: OfficerAnswers,
  correctionInstruction: string,
  personalPrompt?: string
): Promise<string | null> {
  try {
    const client = new Anthropic({ apiKey });
    const { messages } = buildPrompt(profile, references, caseSummary, answers, personalPrompt);

    const lastMessage = messages[messages.length - 1];
    const lastContent = lastMessage.content[lastMessage.content.length - 1];
    lastContent.text += correctionInstruction;

    const response = await client.messages.create({
      model: GENERATION_MODEL,
      max_tokens: MAX_TOKENS,
      messages: messages as Parameters<typeof client.messages.create>[0]['messages'],
    });

    return response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');
  } catch (err) {
    await logException(err, { route: '/api/pipeline/generate (correction)' });
    return null;
  }
}
