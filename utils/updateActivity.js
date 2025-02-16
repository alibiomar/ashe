// utils/updateActivity.js
import { doc, updateDoc, onSnapshot, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

// Get Firestore instance
const db = getFirestore(getApp());

export const updateUserActivity = async (uid) => {
  if (!uid) {
    console.warn('No user ID provided for activity update');
    return;
  }

  try {
    // Create reference to the user document
    const userDocRef = doc(db, 'users', uid);
    
    // Update the document
    await updateDoc(userDocRef, {
      lastActivity: new Date().toISOString()
    });
    
    console.log('Activity updated successfully');
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error; // Rethrow to handle in the component
  }
};

export const setupRealTimeActivityListener = (uid) => {
  if (!uid) {
    console.warn('No user ID provided for activity listener');
    return () => {};
  }

  try {
    // Create reference to the user document
    const userDocRef = doc(db, 'users', uid);
    
    // Set up the listener
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log('Activity updated:', data.lastActivity);
      }
    }, (error) => {
      console.error('Listener error:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up activity listener:', error);
    return () => {};
  }
};