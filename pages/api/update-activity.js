// utils/updateActivity.js
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const updateUserActivity = async (uid) => {
  if (!uid) return;

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastActivity: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating activity:', error);
  }
};

export const setupRealTimeActivityListener = (uid) => {
  if (!uid) return () => {};

  const userRef = doc(db, 'users', uid);
  
  try {
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('Activity updated:', snapshot.data().lastActivity);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up listener:', error);
    return () => {};
  }
};