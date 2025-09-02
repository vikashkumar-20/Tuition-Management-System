import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewResults.css";

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading Results...</h2>
      </div>
    );
  }

  return (
    <div className="results-section">
      <h2 className="results-header">All Uploaded Results</h2>

      {results.length === 0 ? (
        <p>No Results Found</p>
      ) : (
        <div className="results-container">
          <div className="results-content">
            {results.map((result) => (
              <div key={result._id} className="result-card">
                <img
                  src={result.image}
                  alt="Result"
                  className="result-image"
                  onError={(e) => (e.target.src = "/fallback.jpg")}
                />

                <div className="result-info">
                  <p><strong>Name:</strong> {result.name}</p>
                  <p><strong>Roll No:</strong> {result.rollNo}</p>
                  <p><strong>Class:</strong> {result.class}</p>
                  <p><strong>Subject:</strong> {result.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResults;
