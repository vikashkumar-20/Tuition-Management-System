import express from "express";
import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import StudyMaterial from "../models/StudyMaterial.js";
import Leaderboard from "../models/Leaderboard.js";
import Submission from "../models/Submission.js";

const router = express.Router();

// ================== 1. Create Quiz ==================
router.post("/create", async (req, res) => {
  try {
    const { className, subject, title, password, timer, questions } = req.body;

    const quiz = new Quiz({
      className: className || "General",
      subject: subject || "General",
      title: title || "Untitled Quiz",
      password: password || "",
      timer: timer || 0,
      questions: Array.isArray(questions) ? questions : [],
    });

    const savedQuiz = await quiz.save();

    // Optional: Create support material link
    const supportEntry = new StudyMaterial({
      type: "support-material",
      category: "quiz",
      className: className || "General",
      subject: subject || "General",
      files: [
        {
          title: title || "Quiz",
          fileUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/start-quiz/${savedQuiz._id}`,
        },
      ],
    });

    await supportEntry.save();

    res.status(201).json({ quiz: savedQuiz, material: supportEntry });
  } catch (err) {
    console.error("❌ Quiz Create Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ================== 2. Get All Quizzes ==================
router.get("/all", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (err) {
    console.error("❌ Fetch All Quizzes Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ================== 3. Get Quiz by ID ==================
router.get("/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return res.status(404).json({ message: "This quiz has no questions" });
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.error("❌ Get Quiz Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ================== 4. Submit Quiz ==================
router.post("/submit", async (req, res) => {
  try {
    const { quizId, userAnswers, userName = "Anonymous" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (!Array.isArray(userAnswers) || userAnswers.length !== quiz.questions.length) {
      return res.status(400).json({ message: "Answers are incomplete or invalid" });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (userAnswers[i] && q.correctAnswer === userAnswers[i]) score++;
    });

    const submission = await new Submission({
      quizId,
      userName,
      answers: userAnswers,
      score,
    }).save();

    await new Leaderboard({
      quizId,
      userName,
      score,
      submissionId: submission._id,
    }).save();

    res.status(200).json({ message: "Quiz submitted successfully", score });
  } catch (err) {
    console.error("❌ Quiz Submit Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ================== 5. Validate Quiz Password ==================
router.post("/validate-password", async (req, res) => {
  try {
    const { quizId, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Convert both to string and trim
    const inputPassword = password ? password.toString().trim() : "";
    const storedPassword = quiz.password ? quiz.password.toString().trim() : "";

    console.log("Stored password:", storedPassword);
    console.log("Input password:", inputPassword);

    if (inputPassword === storedPassword) {
      return res.status(200).json({ message: "Password validated" });
    }

    res.status(401).json({ message: "Invalid password" });
  } catch (err) {
    console.error("❌ Password Validation Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


export default router;
