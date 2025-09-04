import express from "express";
import Leaderboard from "../models/Leaderboard.js";

const router = express.Router();

/**
 * ================== Admin: Get all leaderboard entries ==================
 * GET /api/leaderboard
 */
router.get("/", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .populate("quizId")
      .populate("submissionId")
      .sort({ createdAt: -1 });

    // Filter out entries missing submission or quiz
    const validLeaderboard = leaderboard.filter(
      (entry) => entry.submissionId && entry.quizId
    );

    res.status(200).json({ leaderboard: validLeaderboard });
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

/**
 * ================== User: Get leaderboard by username ==================
 * GET /api/leaderboard/user/:userName
 */
router.get("/user/:userName", async (req, res) => {
  try {
    const { userName } = req.params;

    const leaderboard = await Leaderboard.find({ userName })
      .populate("quizId")
      .populate("submissionId")
      .sort({ createdAt: -1 });

    const validLeaderboard = leaderboard.filter(
      (entry) => entry.submissionId && entry.quizId
    );

    res.status(200).json(validLeaderboard);
  } catch (err) {
    console.error("Failed to fetch user leaderboard:", err);
    res.status(500).json({ message: "Failed to fetch user leaderboard" });
  }
});

export default router;
