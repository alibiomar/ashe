import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // Ensure this is set correctly in environment variables
  });
}

const db = admin.firestore(); // Firestore reference
export { db };
