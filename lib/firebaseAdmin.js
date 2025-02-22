import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const getProcessedPrivateKey = (key) => {
  if (!key) {
    throw new Error('FIREBASE_PRIVATE_KEY is not defined');
  }
  return key.replace(/\\n/g, '\n').trim();
};

const validatePrivateKey = (key) => {
  if (!key.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Invalid private key header');
  }
  if (!key.endsWith('-----END PRIVATE KEY-----')) {
    throw new Error('Invalid private key footer');
  }
};

let admin;
let db;
let auth;

if (!getApps().length) {
  try {
    const processedKey = getProcessedPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    validatePrivateKey(processedKey);

    const adminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: processedKey
      })
    };

    admin = initializeApp(adminConfig);
    db = getFirestore(admin);
    auth = getAuth(admin);
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
}

export { admin, db, auth };