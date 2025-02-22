import fs from "fs";
import path from "path";
import { getAuth } from "firebase-admin/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Input validation
    const { filename } = req.query;
    // Check for token in header or query param
    const authToken =
      req.headers.authorization?.split("Bearer ")[1] || req.query.token;

    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Authentication
    let userId;
    try {
      const decodedToken = await getAuth().verifyIdToken(authToken);
      userId = decodedToken.uid;
    } catch (authError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Authorization: ensure the filename starts with the user's UID
    if (!filename.startsWith(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // File handling
    const uploadDir = "/var/www/test.ashe.tn/uploads"; // Your VPS uploads path
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch (error) {
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
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.setHeader("Content-Security-Policy", "default-src 'self'");

    // Stream file with error handling
    const stream = fs.createReadStream(filePath);
    stream.on("error", (error) => {
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
