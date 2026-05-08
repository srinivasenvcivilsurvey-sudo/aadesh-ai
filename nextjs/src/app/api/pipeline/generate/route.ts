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
import { detectComplexity } from '@/lib/utils';
import { withRetry, isRateLimit } from '@/lib/pipeline/withRetry';
import { logCacheMetrics } from '@/lib/pipeline/logCacheMetrics';
import { sarvamGenerate, SARVAM_MODEL_ID } from '@/lib/pipeline/sarvamGenerate';
import { redactPII, reInjectPII } from '@/lib/pipeline/piiRedactor';
import { checkDailyLimit, formatResetTime } from '@/lib/pipeline/rateLimiter';
import { logError, logException } from '@/lib/pipeline/errorLogger';
import { validateEnv } from '@/lib/validateEnv';
import { checkIpLimit } from '@/lib/ipRateLimiter';
import {
  computeFinalManifestHash,
  computeManifestSeedHash,
  sha256Hex,
  timingSafeHexEqual,
  validateGenerateGate,
  type LegalOrderState,
} from '@/lib/pipeline/legalState';
import type { CaseSummary, OfficerAnswers } from '@/lib/pipeline/types';

const GENERATION_MODEL = 'claude-sonnet-4-6';
const PROMPT_VERSION = 'V3.2.7'; // V3.2.7 2026-04-19: party role lock + analysis 4 sub-sections + header dedupe (post-Machohalli P0 fix)
const MAX_TOKENS = 8192;
const GENERATION_TIMEOUT_MS = 120_000;
const SIMPLE_CASE_TYPES = ['withdrawal', 'suo_motu'];
const VALID_CASE_TYPES = ['contested_appeal', 'withdrawal', 'suo_motu', 'appeal', 'contested'];

interface GenerateRequestBody {
  caseType: string;
  caseSummary: CaseSummary;
  officerAnswers: OfficerAnswers;
  sessionOrderCount?: number;
  receiptId?: string | null;
  order_id?: string | null;
  idempotency_key?: string | null;
  attestationHash?: string | null;
  reasoningHash?: string | null;
  inputFileSha256?: string | null;
}

interface LegalOrderRow {
  id: string;
  user_id: string;
  state: LegalOrderState;
  state_version: number;
  upload_sha256: string | null;
  attestation_hash: string | null;
  reasoning_hash: string | null;
  locked_at: string | null;
  locked_name: string | null;
  attestation_nonce: string | null;
  attestation_nonce_consumed: boolean | null;
  manifest_seed_hash: string | null;
  idempotency_key: string | null;
  generated_order?: string | null;
  output_hash?: string | null;
  final_manifest_hash?: string | null;
}

function jsonResponse(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getOrderId(body: GenerateRequestBody): string {
  return (body.order_id ?? body.receiptId ?? '').trim();
}

async function loadLegalOrder(
  adminClient: SupabaseClient,
  orderId: string,
  userId: string
): Promise<LegalOrderRow | null> {
  const { data, error } = await adminClient
    .from('orders')
    .select('id, user_id, state, state_version, upload_sha256, attestation_hash, reasoning_hash, locked_at, locked_name, attestation_nonce, attestation_nonce_consumed, manifest_seed_hash, idempotency_key, generated_order, output_hash, final_manifest_hash')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as LegalOrderRow;
}

function validateLegalPrerequisites(order: LegalOrderRow): { status: number; message: string } | null {
  const gate = validateGenerateGate(order);
  return gate.allowed ? null : { status: gate.status, message: gate.reason };
}

async function claimLegalGeneration(
  adminClient: SupabaseClient,
  order: LegalOrderRow,
  userId: string,
  promptVersion: string,
  idempotencyKey: string
): Promise<{ ok: true; seedHash: string } | { ok: false; status: number; message: string }> {
  const prerequisiteError = validateLegalPrerequisites(order);
  if (prerequisiteError) return { ok: false, ...prerequisiteError };

  let current = order;
  let seedHash = current.manifest_seed_hash ?? '';

  if (current.state === 'reasoned') {
    seedHash = computeManifestSeedHash({
      user_id: userId,
      order_id: current.id,
      upload_sha256: current.upload_sha256!,
      attestation_hash: current.attestation_hash!,
      reasoning_hash: current.reasoning_hash!,
      attestation_nonce: current.attestation_nonce!,
      prompt_version: promptVersion,
    });

    const { data: seededRows, error: seedError } = await adminClient
      .from('orders')
      .update({
        state: 'manifest_seeded',
        state_version: Number(current.state_version) + 1,
        manifest_seed_hash: seedHash,
        seeded_at: new Date().toISOString(),
      })
      .eq('id', current.id)
      .eq('user_id', userId)
      .eq('state', 'reasoned')
      .eq('state_version', current.state_version)
      .select('id, user_id, state, state_version, upload_sha256, attestation_hash, reasoning_hash, locked_at, locked_name, attestation_nonce, attestation_nonce_consumed, manifest_seed_hash, idempotency_key')
      .limit(1);

    if (seedError || !seededRows || seededRows.length !== 1) {
      return { ok: false, status: 409, message: 'concurrent manifest seed transition' };
    }
    current = seededRows[0] as LegalOrderRow;
  }

  const expectedSeed = computeManifestSeedHash({
    user_id: userId,
    order_id: current.id,
    upload_sha256: current.upload_sha256!,
    attestation_hash: current.attestation_hash!,
    reasoning_hash: current.reasoning_hash!,
    attestation_nonce: current.attestation_nonce!,
    prompt_version: promptVersion,
  });

  if (!current.manifest_seed_hash || !timingSafeHexEqual(expectedSeed, current.manifest_seed_hash)) {
    return { ok: false, status: 409, message: 'manifest seed mismatch' };
  }

  const { data: claimedRows, error: claimError } = await adminClient
    .from('orders')
    .update({
      state: 'generating',
      state_version: Number(current.state_version) + 1,
      attestation_nonce_consumed: true,
      idempotency_key: idempotencyKey,
      gen_started_at: new Date().toISOString(),
    })
    .eq('id', current.id)
    .eq('user_id', userId)
    .eq('state', 'manifest_seeded')
    .eq('state_version', current.state_version)
    .eq('attestation_nonce_consumed', false)
    .select('id')
    .limit(1);

  if (claimError || !claimedRows || claimedRows.length !== 1) {
    return { ok: false, status: 409, message: 'concurrent generation transition or nonce replay' };
  }

  return { ok: true, seedHash: current.manifest_seed_hash };
}

async function markGenerationFailed(
  adminClient: SupabaseClient,
  orderId: string,
  userId: string,
  reason: string
): Promise<void> {
  const { data: order } = await adminClient
    .from('orders')
    .select('state_version')
    .eq('id', orderId)
    .eq('user_id', userId)
    .eq('state', 'generating')
    .maybeSingle();
  if (!order) return;

  await adminClient
    .from('orders')
    .update({
      state: 'generation_failed',
      state_version: Number((order as { state_version: number }).state_version) + 1,
      generation_failed_at: new Date().toISOString(),
      generation_failure_reason: reason.slice(0, 500),
    })
    .eq('id', orderId)
    .eq('user_id', userId)
    .eq('state', 'generating');
}

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

  let requestBody: GenerateRequestBody;
  try {
    requestBody = await request.json() as GenerateRequestBody;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const orderId = getOrderId(requestBody);
  const idempotencyKey = (requestBody.idempotency_key ?? '').trim();
  if (!orderId || !idempotencyKey) {
    return jsonResponse(409, {
      error: 'Missing legal order_id or idempotency_key. Upload, Entity Lock, and reasoning are required before generation.',
    });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(500, { error: 'Server legal-state configuration missing' });
  }

  const preflightAdminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const preflightOrder = await loadLegalOrder(preflightAdminClient, orderId, authenticatedUserId);
  if (!preflightOrder) {
    return jsonResponse(409, { error: 'Order legal state not found. Please upload again.' });
  }
  if (preflightOrder.state === 'generated' && preflightOrder.idempotency_key === idempotencyKey) {
    return jsonResponse(200, {
      output: preflightOrder.generated_order ?? '',
      output_hash: preflightOrder.output_hash ?? null,
      final_manifest_hash: preflightOrder.final_manifest_hash ?? null,
      idempotent: true,
    });
  }
  const preflightError = validateLegalPrerequisites(preflightOrder);
  if (preflightError) {
    return jsonResponse(preflightError.status, { error: preflightError.message });
  }

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
      let claimedOrderId = '';

      try {
        validateEnv();

        const body = requestBody;
        const {
          caseType,
          caseSummary,
          officerAnswers,
          sessionOrderCount = 1,
          receiptId = null,
          order_id = null,
          idempotency_key = null,
          inputFileSha256 = null,
        } = body;
        resolvedUserId = authenticatedUserId;
        const userId = authenticatedUserId;

        if (!caseType || !caseSummary || !officerAnswers) {
          send('error', { message: 'ಅಗತ್ಯ ಮಾಹಿತಿ ಕಾಣೆಯಾಗಿದೆ / Required fields missing' });
          controller.close();
          return;
        }
        // Pricing v2: trial users get Sonnet-only (no Opus fallback). selectedModel
        // is reassigned to 'anthropic' after the profile load if the user is on trial.
        let selectedModel = officerAnswers.selectedModel ?? 'sarvam';
        const legalOrderId = (order_id ?? receiptId ?? '').trim();
        const legalIdempotencyKey = (idempotency_key ?? '').trim();

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
          .select('credits_remaining, officer_name, designation, district, salutation, full_name, personal_prompt, training_status, trial_credit_granted_at, trial_credit_used')
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

        // ── Pricing v2: Trial Sonnet-lock ──────────────────────────────────────
        // If the user has a trial credit granted but never used (and no paid
        // history is required by spec — but trial_credit_used is the simpler
        // and race-safe predicate), force model = 'anthropic' (Sonnet) to block
        // Opus / OpenRouter abuse on the free credit.
        const isOnTrial =
          profile.trial_credit_granted_at !== null &&
          profile.trial_credit_used === false;
        if (isOnTrial && selectedModel !== 'anthropic') {
          console.log(`[generate] Trial user ${userId}: forcing Sonnet (was ${selectedModel})`);
          selectedModel = 'anthropic';
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

          // Log top 3 for observability
          const top3 = scored.slice(0, 3);
          await logError({
            message: `[ref-select] scored ${userRefs.length} refs, keywords: ${keywords.length}, top3: ${top3.map(s => `${s.ref.id.slice(-6)}:${s.score}`).join(', ')}`,
            route: '/api/pipeline/generate',
            userId,
            severity: 'INFO',
          });

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
            await logError({
              message: 'User has no uploaded references — using default system prompt only',
              route: '/api/pipeline/generate',
              userId,
              severity: 'INFO',
            });
          }
        }

        // ── Guard: partial uploads (1-4) are suspicious — block with guidance ──
        // 0 refs = new user, system prompt only — allowed
        // 1-4 refs = incomplete upload set — block and guide
        // 5+ refs = personalized generation — allowed
        if (references.length > 0 && references.length < 5) {
          await logError({
            message: `Blocked generation: partial references uploaded (${references.length}/5 minimum)`,
            route: '/api/pipeline/generate',
            userId,
            severity: 'WARNING',
          });
          send('error', {
            message: `${references.length} ಉಲ್ಲೇಖ ಆದೇಶಗಳು ಕಂಡಿವೆ. ಕನಿಷ್ಠ 5 ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ / Found ${references.length} reference orders. Upload minimum 5 to continue.`,
            code: 'INSUFFICIENT_REFERENCES',
            referencesFound: references.length,
          });
          controller.close();
          return;
        }

        // ── Legal Shield hard gate: seed manifest and claim generation ───────
        const legalOrder = await loadLegalOrder(adminClient, legalOrderId, userId);
        if (!legalOrder) {
          send('error', { message: 'ಕಾನೂನು ಸ್ಥಿತಿ ಕಾಣೆಯಾಗಿದೆ / Legal order state not found' });
          controller.close();
          return;
        }
        const legalClaim = await claimLegalGeneration(
          adminClient,
          legalOrder,
          userId,
          PROMPT_VERSION,
          legalIdempotencyKey
        );
        if (!legalClaim.ok) {
          send('error', { message: legalClaim.message, code: 'LEGAL_STATE_ERROR' });
          controller.close();
          return;
        }
        const manifestSeedHash = legalClaim.seedHash;
        claimedOrderId = legalOrderId;

        // ── Get personal prompt from profile ─────────────────────────────────
        const personalPrompt = (profile as Record<string, unknown>).personal_prompt as string | undefined;

        const officerProfile: OfficerProfile = {
          officerName: profile.officer_name ?? profile.full_name ?? officerAnswers.officerName,
          designation: profile.designation ?? 'ಕ.ಆ.ಸೇ',
          district: profile.district ?? '',
          salutation: profile.salutation ?? 'ಶ್ರೀ/ಶ್ರೀಮತಿ',
        };

        const isSimpleByType = SIMPLE_CASE_TYPES.includes(caseType.toLowerCase());
        // For paid users: entity-count analysis can upgrade simple → complex.
        // Trial users always take the simple path (no correction pass) to control cost.
        const complexityResult = !isOnTrial
          ? detectComplexity(JSON.stringify(caseSummary))
          : 'simple';
        const isSimplePath = isSimpleByType && complexityResult === 'simple';

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
            // FIX B3: timeout parity with Anthropic path — Sarvam can hang without this
            const sarvamTimeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Sarvam generation timeout after 120 seconds')), GENERATION_TIMEOUT_MS)
            );
            const sarvamResult = await Promise.race([
              sarvamGenerate(redactedCaseSummary, redactedAnswers, officerProfile, sarvamKey, personalPrompt),
              sarvamTimeoutPromise,
            ]);
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
        // FIX B1: use redactedCaseSummary — original caseSummary has PII that leaks into audit DB logs
        let auditResult = await auditOrder(generatedText, redactedCaseSummary, caseType);
        let correctionApplied = false;

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
            auditResult = await auditOrder(generatedText, redactedCaseSummary, caseType);
            send('correction', { text: generatedText });
            correctionApplied = true;
          }
        }

        // ── Log cache metrics ─────────────────────────────────────────────────
        logCacheMetrics(userId, cachedTokens, sessionOrderCount);

        // ── Final credit and generated-state commit ───────────────────────────
        // Pricing v2: if user was on trial credit, also flip trial_credit_used = TRUE
        // so future generations no longer enforce the Sonnet-lock.
        const finalUpdatePayload: Record<string, unknown> = {
          credits_remaining: (profile.credits_remaining ?? 1) - 1,
          updated_at: new Date().toISOString(),
        };
        if (isOnTrial) {
          finalUpdatePayload.trial_credit_used = true;
        }

        const { data: creditRows, error: finalCreditError } = await adminClient
          .from('profiles')
          .update(finalUpdatePayload)
          .eq('id', userId)
          .gte('credits_remaining', 1)
          .select('credits_remaining')
          .limit(1);

        if (finalCreditError || !creditRows || creditRows.length !== 1) {
          await markGenerationFailed(adminClient, legalOrderId, userId, 'credit deduction failed after generation');
          send('error', {
            message: 'ಕ್ರೆಡಿಟ್‌ಗಳು ಖಾಲಿಯಾಗಿವೆ / No credits remaining',
            code: 'NO_CREDITS',
          });
          controller.close();
          return;
        }
        creditDeducted = true;

        const outputHash = sha256Hex(generatedText);
        const generatedAt = new Date().toISOString();
        const finalManifestHash = computeFinalManifestHash({
          seed_hash: manifestSeedHash,
          output_hash: outputHash,
          model: modelUsed,
          prompt_version: PROMPT_VERSION,
          generated_at: generatedAt,
          input_tokens: inputTokens ?? 0,
          output_tokens: outputTokens ?? 0,
        });

        const { data: generatingOrder } = await adminClient
          .from('orders')
          .select('state_version')
          .eq('id', legalOrderId)
          .eq('user_id', userId)
          .eq('state', 'generating')
          .single();

        if (!generatingOrder) {
          await markGenerationFailed(adminClient, legalOrderId, userId, 'generating order row missing at final commit');
          throw new Error('Legal order state changed during generation');
        }

        const { error: orderUpdateError } = await adminClient
          .from('orders')
          .update({
            state: 'generated',
            state_version: Number((generatingOrder as { state_version: number }).state_version) + 1,
            generated_order: generatedText,
            score: auditResult.score,
            model_used: modelUsed,
            version_number: 1,
            output_hash: outputHash,
            final_manifest_hash: finalManifestHash,
            manifest_hash: finalManifestHash,
            prompt_version: PROMPT_VERSION,
            input_tokens: inputTokens || null,
            output_tokens: outputTokens || null,
            gen_finished_at: generatedAt,
            input_pdf_sha256: inputFileSha256,
          })
          .eq('id', legalOrderId)
          .eq('user_id', userId)
          .eq('state', 'generating');

        if (orderUpdateError) {
          throw new Error(`Failed to commit generated order: ${orderUpdateError.message}`);
        }

        // ── Done ──────────────────────────────────────────────────────────────
        generationSuccessful = true;
        send('done', {
          guardrailScore: auditResult.score,
          cachedTokens,
          modelUsed,
          creditsRemaining: (creditRows[0] as { credits_remaining: number }).credits_remaining,
          promptVersion: PROMPT_VERSION,
          inputTokens: inputTokens || null,
          outputTokens: outputTokens || null,
          outputHash,
          finalManifestHash,
          correctionApplied,
        });

        controller.close();
      } catch (err) {
        if (claimedOrderId && resolvedUserId && !generationSuccessful) {
          await markGenerationFailed(createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          ), claimedOrderId, resolvedUserId, err instanceof Error ? err.message : String(err));
        }

        // Credit is charged only after successful AI output. If a later commit
        // fails after deduction, keep an ERROR log for manual reconciliation.
        if (creditDeducted && !generationSuccessful && resolvedUserId) {
          await logError({
            message: `CRITICAL: generation failed after final credit deduction for user ${resolvedUserId}`,
            route: '/api/pipeline/generate',
            userId: resolvedUserId,
            severity: 'ERROR',
            metadata: { orderId: claimedOrderId, creditReconciliationNeeded: true },
          });
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
  // FIX B4: filter to text-only blocks — non-text blocks (image, tool_use) have no .text property
  const openaiMessages = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content.filter(c => c.type === 'text').map(c => c.text).join(''),
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

    // FIX B5: avoid mutation — spread instead of in-place += on message content
    const lastMessage = messages[messages.length - 1];
    const lastContent = lastMessage.content[lastMessage.content.length - 1];
    lastMessage.content[lastMessage.content.length - 1] = { ...lastContent, text: lastContent.text + correctionInstruction };

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
