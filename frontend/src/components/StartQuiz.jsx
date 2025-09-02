import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import './StartQuiz.css';

const StartQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [userName, setUserName] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0); // in seconds
  const [isRequesting, setIsRequesting] = useState(false);  // To prevent multiple requests


  useEffect(() => {
    setQuiz(null);
    setAnswers({});
    setMarkedForReview([]);
    setCurrentQuestionIndex(0);
    setTimer(0);
  }, [quizId]);

  // Handle password validation
  const handlePasswordSubmit = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
  
    try {
      const res = await axios.post(`http://localhost:5000/api/quiz/validate-password`, {
        quizId,
        password: passwordInput,
      });
  
      if (res.data.message === 'Password validated') {
        setIsPasswordVerified(true);
        const now = Date.now();
        localStorage.setItem("quizStartTime", now.toString());
        localStorage.setItem("quizId", quizId);
  
        // 👉 Immediately fetch quiz data and set timer
        const quizResponse = await axios.get(`http://localhost:5000/api/quiz/${quizId}`);
        const fetchedQuiz = quizResponse.data;
        setQuiz(fetchedQuiz);
  
        const totalSeconds = (fetchedQuiz.timer || 1) * 60;
        setTimer(totalSeconds);
        localStorage.setItem(`quizData-${quizId}`, JSON.stringify(fetchedQuiz));
      } else {
        alert("Invalid password.");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      alert("Failed to verify password.");
    } finally {
      setIsRequesting(false);
    }
  };
  

  // Handle option selection
  const handleOptionSelect = (index, option) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  // Mark question for review
  const handleMarkForReview = () => {
    if (!markedForReview.includes(currentQuestionIndex)) {
      setMarkedForReview((prev) => [...prev, currentQuestionIndex]);
    }
  };

  // Handle submitting quiz
  const handleSubmit = async (forceSubmit = false) => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      alert("Quiz data is not available.");
      return;
    }
  
    if (!forceSubmit) {
      for (let i = 0; i < quiz.questions.length; i++) {
        if (answers[i] === undefined) {
          alert(`Please answer question ${i + 1}.`);
          return;
        }
      }
    }
  
    const compiledAnswers = quiz.questions.map((_, i) => answers[i] ?? null);
  
    try {
      await axios.post("http://localhost:5000/api/quiz/submit", {
        quizId: quiz._id,
        userAnswers: compiledAnswers,
        userName,
      });
  
      // ✅ CLEAR LOCALSTORAGE for this quiz
      localStorage.removeItem(`quizAnswers-${quizId}`);
      localStorage.removeItem(`quizMarkedForReview-${quizId}`);
      localStorage.removeItem(`quizCurrentIndex-${quizId}`);
      localStorage.removeItem(`quizData-${quizId}`);
      localStorage.removeItem("quizStartTime");
      localStorage.removeItem("quizId");
  
      alert("Quiz submitted successfully!");
  
      // Navigate away
      navigate("/study-material/support-material");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("There was an error submitting your quiz. Please try again.");
    }
  };
  

  // Fetching quiz data after password verification
  useEffect(() => {
    const savedQuizId = localStorage.getItem("quizId");
    const savedQuizData = localStorage.getItem(`quizData-${quizId}`);
    const savedStartTime = localStorage.getItem("quizStartTime");

    if (savedQuizId === quizId && savedQuizData && savedStartTime) {
      const parsedQuiz = JSON.parse(savedQuizData);
      const startTime = parseInt(savedStartTime, 10);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);  // Calculate the elapsed time in seconds
      const remaining = (parsedQuiz.timer || 1) * 60 - elapsed;  // Calculate remaining time based on the timer in DB

      if (remaining <= 0) {
        handleSubmit();  // Submit the quiz if time is up
      } else {
        setQuiz(parsedQuiz);
        setIsPasswordVerified(true);
        setTimer(remaining);  // Set the remaining time in seconds
        const savedAnswers = localStorage.getItem(`quizAnswers-${quizId}`);
        const savedMarked = localStorage.getItem(`quizMarkedForReview-${quizId}`);
        const savedIndex = localStorage.getItem(`quizCurrentIndex-${quizId}`);

        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
        if (savedMarked) setMarkedForReview(JSON.parse(savedMarked));
        if (savedIndex) setCurrentQuestionIndex(Number(savedIndex));
      }
    } else {
      // Fetch quiz data if not available in localStorage
      const fetchQuizData = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/quiz/${quizId}`);
          const fetchedQuiz = response.data;
          setQuiz(fetchedQuiz);
          setIsPasswordVerified(true);
          localStorage.setItem(`quizData-${quizId}`, JSON.stringify(fetchedQuiz));
        } catch (error) {
          console.error("Error fetching quiz data:", error);
          alert("Error loading quiz.");
        }
      };

      if (isPasswordVerified) {
        fetchQuizData();
      }
    }
  }, [quizId, isPasswordVerified]);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;

    const countdown = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdown);
          handleSubmit(true); // Pass true to allow unanswered questions
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);


  // Format time for display
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // If password is not verified, show password entry form
  if (!isPasswordVerified) {
    return (
      <div className="quiz-password-container" id="quiz-password">
        <h2 id="quiz-password-title">Enter Quiz Password</h2>
        <input className="quiz-input" id="username-input" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name" />
        <input className="quiz-input" id="password-input" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Quiz Password" />
        <button className="quiz-btn" id="start-quiz-btn" onClick={handlePasswordSubmit}> Start Quiz </button>
      </div>
    );
  }

  // If quiz is not loaded or no questions are available
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="loading-container" id="quiz-loading">Loading quiz or no questions available.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="start-quiz-container" id="quiz-main">
      <h2 className="quiz-title" id="quiz-title">{quiz.title}</h2>
      <p className="quiz-timer" id="quiz-timer">Time Left: {formatTime(timer)}</p>
      <hr />
      <div className="question-box" id={`question-${currentQuestionIndex}`}>
        <h4 className="question-text" id="question-text">
          Q{currentQuestionIndex + 1}: {currentQuestion.questionText}
        </h4>
        {currentQuestion.options.map((opt, idx) => (
          <div key={idx} className="quiz-option" id={`option-${idx}`}>
            <input type="radio" id={`q${currentQuestionIndex}-opt${idx}`} name={`question-${currentQuestionIndex}`} value={opt} checked={answers[currentQuestionIndex] === opt} onChange={() => handleOptionSelect(currentQuestionIndex, opt)} />
            <label htmlFor={`q${currentQuestionIndex}-opt${idx}`}>{opt}</label>
          </div>
        ))}
      </div>
      <div className="quiz-controls" id="quiz-controls">
        <button className="quiz-btn" id="prev-btn" onClick={() => setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev))}> Previous </button>
        <button className="quiz-btn" id="mark-btn" onClick={handleMarkForReview}> Mark for Review </button>
        <button className="quiz-btn" id="next-btn" onClick={() => setCurrentQuestionIndex((prev) => (prev < quiz.questions.length - 1 ? prev + 1 : prev))}> Next </button>
      </div>
      <button className="submit-btn" id="submit-quiz-btn" onClick={handleSubmit}> Submit Quiz </button>
    </div>
  );
};

export default StartQuiz;
