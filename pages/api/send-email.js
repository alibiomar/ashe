import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import dotenv from "dotenv";
dotenv.config();

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
    const sanitizedText = sanitizeHtml(text, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['style', 'button']),
      allowedAttributes: {
        a: ['href', 'name', 'target', 'style'], 
        button: ['style'], 
        '*': ['style'], 
      },
    });
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER_HOST,
      port: 465, 
      secure: true, 
      auth: {
        user: process.env.SMTP_SERVER_USERNAME, 
        pass: process.env.SMTP_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"ASHE Support" <${process.env.SMTP_SERVER_USERNAME}>`, 
      to: 'contact@ashe.tn', 
      subject: sanitizedSubject,
      html: `<p>${sanitizedText}</p>`, 
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({
      error: "Email failed to send",
      details: error.message,
    });
  }
}
