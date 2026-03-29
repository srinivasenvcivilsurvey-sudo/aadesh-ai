import { NextRequest, NextResponse } from 'next/server';
import { generateOrder, DEFAULT_SYSTEM_PROMPT, normalizeNFKC } from '@/lib/sarvam';
import { runGuardrails } from '@/lib/guardrails';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSmartContext, buildContextBlock } from '@/lib/smart-context';

const MAX_INPUT_LENGTH = 10_000; // characters

export async function POST(request: NextRequest) {
  try {
    // ── AUTH ──────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── RATE LIMIT ───────────────────────────────────────
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ (rate limit)' },
        { status: 429 }
      );
    }

    // ── PARSE & VALIDATE INPUT ───────────────────────────
    const body = await request.json();
    const { orderType, caseDetails, previousCases } = body;

    if (!orderType || !caseDetails) {
      return NextResponse.json(
        { error: 'ಆದೇಶ ಪ್ರಕಾರ ಮತ್ತು ಪ್ರಕರಣ ವಿವರಗಳು ಅಗತ್ಯ' },
        { status: 400 }
      );
    }

    if (!['appeal', 'suo_motu'].includes(orderType)) {
      return NextResponse.json(
        { error: 'Invalid orderType. Must be "appeal" or "suo_motu"' },
        { status: 400 }
      );
    }

    if (caseDetails.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `ಇನ್‌ಪುಟ್ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ (ಗರಿಷ್ಠ ${MAX_INPUT_LENGTH} ಅಕ್ಷರಗಳು)` },
        { status: 400 }
      );
    }

    // ── CHECK SARVAM API KEY ─────────────────────────────
    const sarvamKey = process.env.SARVAM_API_KEY;
    if (!sarvamKey) {
      console.error('SARVAM_API_KEY not configured');
      return NextResponse.json(
        { error: 'ಸರ್ವರ್ ಕಾನ್ಫಿಗರೇಶನ್ ದೋಷ' },
        { status: 500 }
      );
    }

    // ── CHECK CREDITS ────────────────────────────────────
    // Use service role client for DB operations (bypasses RLS)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' },
        { status: 500 }
      );
    }

    if (profile.credits_remaining <= 0) {
      return NextResponse.json(
        { error: 'ಕ್ರೆಡಿಟ್‌ಗಳು ಖಾಲಿಯಾಗಿವೆ. ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ.' },
        { status: 402 }
      );
    }

    // ── SMART-CONTEXT: fetch best reference orders ───────
    const normalizedCaseDetails = normalizeNFKC(caseDetails);

    const smartContext = await getSmartContext(adminClient, user.id, orderType, normalizedCaseDetails);
    const contextBlock = buildContextBlock(smartContext);

    // Append previous cases if provided
    const prevCasesBlock = previousCases?.trim()
      ? `\nಸಂಬಂಧಿತ ಹಿಂದಿನ ಪ್ರಕರಣ: ${normalizeNFKC(previousCases.trim())} — ಇದನ್ನು ಆದೇಶದಲ್ಲಿ ಉಲ್ಲೇಖಿಸಿ.\n`
      : '';

    // Combine context + previous cases + user input
    const enrichedInput = contextBlock + prevCasesBlock + normalizedCaseDetails;

    // ── GENERATE ORDER ───────────────────────────────────
    const startTime = Date.now();
    const result = await generateOrder(
      {
        orderType,
        caseDetails: enrichedInput,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
      },
      sarvamKey
    );
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // ── PLACEHOLDER CHECK ────────────────────────────────
    // Reject output if AI returned unfilled template brackets like [NAME], [DATE]
    const unfilledPlaceholders = result.content.match(/\[[A-Z][A-Z_]{2,}\]/g);
    if (unfilledPlaceholders) {
      console.error('Unfilled placeholders detected:', unfilledPlaceholders);
      return NextResponse.json(
        {
          error: 'ಆದೇಶ ಸಂಪೂರ್ಣವಾಗಿ ರಚಿಸಲಾಗಲಿಲ್ಲ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ನೀಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
          errorCode: 'INCOMPLETE_ORDER',
          placeholders: unfilledPlaceholders,
        },
        { status: 422 }
      );
    }

    // ── RUN GUARDRAILS ───────────────────────────────────
    const guardrails = runGuardrails(result.content, orderType, normalizedCaseDetails);

    // ── SAVE ORDER TO DATABASE ───────────────────────────
    const { data: savedOrder, error: saveError } = await adminClient
      .from('orders')
      .insert({
        user_id: user.id,
        case_type: orderType,
        input_text: normalizedCaseDetails,
        generated_order: result.content,
        score: guardrails.allPassed ? 90 : 70,
        model_used: result.model,
        verified: false,
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Order save error:', saveError);
      // Don't block the response — order was generated successfully
    }

    // ── DEDUCT 1 CREDIT ──────────────────────────────────
    const { error: creditError } = await adminClient
      .from('profiles')
      .update({
        credits_remaining: profile.credits_remaining - 1,
        total_orders_generated: (await adminClient
          .from('profiles')
          .select('total_orders_generated')
          .eq('id', user.id)
          .single()
        ).data?.total_orders_generated + 1 || 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (creditError) {
      console.error('Credit deduction error:', creditError);
    }

    // ── RESPOND ──────────────────────────────────────────
    return NextResponse.json({
      success: true,
      order: result.content,
      orderId: savedOrder?.id || null,
      metadata: {
        wordCount: result.wordCount,
        model: result.model,
        tokensUsed: result.tokensUsed,
        orderType,
        generationTime: `${generationTime}s`,
        generatedAt: new Date().toISOString(),
        creditsRemaining: profile.credits_remaining - 1,
        refsUsed: smartContext.refsUsed,
        totalRefs: smartContext.totalRefs,
        refSource: smartContext.source,
      },
      guardrails: {
        results: guardrails.results,
        allPassed: guardrails.allPassed,
        summary: guardrails.summary,
        summaryKn: guardrails.summaryKn,
      },
    });
  } catch (error: unknown) {
    console.error('Order generation error:', error);
    // Return Kannada error message to user (never leak server details)
    const message = error instanceof Error && error.message.includes('timeout')
      ? 'AI ಸೇವೆ ನಿಧಾನವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
      : 'ಆದೇಶ ರಚನೆ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
