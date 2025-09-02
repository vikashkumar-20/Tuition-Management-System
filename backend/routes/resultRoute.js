// routes/resultRoute.js

import express from 'express';
import ResultModel from '../models/resultModel.js';
import { upload } from '../middlewares/uploadFile.js';

const router = express.Router();

/**
 * Upload result data to DB
 */
router.post('/upload-result-data', async (req, res) => {
  try {
    const { name, rollNo, class: studentClass, subject, image } = req.body;

    if (!name || !rollNo || !studentClass || !subject || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newResult = new ResultModel({
      name,
      rollNo,
      class: studentClass,
      subject,
      image,
    });

    await newResult.save();

    res.status(200).json({ message: "Result uploaded successfully" });

  } catch (error) {
    console.error("Error uploading result data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Get all results
 */
router.get('/all', async (req, res) => {
  try {
    const results = await ResultModel.find();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Delete result by ID
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ResultModel.findById(id);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    await ResultModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Result deleted successfully" });

  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Upload single image to S3
 */
router.post('/upload-result-image', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "File Upload Failed", error: err.message });
    }

    try {
      const fileUrl = req.file.location;
      res.status(200).json({ fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
});

/**
 * Upload multiple images to S3
 */
router.post('/upload-multiple', (req, res) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "Multiple File Upload Failed", error: err.message });
    }

    try {
      const fileUrls = req.files.map(file => file.location);
      res.status(200).json({ fileUrls });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
});

export default router;
