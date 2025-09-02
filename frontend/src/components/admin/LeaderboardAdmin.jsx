import React, { useEffect, useState } from "react";
import axios from "axios";
import './LeaderboardAdmin.css';

const LeaderboardAdmin = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/quiz/leaderboard/all");
        setEntries(res.data.leaderboard);
        setFilteredEntries(res.data.leaderboard);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    let filtered = entries;

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(entry =>
        new Date(entry.createdAt).toISOString().slice(0, 10) === selectedDate
      );
    }

    setFilteredEntries(filtered);
  }, [searchQuery, selectedDate, entries]);

  const handleNameClick = async (submissionId) => {
    try {
      const submissionRes = await axios.get(
        `http://localhost:5000/api/quiz/submission/${submissionId}`
      );
      const submission = submissionRes.data;
      setSelectedSubmission(submission);

      const quizRes = await axios.get(`http://localhost:5000/api/quiz/${submission.quizId}`);
      const quiz = quizRes.data;
      setSelectedQuiz(quiz);
    } catch (err) {
      console.error(err);
      alert("Failed to load submission or quiz details");
    }
  };

  return (
    <div className="leaderboard-admin-container" id="leaderboard-admin">
      <h2 className="leaderboard-title">All Student Leaderboard</h2>

      {/* Filters */}
      <div className="filters-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="date"
          className="date-filter"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : filteredEntries.length === 0 ? (
        <p className="no-data-text">No matching leaderboard data.</p>
      ) : (
        <table className="leaderboard-table" id="leaderboard-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header">Student Name</th>
              <th className="table-header">Quiz Title</th>
              <th className="table-header">Score</th>
              <th className="table-header">Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry, idx) => (
              <tr key={idx} className="leaderboard-row" id={`leaderboard-row-${idx}`}>
                <td className="student-name">
                  <button
                    className="link-button student-name-button"
                    id={`student-name-${idx}`}
                    onClick={() => handleNameClick(entry.submissionId?._id)}
                  >
                    {entry.userName}
                  </button>
                </td>
                <td className="quiz-title">{entry.quizId?.title || "Untitled"}</td>
                <td className="quiz-score">{entry.score}</td>
                <td className="submission-time">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Submission Detail Viewer */}
      {selectedSubmission && selectedQuiz && (
        <div className="submission-details" id="submission-details">
          <h3 className="quiz-detail-title">Quiz: {selectedQuiz.title}</h3>
          <button
            className="close-button"
            id="close-submission-details"
            onClick={() => {
              setSelectedSubmission(null);
              setSelectedQuiz(null);
            }}
          >
            Close
          </button>

          {selectedQuiz.questions.map((q, i) => (
            <div
              key={i}
              className="question-view"
              id={`question-view-${i}`}
            >
              <p className="question-text">
                <strong>Q{i + 1}:</strong> {q.questionText}
              </p>
              <ul className="options-list" id={`options-list-${i}`}>
                {q.options.map((opt, j) => (
                  <li
                    key={j}
                    className={`option-item ${
                      selectedSubmission.answers[i] === opt ? "selected-option" : ""
                    }`}
                    id={`option-${i}-${j}`}
                    style={{
                      backgroundColor:
                        selectedSubmission.answers[i] === opt ? "#d1e7dd" : "transparent",
                      fontWeight:
                        selectedSubmission.answers[i] === opt ? "bold" : "normal",
                    }}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardAdmin;
