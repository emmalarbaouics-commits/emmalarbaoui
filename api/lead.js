export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const { email, source } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanSource = String(source || 'site').trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      return res.status(400).json({ ok: false, error: 'Email invalide' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'BREVO_API_KEY manquante dans Vercel' });
    }

    const listId = cleanSource === 'guide'
      ? process.env.BREVO_LIST_ID_GUIDE
      : cleanSource === 'diagnostic'
        ? process.env.BREVO_LIST_ID_DIAGNOSTIC
        : process.env.BREVO_LIST_ID;

    if (!listId) {
      return res.status(500).json({ ok: false, error: 'ID de liste Brevo manquant dans Vercel' });
    }

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        email: cleanEmail,
        listIds: [Number(listId)],
        updateEnabled: true
      })
    });

    if (!brevoResponse.ok && brevoResponse.status !== 204) {
      const details = await brevoResponse.text();
      return res.status(502).json({ ok: false, error: 'Erreur Brevo', details });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
  }
}
