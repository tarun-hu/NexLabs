import { NextRequest, NextResponse } from 'next/server';
import { openai, PRD_MODEL, FALLBACK_MODEL } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const PRD_SYSTEM_PROMPT = `You are a technical co-founder helping scope a software project.
Generate a structured 1-page PRD from the client's form submission AND questionnaire answers.

Output JSON format:
{
  "product_name": string,
  "problem_statement": string (1-2 sentences),
  "target_user": string,
  "core_features": [string] (3-5 features),
  "screen_inventory": [string],
  "user_flows": [string],
  "success_metrics": string,
  "out_of_scope": [string],
  "development_phases": ["Phase 1: MVP", "Phase 2: ..."],
  "design_system": string,
  "recommended_stack": string,
  "timeline_estimate": string,
  "complexity_score": number (1-10),
  "ai_features_suggested": [string],
  "risks_and_considerations": [string],
  "quote_range_low": number,
  "quote_range_high": number
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, questionnaire_answers } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    // Fetch submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('scoping_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Use questionnaire answers from request body if provided, otherwise from submission
    const qa = questionnaire_answers || (submission.ai_prd_raw as Record<string, unknown>)?.questionnaire || {};

    // Generate PRD with OpenAI using questionnaire data
    const userPrompt = `
Project Idea: ${submission.idea}
Vertical: ${submission.vertical}
Timeline: ${submission.timeline}
Budget: ${submission.budget_range}

Questionnaire Answers:
- Primary User: ${qa.primary_user || 'Not specified'}
- Pain Point: ${qa.user_pain_point || 'Not specified'}
- Core Feature: ${qa.primary_feature || 'Not specified'}
- Secondary Features: ${Array.isArray(qa.secondary_features) ? qa.secondary_features.join(', ') : qa.secondary_features || 'Not specified'}
- Platform: ${Array.isArray(qa.platform) ? qa.platform.join(', ') : qa.platform || 'Not specified'}
- Design Preference: ${qa.design_preference || 'Not specified'}
- Timeline Urgency: ${qa.timeline_urgency || 'Not specified'}
- Existing Tools: ${Array.isArray(qa.existing_tools) ? qa.existing_tools.join(', ') : qa.existing_tools || 'None'}
- Success Metric: ${qa.success_metric || 'Not specified'}
- Target Users (6mo): ${qa.target_users_count || 'Not specified'}
- Out of Scope: ${Array.isArray(qa.out_of_scope) ? qa.out_of_scope.join(', ') : 'None specified'}
- MVP Focus: ${qa.must_have_only || 'Not specified'}

Generate a comprehensive PRD based on these requirements.
`;

    let prdResult;
    try {
      prdResult = await openai.chat.completions.create({
        model: PRD_MODEL,
        messages: [
          { role: 'system', content: PRD_SYSTEM_PROMPT },
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
          { role: 'system', content: PRD_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
    }

    const prd = JSON.parse(prdResult.choices[0].message.content || '{}');

    // Update submission with PRD
    await supabaseAdmin
      .from('scoping_submissions')
      .update({
        ai_prd_status: 'generated',
        ai_prd_raw: { ...submission.ai_prd_raw, ...prd },
      })
      .eq('id', submissionId);

    // Find existing user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', submission.email)
      .single();

    // Create a project from this submission
    const { data: project } = await supabaseAdmin
      .from('projects')
      .insert({
        title: prd.product_name || `${submission.vertical} Project`,
        idea_summary: submission.idea,
        vertical: submission.vertical,
        timeline: submission.timeline,
        budget_range: submission.budget_range,
        ai_generated_prd: prd,
        status: 'discovery',
        client_email: submission.email,
        user_id: user?.id || null,
        quote_amount: prd.quote_range_low ? prd.quote_range_low * 100 : null,
        quote_notes: prd.quote_range_low && prd.quote_range_high ? `AI Estimated Range: $${prd.quote_range_low.toLocaleString()} - $${prd.quote_range_high.toLocaleString()}\nThis is an initial AI estimate. Our team will review and confirm pricing.` : null,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      prd,
      status: 'generated',
      projectId: project?.id,
    });
  } catch (error) {
    console.error('PRD generation error:', error);

    return NextResponse.json({
      status: 'pending',
      message: "AI review in progress — we'll respond within 24 hours",
    });
  }
}
