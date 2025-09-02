import express from "express";
import mongoose from "mongoose";
import DownloadBooks from "../models/DownloadBooks.js";
import StudyMaterial from "../models/StudyMaterial.js";

const router = express.Router();

// ✅ Test route
router.get("/", (req, res) => {
  res.json({ success: true, message: "Download API is running..." });
});

// 📥 POST: Update download count
router.post("/update", async (req, res) => {
  const { userId, className, subject } = req.body;

  if (!userId || !className || !subject) {
    return res.status(400).json({ success: false, message: "Missing required fields: userId, className, or subject." });
  }

  try {
    let record = await DownloadBooks.findOne({ userId });

    if (!record) {
      record = new DownloadBooks({
        userId,
        downloads: [{ className, subject, count: 1 }],
      });
    } else {
      const totalDownloads = record.downloads.reduce((sum, d) => sum + d.count, 0);

      if (totalDownloads >= 2) {
        return res.status(403).json({ success: false, message: "Download limit reached. You can't download more than 2 materials." });
      }

      const existing = record.downloads.find(d => d.className === className && d.subject === subject);

      if (existing) {
        existing.count += 1;
      } else {
        record.downloads.push({ className, subject, count: 1 });
      }
    }

    await record.save();
    res.status(200).json({ success: true, message: "Download count updated successfully" });
  } catch (err) {
    console.error("❌ Error updating download count:", err.message);
    res.status(500).json({ success: false, message: "Error updating download count.", error: err.message });
  }
});

// 📤 GET: Fetch the study material download URLs by ID
router.get("/download/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid material ID" });
  }

  try {
    const material = await StudyMaterial.findById(id);

    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    const urls = material.files?.map(file => file.fileUrl) || [];
    res.status(200).json({ success: true, fileUrls: urls });
  } catch (error) {
    console.error("❌ Error fetching material:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch material", error: error.message });
  }
});

export default router;
