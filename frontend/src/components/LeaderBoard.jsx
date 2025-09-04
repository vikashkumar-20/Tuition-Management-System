import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api"; // ✅ use your API instance


const LeaderBoard = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserSubmissions = async () => {
      try {
        const res = await API.get(`/quiz/leaderboard/${userName}`);
        const data = Array.isArray(res.data) ? res.data : [res.data];

        const formattedSubmissions = data.map((submission, idx) => ({
          _id: submission._id || idx,
          quizTitle: submission.quizId?.title || "Unknown Quiz",
          quizId: submission.quizId?._id || submission.quizId || "N/A",
          score: submission.score ?? 0,
          createdAt: submission.createdAt
            ? new Date(submission.createdAt).toLocaleString()
            : "N/A",
        }));

        setSubmissions(formattedSubmissions);
      } catch (err) {
        console.error("Error fetching user leaderboard:", err);
        setError("Unable to fetch leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, [userName]);

  const handleQuizClick = (quizId) => {
    if (quizId && quizId !== "N/A") {
      navigate(`/quiz/${quizId}`);
    } else {
      alert("Quiz details not available.");
    }
  };

  if (loading) return <div className="leaderboard-loading">Loading your quiz results...</div>;
  if (error) return <div className="leaderboard-error">{error}</div>;
  if (!submissions.length) return <div className="leaderboard-no-submissions">{`No quiz submissions found for ${userName}.`}</div>;

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">{`${userName}'s Quiz History`}</h2>
      <div className="leaderboard-result-list">
        {submissions.map((submission) => (
          <div className="leaderboard-result-box" key={submission._id}>
            <p><strong>Quiz Title:</strong> {submission.quizTitle}</p>
            <p><strong>Score:</strong> {submission.score}</p>
            <p><strong>Date:</strong> {submission.createdAt}</p>
            <button
              className="leaderboard-view-quiz-button"
              onClick={() => handleQuizClick(submission.quizId)}
            >
              View Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderBoard;
