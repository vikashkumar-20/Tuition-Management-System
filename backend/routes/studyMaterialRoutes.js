// routes/studyMaterialRoutes.js
import express from "express";
import StudyMaterial from "../models/StudyMaterial.js";
import { upload } from "../middlewares/uploadFile.js";

const router = express.Router();

/**
 * ================== 1. Get All Study Materials ==================
 */
router.get("/", async (req, res) => {
  try {
    const studyMaterials = await StudyMaterial.find().sort({ createdAt: -1 });
    res.status(200).json(studyMaterials);
  } catch (error) {
    console.error("❌ Error fetching study materials:", error);
    res.status(500).json({ error: "Failed to fetch study materials" });
  }
});

/**
 * ================== 2. Get Study Material by Type (Query Param) ==================
 * Example: /api/study-material/get?type=ncert-books
 */
router.get("/get", async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      return res.status(400).json({ error: "Type query param is required" });
    }

    const studyMaterials = await StudyMaterial.find({ type }).sort({ createdAt: -1 });

    if (!studyMaterials.length) {
      return res.status(404).json({ error: "No study materials found for given type" });
    }

    res.status(200).json(studyMaterials);
  } catch (error) {
    console.error("❌ Error fetching study material:", error);
    res.status(500).json({ error: "Failed to fetch study material" });
  }
});

/**
 * ================== 3. Get Study Material by Category ==================
 * Example: /api/study-material/category/ncert-books
 */
router.get("/category/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const studyMaterials = await StudyMaterial.find({ type }).sort({ createdAt: -1 });

    if (!studyMaterials.length) {
      return res.status(404).json({ message: "No study materials found" });
    }

    res.status(200).json(studyMaterials);
  } catch (error) {
    console.error("❌ Error fetching study materials by category:", error);
    res.status(500).json({ error: "Failed to fetch study materials" });
  }
});

/**
 * ================== 4. Get Study Material by ID ==================
 */
router.get("/:id", async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findById(req.params.id);
    if (!studyMaterial) {
      return res.status(404).json({ error: "Study material not found" });
    }
    res.status(200).json(studyMaterial);
  } catch (error) {
    console.error("❌ Error fetching study material:", error);
    res.status(500).json({ error: "Failed to fetch study material" });
  }
});

/**
 * ================== 5. Upload Study Material ==================
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { className, subject, title, type, category, year, uploadType, url } = req.body;

    if (!title || !subject || !className) {
      return res.status(400).json({ error: "Title, subject, and className are required" });
    }

    const fileUrl = req.file ? req.file.location : url;

    if (!fileUrl) {
      return res.status(400).json({ error: "File or URL is required" });
    }

    const newMaterial = await new StudyMaterial({
      className,
      subject,
      title,
      type,
      category,
      year,
      uploadType,
      fileUrl,
    }).save();

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("❌ Error uploading study material:", error);
    res.status(500).json({ error: "Failed to upload study material" });
  }
});

/**
 * ================== 6. Delete Study Material by ID ==================
 */
router.delete("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Study material not found" });
    }
    res.status(200).json({ message: "Study material deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting study material:", error);
    res.status(500).json({ error: "Failed to delete study material" });
  }
});

/**
 * ================== 7. Upload File Only ==================
 */
router.post("/upload/file", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("❌ File upload error:", err);
      return res.status(400).json({ error: "File Upload Failed", details: err.message });
    }

    if (!req.file || !req.file.location) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.status(200).json({ fileUrl: req.file.location });
  });
});

/**
 * ================== 8. Fetch By Class & Subject ==================
 */
router.get("/by-class-subject/:className/:subject", async (req, res) => {
  try {
    const { className, subject } = req.params;
    const studyMaterials = await StudyMaterial.find({ className, subject }).sort({ createdAt: -1 });

    if (studyMaterials.length === 0) {
      return res.status(404).json({ message: "No study materials found for given filters" });
    }

    res.status(200).json(studyMaterials);
  } catch (error) {
    console.error("❌ Error fetching by class & subject:", error);
    res.status(500).json({ error: "Failed to fetch study materials" });
  }
});

export default router;
