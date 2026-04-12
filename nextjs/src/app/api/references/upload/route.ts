/**
 * POST /api/references/upload
 * Uploads a reference order file, extracts text, stores in Supabase.
 * Accepts: PDF, DOCX, TXT. Max 10MB per file.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';

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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      return NextResponse.json(
        { error: 'Only PDF, DOCX, and TXT files are accepted' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File must be smaller than 10MB' },
        { status: 400 }
      );
    }

    // Check total count (max 30 reference files)
    const { count: existingCount } = await adminClient
      .from('references')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((existingCount ?? 0) >= 30) {
      return NextResponse.json(
        { error: 'Maximum 30 reference files allowed' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Extract text based on file type ──────────────────────────────────────
    let extractedText = '';

    if (ext === 'txt') {
      extractedText = buffer.toString('utf-8');
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (ext === 'pdf') {
      // pdf-parse v2.x: PDFParse class with getText()
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      extractedText = textResult.text || '';
      await parser.destroy();
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from file. Please check the file and try again.' },
        { status: 422 }
      );
    }

    // ── Upload file to Supabase Storage ──────────────────────────────────────
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await adminClient.storage
      .from('references')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, try to create it
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        await adminClient.storage.createBucket('references', {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024,
        });
        // Retry upload
        const { error: retryError } = await adminClient.storage
          .from('references')
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
          });
        if (retryError) {
          console.error('Storage upload retry failed:', retryError);
          // Continue without storage — text extraction is the critical part
        }
      } else {
        console.error('Storage upload error:', uploadError);
        // Continue without storage — text is more important
      }
    }

    // ── Store metadata in references table ───────────────────────────────────
    const { error: insertError } = await adminClient
      .from('references')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        extracted_text: extractedText,
        uploaded_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('References insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save reference order. Please retry.' },
        { status: 500 }
      );
    }

    // ── Get updated count ────────────────────────────────────────────────────
    const { count: totalCount } = await adminClient
      .from('references')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const newCount = totalCount ?? 0;

    // ── Auto-trigger personal prompt generation when user first reaches 5 refs ──
    // Fire-and-forget async IIFE: does NOT block the upload response.
    if (newCount >= 5) {
      void (async () => {
        try {
          const { data: profile } = await adminClient
            .from('profiles')
            .select('personal_prompt')
            .eq('id', user.id)
            .single();

          if (!profile?.personal_prompt) {
            console.log(`[auto-prompt] Triggering personal prompt for user ${user.id} (${newCount} references)`);
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const r = await fetch(`${baseUrl}/api/references/generate-prompt`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader!, // Reuse Bearer token from upload request
              },
            });
            if (!r.ok) {
              const d = await r.json().catch(() => ({})) as unknown;
              console.error(`[auto-prompt] Failed for user ${user.id}:`, d);
            } else {
              console.log(`[auto-prompt] Successfully generated prompt for user ${user.id}`);
            }
          }
        } catch (err) {
          console.error(`[auto-prompt] Error for user ${user.id}:`, err);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      file_name: file.name,
      total_count: newCount,
      text_length: extractedText.length,
    });
  } catch (err) {
    console.error('Reference upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
