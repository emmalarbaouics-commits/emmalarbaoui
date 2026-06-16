export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const {
      email,
      source,
      phone,
      phoneCountryCode,
      phoneNational,
      diagnostic
    } = req.body || {};

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanSource = String(source || 'site').trim().toLowerCase();
    const cleanCountryCode = String(phoneCountryCode || '').replace(/[^+\d]/g, '');
    const cleanPhoneNational = String(phoneNational || '').replace(/[^\d]/g, '');
    const cleanPhone = String(phone || (cleanCountryCode + cleanPhoneNational)).replace(/(?!^)\D/g, '');

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      return res.status(400).json({ ok: false, error: 'Email invalide' });
    }

    if (!/^\+?\d{7,16}$/.test(cleanPhone)) {
      return res.status(400).json({ ok: false, error: 'Numéro de téléphone invalide' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'BREVO_API_KEY manquante dans Vercel' });
    }

    const rawListId = cleanSource === 'guide'
      ? process.env.BREVO_LIST_ID_GUIDE
      : cleanSource === 'diagnostic'
        ? process.env.BREVO_LIST_ID_DIAGNOSTIC
        : process.env.BREVO_LIST_ID;

    const listId = Number(String(rawListId || '').replace('#', '').trim());
    if (!Number.isFinite(listId) || listId <= 0) {
      return res.status(500).json({ ok: false, error: 'ID de liste Brevo manquant ou invalide dans Vercel' });
    }

    const attributes = {
      SMS: cleanPhone.startsWith('+') ? cleanPhone : ('+' + cleanPhone)
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        email: cleanEmail,
        attributes,
        listIds: [listId],
        updateEnabled: true
      })
    });

    if (!brevoResponse.ok && brevoResponse.status !== 204) {
      const details = await brevoResponse.text();
      return res.status(502).json({ ok: false, error: 'Erreur Brevo', details });
    }

    // Optionnel : envoie le résultat du simulateur à Emma par email transactionnel Brevo.
    // Ajoutez ces variables dans Vercel seulement si vous voulez recevoir les résultats par email :
    // BREVO_ADMIN_EMAIL, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
    let adminEmailSent = false;
    if (cleanSource === 'diagnostic' && diagnostic && process.env.BREVO_ADMIN_EMAIL && process.env.BREVO_SENDER_EMAIL) {
      const adminHtml = buildDiagnosticEmail({
        email: cleanEmail,
        phone: attributes.SMS,
        diagnostic
      });

      const mailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || 'Emma Larbaoui',
            email: process.env.BREVO_SENDER_EMAIL
          },
          to: [{ email: process.env.BREVO_ADMIN_EMAIL }],
          subject: 'Nouveau résultat simulateur — Emma Larbaoui',
          htmlContent: adminHtml
        })
      });

      adminEmailSent = mailResponse.ok;
    }

    return res.status(200).json({ ok: true, adminEmailSent });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
  }
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildDiagnosticEmail({ email, phone, diagnostic }) {
  const rows = [
    ['Email', email],
    ['Téléphone', phone],
    ['Capital actuel', diagnostic.savings],
    ['Épargne mensuelle', diagnostic.monthly],
    ['Objectif', diagnostic.goalType],
    ['Montant visé', diagnostic.goalAmt],
    ['Rendement annuel saisi', diagnostic.rate],
    ['Projection 5 ans', diagnostic.v5],
    ['Projection 10 ans', diagnostic.v10],
    ['Projection 15 ans', diagnostic.v15],
    ['Score / délai', diagnostic.score],
    ['Comparaison', diagnostic.compare],
    ['Recommandations', Array.isArray(diagnostic.recos) ? diagnostic.recos.join(' | ') : diagnostic.recos]
  ];

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#13273F">
      <h2>Nouveau résultat du simulateur</h2>
      <p>Un visiteur a rempli le simulateur sur la page Diagnostic.</p>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;border-color:#ddd;width:100%;max-width:760px">
        ${rows.map(([k, v]) => `<tr><td style="font-weight:bold;background:#f7f7f7;width:220px">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
      </table>
    </div>
  `;
}
