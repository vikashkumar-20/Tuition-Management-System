// routes/resultRoute.js
import express from "express";
import ResultModel from "../models/resultModel.js";
import { upload } from "../middlewares/uploadFile.js";

const router = express.Router();

/**
 * ================== 1. Upload File to S3 ==================
 * Endpoint: POST /api/result/upload-result-image
 * Request: multipart/form-data { image }
 * Response: { fileUrl: "https://bucket.s3.amazonaws.com/filename.jpg" }
 */
router.post("/upload-result-image", upload.single("image"), (req, res) => {
  try {
    if (!req.file || !req.file.location) {
      return res.status(400).json({ message: "File upload failed" });
    }

    res.status(200).json({
      message: "File uploaded successfully 🚀",
      fileUrl: req.file.location,
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ================== 2. Save Result Metadata ==================
 * Endpoint: POST /api/result/upload-result-data
 * Request: JSON { name, rollNo, studentClass, subject, image }
 * Response: { message, result }
 */
router.post("/upload-result-data", async (req, res) => {
  try {
    const { name, rollNo, studentClass, subject, image } = req.body;

    if (!name || !rollNo || !studentClass || !subject || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = new ResultModel({
      name,
      rollNo,
      studentClass,
      subject,
      image, // this is the file URL returned from /upload-result-image
    });

    await result.save();
    res.status(201).json({ message: "Result saved successfully 🚀", result });
  } catch (error) {
    console.error("❌ Error saving result:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ================== 3. Get All Results ==================
 */
router.get("/all", async (req, res) => {
  try {
    const results = await ResultModel.find().sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ================== 4. Delete Result by ID ==================
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ResultModel.findById(id);

    if (!result) return res.status(404).json({ message: "Result not found" });

    await result.deleteOne();
    res.status(200).json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting result:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

export default router;
