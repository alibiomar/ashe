// pages/api/sendNotification.js
import { admin } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  try {
    const { orderId, orderData } = req.body;

    // In a real app, you might look up the admin’s FCM tokens from your database.
    const adminFcmToken = process.env.ADMIN_FCM_TOKEN;
    
    const message = {
      notification: {
        title: 'New Order Received',
        body: `Order ID: ${orderId}\nDetails: ${orderData}`,
      },
      token: adminFcmToken,
    };
    
    const response = await admin.messaging().send(message);
    res.status(200).json({ message: 'Notification sent', response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
}
