import express from 'express';
import ResultModel from '../models/resultModel.js';

const router = express.Router();

// Upload Result Route
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


// Get All Results Route
router.get('/all', async (req, res) => {
  try {
    const results = await ResultModel.find();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Delete Result by ID Route
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


export default router;
