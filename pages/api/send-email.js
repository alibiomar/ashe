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

  // Debugging: Log environment variables
  console.log('Environment Variables:', {
    host: process.env.SMTP_SERVER_HOST,
    user: process.env.SMTP_SERVER_USERNAME,
    recipient: process.env.SMTP_SERVER_USERNAME,
  });



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
    const info = await transporter.sendMail({
      from: `"ASHE Support" <${process.env.SMTP_SERVER_USERNAME}>`,
      to: recipient,
      replyTo: email,
      subject: subject,
      html: text,
    });

    console.log('Email sent successfully:', info.messageId);
    res.status(200).json({ messageId: info.messageId });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
    });
  }
}