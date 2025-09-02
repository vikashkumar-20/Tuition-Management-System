import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import UserPayments from '../models/UserPayments.js';

dotenv.config();

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ 1. Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating order' });
  }
});

router.post('/payment-success', async (req, res) => {
  try {
    // Log the entire request body for debugging
    console.log('Received Payment Details:', req.body);

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      materialId, 
      type, 
      className, 
      subject 
    } = req.body;

    // Check if all the required fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !materialId || !type || !className || !subject) {
      console.error('Missing payment details or material data');
      return res.status(400).json({ success: false, message: 'Missing payment details or material data' });
    }

    // Validate that className and subject are not default values
    if (className === "defaultClass" || subject === "defaultSubject") {
      console.error('Invalid class or subject:', { className, subject });
      return res.status(400).json({ success: false, message: 'Invalid class or subject' });
    }

    // Verify the Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid signature, payment verification failed');
      return res.status(400).json({ success: false, message: 'Invalid signature, payment verification failed' });
    }

    // Save payment data to the database
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

    // Update or insert payment data into the database
    const userPayment = await UserPayments.findOneAndUpdate(
      { userId, materialId, type, className, subject },
      paymentData,
      { upsert: true, new: true }
    );

    console.log('Payment verified and saved:', userPayment);

    // Respond with success
    return res.status(200).json({ success: true, message: 'Payment verified and access granted' });

  } catch (error) {
    console.error('Payment Success Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while verifying payment' });
  }
});

router.post('/check-purchase', async (req, res) => {
  const { userId, type, className, subject } = req.body;

  console.log('Received request:', req.body);

  if (!userId || !type || !className || !subject) {
    console.warn("Missing fields:", { userId, type, className, subject });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const purchase = await UserPayments.findOne({ userId, type, className, subject });
    res.json({ purchased: !!(purchase && purchase.paymentStatus) });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
