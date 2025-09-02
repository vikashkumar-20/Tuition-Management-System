import express from "express";
import DemoBooking from "../models/DemoBooking.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { name, motherName, class: studentClass, mobile, email, address } = req.body;

    const newBooking = new DemoBooking({
      name,
      motherName,
      class: studentClass,
      mobile,
      email,
      address,
    });

    await newBooking.save();

    res.status(201).json({ message: "Demo class booked successfully" });
  } catch (error) {
    console.error("Error booking demo class:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
