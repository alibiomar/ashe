import { adminAuth } from '../../lib/firebaseAdmin';
import { sendEmail } from '../../utils/mail';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' }),
});

export default async function handler(req, res) {
  await runMiddleware(req, res, limiter);
  
  if (req.method !== 'POST') return res.status(405).end();
  
  const { email } = req.body;
  if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });

  try {
    const actionCodeSettings = {
      url: `${process.env.NEXTAUTH_URL}/verify-email?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    const link = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);
    
    const emailContent = `
      <h1 style="color: #2d3748;">Verify Your Email</h1>
      <p>Click below to complete your registration:</p>
      <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #4299e1; color: white; text-decoration: none; border-radius: 4px;">
        Confirm Email
      </a>
      <p style="margin-top: 20px; color: #718096;">
        If you didn't create this account, please ignore this email.
      </p>
    `;

    await sendEmail(email, 'Confirm Your ASHE Account', emailContent);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Verification error:', error);
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