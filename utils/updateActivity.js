// utils/updateActivity.js
import { doc, updateDoc, onSnapshot, getFirestore, serverTimestamp } from 'firebase/firestore';
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
    
    // Update the document using Firestore's serverTimestamp
    await updateDoc(userDocRef, {
      lastActivity: serverTimestamp()
    });
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
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // You can now use data.lastActivity (as a Timestamp)
        }
      },
      (error) => {
        console.error('Listener error:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up activity listener:', error);
    return () => {};
  }
};
