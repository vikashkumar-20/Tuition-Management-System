import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const LeaderBoard = () => {
  const { userName } = useParams(); // Extracting userName from URL
  const navigate = useNavigate(); // For redirecting to specific quiz view
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Track errors

  useEffect(() => {
    const fetchUserSubmissions = async () => {
      try {
        const res = await axios.get(`/api/quiz/leaderboard/${userName}`);
        console.log(res.data); // Log response to see its structure
        const data = Array.isArray(res.data) ? res.data : [res.data];

        const formattedSubmissions = data.map((submission) => ({
          ...submission,
          quizId: submission.quizId?.title || "Unknown Quiz", // Handle populated quizId
          score: submission.score || 0,
          createdAt: submission.createdAt
            ? new Date(submission.createdAt).toLocaleString()
            : "Invalid Date",
        }));

        setSubmissions(formattedSubmissions);
      } catch (error) {
        console.error("Error fetching user leaderboard:", error);
        setError("Unable to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, [userName]);

  const handleQuizClick = (quizId) => {
    navigate(`/quiz/${quizId}`); // Redirect to quiz page using quizId
  };

  if (loading) return <div className="leaderboard-loading" id="loading-state">Loading your quiz results...</div>;

  if (error) return <div className="leaderboard-error" id="error-state">{error}</div>; // Show error message if an error occurs

  if (!submissions.length) return <div className="leaderboard-no-submissions" id="no-submissions">{`No quiz submissions found for ${userName}.`}</div>;

  return (
    <div className="leaderboard-container" id="leaderboard">
      <h2 className="leaderboard-title" id="user-name">{`${userName}'s Quiz History`}</h2>
      <div className="leaderboard-result-list" id="result-list">
        {submissions.map((submission) => (
          <div className="leaderboard-result-box" id={`submission-${submission._id}`} key={submission._id}>
            <p className="leaderboard-quiz-title"><strong>Quiz Title:</strong> {submission.quizId}</p>
            <p className="leaderboard-score"><strong>Score:</strong> {submission.score}</p>
            <p className="leaderboard-date"><strong>Date:</strong> {submission.createdAt}</p>
            <button
              className="leaderboard-view-quiz-button"
              id={`view-quiz-${submission.quizId}`}
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
