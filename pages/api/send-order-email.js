import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import dotenv from "dotenv";
dotenv.config();

const allowedAttributes = {
  '*': ['style', 'class'],
  a: ['href', 'name', 'target'],
  table: ['border', 'cellpadding', 'cellspacing'],
  td: ['width', 'align']
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order } = req.body;

    if (!order || !order.userInfo || !order.items) {
      return res.status(400).json({ error: "Invalid order format" });
    }

    // Sanitize order data
    const sanitizedOrder = {
      id: sanitizeHtml(order.id),
      userInfo: {
        name: sanitizeHtml(order.userInfo.name),
        email: sanitizeHtml(order.userInfo.email),
        phone: sanitizeHtml(order.userInfo.phone),
        address: sanitizeHtml(order.shippingInfo?.addressLine || 'N/A')
      },
      items: order.items.map(item => ({
        name: sanitizeHtml(item.name),
        price: sanitizeHtml(item.price.toFixed(2)),
        quantity: sanitizeHtml(item.quantity.toString())
      })),
      total: sanitizeHtml(order.totalAmount.toFixed(2)),
      date: new Date(sanitizeHtml(order.createdAt)).toLocaleString()
    };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_SERVER_USERNAME, // Should be noreply@ashe.tn credentials
        pass: process.env.SMTP_SERVER_PASSWORD,
      },
    });

    // Admin Email Template
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #46c7c7;">New Order Notification</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; width: 30%;">Order ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${sanitizedOrder.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Customer Name</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${sanitizedOrder.userInfo.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Total Amount</td>
            <td style="padding: 8px; border: 1px solid #ddd;">TND ${sanitizedOrder.total}</td>
          </tr>
        </table>

        <h3 style="color: #46c7c7;">Order Items</h3>
        <ul style="list-style: none; padding: 0;">
          ${sanitizedOrder.items.map(item => `
            <li style="padding: 10px; border-bottom: 1px solid #eee;">
              ${item.name} - ${item.quantity}x (TND ${item.price})
            </li>
          `).join('')}
        </ul>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://admin.ashe.tn/admin/orders/" 
             style="background-color: #46c7c7; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px;">
            View Full Order Details
          </a>
        </div>
      </div>
    `;

    // Send to admin
    await transporter.sendMail({
      from: `"ASHE Orders" <noreply@ashe.tn>`, // Hardcoded sender
      to: 'contact@ashe.tn', // Hardcoded recipient
      subject: `New Order: ${sanitizedOrder.id}`,
      html: sanitizeHtml(adminHtml, { 
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['style']), 
        allowedAttributes 
      })
    });

    console.log("✅ Admin notification sent successfully");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Order notification error:", error);
    res.status(500).json({
      error: "Failed to send order notification",
      details: error.message
    });
  }
}