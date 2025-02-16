// pages/api/update-activity.js
import { adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { uid } = req.body; // Assume uid is passed in the request body

  try {
    const userDoc = adminDb.collection('users').doc(uid);
    await userDoc.update({
      lastActivity: new Date()
    });

    res.status(200).json({ message: 'User activity updated' });
  } catch (error) {
    console.error('Error updating user activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
