import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get user for role check
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Project fetch result:', { project, projectError });

    if (projectError) {
      console.error('Project fetch error details:', projectError);
      return NextResponse.json({ error: 'Project not found', details: projectError.message }, { status: 404 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check authorization (owner or admin)
    // Also check client_email as fallback for projects without user_id
    const isOwner = project.user_id === user.id || project.client_email === session.user.email;
    const isAdmin = user.role === 'admin';

    console.log('Auth check:', { projectUserId: project.user_id, userId: user.id, userRole: user.role, isOwner, isAdmin, clientEmail: project.client_email });

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch messages (non-internal for clients, all for admins)
    const messagesQuery = supabaseAdmin
      .from('project_messages')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    if (user.role !== 'admin') {
      messagesQuery.eq('is_internal', false);
    }

    const { data: messages } = await messagesQuery;

    return NextResponse.json({
      project,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Project details fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Get user for role check
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the project to check ownership and status
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('user_id, status')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check authorization:
    // 1. Client can withdraw their own project (any status)
    // 2. Admin can delete rejected projects
    const isOwner = project.user_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Admins can only delete rejected projects
    if (isAdmin && project.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Admins can only delete rejected projects' },
        { status: 400 }
      );
    }

    // Delete the project
    const { error: deleteError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error('Failed to delete project:', deleteError);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
