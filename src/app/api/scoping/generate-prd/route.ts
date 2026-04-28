import { NextRequest, NextResponse } from 'next/server';
import { openai, PRD_MODEL, FALLBACK_MODEL } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const PRD_SYSTEM_PROMPT = `You are a technical co-founder helping scope a software project.
Generate a structured 1-page PRD from the client's form submission.

Output JSON format:
{
  "product_name": string,
  "problem_statement": string (1-2 sentences),
  "target_user": string,
  "core_features": [string] (3-5 features),
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
    const { submissionId } = body;

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

    // Generate PRD with OpenAI
    const userPrompt = `
- Idea: ${submission.idea}
- Vertical: ${submission.vertical}
- Timeline: ${submission.timeline}
- Budget: ${submission.budget_range}
- Tech Preference: ${submission.tech_stack_preference || 'None specified'}
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
      // Fallback to gpt-3.5-turbo
      console.warn('Primary model failed, using fallback:', openaiError);
      try {
        prdResult = await openai.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [
            { role: 'system', content: PRD_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });
      } catch (fallbackError) {
        console.error('Both models failed:', fallbackError);
        // Mark as failed and return pending
        await supabaseAdmin
          .from('scoping_submissions')
          .update({ ai_prd_status: 'failed' })
          .eq('id', submissionId);

        return NextResponse.json({
          status: 'pending',
          message: "AI review in progress — we'll respond within 24 hours",
        });
      }
    }

    const prd = JSON.parse(prdResult.choices[0].message.content || '{}');

    // Update submission with PRD
    await supabaseAdmin
      .from('scoping_submissions')
      .update({
        ai_prd_status: 'generated',
        ai_prd_raw: prd,
      })
      .eq('id', submissionId);

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
