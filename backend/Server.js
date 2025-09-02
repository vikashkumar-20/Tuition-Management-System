  import express from "express";
  import dotenv from "dotenv";
  import cors from "cors";
  import connectDB from "./config/connectDB.js";
  import studyMaterialRoutes from "./routes/studyMaterialRoutes.js";
  import resultUploadRoutes from './middlewares/resultUploadRoutes.js';
  import resultRoute from './routes/resultRoute.js';
  import otpRoutes from "./routes/otpRoutes.js";
  import quizRoutes from './routes/quizRoutes.js';
  import downloadRoutes from './routes/downloadRoute.js';
  import paymentRoutes from './routes/paymentRoute.js';
  import demoBookingRoutes from './routes/demoBooking.js'


  const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];


  dotenv.config();

  const app = express();

  // Middlewares
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "connect-src 'self' " +
      "http://localhost:5000 " +
      "https://api.razorpay.com " +
      "https://checkout.razorpay.com " +
      "https://lumberjack.razorpay.com " +
      "https://www.gstatic.com " +
      "https://www.googleapis.com " +
      "https://identitytoolkit.googleapis.com " +
      "https://securetoken.googleapis.com " +
      "https://firestore.googleapis.com " +
      "https://ck-study-backend.vercel.app " +
      "https://ckstudyclasses.s3.eu-north-1.amazonaws.com; " +
      "script-src 'self' https://checkout.razorpay.com; " +
      "script-src-elem https://checkout.razorpay.com; " + // Allow Razorpay script tags
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
      "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.youtube.com; " +
      "report-uri /csp-violation-report-endpoint;"
    );
    
    
    next();
  });
  


  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/otp", otpRoutes);

  // API Routes
  app.use("/api/study-material", studyMaterialRoutes);
  app.use("/api/result", resultUploadRoutes);
  app.use("/api/result", resultRoute);
  app.use("/api/quiz", quizRoutes);
  app.use('/api/downloadCount', downloadRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use("/api/demo-booking", demoBookingRoutes);

  app.post('/csp-violation-report-endpoint', express.json(), (req, res) => {
    console.log('CSP Violation Report:', req.body);  // Log the violation to help debug
    res.status(200).send('CSP Violation Report Received');
  });

  

  // DB Connection
  connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
  });
