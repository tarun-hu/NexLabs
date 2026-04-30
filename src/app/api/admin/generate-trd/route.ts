import { NextRequest, NextResponse } from 'next/server';
import { openai, TRD_MODEL, FALLBACK_MODEL } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const TRD_GENERATION_PROMPT = `You are a senior software architect helping me create a Technical Requirements Document (TRD) for my app. I'm using AI coding tools (Claude, Cursor, v0.dev, Bolt) to build this, so the TRD needs to be "vibe coding friendly" - clear specs that AI can understand and implement.

CRITICAL REQUIREMENTS FOR VIBE CODING:
- Recommend SPECIFIC libraries/packages with exact names (e.g., "react-native-deck-swiper", not "a card library")
- Use FREE tiers wherever possible (Firebase Spark, Vercel free, etc.)
- Suggest pre-built UI component libraries (saves time vs custom coding)
- Avoid complex custom solutions - prefer standard patterns AI tools know well
- All database field names must be exact (AI will use these verbatim)

Output as JSON with these exact keys. All fields are required:
{
  "document_overview": "2-3 sentence summary of the technical approach",
  "system_architecture": "Simple text diagram like: Client (Next.js) → API Routes → Supabase → OpenAI API",
  "technology_stack": [{"component": "Frontend", "technology": "Next.js 14 + React", "why": "Fast SSR, great DX"}],
  "database_schema": [{"table": "users", "fields": [{"name": "id", "type": "UUID PRIMARY KEY", "constraints": "auto-generated"}]}],
  "api_design": [{"name": "createUser", "purpose": "Create new user", "input": "email, name", "output": "user object"}],
  "security_rate_limiting": [{"rule": "API rate limiting", "limit": "100 requests/minute per user"}],
  "ai_integration": {"service": "OpenAI via NVIDIA API", "models": ["llama-3.1-8b-instruct"], "implementation": "Server-side API calls"},
  "deployment_strategy": ["Step 1: Push to GitHub", "Step 2: Connect Vercel", "Step 3: Add env vars"],
  "performance_requirements": {"load_time_ms": 1000, "fps": 60, "concurrent_users": 1000},
  "cost_estimate": {"free_tier_limit": 100, "cost_at_100_users": "$0", "cost_at_1000_users": "$20/mo", "cost_at_10000_users": "$200/mo"},
  "development_checklist": [{"day": "Day 1", "tasks": ["Setup Next.js project", "Configure Supabase"]}],
  "technical_success_criteria": ["Page loads under 1s", "Zero console errors", "All tests passing"],
  "required_env_vars": [{"name": "SUPABASE_URL", "description": "Your Supabase project URL", "required": true}],
  "external_dependencies": [{"name": "Supabase", "purpose": "Database + Auth", "free_tier": "Spark plan - 500MB DB, 50K MAU"}]
}`;

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    // Retry logic: wait for PRD to be available (in case of race condition)
    let project = null;
    let retries = 0;
    const maxRetries = 10;
    const retryDelay = 1000; // 1 second

    while (!project && retries < maxRetries) {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('ai_generated_prd, title, vertical')
        .eq('id', projectId)
        .single();

      if (error || !data) {
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        console.error('Failed to fetch project after retries:', error);
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      if (!data.ai_generated_prd) {
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        return NextResponse.json({ error: 'PRD not ready yet, try again in a few seconds' }, { status: 400 });
      }

      project = data;
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found after retries' }, { status: 404 });
    }

    const prdData = project.ai_generated_prd;

    const userPrompt = `
Project: ${project.title || 'Unnamed'}
Vertical: ${project.vertical || 'N/A'}

PRD Data:
${JSON.stringify(prdData, null, 2)}

Generate a complete TRD with all required fields. Be specific with library names, exact database field names, and free-tier services.
`;

    let trdResult;
    try {
      trdResult = await openai.chat.completions.create({
        model: TRD_MODEL,
        messages: [
          { role: 'system', content: TRD_GENERATION_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 4000,
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
        max_tokens: 4000,
      });
    }

    const trdContent = trdResult.choices[0].message.content;

    if (!trdContent) {
      console.error('TRD generation returned empty content');
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
    }

    console.log('Raw TRD content received:', trdContent.substring(0, 500) + '...');

    let trd;
    try {
      trd = JSON.parse(trdContent);
      console.log('TRD parsed successfully:', Object.keys(trd));
    } catch (parseError) {
      console.error('Failed to parse TRD JSON:', parseError);
      console.error('Raw content that failed to parse:', trdContent);
      return NextResponse.json({
        error: 'Invalid JSON from AI',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 500 });
    }

    // Update project with TRD
    console.log('Attempting to update project:', projectId);
    console.log('TRD data keys:', Object.keys(trd));

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('projects')
      .update({
        technical_requirements: trd,
        trd_status: 'generated',
      })
      .eq('id', projectId)
      .select();

    console.log('Supabase update result:', { updateData, updateError });

    if (updateError) {
      console.error('Failed to update project with TRD:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json({
        error: 'Failed to save TRD to database',
        details: updateError.message,
        hint: 'Check if technical_requirements column exists in projects table'
      }, { status: 500 });
    }

    console.log('TRD saved successfully for project:', projectId, updateData);

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
