import { getAuth } from "firebase-admin/auth";
import { db } from "../../lib/firebaseAdmin";
import path from "path";
import { promises as fs } from "fs";
import formidable from "formidable";
import sharp from "sharp"; // Import sharp for image compression

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

    // Parse form data with formidable
    const form = formidable({
      maxFileSize: 3 * 1024 * 1024, // 3MB
      filter: function ({ mimetype }) {
        return mimetype && mimetype.includes("image/");
      },
    });

    const [fields, files] = await form.parse(req);

    // File validation
    const file = files.avatar?.[0];
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get current avatar from Firestore
    let currentAvatar = null;
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      currentAvatar = userDoc.data()?.avatar;
    } catch (firestoreError) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    // Delete the old avatar if it exists
    if (currentAvatar) {
      const oldFilePath = path.join("/var/www/test.ashe.tn/uploads", currentAvatar);
        await fs.unlink(oldFilePath); // Delete old file if it exists
      
    }

    // Define upload directory
    const uploadDir = "/var/www/test.ashe.tn/uploads"; // Adjust to your VPS path
    const ext = path.extname(file.originalFilename || "");
    const filename = `${userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    try {
      // Compress and save the image
      await sharp(file.filepath)
        .resize(800) // Resize to a maximum width of 800px while maintaining aspect ratio
        .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality (adjustable)
        .toFile(filePath);

      // Delete the temporary uploaded file
      await fs.unlink(file.filepath);
    } catch (compressionError) {
      return res.status(500).json({ error: "Image compression failed" });
    }

    // Update Firestore with new avatar filename
    try {
      await db.collection("users").doc(userId).update({
        avatar: filename,
        updatedAt: new Date().toISOString(),
      });
    } catch (dbError) {
      await fs.unlink(filePath).catch(console.error); // Cleanup on failure
      return res.status(500).json({ error: "Database update failed" });
    }

    res.status(200).json({
      success: true,
      avatarUrl: `/uploads/${filename}`, // Adjust based on your server config
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
