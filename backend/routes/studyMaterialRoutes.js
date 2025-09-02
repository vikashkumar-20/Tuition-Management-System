import express from "express";
import StudyMaterial from "../models/StudyMaterial.js";
import { upload } from "../middlewares/uploadFile.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";

const router = express.Router();

// Upload study material
router.post("/upload/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = req.file.location; // URL from S3
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

// Save metadata to MongoDB
router.post("/upload/metadata", async (req, res) => {
  try {
    const {
      type,
      className,
      subject,
      year,
      category,
      title,
      s3Url,
      uploadType,
    } = req.body;

    const newMaterial = new StudyMaterial({
      type,
      className,
      subject,
      year,
      category,
      files: [
        {
          title: title,
          fileUrl: s3Url,
          optionalUrl: uploadType === 'URL' ? s3Url : null,
        },
      ],
    });

    console.log("Saving new material:", newMaterial);
    await newMaterial.save();

    res.status(201).json({ message: "Study material saved successfully" });
  } catch (error) {
    console.error("Error saving study material:", error);
    res.status(500).json({ message: "Error saving study material", error: error.message });
  }
});


// Get study materials with optional filters
router.get("/get", async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    const studyMaterials = await StudyMaterial.find(filter);
    res.status(200).json(studyMaterials);
  } catch (error) {
    console.error("Error fetching study material:", error);
    res.status(500).json({ error: "Failed to fetch study material", error: error.message });
  }
});

// Delete study material
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log("🔍 Deleting material with ID:", id);

    const material = await StudyMaterial.findById(id);

    if (!material) {
      console.log("⚠️ Material not found in database");
      return res.status(404).json({ error: "Material not found" });
    }

    console.log("✅ Material found:", material);

    // Check if files exist in S3 and delete them
    if (material.files && material.files.length > 0) {
      material.files.forEach(async (file) => {
        if (file.fileUrl) {
          const urlParts = file.fileUrl.split("/");
          const key = urlParts[urlParts.length - 1];

          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          };

          await s3.send(new DeleteObjectCommand(deleteParams));
          console.log("✅ S3 file deleted successfully");
        }
      });
    }

    // Delete from MongoDB
    await StudyMaterial.findByIdAndDelete(id);
    console.log("✅ Material document deleted from MongoDB");

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting material:", error);
    res.status(500).json({ error: "Server error while deleting material", error: error.message });
  }
});



router.get("/:className/:subject", async (req, res) => {
  const { className, subject } = req.params;
  console.log('Received className:', className, 'subject:', subject); // Log the incoming parameters

  try {
    // Query the study materials collection with class and subject
    const material = await StudyMaterial.findOne({
      className: className,
      subject: subject,
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const fileUrl = material.files[0]?.fileUrl;
    if (!fileUrl) {
      return res.status(404).json({ error: 'File URL not found' });
    }

    res.json({ fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



export default router;
