import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, subject, text } = req.body;

  if (!email || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Configure transporter with OVH settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST, // ssl0.ovh.net
    port: 465, // OVH’s recommended SSL port
    secure: true, // SSL required
    auth: {
      user: process.env.SMTP_SERVER_USERNAME, // noreply@ashe.tn
      pass: process.env.SMTP_SERVER_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"ASHE Support" <noreply@ashe.tn>`, // Must match your OVH domain
      to: process.env.SITE_MAIL_RECIEVER, // contact@ashe.tn
      replyTo: email, // User’s email from the form
      subject: subject,
      html: text,
    });

    console.log('Email sent:', info.messageId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Email failed to send',
      details: error.message,
    });
  }
}