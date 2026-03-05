import nodemailer from 'nodemailer';

// A very basic email sender utility. In production you'd configure SMTP
// credentials via environment variables and handle errors properly.
// For development/testing it will log the message and resolve.

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  // fallback to console when transporter is not configured
  if (!transport) {
    // eslint-disable-next-line no-console
    console.log('sendEmail:', { to, subject, html, text });
    return;
  }

  const message = {
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    html,
    text,
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
