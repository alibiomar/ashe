import { admin } from '../../lib/firebaseAdmin';
import { db } from "../../lib/firebaseAdmin";
import { doc, getDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  try {
    const { orderId, orderData } = req.body;

    // Fetch admin's FCM token from Firestore
    const adminDoc = await getDoc(doc(db, "adminTokens", "adminUser"));

    if (!adminDoc.exists()) {
      return res.status(400).json({ error: "Admin FCM token not found" });
    }

    const adminFcmToken = adminDoc.data().fcmToken;

    const message = {
      notification: {
        title: 'New Order Received',
        body: `Order ID: ${orderId}\nDetails: ${orderData}`,
      },
      token: adminFcmToken,
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ message: 'Notification sent', response });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
