import type { VercelRequest, VercelResponse } from 'vercel';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

/* -----------------------------
   CLIENTS (SERVER ONLY)
-------------------------------- */

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY!);

/* -----------------------------
   HANDLER
-------------------------------- */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      platform,
      figma_url,
      outcome,
      consent_files,
      consent_data
    } = req.body || {};

    /* -----------------------------
       HARD VALIDATION (NON-NEGOTIABLE)
    -------------------------------- */

    if (
      !name ||
      !email ||
      !platform ||
      !outcome ||
      consent_files !== true ||
      consent_data !== true
    ) {
      return res.status(400).json({
        error: 'Invalid or incomplete submission'
      });
    }

    const allowedPlatforms = ['Web', 'iOS', 'Android'];
    if (!allowedPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform value' });
    }

    const allowedOutcomes = ['Foundation', 'Cleanup'];
    if (!allowedOutcomes.includes(outcome)) {
      return res.status(400).json({ error: 'Invalid service selection' });
    }

    /* -----------------------------
       DATABASE INSERT
    -------------------------------- */

    const { error: dbError } = await supabase
      .from('setup_requests')
      .insert({
        name,
        email,
        platform,
        figma_url: figma_url || null,
        outcome,
        consent_files,
        consent_data,
        source_ip: req.headers['x-forwarded-for'] || null,
        user_agent: req.headers['user-agent'] || null
      });

    if (dbError) {
      console.error('SUPABASE INSERT ERROR:', dbError);
      return res.status(500).json({ error: 'Database write failed' });
    }

    /* -----------------------------
       EMAIL NOTIFICATION (YOU)
    -------------------------------- */

    await resend.emails.send({
      from: 'Axinite System <notifications@axinite.vercel.app>',
      to: ['your@email.com'], // ← REPLACE
      subject: 'New Axinite Setup Request',
      text: `
New setup request received:

Name: ${name}
Email: ${email}
Platform: ${platform}
Service: ${outcome}
Figma: ${figma_url || '—'}

Submitted via axinite.vercel.app
`
    });

    /* -----------------------------
       SUCCESS RESPONSE
    -------------------------------- */

    return res.status(200).json({ ok: true });

  } catch (err: any) {
    console.error('SETUP API ERROR:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
