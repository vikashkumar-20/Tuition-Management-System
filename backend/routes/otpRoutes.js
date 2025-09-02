import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP route
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

  otpStore.set(email, { otp, expiresAt });

  try {
    await transporter.sendMail({
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });
    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP route
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  // Check if record exists and if OTP is correct
  if (record && record.otp === otp) {
    if (Date.now() < record.expiresAt) {
      otpStore.delete(email); // OTP is valid, delete it from memory
      return res.json({ verified: true });
    } else {
      return res.status(400).json({ error: "OTP has expired" });
    }
  }

  return res.status(400).json({ error: "Invalid OTP" });
});

// Reset password route (you should implement your password update logic)
router.post("/update-password", (req, res) => {
  const { email, newPassword } = req.body;

  // Add your password update logic here, e.g., Firebase update
  // Example: await auth.updateUserPassword(email, newPassword);

  res.json({ success: true });
});

export default router;
