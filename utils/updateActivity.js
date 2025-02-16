// utils/updateActivity.js
import { db } from '../lib/firebase';

export async function updateUserActivity(uid) {
  try {
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update({
      lastActivity: new Date()
    });
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
}

export function setupRealTimeActivityListener(uid) {
  const userDocRef = db.collection('users').doc(uid);
  userDocRef.onSnapshot((doc) => {
    if (doc.exists) {
      updateUserActivity(uid);
    }
  });
}
