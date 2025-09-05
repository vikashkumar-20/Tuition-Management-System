import express from "express";
import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import StudyMaterial from "../models/StudyMaterial.js";
import Leaderboard from "../models/Leaderboard.js";
import Submission from "../models/Submission.js";

const router = express.Router();

// Create Quiz
router.post("/create", async (req, res) => {
  try {
    const { className, subject, title, password, timer, questions } = req.body;

    const quiz = new Quiz({
      title: title || "Untitled Quiz",
      password: password || "",
      timer: timer || 1,
      questions: Array.isArray(questions) ? questions : [],
    });

    const savedQuiz = await quiz.save();

    // Create StudyMaterial link
    const supportEntry = new StudyMaterial({
      type: "support-material",
      category: "quiz",
      className: className || "General",
      subject: subject || "General",
      files: [
        {
          title: title || "Quiz",
          fileUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/quiz/${savedQuiz._id}`,
        },
      ],
    });

    await supportEntry.save();

    res.status(201).json({ quiz: savedQuiz, material: supportEntry });
  } catch (err) {
    console.error("Quiz Create Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get Quiz by ID
router.get("/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json(quiz);
  } catch (err) {
    console.error("Get Quiz Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Validate Quiz Password
router.post("/validate-password", async (req, res) => {
  try {
    const { quizId, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const inputPassword = password ? password.toString().trim() : "";
    const storedPassword = quiz.password ? quiz.password.toString().trim() : "";

    if (inputPassword === storedPassword) {
      return res.status(200).json({ message: "Password validated" });
    }

    res.status(401).json({ message: "Invalid password" });
  } catch (err) {
    console.error("Password Validation Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Submit Quiz
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
    console.error("Quiz Submit Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/submission/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid Submission ID" });
    }
    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.status(200).json(submission);
  } catch (err) {
    console.error("Get Submission Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
