// /api/setup.js

export default async function handler(req, res) {
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
    } = req.body;

    // -----------------------------
    // 1. HARD VALIDATION
    // -----------------------------
    if (!name || !email || !platform || !outcome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!consent_files || !consent_data) {
      return res.status(400).json({ error: 'Consent required' });
    }

    // -----------------------------
    // 2. INSERT INTO SUPABASE
    // -----------------------------
    const supabaseResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/setup_requests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          name,
          email,
          platform,
          figma_url: figma_url || null,
          requested_service: outcome,
          consent_files,
          consent_data,
          source_ip: req.headers['x-forwarded-for'] || null,
          user_agent: req.headers['user-agent'] || null,
          created_at: new Date().toISOString()
        })
      }
    );

    if (!supabaseResponse.ok) {
      const text = await supabaseResponse.text();
      console.error('SUPABASE ERROR:', text);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    // -----------------------------
    // 3. OPTIONAL EMAIL NOTIFICATION
    // -----------------------------
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Axinite <no-reply@axinite.vercel.app>',
          to: process.env.NOTIFY_EMAIL,
          subject: 'New Axinite Setup Request',
          html: `
            <strong>New setup request received</strong><br><br>
            <b>Name:</b> ${name}<br>
            <b>Email:</b> ${email}<br>
            <b>Platform:</b> ${platform}<br>
            <b>Service:</b> ${outcome}<br>
            <b>Figma:</b> ${figma_url || '—'}
          `
        })
      });
    }

    // -----------------------------
    // 4. SUCCESS RESPONSE
    // -----------------------------
    return res.status(200).json({ status: 'ok' });

  } catch (err) {
    console.error('SETUP API ERROR:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
