import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    userName: { type: String, default: "Anonymous" },
    answers: [String],
    score: { type: Number, default: 0 }, // Default score set to 0
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default mongoose.model("Submission", submissionSchema);
