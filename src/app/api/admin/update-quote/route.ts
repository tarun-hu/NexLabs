import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and verify admin role
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — Admin access required' }, { status: 403 });
    }

    const { projectId, quote_amount, quote_notes, status } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (quote_amount !== undefined) {
      updateData.quote_amount = quote_amount;
    }
    if (quote_notes !== undefined) {
      updateData.quote_notes = quote_notes;
    }
    if (status) {
      const validStatuses = ['lead', 'discovery', 'quoted', 'active', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      updateData.status = status;
    }

    // Update project
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Admin update-quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
