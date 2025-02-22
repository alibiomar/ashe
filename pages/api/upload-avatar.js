import { getAuth } from "firebase-admin/auth";
import { db } from "../../lib/firebaseAdmin";
import path from "path";
import { promises as fs } from "fs";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Authentication
    const authToken = req.headers.authorization?.split("Bearer ")[1];
    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(authToken);
    } catch (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.uid;

    // Parse form data with updated formidable usage
    const form = formidable({
      maxFileSize: 3 * 1024 * 1024, // 3MB
      filter: function ({ mimetype }) {
        return mimetype && mimetype.includes('image/');
      },
    });

    const [fields, files] = await form.parse(req);
    
    // File validation
    const file = files.avatar?.[0];  // Updated to match new formidable structure
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create upload directory with absolute path
    const uploadDir = '/var/www/test.ashe.tn/uploads';  // Change this to your VPS path

    // File handling
    const ext = path.extname(file.originalFilename || '');
    const filename = `${userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    try {
        await fs.copyFile(file.filepath, filePath);
        await fs.unlink(file.filepath); // Delete the temp file
        
    } catch (moveError) {
      return res.status(500).json({ error: "File processing error" });
    }

    // Update Firestore
    try {
      await db.collection("users").doc(userId).update({
        avatar: filename,
        updatedAt: new Date().toISOString()
      });
    } catch (dbError) {
      // Try to cleanup the uploaded file
      await fs.unlink(filePath).catch(console.error);
      return res.status(500).json({ error: "Database update failed" });
    }

    res.status(200).json({ 
      success: true,
      avatarUrl: `/uploads/${filename}` // Adjust this URL based on your server config
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}