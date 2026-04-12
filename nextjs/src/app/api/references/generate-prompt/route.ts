/**
 * POST /api/references/generate-prompt
 * Analyzes user's reference orders and generates a personalized system prompt.
 * Stores result in profiles.personal_prompt.
 * Triggered automatically when user has 5+ reference files.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // ── Load user's reference orders ─────────────────────────────────────────
    const { data: references, error: refsError } = await adminClient
      .from('references')
      .select('extracted_text, file_name')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })
      .limit(20);

    if (refsError || !references || references.length < 5) {
      return NextResponse.json(
        { error: 'Need at least 5 reference orders to generate a personal prompt' },
        { status: 400 }
      );
    }

    // ── Load base system prompt V3.2.6 ───────────────────────────────────────
    let basePrompt = '';
    const promptPaths = [
      path.join(process.cwd(), '..', 'KarnatakaAI', '11_DDLR_App', 'DDLR_SYSTEM_PROMPT_V3_2_6.md'),
      path.join(process.cwd(), '..', '..', 'KarnatakaAI', '11_DDLR_App', 'DDLR_SYSTEM_PROMPT_V3_2_6.md'),
      // Fallback for Linux VPS layout
      '/root/aadesh-ai/KarnatakaAI/11_DDLR_App/DDLR_SYSTEM_PROMPT_V3_2_6.md',
    ];

    for (const p of promptPaths) {
      try {
        basePrompt = fs.readFileSync(p, 'utf-8');
        if (basePrompt.trim()) break;
      } catch {
        // Try next path
      }
    }

    if (!basePrompt.trim()) {
      console.error('V3.2.6 prompt file not found at any expected path');
      // Use embedded fallback — the system-prompt.ts V3.2.1
      const { buildSystemPrompt } = await import('@/lib/system-prompt');
      basePrompt = buildSystemPrompt();
    }

    // ── Call Anthropic to generate personalized prompt ────────────────────────
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: anthropicKey });
    const orderTexts = references
      .map((ref, i) => `--- Order ${i + 1}: ${ref.file_name} ---\n${ref.extracted_text}`)
      .join('\n\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: [
        {
          type: 'text',
          text: 'You are an expert in Karnataka government drafting. Analyze sample orders and extract the officer\'s personal style.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Analyze these ${references.length} orders written by one specific Karnataka government officer. Then write a complete system prompt that instructs an AI to draft orders in EXACTLY this officer's style.

Base your system prompt on this foundation:
---BASE PROMPT START---
${basePrompt}
---BASE PROMPT END---

After the base prompt, ADD a section titled:
'=== OFFICER PERSONAL STYLE (auto-generated) ==='

In this section, document specifically:
1. Three to five real phrases from their orders as style examples
2. Their typical section lengths (words per section)
3. Their preferred legal terminology vs alternatives
4. How they open and close each section
5. Their paragraph rhythm (short/medium/long sentences)
6. Any unique patterns in their Sarakari Kannada usage

IMPORTANT: Quote real phrases from their actual orders.
Be specific, not generic. This prompt will be used to
generate future orders that must sound like this officer.

Here are the officer's ${references.length} orders:

${orderTexts}`,
        },
      ],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
    );
    if (!textBlock) {
      return NextResponse.json(
        { error: 'AI did not return a prompt' },
        { status: 500 }
      );
    }

    const generatedPrompt = textBlock.text;
    const trainingStatus = Math.min(100, references.length * 5);

    // ── Store in profiles ────────────────────────────────────────────────────
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        personal_prompt: generatedPrompt,
        training_status: trainingStatus,
        prompt_generated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      // If columns don't exist, try adding them
      if (updateError.message?.includes('personal_prompt') || updateError.message?.includes('column')) {
        try {
          await adminClient.rpc('exec_sql', {
            sql: `
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_prompt TEXT;
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_status INTEGER DEFAULT 0;
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prompt_generated_at TIMESTAMPTZ;
            `,
          });
          // Retry update
          await adminClient
            .from('profiles')
            .update({
              personal_prompt: generatedPrompt,
              training_status: trainingStatus,
              prompt_generated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        } catch (alterErr) {
          console.error('ALTER TABLE failed:', alterErr);
          return NextResponse.json(
            { error: 'Database schema update needed. Please contact support.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to save personal prompt' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      training_status: trainingStatus,
      prompt_length: generatedPrompt.length,
    });
  } catch (err) {
    console.error('Generate prompt error:', err);
    return NextResponse.json(
      { error: 'Prompt generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
