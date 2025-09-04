import { useState } from "react";
import axios from "axios";
import "./CreateQuiz.css";

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    title: "",
    password: "",
    timer: 1,
    questions: [{ questionText: "", options: ["", ""], correctAnswer: "" }],
  });

  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Handle general field changes (class, subject, title, password, timer)
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "timer" ? Number(value) : value,
    });
  };

  // Handle changes inside questions
  const handleChange = (e, qIndex, optIndex = null) => {
    const { name, value } = e.target;
    const updatedQuestions = [...formData.questions];

    if (name === "questionText" || name === "correctAnswer") {
      updatedQuestions[qIndex][name] = value;
    } else if (name === "option" && optIndex !== null) {
      updatedQuestions[qIndex].options[optIndex] = value;
    }

    setFormData({ ...formData, questions: updatedQuestions });
  };

  // Add a new question
  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { questionText: "", options: ["", ""], correctAnswer: "" },
      ],
    });
  };

  // Add a new option to a question
  const handleAddOption = (qIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options.push("");
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // Remove an option from a question
  const handleRemoveOption = (qIndex, optIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[qIndex].options.length <= 2) return; // minimum 2 options
    updatedQuestions[qIndex].options.splice(optIndex, 1);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // Submit the quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/quiz/create`, formData);
      alert(`Quiz Created! ID: ${res.data.quiz ? res.data.quiz._id : res.data._id}`);

      // Reset form
      setFormData({
        className: "",
        subject: "",
        title: "",
        password: "",
        timer: 1,
        questions: [{ questionText: "", options: ["", ""], correctAnswer: "" }],
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-container">
      <h3>Create Quiz</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="className"
          value={formData.className}
          onChange={handleGeneralChange}
          placeholder="Class"
          required
        />
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleGeneralChange}
          placeholder="Subject"
          required
        />
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleGeneralChange}
          placeholder="Quiz Title"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleGeneralChange}
          placeholder="Password"
          required
        />
        <input
          type="number"
          name="timer"
          value={formData.timer}
          onChange={handleGeneralChange}
          placeholder="Timer (minutes)"
          min={1}
          required
        />

        {formData.questions.map((q, qIndex) => (
          <div key={qIndex} className="quiz-question-block">
            <input
              type="text"
              name="questionText"
              value={q.questionText}
              onChange={(e) => handleChange(e, qIndex)}
              placeholder={`Question ${qIndex + 1}`}
              required
            />

            {q.options.map((opt, optIndex) => (
              <div key={optIndex} className="option-input-group">
                <input
                  type="text"
                  name="option"
                  value={opt}
                  onChange={(e) => handleChange(e, qIndex, optIndex)}
                  placeholder={`Option ${optIndex + 1}`}
                  required
                />
                <button type="button" onClick={() => handleRemoveOption(qIndex, optIndex)}>
                  Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={() => handleAddOption(qIndex)}>
              Add Option
            </button>

            <input
              type="text"
              name="correctAnswer"
              value={q.correctAnswer}
              onChange={(e) => handleChange(e, qIndex)}
              placeholder="Correct Answer"
              required
            />
          </div>
        ))}

        <button type="button" onClick={handleAddQuestion}>
          Add Question
        </button>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Quiz"}
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;
