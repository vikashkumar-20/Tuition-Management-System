import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./StartQuiz.css";

const StartQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = String(sec % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`quizState-${quizId}`));
    if (saved) {
      setUserName(saved.userName || "");
      setIsVerified(saved.isVerified || false);
      setAnswers(saved.answers || []);
      setCurrentQuestion(saved.currentQuestion || 0);
      setTimer(saved.timer || 0);
      if (saved.isVerified) fetchQuiz();
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(
      `quizState-${quizId}`,
      JSON.stringify({
        userName,
        isVerified,
        answers,
        currentQuestion,
        timer,
      })
    );
  }, [userName, isVerified, answers, currentQuestion, timer]);

  // Clean up on submit
  const clearStorage = () => {
    localStorage.removeItem(`quizState-${quizId}`);
  };

  // Verify quiz password
  const verifyPassword = async () => {
    if (!password) return alert("Enter password");
    setLoading(true);
    try {
      const res = await API.post("/quiz/validate-password", { quizId, password });
      if (res.status === 200) {
        setIsVerified(true);
        fetchQuiz();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  // Fetch quiz data
  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/quiz/${quizId}`);
      const questions = res.data.questions || [];

      // Only initialize answers and timer if not already restored
      if (answers.length === 0) {
        setAnswers(new Array(questions.length).fill(""));
      }
      if (timer === 0) {
        setTimer((res.data.timer || 1) * 60);
      }

      setQuiz(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswer = (index, value) => {
    if (submitted || timer === 0) return;
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (submitted) return;
    if (!window.confirm("Are you sure you want to submit your answers?")) return;

    setSubmitted(true);
    try {
      await API.post("/quiz/submit", {
        quizId,
        userAnswers: answers,
        userName: userName || "Anonymous",
      });
      alert("Quiz submitted!");
      clearStorage(); // Clean up localStorage
      navigate("/study-material/support-material");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit quiz");
      setSubmitted(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isVerified || timer <= 0 || submitted) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVerified, submitted]);

  // Keyboard navigation
  useEffect(() => {
    if (!quiz) return;
    const handleKey = (e) => {
      if (submitted || timer === 0) return;

      if (e.key === "ArrowRight" && currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
      if (e.key === "ArrowLeft" && currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      }
      if (e.key >= "1" && e.key <= String(quiz.questions.length)) {
        setCurrentQuestion(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentQuestion, submitted, timer, quiz]);

  // Render password input if not verified
  if (!isVerified) {
    return (
      <div className="quiz-password-container">
        <h2>Enter Quiz Password</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button onClick={verifyPassword} disabled={loading}>
          {loading ? "Verifying..." : "Start Quiz"}
        </button>
      </div>
    );
  }

  if (loading || !quiz) return <p>Loading quiz...</p>;

  const q = quiz.questions[currentQuestion];

  return (
    <div className="start-quiz-container">
      <h2>{quiz.title}</h2>

      <p className="timer">Time left: {formatTime(timer)}</p>

      <div className="question-nav">
        {quiz.questions.map((_, idx) => (
          <button
            key={idx}
            className={`nav-btn ${
              idx === currentQuestion ? "active" : ""
            } ${answers[idx] ? "answered" : "unanswered"}`}
            onClick={() => !submitted && timer > 0 && setCurrentQuestion(idx)}
            disabled={submitted || timer === 0}
            aria-label={`Go to question ${idx + 1}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <div className="progress-bar">
        <div
          className="progress-filled"
          style={{
            width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="question-box">
        <p>
          Q{currentQuestion + 1}: {q.questionText}
        </p>
        {q.options.map((opt, i) => (
          <label key={i} className={submitted || timer === 0 ? "disabled-label" : ""}>
            <input
              type="radio"
              name={`q-${currentQuestion}`}
              value={opt}
              checked={answers[currentQuestion] === opt}
              onChange={() => handleAnswer(currentQuestion, opt)}
              disabled={submitted || timer === 0}
            />
            {opt}
          </label>
        ))}
      </div>

      <div className="quiz-controls">
        <button
          disabled={currentQuestion === 0 || submitted || timer === 0}
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
        >
          Previous
        </button>
        <button
          disabled={currentQuestion === quiz.questions.length - 1 || submitted || timer === 0}
          onClick={() => setCurrentQuestion(currentQuestion + 1)}
        >
          Next
        </button>
      </div>

      {currentQuestion === quiz.questions.length - 1 && (
        <button disabled={submitted || timer === 0} onClick={submitQuiz}>
          {submitted ? "Submitting..." : "Submit Quiz"}
        </button>
      )}
    </div>
  );
};

export default StartQuiz;
