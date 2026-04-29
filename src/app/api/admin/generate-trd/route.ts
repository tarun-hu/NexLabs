import { NextRequest, NextResponse } from 'next/server';
import { openai, PRD_MODEL, FALLBACK_MODEL } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const TRD_GENERATION_PROMPT = `You are a senior software architect. Create a Technical Requirements Document (TRD) based on the PRD.
This TRD will be used by AI coding tools (Claude, Cursor, v0.dev) so it must be "vibe coding friendly" - clear specs that AI can implement.

Output JSON format:
{
  "system_architecture": string,
  "technology_stack": [{"component": string, "technology": string, "why": string}],
  "database_schema": [{"table": string, "fields": [{"name": string, "type": string, "description": string}]}],
  "api_design": [{"name": string, "method": string, "endpoint": string, "purpose": string, "input": string, "output": string}],
  "security_measures": [string],
  "ai_integration": {"service": string, "models": [string], "implementation": string},
  "deployment_strategy": [string],
  "performance_requirements": {"load_time_ms": number, "concurrent_users": number, "notes": string},
  "cost_estimate": {"free_tier_limit": number, "cost_at_100_users": string, "cost_at_1000_users": string, "cost_at_10000_users": string},
  "development_checklist": [{"day": string, "tasks": [string]}],
  "technical_success_criteria": [string],
  "required_env_vars": [{"name": string, "description": string, "required": boolean}],
  "external_dependencies": [{"name": string, "purpose": string, "free_tier": string}]
}`;

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    // Fetch PRD from project
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('ai_generated_prd, title, vertical')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      console.error('Failed to fetch project:', fetchError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const prdData = project.ai_generated_prd;

    if (!prdData) {
      return NextResponse.json({ error: 'No PRD found for this project' }, { status: 400 });
    }

    const userPrompt = `
Project: ${project.title || 'Unnamed'}
Vertical: ${project.vertical || 'N/A'}

PRD Details:
- Product: ${prdData.product_name || 'N/A'}
- Problem: ${prdData.problem_statement || 'N/A'}
- Target User: ${prdData.target_user || 'N/A'}
- Core Features: ${Array.isArray(prdData.core_features) ? prdData.core_features.join(', ') : 'N/A'}
- Recommended Stack: ${prdData.recommended_stack || 'N/A'}
- Complexity: ${prdData.complexity_score || 'N/A'}/10
- Timeline: ${prdData.timeline_estimate || 'N/A'}
- Quote Range: $${prdData.quote_range_low || 'N/A'} - $${prdData.quote_range_high || 'N/A'}

Generate a complete TRD with all required fields including required_env_vars for deployment.
`;

    let trdResult;
    try {
      trdResult = await openai.chat.completions.create({
        model: PRD_MODEL,
        messages: [
          { role: 'system', content: TRD_GENERATION_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });
    } catch (openaiError: unknown) {
      console.warn('Primary model failed, using fallback:', openaiError);
      trdResult = await openai.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [
          { role: 'system', content: TRD_GENERATION_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });
    }

    const trdContent = trdResult.choices[0].message.content || '{}';
    const trd = JSON.parse(trdContent);

    // Update project with TRD
    await supabaseAdmin
      .from('projects')
      .update({
        technical_requirements: trd,
        trd_status: 'generated',
      })
      .eq('id', projectId);

    return NextResponse.json({
      success: true,
      trd,
    });
  } catch (error) {
    console.error('TRD generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate TRD',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
