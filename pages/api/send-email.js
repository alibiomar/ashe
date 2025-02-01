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

  // Log SMTP server details for debugging
  console.log('Connecting to SMTP server:', process.env.SMTP_SERVER_HOST, process.env.SMTP_SERVER_USERNAME);

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST, // e.g., smtp.mail.ovh.net
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.SMTP_SERVER_USERNAME,
      pass: process.env.SMTP_SERVER_PASSWORD,
    },
  });

  try {
    // Send email
    const info = await transporter.sendMail({
      from: `"ASHE Support" <${process.env.SMTP_SERVER_USERNAME}>`, // Sender name and email
      to: process.env.SITE_MAIL_RECEIVER, // Receiver email
      subject: subject,
      text: text,
    });

    // Respond with success
    res.status(200).json({ messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}