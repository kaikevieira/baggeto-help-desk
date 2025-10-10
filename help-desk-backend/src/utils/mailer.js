import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter;
export function getTransporter() {
  if (transporter) return transporter;
  if (!ENV.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT || 587,
    secure: !!ENV.SMTP_SECURE,
    auth: ENV.SMTP_USER ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) return { skipped: true };
  const info = await tx.sendMail({ from: ENV.MAIL_FROM, to, subject, html, text });
  return info;
}

export function ticketEmailTemplate({ title, message, ticketId }) {
  const url = `${ENV.CLIENT_URL}/tickets/${ticketId}`;
  const logoUrl = `${ENV.CLIENT_URL}/logo.png`;
  return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f7fb;padding:24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <tr style="background:#0f172a;color:#fff">
        <td style="padding:16px 20px;display:flex;align-items:center;gap:12px">
          <img src="${logoUrl}" alt="logo" height="28" style="display:inline-block;border-radius:6px"/>
          <strong style="font-size:16px;letter-spacing:.2px">${ENV.APP_NAME}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 20px 12px 20px">
          <h2 style="margin:0 0 8px 0;color:#0f172a;font-size:18px">${title}</h2>
          <p style="margin:0;color:#334155;font-size:14px;line-height:1.6">${message}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 24px 20px">
          <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600">Abrir chamado</a>
          <div style="margin-top:10px;color:#64748b;font-size:12px">Se o botão não funcionar, acesse: <a href="${url}">${url}</a></div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-top:1px solid #e5e7eb;color:#94a3b8;font-size:12px">Este é um e-mail automático. Não responda.</td>
      </tr>
    </table>
  </div>`;
}
