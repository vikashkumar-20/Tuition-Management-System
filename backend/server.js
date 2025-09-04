// server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";

// ✅ Import routes
import studyMaterialRoutes from "./routes/studyMaterialRoutes.js";
import resultRoute from "./routes/resultRoute.js";
import otpRoutes from "./routes/otpRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import downloadRoutes from "./routes/downloadRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import demoBookingRoutes from "./routes/demoBooking.js";

dotenv.config();

const app = express();

/**
 * ================== 1. CORS Setup ==================
 */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://tuition-management-system-rwxu.onrender.com",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/tuition-management-system-[a-z0-9]+\.vercel\.app$/.test(origin) // ✅ allow all vercel previews
      ) {
        callback(null, true);
      } else {
        console.warn("❌ CORS Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ================== 2. CSP Middleware (optional) ==================
 * Tip: Disable this if you face frontend fetch/XHR blocking issues
 */
if (process.env.ENABLE_CSP === "true") {
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "connect-src 'self' http://localhost:5000 " +
      "https://api.razorpay.com https://checkout.razorpay.com " +
      "https://lumberjack.razorpay.com https://www.gstatic.com " +
      "https://www.googleapis.com https://identitytoolkit.googleapis.com " +
      "https://securetoken.googleapis.com https://firestore.googleapis.com " +
      "https://ck-study-backend.vercel.app " +
      "https://ckstudyclasses.s3.eu-north-1.amazonaws.com; " +
      "script-src 'self' https://checkout.razorpay.com; " +
      "script-src-elem https://checkout.razorpay.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
      "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.youtube.com https://*.firebaseapp.com https://apis.google.com; " +
      "img-src 'self' data: blob: https://tuition-management-system-rwxu.onrender.com https://*.s3.eu-north-1.amazonaws.com; " +
      "report-uri /csp-violation-report-endpoint;"
    );
    next();
  });
}


/**
 * ================== 3. Routes ==================
 */
app.get("/api", (req, res) => {
  res.send("✅ Tuition Management System API is running...");
});

app.use("/api/otp", otpRoutes);
app.use("/api/study-material", studyMaterialRoutes);
app.use("/api/result", resultRoute);
app.use("/api/quiz", quizRoutes);
app.use("/api/downloadCount", downloadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/demo-booking", demoBookingRoutes);

// ✅ CSP violation report endpoint
app.post("/csp-violation-report-endpoint", express.json(), (req, res) => {
  console.log("⚠️ CSP Violation Report:", req.body);
  res.status(200).send("CSP Violation Report Received");
});

/**
 * ================== 4. Global Error Handler ==================
 */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

/**
 * ================== 5. Database Connection ==================
 */
connectDB();

/**
 * ================== 6. Start Server ==================
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
