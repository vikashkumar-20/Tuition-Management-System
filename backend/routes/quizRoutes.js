import express from "express";
import mongoose from "mongoose"; // Import mongoose for ObjectId handling
import Quiz from "../models/Quiz.js";
import StudyMaterial from "../models/StudyMaterial.js";
import Leaderboard from "../models/Leaderboard.js";
import Submission from "../models/Submission.js";

const router = express.Router();

// POST /api/quiz/create
router.post("/create", async (req, res) => {
  try {
    const quiz = new Quiz({
      className: req.body.className || "",
      subject: req.body.subject || "",
      title: req.body.title || "",
      password: req.body.password,
      timer: req.body.timer,
      questions: req.body.questions,
    });

    const savedQuiz = await quiz.save();

    const supportEntry = new StudyMaterial({
      type: "support-material",
      category: "quiz",
      className: req.body.className || "General",
      subject: req.body.subject || "General",
      files: [
        {
          title: req.body.title || "Quiz",
          fileUrl: `http://localhost:3000/start-quiz/${savedQuiz._id}`,
        },
      ],
    });

    await supportEntry.save();

    res.status(201).json({ quiz: savedQuiz, material: supportEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz/all
router.get('/all', async (req, res) => {
  try {
    const quizzes = await Quiz.find();  // Fetch all quizzes
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load quizzes' });
  }
});

// GET /api/quiz/:quizId
router.get('/:quizId', async (req, res) => {
  try {
      const quizId = req.params.quizId;
      if (!mongoose.Types.ObjectId.isValid(quizId)) {
          return res.status(400).json({ message: 'Invalid quiz ID' });
      }

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
          return res.status(404).json({ message: 'Quiz not found' });
      }

      console.log('Fetched quiz:', quiz);

      if (!quiz.questions || quiz.questions.length === 0) {
          return res.status(404).json({ message: 'This quiz has no questions' });
      }

      res.json(quiz);  // Return the quiz details
  } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/quiz/submit
router.post("/submit", async (req, res) => {
  const { quizId, userAnswers, userName = "Anonymous" } = req.body;

  try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
          return res.status(404).json({ message: "Quiz not found" });
      }

      let score = 0;

      if (!Array.isArray(userAnswers) || userAnswers.length !== quiz.questions.length) {
          return res.status(400).json({ message: "Answers are incomplete or invalid" });
      }

      quiz.questions.forEach((q, i) => {
          if (userAnswers[i] && q.correctAnswer === userAnswers[i]) {
              score++;
          }
      });

      const submission = new Submission({
          quizId,
          userName,
          answers: userAnswers,
          score,
      });
      await submission.save();

      const leaderboardEntry = new Leaderboard({
          quizId,
          userName,
          score,
          submissionId: submission._id,
      });
      await leaderboardEntry.save();

      res.json({ message: "Quiz submitted successfully", score });
  } catch (error) {
      console.error("Quiz submit error:", error);
      res.status(500).json({ message: "Error submitting quiz", error });
  }
});


// Validate password for quiz access
// POST /api/quiz/validate-password
router.post('/validate-password', async (req, res) => {
  const { quizId, password } = req.body;
  
  try {
    // Fetch quiz by quizId (not support material ID)
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if password matches
    if (quiz.password === password) {
      return res.status(200).json({ message: 'Password validated' });
    } else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



export default router;
