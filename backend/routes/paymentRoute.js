import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import UserPayments from "../models/UserPayments.js";

dotenv.config();

const router = express.Router();

// 🟢 Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================== 1. Create Razorpay Order ==================
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("❌ Create Order Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating order" });
  }
});

// ================== 2. Verify Payment & Save ==================
router.post("/payment-success", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      materialId,
      type,
      className,
      subject,
    } = req.body;

    // 🔎 Validation
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !materialId ||
      !type ||
      !className ||
      !subject
    ) {
      return res.status(400).json({ success: false, message: "Missing payment or material details" });
    }

    if (className === "defaultClass" || subject === "defaultSubject") {
      return res.status(400).json({ success: false, message: "Invalid class or subject" });
    }

    // 🔒 Signature Verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature, payment verification failed" });
    }

    // 💾 Save or Update Payment Record
    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      materialId,
      type,
      className,
      subject,
      paymentStatus: true,
      lastPaymentDate: new Date(),
    };

    const userPayment = await UserPayments.findOneAndUpdate(
      { userId, materialId, type, className, subject },
      paymentData,
      { upsert: true, new: true }
    );

    console.log("✅ Payment verified & saved:", userPayment);

    res.status(200).json({ success: true, message: "Payment verified and access granted" });
  } catch (error) {
    console.error("❌ Payment Success Error:", error);
    res.status(500).json({ success: false, message: "Server error while verifying payment" });
  }
});

// ================== 3. Check if User Purchased ==================
router.post("/check-purchase", async (req, res) => {
  try {
    const { userId, type, className, subject } = req.body;

    if (!userId || !type || !className || !subject) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const purchase = await UserPayments.findOne({ userId, type, className, subject });

    res.json({ purchased: !!(purchase && purchase.paymentStatus) });
  } catch (error) {
    console.error("❌ Check Purchase Error:", error);
    res.status(500).json({ error: "Server error while checking purchase" });
  }
});

export default router;
