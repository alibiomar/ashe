import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, subject, text } = req.body;

    if (!email || !subject || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sanitizedSubject = sanitizeHtml(subject);
    const sanitizedText = sanitizeHtml(text);

    // Configure transporter with OVH SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER_HOST, // "ssl0.ovh.net"
      port: 465, // OVH’s recommended SSL port
      secure: true, // Must be true for port 465
      auth: {
        user: process.env.SMTP_SERVER_USERNAME, // "noreply@ashe.tn"
        pass: process.env.SMTP_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"ASHE Support" <${process.env.SMTP_SERVER_USERNAME}>`, // Must match OVH sender
      to: process.env.SITE_MAIL_RECIEVER, // Admin or business email
      subject: sanitizedSubject,
      html: `<p>${sanitizedText}</p>`, // Ensure it's HTML safe
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("❌ SMTP Error:", error);
    res.status(500).json({
      error: "Email failed to send",
      details: error.message,
    });
  }
}
