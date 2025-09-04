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

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Fetch all leaderboard entries for admin
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/leaderboard`); // admin leaderboard API
        setEntries(res.data.leaderboard || []); 
        setFilteredEntries(res.data.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        alert("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [API_BASE]);

  // Filter entries by search or date
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

  // Handle click to view submission & quiz details
  const handleNameClick = async (submissionId, quizId) => {
    if (!submissionId || !quizId) {
      alert("Submission or Quiz ID is missing!");
      return;
    }

    try {
      const submissionRes = await axios.get(`${API_BASE}/quiz/submission/${submissionId}`);
      setSelectedSubmission(submissionRes.data);

      const quizRes = await axios.get(`${API_BASE}/quiz/${quizId}`);
      setSelectedQuiz(quizRes.data);
    } catch (err) {
      console.error("Failed to load submission or quiz:", err);
      alert("Failed to load submission or quiz details");
    }
  };

  if (loading) return <p className="loading-text">Loading leaderboard...</p>;
  if (!entries.length) return <p className="no-data-text">No leaderboard data found.</p>;

  return (
    <div className="leaderboard-admin-container">
      <h2 className="leaderboard-title">All Student Leaderboard</h2>

      {/* Filters */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Quiz Title</th>
            <th>Score</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry, idx) => (
            <tr key={idx}>
              <td>
                <button
                  className="link-button"
                  onClick={() => handleNameClick(entry.submissionId?._id, entry.quizId?._id)}
                >
                  {entry.userName}
                </button>
              </td>
              <td>{entry.quizId?.title || "Untitled"}</td>
              <td>{entry.score}</td>
              <td>{new Date(entry.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Submission Details */}
      {selectedSubmission && selectedQuiz && (
        <div className="submission-details">
          <h3>Quiz: {selectedQuiz.title}</h3>
          <button onClick={() => { setSelectedSubmission(null); setSelectedQuiz(null); }}>
            Close
          </button>

          {selectedQuiz.questions.map((q, i) => (
            <div key={i}>
              <p><strong>Q{i + 1}:</strong> {q.questionText}</p>
              <ul>
                {q.options.map((opt, j) => (
                  <li
                    key={j}
                    style={{
                      fontWeight: selectedSubmission.answers[i] === opt ? "bold" : "normal",
                      backgroundColor: selectedSubmission.answers[i] === opt ? "#d1e7dd" : "transparent"
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
