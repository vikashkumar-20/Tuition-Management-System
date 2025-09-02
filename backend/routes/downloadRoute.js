import express from 'express';
import DownloadBooks from '../models/DownloadBooks.js';
import StudyMaterial from '../models/StudyMaterial.js';

const router = express.Router();

// 📥 POST: Update download count
router.post('/update', async (req, res) => {
  const { userId, className, subject } = req.body;

  // Validate that the required fields are provided
  if (!userId || !className || !subject) {
    return res.status(400).json({ message: 'Missing required fields: userId, className, or subject.' });
  }

  try {
    // Try to find an existing record for the user
    let record = await DownloadBooks.findOne({ userId });

    if (!record) {
      // First download for the user, create a new record
      record = new DownloadBooks({
        userId,
        downloads: [{ className, subject, count: 1 }]
      });
    } else {
      // Calculate the total number of downloads for the user
      const totalDownloads = record.downloads.reduce((sum, d) => sum + d.count, 0);

      // Check if the download limit has been reached
      if (totalDownloads >= 2) {
        return res.status(403).json({ error: "Download limit reached. You can't download more than 2 materials." });
      }

      // Check if the className and subject already exist in the downloads
      const existing = record.downloads.find(d => d.className === className && d.subject === subject);

      // If it exists, increment the download count, else add a new entry
      if (existing) {
        existing.count += 1;
      } else {
        record.downloads.push({ className, subject, count: 1 });
      }
    }

    // Save the updated download count
    await record.save();

    // Respond with success message
    res.status(200).json({ message: 'Download count updated successfully' });

  } catch (err) {
    console.error("Error updating download count:", err.message);
    res.status(500).json({ message: 'Error updating download count.', error: err.message });
  }
});

// 📤 GET: Fetch the study material download URLs by ID
router.get("/download/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the study material by ID
    const material = await StudyMaterial.findById(id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Extract file URLs from the material's files array
    const urls = material.files.map(file => file.fileUrl);
    res.status(200).json({ fileUrls: urls });

  } catch (error) {
    console.error("Error fetching material:", error.message);
    res.status(500).json({ error: "Failed to fetch material" });
  }
});

export default router;
