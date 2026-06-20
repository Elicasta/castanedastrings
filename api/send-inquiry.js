const RESEND_API_URL = 'https://api.resend.com/emails';

const MAX_FIELD_LENGTH = 1400;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function clean(value = '') {
  return String(value || '').trim().slice(0, MAX_FIELD_LENGTH);
}

function isValidEmail(email = '') {
  return /^\S+@\S+\.\S+$/.test(email);
}

function parseRecipientList(value = '', fallback = '') {
  return String(value || fallback)
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

function formatDate(value = '') {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function buildRows(fields) {
  return fields.map(([label, value]) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #e4ddcf;color:#8d7a59;font:700 11px/1.3 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;vertical-align:top;width:180px;">${escapeHtml(label)}</td>
      <td style="padding:14px 0;border-bottom:1px solid #e4ddcf;color:#2d2a25;font:400 16px/1.6 Arial,sans-serif;vertical-align:top;">${escapeHtml(value || '—')}</td>
    </tr>
  `).join('');
}

function buildEmailHtml(payload) {
  const fields = [
    ['Name', payload.name],
    ['Email', payload.email],
    ['Phone', payload.phone || '—'],
    ['Event Type', payload.eventType || '—'],
    ['Event Date', formatDate(payload.eventDate)],
    ['Event Time', payload.eventTime || '—'],
    ['Venue / Location', payload.venue || '—'],
    ['Performance Time', payload.duration || '—'],
    ['Song Requests', payload.musicStyle || '—'],
    ['Preferred Contact', payload.contactMethod || '—'],
    ['Source', payload.source || 'Website'],
    ['Event Notes', payload.message || '—']
  ];

  return `
  <div style="margin:0;padding:0;background:#f7f4ed;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ed;margin:0;padding:36px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fffdf8;border:1px solid #d9cfbd;border-radius:28px;overflow:hidden;">
            <tr>
              <td style="padding:34px 34px 18px 34px;border-bottom:1px solid #e4ddcf;">
                <div style="color:#9b8050;font:700 12px/1.3 Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;margin-bottom:14px;">Castaneda Strings</div>
                <h1 style="margin:0;color:#2d2a25;font:400 34px/1.08 Georgia,serif;">New event inquiry</h1>
                <p style="margin:14px 0 0 0;color:#6d675e;font:400 16px/1.7 Arial,sans-serif;">A new inquiry was submitted from the Castaneda Strings website.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 34px 34px 34px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${buildRows(fields)}
                </table>
                <p style="margin:24px 0 0 0;color:#6d675e;font:400 14px/1.7 Arial,sans-serif;">Reply directly to this email to respond to ${escapeHtml(payload.name)}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

function buildEmailText(payload) {
  return [
    'New Castaneda Strings inquiry',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || '—'}`,
    `Event type: ${payload.eventType || '—'}`,
    `Event date: ${formatDate(payload.eventDate)}`,
    `Event time: ${payload.eventTime || '—'}`,
    `Venue / location: ${payload.venue || '—'}`,
    `Desired performance time: ${payload.duration || '—'}`,
    `Song requests: ${payload.musicStyle || '—'}`,
    `Preferred contact: ${payload.contactMethod || '—'}`,
    `Source: ${payload.source || 'Website'}`,
    '',
    'Event notes:',
    payload.message || '—'
  ].join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmails = parseRecipientList(process.env.INQUIRY_TO_EMAIL || process.env.RESEND_TO_EMAIL, 'castanedaeli0@gmail.com');
  const ccEmails = parseRecipientList(process.env.INQUIRY_CC_EMAILS);
  const bccEmails = parseRecipientList(process.env.INQUIRY_BCC_EMAILS);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Castaneda Strings <onboarding@resend.dev>';

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY environment variable.' });
  }

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  const payload = {
    source: clean(body.source),
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    eventType: clean(body.eventType),
    eventDate: clean(body.eventDate),
    eventTime: clean(body.eventTime),
    venue: clean(body.venue),
    duration: clean(body.duration),
    musicStyle: clean(body.musicStyle),
    contactMethod: clean(body.contactMethod),
    message: clean(body.message),
    companyWebsite: clean(body.companyWebsite)
  };

  if (payload.companyWebsite) {
    return res.status(200).json({ ok: true });
  }

  if (!payload.name || !payload.email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  if (!isValidEmail(payload.email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const subjectEvent = payload.eventType || 'Event';
  const subject = `New Castaneda Strings inquiry — ${subjectEvent} — ${payload.name}`;

  const resendPayload = {
    from: fromEmail,
    to: toEmails,
    reply_to: payload.email,
    subject,
    html: buildEmailHtml(payload),
    text: buildEmailText(payload)
  };

  if (ccEmails.length) resendPayload.cc = ccEmails;
  if (bccEmails.length) resendPayload.bcc = bccEmails;

  try {
    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    const result = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error('Resend error:', result);
      return res.status(502).json({ error: 'Resend could not send the inquiry.' });
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    console.error('Inquiry send error:', error);
    return res.status(500).json({ error: 'Inquiry email failed to send.' });
  }
};
