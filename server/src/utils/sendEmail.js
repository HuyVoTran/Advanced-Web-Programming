import nodemailer from 'nodemailer';

const stripHtml = (value = '') =>
  String(value)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const DEFAULT_PUBLIC_LOGO_URL =
  'https://cdn.jsdelivr.net/gh/HuyVoTran/Advanced-Web-Programming@main/client/public/images/SalvioRoyale-Logo.png';

const trimTrailingSlash = (value = '') => String(value || '').replace(/\/+$/, '');

const isLocalAddress = (value = '') => /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(String(value || ''));

const resolveEmailLogoUrl = () => {
  const configuredLogoUrl = String(process.env.EMAIL_LOGO_URL || '').trim();
  const serverUrl = trimTrailingSlash(process.env.SERVER_URL || 'http://localhost:5000');

  if (configuredLogoUrl) {
    if (/^https?:\/\//i.test(configuredLogoUrl)) {
      return configuredLogoUrl;
    }
    if (configuredLogoUrl.startsWith('/')) {
      return `${serverUrl}${configuredLogoUrl}`;
    }
  }

  try {
    const parsedServerUrl = new URL(serverUrl);
    if (!isLocalAddress(parsedServerUrl.hostname)) {
      return `${serverUrl}/client/public/images/SalvioRoyale-Logo.png`;
    }
  } catch {
    return DEFAULT_PUBLIC_LOGO_URL;
  }

  return DEFAULT_PUBLIC_LOGO_URL;
};

const buildBrandedHtml = ({ title, contentHtml }) => {
  const siteUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const logoUrl = resolveEmailLogoUrl();
  const year = new Date().getFullYear();

  return `
    <div style="margin:0;padding:0;background:#f6f4ef;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ef;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #ece7dd;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="background:#ffffff;padding:20px 28px;text-align:center;border-bottom:1px solid #ece7dd;">
                  <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
                    <img src="${logoUrl}" alt="Salvio Royale" style="height:48px;max-width:240px;object-fit:contain;display:block;margin:0 auto;" />
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:30px 28px 20px;">
                  <h1 style="margin:0 0 14px;color:#111827;font-size:24px;font-weight:600;line-height:1.35;">${title}</h1>
                  <div style="font-size:15px;line-height:1.7;color:#374151;">${contentHtml}</div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 26px;">
                  <div style="padding:16px 18px;background:#faf8f3;border:1px solid #efe7d8;border-radius:10px;color:#6b7280;font-size:13px;line-height:1.6;">
                    Nếu bạn cần hỗ trợ, vui lòng liên hệ đội ngũ Salvio Royale qua email phản hồi này.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background:#111827;padding:18px 28px;text-align:center;">
                  <p style="margin:0 0 6px;color:#d1d5db;font-size:12px;">© ${year} Salvio Royale. All rights reserved.</p>
                  <a href="${siteUrl}" style="color:#d4af37;font-size:12px;text-decoration:none;">Visit our website</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASS || '';

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER hoặc EMAIL_PASS chưa được cấu hình trong môi trường');
  }

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const baseHtml = html || `<p>${String(text || '').replace(/\n/g, '<br />')}</p>`;
  const brandedHtml = buildBrandedHtml({
    title: subject || 'Thông báo từ Salvio Royale',
    contentHtml: baseHtml,
  });

  const fallbackText = text || stripHtml(baseHtml) || 'Thông báo từ Salvio Royale';

  const message = {
    from: emailUser,
    to,
    subject,
    html: brandedHtml,
    text: fallbackText,
  };

  try {
    const info = await transport.sendMail(message);
    // eslint-disable-next-line no-console
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to send email:', err);
    throw err;
  }
};

export default sendEmail;
