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

function parseEmailList(value = '') {
  return String(value || '')
    .split(',')
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

function shortUrl(value = '') {
  if (!value) return '—';
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}${url.search}`.slice(0, MAX_FIELD_LENGTH);
  } catch (error) {
    return String(value).slice(0, MAX_FIELD_LENGTH);
  }
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
    ['Form Location', payload.source || 'Website'],
    ['Lead Source', payload.leadSource || 'Direct / Website'],
    ['Lead Medium', payload.leadMedium || '—'],
    ['Message Channel', payload.messageChannel || '—'],
    ['Referral Code', payload.referralCode || '—'],
    ['Campaign', payload.leadCampaign || '—'],
    ['Content / Placement', payload.leadContent || '—'],
    ['Browser Context', payload.browserContext || '—'],
    ['Referrer', shortUrl(payload.referrer)],
    ['Landing Page', shortUrl(payload.landingPage)],
    ['Current Page', shortUrl(payload.currentPage)],
    ['Click ID Type', payload.clickId || '—'],
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
    `Form location: ${payload.source || 'Website'}`,
    `Lead source: ${payload.leadSource || 'Direct / Website'}`,
    `Lead medium: ${payload.leadMedium || '—'}`,
    `Message channel: ${payload.messageChannel || '—'}`,
    `Referral code: ${payload.referralCode || '—'}`,
    `Campaign: ${payload.leadCampaign || '—'}`,
    `Content / placement: ${payload.leadContent || '—'}`,
    `Browser context: ${payload.browserContext || '—'}`,
    `Referrer: ${shortUrl(payload.referrer)}`,
    `Landing page: ${shortUrl(payload.landingPage)}`,
    `Current page: ${shortUrl(payload.currentPage)}`,
    `Click ID type: ${payload.clickId || '—'}`,
    '',
    'Event notes:',
    payload.message || '—'
  ].join('\n');
}

function subjectTag(payload) {
  const parts = [];
  if (payload.leadSource && payload.leadSource !== 'Direct / Website') parts.push(payload.leadSource);
  if (payload.leadMedium) parts.push(payload.leadMedium);
  if (payload.referralCode) parts.push(`ref:${payload.referralCode}`);
  return parts.length ? ` [${parts.join(' / ')}]` : '';
}

function buildAdminMessage(payload) {
  const lines = [];
  if (payload.message) lines.push(payload.message, '');
  lines.push('--- Submitted details ---');
  if (payload.eventTime) lines.push(`Event time: ${payload.eventTime}`);
  if (payload.duration) lines.push(`Desired performance time: ${payload.duration}`);
  if (payload.musicStyle) lines.push(`Song requests: ${payload.musicStyle}`);
  if (payload.contactMethod) lines.push(`Preferred contact: ${payload.contactMethod}`);
  if (payload.source) lines.push(`Form location: ${payload.source}`);
  if (payload.leadSource && payload.leadSource !== 'Direct / Website') {
    lines.push(`Lead source: ${payload.leadSource}${payload.leadMedium ? ` / ${payload.leadMedium}` : ''}`);
  }
  if (payload.referralCode) lines.push(`Referral code: ${payload.referralCode}`);
  return lines.join('\n');
}

async function pushToAdminApp(payload) {
  const url = process.env.ADMIN_INTAKE_URL;
  const apiKey = process.env.ADMIN_INTAKE_API_KEY;
  if (!url || !apiKey) {
    console.error('Admin app intake skipped: missing ADMIN_INTAKE_URL or ADMIN_INTAKE_API_KEY.');
    return { ok: false };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || undefined,
        event_type: payload.eventType || undefined,
        event_date: payload.eventDate || undefined,
        location_name: payload.venue || undefined,
        message: buildAdminMessage(payload),
        source: payload.leadSource && payload.leadSource !== 'Direct / Website' ? payload.leadSource : 'website',
      }),
    });
    if (!response.ok) {
      console.error('Admin app rejected inquiry:', response.status, await response.text().catch(() => ''));
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error('Admin app push failed:', error);
    return { ok: false };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmails = parseEmailList(process.env.INQUIRY_TO_EMAIL || process.env.RESEND_TO_EMAIL || 'castanedaeli0@gmail.com');
  const ccEmails = parseEmailList(process.env.INQUIRY_CC_EMAILS || '');
  const bccEmails = parseEmailList(process.env.INQUIRY_BCC_EMAILS || '');
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Castaneda Strings <onboarding@resend.dev>';

  // Resend is a backup notification channel now, not the only path — the admin
  // app push below is what actually creates the inquiry. So a missing/broken
  // Resend config shouldn't block submissions.
  const resendConfigured =
    Boolean(apiKey) &&
    toEmails.length > 0 &&
    toEmails.every(isValidEmail) &&
    ccEmails.every(isValidEmail) &&
    bccEmails.every(isValidEmail);

  if (apiKey && (!toEmails.length || toEmails.some((email) => !isValidEmail(email)))) {
    console.error('INQUIRY_TO_EMAIL must include at least one valid email address — skipping Resend notification.');
  }
  if (ccEmails.some((email) => !isValidEmail(email)) || bccEmails.some((email) => !isValidEmail(email))) {
    console.error('INQUIRY_CC_EMAILS / INQUIRY_BCC_EMAILS contain an invalid address — skipping Resend notification.');
  }

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  const payload = {
    source: clean(body.source),
    leadSource: clean(body.leadSource),
    leadMedium: clean(body.leadMedium),
    messageChannel: clean(body.messageChannel),
    referralCode: clean(body.referralCode),
    leadCampaign: clean(body.leadCampaign),
    leadContent: clean(body.leadContent),
    leadTerm: clean(body.leadTerm),
    clickId: clean(body.clickId),
    referrer: clean(body.referrer),
    landingPage: clean(body.landingPage),
    currentPage: clean(body.currentPage),
    browserContext: clean(body.browserContext),
    userAgent: clean(body.userAgent),
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
  const subject = `New Castaneda Strings inquiry — ${subjectEvent} — ${payload.name}${subjectTag(payload)}`;

  const resendPayload = {
    from: fromEmail,
    to: toEmails,
    ...(ccEmails.length ? { cc: ccEmails } : {}),
    ...(bccEmails.length ? { bcc: bccEmails } : {}),
    reply_to: payload.email,
    subject,
    html: buildEmailHtml(payload),
    text: buildEmailText(payload)
  };

  try {
    const [resendResult, adminResult] = await Promise.all([
      resendConfigured
        ? fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(resendPayload)
          })
            .then(async (resendResponse) => ({
              ok: resendResponse.ok,
              body: await resendResponse.json().catch(() => ({}))
            }))
            .catch((error) => {
              console.error('Resend request failed:', error);
              return { ok: false, body: {} };
            })
        : Promise.resolve({ ok: false, body: {}, skipped: true }),
      pushToAdminApp(payload)
    ]);

    if (!resendResult.ok && !resendResult.skipped) {
      console.error('Resend error:', resendResult.body);
    }

    if (!resendResult.ok && !adminResult.ok) {
      return res.status(502).json({ error: 'Inquiry could not be delivered. Please try again or email us directly.' });
    }

    return res.status(200).json({ ok: true, id: resendResult.body.id, savedToAdmin: adminResult.ok });
  } catch (error) {
    console.error('Inquiry send error:', error);
    return res.status(500).json({ error: 'Inquiry failed to send.' });
  }
};
