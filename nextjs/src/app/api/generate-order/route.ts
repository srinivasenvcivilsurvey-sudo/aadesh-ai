import { NextRequest, NextResponse } from 'next/server';
import { generateOrder, DEFAULT_SYSTEM_PROMPT } from '@/lib/sarvam';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Verify user with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { orderType, caseDetails, systemPrompt } = body;

    if (!orderType || !caseDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: orderType, caseDetails' },
        { status: 400 }
      );
    }

    // Validate order type
    if (!['appeal', 'suo_motu'].includes(orderType)) {
      return NextResponse.json(
        { error: 'Invalid orderType. Must be "appeal" or "suo_motu"' },
        { status: 400 }
      );
    }

    // Check Sarvam API key
    const sarvamKey = process.env.SARVAM_API_KEY;
    if (!sarvamKey) {
      return NextResponse.json(
        { error: 'Server configuration error: SARVAM_API_KEY not set' },
        { status: 500 }
      );
    }

    // Generate the order using Sarvam 105B
    const result = await generateOrder(
      {
        orderType,
        caseDetails,
        systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
      },
      sarvamKey
    );

    // TODO: Deduct credits from user's balance in Supabase
    // TODO: Save generated order to orders table

    return NextResponse.json({
      success: true,
      order: result.content,
      metadata: {
        wordCount: result.wordCount,
        model: result.model,
        tokensUsed: result.tokensUsed,
        orderType,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('Order generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate order' },
      { status: 500 }
    );
  }
}
