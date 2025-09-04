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

    const result = new ResultModel({
      name,
      rollNo,
      studentClass,
      subject,
      image,
    });

    await result.save();
    res.status(201).json({ message: "Result saved successfully", result });
  } catch (error) {
    console.error("❌ Error saving result:", error);
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

export default router;
