import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.OVH_SMTP_HOST || 'ssl0.ovh.net',
    port: parseInt(process.env.OVH_SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.OVH_EMAIL,
      pass: process.env.OVH_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

const emailWrapper = (content) => `
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; font-family: Arial, sans-serif;">
    ${content}
    <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent by ASHE. Please do not reply to this message.
      </p>
    </footer>
  </div>
`;

export const sendEmail = async (to, subject, content) => {
  const transporter = createTransporter();
  
  try {
    await transporter.sendMail({
      from: `ASHE Team <${process.env.OVH_EMAIL}>`,
      to,
      subject,
      html: emailWrapper(content),
      text: content.replace(/<[^>]+>/g, ''),
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};