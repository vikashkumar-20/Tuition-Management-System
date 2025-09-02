import { useState } from "react";
import axios from "axios";
import "./Quiz.css";

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    title: "",
    password: "",
    timer: "",
    questions: [
      { questionText: "", options: ["", "", "", ""], correctAnswer: "" }
    ],
  });

  const handleChange = (e, qIndex, optIndex) => {
    const { name, value } = e.target;
    const updatedQuestions = [...formData.questions];

    if (name === "questionText" || name === "correctAnswer") {
      updatedQuestions[qIndex][name] = value;
    } else {
      updatedQuestions[qIndex].options[optIndex] = value;
    }

    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    });
  };

  const handleGeneralChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/quiz/create", formData);
      alert("Quiz Created Successfully!");

      setFormData({
        className: "",
        subject: "",
        title: "",
        password: "",
        timer: "",
        questions: [
          { questionText: "", options: ["", "", "", ""], correctAnswer: "" }
        ],
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz.");
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
          placeholder="Quiz Password"
          required
        />
        <input
          type="number"
          name="timer"
          value={formData.timer}
          onChange={handleGeneralChange}
          placeholder="Timer (minutes)"
          required
        />

        {formData.questions.map((q, index) => (
          <div key={index} className="quiz-question-block">
            <input
              type="text"
              name="questionText"
              value={q.questionText}
              onChange={(e) => handleChange(e, index)}
              placeholder={`Question ${index + 1}`}
              required
            />
            {q.options.map((opt, optIndex) => (
              <input
                key={optIndex}
                type="text"
                value={opt}
                onChange={(e) => handleChange(e, index, optIndex)}
                placeholder={`Option ${optIndex + 1}`}
                required
              />
            ))}
            <input
              type="text"
              name="correctAnswer"
              value={q.correctAnswer}
              onChange={(e) => handleChange(e, index)}
              placeholder="Correct Answer"
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddQuestion}>
          Add Another Question
        </button>
        <button type="submit">Create Quiz</button>
      </form>
    </div>
  );
};

export default CreateQuiz;
