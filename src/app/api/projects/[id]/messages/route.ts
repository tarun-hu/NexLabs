import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { content, is_internal } = await req.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify project exists and user has access
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Only owner or admin can post messages
    if (project.user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only admins can mark messages as internal
    const messageIsInternal = user.role === 'admin' ? (is_internal || false) : false;

    // Insert message
    const { data: message, error } = await supabaseAdmin
      .from('project_messages')
      .insert({
        project_id: id,
        sender_id: user.id,
        content: content.trim(),
        is_internal: messageIsInternal,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Message post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
