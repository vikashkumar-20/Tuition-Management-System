import React, { useEffect, useState } from "react";
import axios from "axios";
import './DeleteResult.css';

const DeleteResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/result/all");
      setResults(res.data);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this result?");
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/result/delete/${id}`);
      alert("Result deleted successfully");
      fetchResults();
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Failed to delete result");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="delete-result-loading-container" id="delete-result-loading">
        <h2 className="delete-result-loading-text">Loading Results...</h2>
      </div>
    );
  }

  return (
    <div className="delete-result-container" id="delete-result">
      <h2 className="delete-result-heading">Delete Uploaded Results</h2>

      {results.length === 0 ? (
        <p className="delete-result-no-data">No Results Found</p>
      ) : (
        <div className="delete-result-grid">
          {results.map((result) => (
            <div key={result._id} className="delete-result-card">
              <img
                src={result.image}
                alt="Result"
                className="delete-result-image"
                onError={(e) => (e.target.src = "/fallback.jpg")}
              />
              <div className="delete-result-info">
                <p><strong>Name:</strong> {result.name}</p>
                <p><strong>Roll No:</strong> {result.rollNo}</p>
                <p><strong>Class:</strong> {result.class}</p>
                <p><strong>Subject:</strong> {result.subject}</p>
              </div>

              <button
                className="delete-result-btn"
                onClick={() => handleDelete(result._id)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeleteResult;
