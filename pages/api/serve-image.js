import fs from 'fs';
import path from 'path';
import { getAuth } from 'firebase-admin/auth';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let { filename } = req.query;
    
    console.log('Requested filename:', filename);  // Debug log

    // Check for token in header or query param
    const authToken = req.headers.authorization?.split("Bearer ")[1] || req.query.token;

    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    // Authentication
    let userId;
    try {
      const decodedToken = await getAuth().verifyIdToken(authToken);
      userId = decodedToken.uid;
    } catch (authError) {
      console.error('Auth error:', authError);  // Debug log
      return res.status(401).json({ error: "Invalid token" });
    }

    // Remove any leading slash and 'uploads/' prefix if it exists
    filename = filename.replace(/^\/+/, '').replace(/^uploads\//, '');

    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Authorization: ensure the filename starts with the user's UID
    if (!filename.startsWith(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const uploadDir = "/var/www/test.ashe.tn";
    const filePath = path.join(uploadDir, 'uploads', filename);
    
    console.log('Full file path:', filePath);  // Debug log

    // Check if file exists
    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch (error) {
      console.error('File access error:', error);  // Debug log
      return res.status(404).json({ error: "File not found" });
    }

    // Set content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[ext];
    if (!contentType) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("Content-Security-Policy", "default-src 'self'");

    // Stream file with error handling
    const stream = fs.createReadStream(filePath);
    stream.on("error", (error) => {
      console.error('Stream error:', error);  // Debug log
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error('Unexpected error:', error);  // Debug log
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}