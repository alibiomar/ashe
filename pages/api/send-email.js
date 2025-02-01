import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, subject, text } = req.body;

  // Validate required fields
  if (!email || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_SERVER_USERNAME,
      pass: process.env.SMTP_SERVER_PASSWORD,
    },
  });

  try {
    const recipient = process.env.SITE_MAIL_RECEIVER;
    if (!recipient) throw new Error('Recipient email not configured');

    const info = await transporter.sendMail({
      from: `"ASHE Support" <${process.env.SMTP_SERVER_USERNAME}>`,
      to: recipient,
      replyTo: email, // Use user's email as reply-to address
      subject: subject,
      html: text, // Use HTML content instead of plain text
    });

    res.status(200).json({ messageId: info.messageId });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
    });
  }
}