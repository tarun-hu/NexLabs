import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
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

    // Fetch ALL projects (admin view)
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        users!projects_user_id_fkey (email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      // If the join fails (e.g., no foreign key), fallback to plain query
      const { data: plainProjects, error: plainError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (plainError) throw plainError;
      return NextResponse.json(plainProjects || []);
    }

    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('Admin projects fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
