// utils/updateActivity.js
import { db } from '../../lib/firebase'; // Import the client-side Firebase instance
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export const updateUserActivity = async (uid) => {
  if (!uid) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastActivity: new Date(),
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};

export const setupRealTimeActivityListener = (uid) => {
  if (!uid) return () => {};

  try {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        // You can handle real-time updates here if needed
        console.log('User activity updated:', doc.data().lastActivity);
      }
    });
  } catch (error) {
    console.error('Error setting up activity listener:', error);
    return () => {};
  }
};