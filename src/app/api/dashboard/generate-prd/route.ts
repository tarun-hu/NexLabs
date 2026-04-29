import { NextRequest, NextResponse } from 'next/server';
import { openai, PRD_MODEL, FALLBACK_MODEL } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const PRD_GENERATION_PROMPT = `You are an expert product manager. Based on the client's questionnaire answers, create a concise, actionable PRD.

Output JSON format:
{
  "product_name": string,
  "problem_statement": string (1 sentence),
  "target_user": string,
  "core_features": [string] (3-5 features),
  "screen_inventory": [string] (list of screens needed),
  "user_flows": [string] (key user journeys),
  "success_metrics": string,
  "out_of_scope": [string],
  "development_phases": ["Phase 1: MVP", "Phase 2: ..."],
  "design_system": string (colors, typography, vibe),
  "recommended_stack": string,
  "timeline_estimate": string,
  "complexity_score": number (1-10),
  "quote_range_low": number,
  "quote_range_high": number
}`;

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    // Map answers to PRD sections
    const prdInput = {
      primary_user: answers.primary_user,
      user_pain_point: answers.user_pain_point,
      primary_feature: answers.primary_feature,
      secondary_features: answers.secondary_features,
      platform: answers.platform,
      design_preference: answers.design_preference,
      timeline_urgency: answers.timeline_urgency,
      existing_tools: answers.existing_tools,
      success_metric: answers.success_metric,
      target_users_count: answers.target_users_count,
      out_of_scope: answers.out_of_scope,
      must_have_only: answers.must_have_only,
    };

    const userPrompt = `
Based on these questionnaire answers, generate a PRD:

- Primary User: ${prdInput.primary_user}
- Pain Point: ${prdInput.user_pain_point}
- Core Feature: ${prdInput.primary_feature}
- Secondary Features: ${Array.isArray(prdInput.secondary_features) ? prdInput.secondary_features.join(', ') : prdInput.secondary_features}
- Platform: ${Array.isArray(prdInput.platform) ? prdInput.platform.join(', ') : prdInput.platform}
- Design Vibe: ${prdInput.design_preference}
- Timeline: ${prdInput.timeline_urgency}
- Existing Tools: ${Array.isArray(prdInput.existing_tools) ? prdInput.existing_tools.join(', ') : prdInput.existing_tools || 'None'}
- Success Metric: ${prdInput.success_metric}
- Target Users (6mo): ${prdInput.target_users_count}
- Out of Scope: ${Array.isArray(prdInput.out_of_scope) ? prdInput.out_of_scope.join(', ') : 'None specified'}
- MVP Focus: ${prdInput.must_have_only}
`;

    let prdResult;
    try {
      prdResult = await openai.chat.completions.create({
        model: PRD_MODEL,
        messages: [
          { role: 'system', content: PRD_GENERATION_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
    } catch (openaiError) {
      console.warn('Primary model failed, using fallback:', openaiError);
      prdResult = await openai.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [
          { role: 'system', content: PRD_GENERATION_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
    }

    const prd = JSON.parse(prdResult.choices[0].message.content || '{}');

    // Find or create user
    const { data: session } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', (req.headers.get('x-user-email') as string) || '')
      .single();

    // Create project with PRD
    const { data: project } = await supabaseAdmin
      .from('projects')
      .insert({
        title: prd.product_name || 'New Project',
        idea_summary: `${prdInput.primary_user} - ${prdInput.user_pain_point}`,
        vertical: 'Custom',
        timeline: prdInput.timeline_urgency,
        budget_range: 'TBD',
        ai_generated_prd: prd,
        status: 'discovery',
        client_email: req.headers.get('x-user-email') as string,
        user_id: session?.id || null,
        quote_amount: prd.quote_range_low ? prd.quote_range_low * 100 : null,
        quote_notes: `AI Estimated: $${prd.quote_range_low?.toLocaleString()} - $${prd.quote_range_high?.toLocaleString()}`,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      projectId: project?.id,
      prd,
    });
  } catch (error) {
    console.error('PRD generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PRD' }, { status: 500 });
  }
}
