import React, { useState, useEffect } from "react";
import axios from "axios";
import './DeleteStudyMaterial.css'

const DeleteStudyMaterial = () => {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [materials, setMaterials] = useState([]);

  // Fetch Study Materials based on filters
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!type) {
        setMaterials([]);
        return;
      }

      try {
        const params = { type };
        if (className) params.className = className;
        if (subject) params.subject = subject;
        if (type === "support-material" && category) params.category = category;
        if (type === "previous-year-questions" && year) params.year = year;

        const res = await axios.get(
          "http://localhost:5000/api/study-material/get",
          { params }
        );
        setMaterials(res.data);
      } catch (err) {
        console.error("Error fetching materials:", err);
      }
    };

    fetchMaterials();
  }, [type, category, className, subject, year]);

  // Handle Delete Material
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/study-material/${id}`);
      alert("Deleted Successfully!");
      setMaterials((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting material:", err);
    }
  };

  return (
    <div className="delete-container">
      <h3>Delete Study Material</h3>

      {/* Type Selection */}
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setCategory("");
          setClassName("");
          setSubject("");
          setYear("");
        }}
      >
        <option value="">Select Type</option>
        <option value="ncert-books">NCERT Books</option>
        <option value="previous-year-questions">Previous Year Questions</option>
        <option value="support-material">Support Material</option>
        <option value="ncert-solutions">NCERT Solutions</option>
      </select>

      {/* Category for Support Material */}
      {type === "support-material" && (
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="notes">Notes</option>
          <option value="videos">Videos</option>
          <option value="practice-set">Practice Set</option>
        </select>
      )}

      {/* Class & Subject Inputs */}
      {type && (
        <>
          <input
            type="text"
            placeholder="Class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </>
      )}

      {/* Year Input for Previous Year Questions */}
      {type === "previous-year-questions" && (
        <input
          type="text"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      )}

      {/* Study Materials List */}
      <div className="delete-material-list">
        {materials.length === 0 && type ? (
          <p className="no-material-message">No Study Material Found!</p>
        ) : (
          materials.map((item) => (
            <div key={item._id} className="delete-material-item">
              <span className="delete-material-info">
                Class {item.className} - {item.subject}
              </span>
              <button
                className="delete-material-btn"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default DeleteStudyMaterial;
