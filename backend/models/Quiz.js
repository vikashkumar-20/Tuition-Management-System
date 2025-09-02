import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String,
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },  // Added title field
  password: String,
  timer: Number,
  questions: [questionSchema],
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
