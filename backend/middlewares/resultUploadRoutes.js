import express from 'express';
import { upload } from '../middlewares/uploadFile.js';

const router = express.Router();

// Route for uploading a single image or PDF
router.post('/upload-result-image', (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: "File Upload Failed", error: err.message });
    }

    try {
      const fileUrl = req.file.location;  // AWS S3 URL for the uploaded file
      res.status(200).json({ fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
});

// Route for uploading multiple images or PDFs
router.post('/upload-multiple', (req, res, next) => {
  upload.array('files', 10)(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: "Multiple File Upload Failed", error: err.message });
    }

    try {
      const fileUrls = req.files.map(file => file.location);  // Map to get S3 URLs for all uploaded files
      res.status(200).json({ fileUrls });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
});

export default router;
