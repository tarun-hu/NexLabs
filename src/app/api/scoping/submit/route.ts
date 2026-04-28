import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resend } from '@/lib/resend';

const scopingSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  idea: z.string().max(500),
  vertical: z.enum(['AI/ML', 'Fintech', 'HealthTech', 'Productivity', 'E-commerce', 'Other']),
  timeline: z.enum(['ASAP', '1 month', '2-3 months', 'Flexible']),
  budget_range: z.enum(['$2k-5k', '$5k-10k', '$10k-20k', '$20k-50k', '$50k+']),
  referral_source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = scopingSchema.parse(body);

    // Insert into database
    const { data: submission, error } = await supabaseAdmin
      .from('scoping_submissions')
      .insert({
        email: validated.email,
        name: validated.name,
        idea: validated.idea,
        vertical: validated.vertical,
        timeline: validated.timeline,
        budget_range: validated.budget_range,
        referral_source: validated.referral_source,
        ai_prd_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email
    await resend.emails.send({
      from: 'NexLabs <onboarding@resend.dev>',
      to: [validated.email],
      subject: 'Thanks for your submission!',
      html: `
        <h1>Thanks for reaching out, ${validated.name}!</h1>
        <p>We've received your project idea and will review it shortly.</p>
        <p><strong>Project:</strong> ${validated.idea}</p>
        <p><strong>Vertical:</strong> ${validated.vertical}</p>
        <p><strong>Timeline:</strong> ${validated.timeline}</p>
        <p><strong>Budget:</strong> ${validated.budget_range}</p>
        <p>Our AI is already analyzing your requirements. You'll receive a detailed PRD and quote within 24 hours.</p>
        <p>Best,<br/>The NexLabs Team</p>
      `,
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Scoping submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
