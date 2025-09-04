import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import './StartQuiz.css';

const StartQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Password verification
  const verifyPassword = async () => {
    if (!password) return alert("Enter password");
    setLoading(true);
    try {
      const res = await API.post("/quiz/validate-password", { quizId, password });
      if (res.status === 200) {
        setIsVerified(true);
        fetchQuiz();
      }
    } catch {
      alert("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  // Fetch quiz
  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/quiz/${quizId}`);
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(""));
      setTimer((res.data.timer || 1) * 60);
    } catch (err) {
      console.error(err);
      alert("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Submit quiz
  const submitQuiz = async () => {
    try {
      await API.post("/quiz/submit", {
        quizId,
        userAnswers: answers,
        userName: userName || "Anonymous",
      });
      alert("Quiz submitted!");
      navigate("/study-material/support-material");
    } catch {
      alert("Failed to submit quiz");
    }
  };

  // Timer
  useEffect(() => {
    if (!timer || !isVerified) return;
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
  }, [timer, isVerified]);

  if (!isVerified) {
    return (
      <div className="quiz-password-container">
        <h2>Enter Quiz Password</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={verifyPassword}>{loading ? "Verifying..." : "Start Quiz"}</button>
      </div>
    );
  }

  if (loading || !quiz) return <p>Loading quiz...</p>;

  const q = quiz.questions[currentQuestion];

  return (
    <div className="start-quiz-container">
      <h2>{quiz.title}</h2>
      <p>Time left: {formatTime(timer)}</p>

      <div className="question-box">
        <p>Q{currentQuestion + 1}: {q.questionText}</p>
        {q.options.map((opt, i) => (
          <label key={i}>
            <input
              type="radio"
              name={`q-${currentQuestion}`}
              value={opt}
              checked={answers[currentQuestion] === opt}
              onChange={() => handleAnswer(currentQuestion, opt)}
            />
            {opt}
          </label>
        ))}
      </div>

      <div className="quiz-controls">
        <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(currentQuestion - 1)}>Previous</button>
        <button disabled={currentQuestion === quiz.questions.length - 1} onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next</button>
      </div>

      {currentQuestion === quiz.questions.length - 1 && (
        <button onClick={submitQuiz}>Submit Quiz</button>
      )}
    </div>
  );
};

export default StartQuiz;
