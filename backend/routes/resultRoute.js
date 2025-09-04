// routes/resultRoute.js
import express from "express";
import ResultModel from "../models/resultModel.js";
import { upload } from "../middlewares/uploadFile.js";

const router = express.Router();

/**
 * ================== 1. Upload Result Data ==================
 * Note: Use `className` instead of `class` to avoid reserved keyword issues
 */
router.post("/upload-result-data", async (req, res) => {
  try {
    const { name, rollNo, studentClass, subject, image } = req.body;

    if (!name || !rollNo || !studentClass || !subject || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newResult = await new ResultModel({
      name,
      rollNo,
      class: studentClass, // save in DB
      subject,
      image,
    }).save();

    res.status(201).json({
      message: "Result uploaded successfully",
      result: newResult,
    });
  } catch (error) {
    console.error("❌ Error uploading result data:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


/**
 * ================== 2. Get All Results ==================
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
 * ================== 3. Delete Result by ID ==================
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

/**
 * ================== 4. Upload Single Image (S3) ==================
 */
router.post("/upload-result-image", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("❌ Single Upload Error:", err);
      return res.status(400).json({ message: "File Upload Failed", error: err.message });
    }

    if (!req.file || !req.file.location) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({ fileUrl: req.file.location });
  });
});

/**
 * ================== 5. Upload Multiple Images (S3) ==================
 */
router.post("/upload-multiple", (req, res) => {
  upload.array("files", 10)(req, res, (err) => {
    if (err) {
      console.error("❌ Multiple Upload Error:", err);
      return res.status(400).json({ message: "Multiple File Upload Failed", error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const fileUrls = req.files.map((file) => file.location);
    res.status(200).json({ fileUrls });
  });
});

export default router;
