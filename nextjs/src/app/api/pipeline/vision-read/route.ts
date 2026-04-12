/**
 * POST /api/pipeline/vision-read
 * Reads a case file using Claude Sonnet Vision and returns a structured summary + questions.
 * Images are held in memory only â€” never written to disk or stored in Supabase.
 *
 * Properties validated:
 *   4: Vision_Reader sends all pages to the API
 *   5: Case summary always contains all required fields
 *   6: Vision_Reader always returns 4 to 5 questions
 *
 * v9.2 security additions:
 *   - Bearer token auth via Supabase (Fix 2)
 *   - Retry logic: 2 retries with 2s delay on network errors, not rate limits (Fix 2)
 *   - Credit check before allowing vision read (Fix 12)
 *   - PDF sent as application/pdf with Anthropic beta header (Fix 15)
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import type { CaseSummary, VisionReadResponse } from '@/lib/pipeline/types';
import mammoth from 'mammoth';
import { checkDailyLimit, formatResetTime } from '@/lib/pipeline/rateLimiter';

const VISION_MODEL = 'claude-sonnet-4-6';
const VISION_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2_000;

const VISION_SYSTEM_PROMPT = `You are an AI assistant for Karnataka government officers. 
Read the provided case file pages and extract structured information.
Return ONLY valid JSON in this exact format, no other text:
{
  "caseType": "string (e.g. 'contested_appeal', 'withdrawal', 'suo_motu')",
  "parties": {
    "petitioner": "string (appellant/petitioner name)",
    "respondent": "string (respondent name)"
  },
  "keyFacts": ["fact 1", "fact 2", "fact 3", "..."],
  "reliefSought": "string (what the petitioner is asking for)",
  "questions": [
    "Question 1 in Kannada or English",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5 (optional case-specific question)"
  ]
}
The questions array must have 4 to 5 items. The last question should be specific to this case.
keyFacts must include all survey numbers, case numbers, dates, and party names mentioned.`;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Anthropic.RateLimitError) return true;
  if (err instanceof Error) {
    return err.message.includes('429') || err.message.toLowerCase().includes('rate limit');
  }
  return false;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'à²…à²¨à²§à²¿à²•à³ƒà²¤ / Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'à²…à²¨à²§à²¿à²•à³ƒà²¤ / Unauthorized' }, { status: 401 });
  }

  // â”€â”€ Credit check (Fix 12) â€” don't deduct, just gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Admin client for credit + rate-limit gate (service role key required)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey ?? 'missing-service-role-key'
  );

  // Credit check: fail open if service role key is not configured
  if (!serviceRoleKey) {
    console.warn('[vision-read] SUPABASE_SERVICE_ROLE_KEY not set — skipping credit+rate-limit gate');
  } else {
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[vision-read] Credit check error:', profileError.message, '— proceeding anyway');
    } else if ((profile?.credits_remaining ?? 0) < 1) {
      console.warn('[vision-read] No credits for user:', user.id);
      return NextResponse.json(
        { error: 'No credits remaining. Please recharge / ಕೈಗಳಿಲ್ಲಗಿರುವದನ್ನು. ದಯವಿಟ್ಟು ರಿಚಾರ್ಜ್ ಮಾಡಿ.' },
        { status: 402 }
      );
    }

    // Rate limit check
    const rateLimit = await checkDailyLimit(user.id, adminClient);
    if (!rateLimit.allowed) {
      const resetTime = formatResetTime(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: `Daily limit reached. Try again after ${resetTime}.`,
          code: 'RATE_LIMIT_DAILY',
        },
        { status: 429 }
      );
    }
  }

  try {
    const body = await request.json();
    const { fileBase64, mimeType } = body as {
      fileBase64: string;
      mimeType: string;
      pageCount: number;
    };

    if (!fileBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'à²«à³ˆà²²à³ à²¡à³‡à²Ÿà²¾ à²…à²—à²¤à³à²¯ / File data required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'à²¸à²°à³à²µà²°à³ à²•à²¾à²¨à³à²«à²¿à²—à²°à³‡à²¶à²¨à³ à²¦à³‹à²· / Server configuration error' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });
    const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // -- DOCX: extract text with mammoth instead of sending as image ----------------
    let docxText: string | null = null;
    if (isDocx) {
      const buffer = Buffer.from(fileBase64, 'base64');
      const extracted = await mammoth.extractRawText({ buffer });
      if (!extracted.value?.trim()) {
        return NextResponse.json(
          { error: 'DOCX text extraction failed. Please convert to PDF and retry.' },
          { status: 422 }
        );
      }
      docxText = extracted.value;
    }

    const imageContent = isDocx ? [] : buildImageContent(fileBase64, mimeType);

    // â”€â”€ Call with retry logic (Fix 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let rawResponse = '';
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

      try {
        const isPdf = mimeType === 'application/pdf';
        const response = await client.messages.create(
          {
            model: VISION_MODEL,
            max_tokens: 2048,
            system: VISION_SYSTEM_PROMPT,
            messages: [
              {
                role: 'user',
                content: docxText
                  ? [
                      { type: 'text' as const, text: `Case file document text:\n\n${docxText}` },
                      { type: 'text' as const, text: 'Please analyze this case file and return the structured JSON as specified.' },
                    ]
                  : [
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ...(imageContent as any[]),
                      { type: 'text' as const, text: 'Please analyze this case file and return the structured JSON as specified.' },
                    ],
              },
            ],
          },
          isPdf ? { headers: { 'anthropic-beta': 'pdfs-2024-09-25' } } : undefined
        );

        rawResponse = response.content
          .filter(block => block.type === 'text')
          .map(block => (block as { type: 'text'; text: string }).text)
          .join('');

        clearTimeout(timeout);
        break; // success â€” exit retry loop
      } catch (err) {
        clearTimeout(timeout);
        lastError = err;

        // Don't retry rate limit errors
        if (isRateLimitError(err)) {
          throw err;
        }

        // Don't retry on last attempt
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    if (!rawResponse) {
      throw lastError ?? new Error('Vision API returned empty response');
    }

    // Parse and validate the JSON response
    const parsed = parseCaseSummary(rawResponse);
    const result: VisionReadResponse = {
      caseSummary: {
        caseType: parsed.caseType,
        parties: parsed.parties,
        keyFacts: parsed.keyFacts,
        reliefSought: parsed.reliefSought,
      },
      questions: parsed.questions,
      caseType: parsed.caseType,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Vision read error:', err);
    const message = err instanceof Error && err.name === 'AbortError'
      ? 'AI à²¸à³‡à²µà³† à²¨à²¿à²§à²¾à²¨à²µà²¾à²—à²¿à²¦à³†. à²¦à²¯à²µà²¿à²Ÿà³à²Ÿà³ à²®à²¤à³à²¤à³Šà²®à³à²®à³† à²ªà³à²°à²¯à²¤à³à²¨à²¿à²¸à²¿ / AI service timed out. Please retry.'
      : 'à²«à³ˆà²²à³ à²“à²¦à²²à³ à²¸à²¾à²§à³à²¯à²µà²¾à²—à²²à²¿à²²à³à²². à²¦à²¯à²µà²¿à²Ÿà³à²Ÿà³ à²®à²¤à³à²¤à³Šà²®à³à²®à³† à²ªà³à²°à²¯à²¤à³à²¨à²¿à²¸à²¿ / Could not read file. Please retry.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type AnthropicImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

type ImageBlock = {
  type: 'image';
  source: { type: 'base64'; media_type: AnthropicImageMediaType; data: string };
};

type DocumentBlock = {
  type: 'document';
  source: { type: 'base64'; media_type: 'application/pdf'; data: string };
};

function buildImageContent(
  fileBase64: string,
  mimeType: string
): Array<ImageBlock | DocumentBlock> {
  // PDFs: send as application/pdf with Anthropic beta (Fix 15)
  if (mimeType === 'application/pdf') {
    return [{
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: fileBase64,
      },
    }];
  }

  // Images (JPG/PNG): single image block
  if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
    return [{
      type: 'image',
      source: {
        type: 'base64',
        media_type: mimeType as AnthropicImageMediaType,
        data: fileBase64,
      },
    }];
  }

  // DOCX: handled via mammoth text extraction in POST handler (not via Vision)
  return [];
}

interface ParsedVisionResponse {
  caseType: string;
  parties: CaseSummary['parties'];
  keyFacts: string[];
  reliefSought: string;
  questions: string[];
}

/**
 * Parse and validate the Claude Vision JSON response.
 * Property 5: Case summary always contains all required fields.
 * Property 6: Vision_Reader always returns 4 to 5 questions.
 */
function parseCaseSummary(rawResponse: string): ParsedVisionResponse {
  // Extract JSON from response (Claude sometimes wraps in markdown)
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Vision response');
  }

  let parsed: Partial<ParsedVisionResponse>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Invalid JSON in Vision response');
  }

  // Validate required fields
  if (!parsed.caseType || typeof parsed.caseType !== 'string' || !parsed.caseType.trim()) {
    throw new Error('Missing or empty caseType in Vision response');
  }
  if (!parsed.parties?.petitioner || !parsed.parties?.respondent) {
    throw new Error('Missing parties in Vision response');
  }
  if (!Array.isArray(parsed.keyFacts) || parsed.keyFacts.length === 0) {
    throw new Error('Missing or empty keyFacts in Vision response');
  }
  if (!parsed.reliefSought || typeof parsed.reliefSought !== 'string' || !parsed.reliefSought.trim()) {
    throw new Error('Missing or empty reliefSought in Vision response');
  }
  if (!Array.isArray(parsed.questions) || parsed.questions.length < 4 || parsed.questions.length > 5) {
    throw new Error(`questions array must have 4-5 items, got ${parsed.questions?.length ?? 0}`);
  }

  return parsed as ParsedVisionResponse;
}

