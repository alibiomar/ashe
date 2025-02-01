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

  // Log the request payload for debugging
  console.log('Request payload:', { email, subject, text });

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.SMTP_SERVER_USERNAME,
      pass: process.env.SMTP_SERVER_PASSWORD,
    },
  });

  try {
    // Log SMTP configuration for debugging
    console.log('SMTP Configuration:', {
      host: process.env.SMTP_SERVER_HOST,
      user: process.env.SMTP_SERVER_USERNAME,
    });

    // Validate recipient email
    const recipient = process.env.SITE_MAIL_RECEIVER;
    if (!recipient) {
      throw new Error('Recipient email not configured');
    }

    // Log recipient email for debugging
    console.log('Recipient email:', recipient);

    // Send email
    const info = await transporter.sendMail({
      from: `"ASHE Support" <${process.env.SMTP_SERVER_USERNAME}>`, // Sender name and email
      to: recipient, // Receiver email
      subject: subject,
      text: text,
    });

    // Log success
    console.log('Email sent successfully:', info.messageId);

    // Respond with success
    res.status(200).json({ messageId: info.messageId });
  } catch (error) {
    // Log the full error for debugging
    console.error('Email error:', error);

    res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
    });
  }
}