import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import "./ViewResults.css";

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await API.get("/result/all");
      setResults(res.data);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
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
        <div className="results-wrapper">
          {results.length > 5 && (
            <button className="scroll-button left" onClick={scrollLeft}>
              &#8249;
            </button>
          )}

          <div
            className={`results-container ${results.length < 5 ? "centered" : ""}`}
            ref={scrollRef}
          >
            <div className="results-content">
              {results.map((result) => (
                <div key={result._id} className="result-card">
                  <img
                    src={result.image}
                    alt="Result"
                    className="result-image"
                    onError={(e) => {
                      if (e.target.src !== "/fallback.jpg") {
                        e.target.src = "/fallback.jpg";
                      }
                    }}
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

          {results.length > 5 && (
            <button className="scroll-button right" onClick={scrollRight}>
              &#8250;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewResults;
