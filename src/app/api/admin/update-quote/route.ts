import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
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

    const { projectId, quote_amount, quote_notes, status } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (quote_amount !== undefined) {
      updateData.quote_amount = quote_amount;
    }
    if (quote_notes !== undefined) {
      updateData.quote_notes = quote_notes;
    }
    if (status) {
      const validStatuses = ['lead', 'discovery', 'quoted', 'active', 'completed', 'archived', 'rejected'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      updateData.status = status;
    }

    // Fetch original project to compare status and get email
    const { data: originalProject } = await supabaseAdmin
      .from('projects')
      .select('status, title, client_email, users(email)')
      .eq('id', projectId)
      .single();

    if (!originalProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    // Send email if status changed
    const clientEmail = originalProject.client_email || (originalProject.users as { email?: string })?.email;
    
    if (status && status !== originalProject.status && clientEmail && process.env.RESEND_API_KEY) {
      const isRejected = status === 'rejected';
      const subject = isRejected 
        ? `Update on your NexLabs Project: ${originalProject.title}` 
        : `Project Status Updated: ${originalProject.title}`;
        
      const statusMessage = isRejected
        ? `We have reviewed your project submission for "${originalProject.title}". After careful consideration, we are unfortunately unable to take on this project at this time.`
        : `The status of your project "${originalProject.title}" has been updated to: **${status.toUpperCase()}**.\n\nPlease log in to your dashboard to view the latest updates and quotes.`;

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">NexLabs Project Update</h2>
          <p style="color: #555; line-height: 1.6;">${statusMessage.replace(/\n/g, '<br/>')}</p>
          ${quote_amount ? `<p style="color: #555;"><strong>Quote Amount:</strong> $${(quote_amount / 100).toLocaleString()}</p>` : ''}
          ${quote_notes ? `<p style="color: #555;"><strong>Notes:</strong> ${quote_notes}</p>` : ''}
          <br/>
          <p style="color: #555;">Best regards,<br/>The NexLabs Team</p>
        </div>
      `;

      try {
        await resend.emails.send({
          from: 'NexLabs <onboarding@resend.dev>', // Update this to your verified domain in production
          to: [clientEmail],
          subject: subject,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // We don't fail the request if email fails, but log it
      }
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Admin update-quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
