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

    if (!name || !email || !platform || !outcome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/setup_requests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name,
          email,
          platform,
          figma_url,
          requested_service: outcome,
          consent_files,
          consent_data,
          source_ip: req.headers['x-forwarded-for'] || null,
          user_agent: req.headers['user-agent'] || null
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }

    return res.status(200).json({ status: 'ok' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}