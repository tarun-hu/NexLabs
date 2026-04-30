import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Try to insert a test TRD into a project
    const { data: testProject } = await supabaseAdmin
      .from('projects')
      .select('id, technical_requirements, trd_status')
      .limit(1)
      .single();

    if (testProject) {
      return NextResponse.json({
        message: 'Schema check successful',
        sample: {
          id: testProject.id,
          has_technical_requirements: testProject.technical_requirements !== null,
          trd_status: testProject.trd_status,
        },
      });
    }

    // If no projects exist, try to create one with TRD fields
    const { data: newProject, error: insertError } = await supabaseAdmin
      .from('projects')
      .insert({
        title: 'Test Project',
        idea_summary: 'Test',
        vertical: 'Test',
        timeline: 'Test',
        budget_range: 'Test',
        technical_requirements: { test: 'data' },
        trd_status: 'generated',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        message: 'Schema check failed',
        error: insertError,
      }, { status: 500 });
    }

    // Clean up test project
    await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', newProject.id);

    return NextResponse.json({
      message: 'Schema check successful - columns exist and work',
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Schema check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
