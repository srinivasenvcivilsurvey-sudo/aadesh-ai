import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Auth
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortDir = searchParams.get('dir') === 'asc' ? true : false;

    // Use service role for DB access
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = adminClient
      .from('orders')
      .select('id, case_type, input_text, generated_order, score, model_used, verified, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortDir })
      .range((page - 1) * limit, page * limit - 1);

    // Search filter — search in input_text
    if (search) {
      query = query.ilike('input_text', `%${search}%`);
    }

    const { data: orders, error: queryError, count } = await query;

    if (queryError) {
      console.error('Orders query error:', queryError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Compute word count for each order
    const ordersWithMeta = (orders || []).map(o => {
      const wordCount = (o.generated_order || '').split(/\s+/).filter(Boolean).length;
      // Extract case number from input text
      const caseMatch = (o.input_text || '').match(/\d+\/\d+/);
      return {
        id: o.id,
        caseType: o.case_type,
        caseNumber: caseMatch?.[0] || null,
        wordCount,
        score: o.score,
        model: o.model_used,
        verified: o.verified,
        createdAt: o.created_at,
        // Send a preview (first 200 chars) instead of full text
        preview: (o.generated_order || '').slice(0, 200),
      };
    });

    return NextResponse.json({
      orders: ordersWithMeta,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
