import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();
const otpStore = new Map();

// OTP generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================== SEND OTP ==================
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

    otpStore.set(email, { otp, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ================== VERIFY OTP ==================
router.post("/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ error: "OTP not found for this email" });
    }

    if (record.otp === otp) {
      if (Date.now() < record.expiresAt) {
        otpStore.delete(email); // OTP used, remove from memory
        return res.json({ verified: true });
      } else {
        return res.status(400).json({ error: "OTP has expired" });
      }
    }

    res.status(400).json({ error: "Invalid OTP" });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// ================== UPDATE PASSWORD ==================
router.post("/update-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email and new password are required" });
    }

    // TODO: Implement your password update logic here
    // Example (if using MongoDB + bcrypt):
    // const user = await User.findOne({ email });
    // if (!user) return res.status(404).json({ error: "User not found" });
    // user.password = await bcrypt.hash(newPassword, 10);
    // await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

export default router;
