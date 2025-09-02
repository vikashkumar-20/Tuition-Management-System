// models/Leaderboard.js
import mongoose from "mongoose"; 

const leaderboardSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    userName: String,
    score: Number,
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" }, // ✅ Add this if not already
    createdAt: { type: Date, default: Date.now },
  });

export default mongoose.model("Leaderboard", leaderboardSchema);
