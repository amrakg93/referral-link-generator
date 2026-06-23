'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!config.SMTP_HOST) {
    console.warn('⚠ SMTP_HOST not configured — email sending disabled');
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: config.SMTP_USER
      ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
      : undefined,
  });

  return _transporter;
}

/**
 * Send an email. Returns { success, messageId, error }.
 */
async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[email] Skipped sending to ${to} — SMTP not configured`);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: config.FROM_EMAIL,
      to,
      subject,
      html,
      text: text || htmlToPlainText(html),
    });
    console.log(`[email] Sent "${subject}" to ${to} — ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/** Crude HTML→plain-text fallback for email clients that don't support HTML. */
function htmlToPlainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { sendMail };
