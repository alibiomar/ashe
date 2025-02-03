import { adminAuth } from '../../lib/firebaseAdmin';
import { sendEmail } from '../../utils/mail';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limite à 3 requêtes par fenêtre de temps
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' }),
});

export default async function handler(req, res) {
  await runMiddleware(req, res, limiter);

  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });

  try {
    const actionCodeSettings = {
      url: `${process.env.NEXTAUTH_URL}/reset-password?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    // Générer un lien de réinitialisation de mot de passe
    const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

    // Contenu de l'email
    const emailContent = `
      <h1 style="color: #2d3748;">Reset Your Password</h1>
      <p>Click the button below to reset your password:</p>
      <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #e53e3e; color: white; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p style="margin-top: 20px; color: #718096;">
        If you did not request this, please ignore this email.
      </p>
    `;

    // Envoi de l'email
    await sendEmail(email, 'Reset Your Password - ASHE', emailContent);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message });
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Middleware runner
const runMiddleware = (req, res, fn) => 
  new Promise((resolve, reject) => {
    fn(req, res, (result) => 
      result instanceof Error ? reject(result) : resolve(result)
    );
  });
