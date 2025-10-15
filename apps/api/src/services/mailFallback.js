// mailFallback.js
// Usage: const { sendEmailWithFallback } = require('./mailFallback');

const nodemailer = require('nodemailer');
const sendmailLib = require('sendmail');

// configurable: prefer nodemailer first, then sendmail
const PREFER = process.env.MAIL_PREFER || 'nodemailer'; // 'nodemailer' | 'sendmail'
const SEND_TIMEOUT_MS = Number(process.env.MAIL_TIMEOUT_MS) || 15000;

// optional: create nodemailer transporter from env
function createNodemailerTransporter() {
  // Require minimal SMTP envs; if missing, return null to skip
  //   const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  //   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  //   const secure = String(SMTP_PORT) === '465';
  return nodemailer.createTransport({
    host: 'mail.metachessmind.com', // معمولاً همین است// SMTP_HOST,
    // port: Number(SMTP_PORT),
    // auth: { user: SMTP_USER, pass: SMTP_PASS },
    secure: false,
    auth: {
      user: 'no-reply@metachessmind.com',
      pass: 'IG;0zY@3E43bhf',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// wrap a promise with timeout
function withTimeout(promise, ms, tag = 'mail') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${tag}_timeout_${ms}ms`)), ms)),
  ]);
}

async function tryNodemailer({ from, to, subject, html, text }) {
  const transporter = createNodemailerTransporter();
  if (!transporter) {
    return { ok: false, provider: 'nodemailer', reason: 'no_smtp_config' };
  }

  try {
    // optional: verify connectivity quickly (fast fail)
    if (process.env.MAIL_VERIFY_ON_BOOT === 'true') {
      await withTimeout(transporter.verify(), 4000, 'smtp_verify');
    }

    const info = await withTimeout(
      transporter.sendMail({ from, to, subject, html, text }),
      SEND_TIMEOUT_MS,
      'smtp_send',
    );

    // Acceptance policy: consider success only if at least one accepted
    const accepted = Array.isArray(info.accepted) ? info.accepted : [];
    if (accepted.length > 0) {
      return { ok: true, provider: 'nodemailer', accepted, info };
    }
    // no accepted → treat as soft fail to allow fallback
    return {
      ok: false,
      provider: 'nodemailer',
      reason: 'no_accepted_recipients',
      meta: { rejected: info.rejected, response: info.response },
    };
  } catch (err) {
    return { ok: false, provider: 'nodemailer', error: err };
  }
}

function trySendmail({ from, to, subject, html, text }) {
  const sendmail = sendmailLib({ silent: true }); // keep logs quiet
  const msg = {
    from: from || process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    // sendmail lib prefers plain or html; we pass html and fallback text
    html,
    text,
  };

  return withTimeout(
    new Promise((resolve) => {
      sendmail(msg, (err, reply) => {
        if (err) {
          resolve({ ok: false, provider: 'sendmail', error: err });
        } else {
          // sendmail doesn't provide 'accepted' like nodemailer; absence of error == success-ish
          resolve({ ok: true, provider: 'sendmail', reply });
        }
      });
    }),
    SEND_TIMEOUT_MS,
    'sendmail_send',
  );
}

async function sendEmailWithFallback({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || 'no-reply@example.com';

  // decide order
  const order = PREFER === 'sendmail' ? [trySendmail, tryNodemailer] : [tryNodemailer, trySendmail];

  let first = await order[0]({ from, to, subject, html, text });
  if (first.ok) return { ...first, tried: [first.provider] };

  let second = await order[1]({ from, to, subject, html, text });
  if (second.ok) return { ...second, tried: [first.provider, second.provider], fallbackUsed: true };

  // both failed
  return {
    ok: false,
    tried: [first.provider, second.provider],
    firstError: first.error || first.reason,
    secondError: second.error || second.reason,
  };
}

module.exports = { sendEmailWithFallback };
