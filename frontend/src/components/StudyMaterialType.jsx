import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const StudyMaterialType = () => {
  const { type } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/notes?type=${type}`)
      .then((res) => {
        setNotes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
        setLoading(false);
      });
  }, [type]);

  if (loading) return <p>Loading...</p>;
  if (notes.length === 0) return <p>No content available for this category.</p>;

  return (
    <div className="material-type-page">
      <h2>{type.replace(/-/g, " ").toUpperCase()}</h2>

      {notes.map((note, idx) => (
        <div key={idx} className="note-card">
          <h3>Class {note.className} - {note.subject}</h3>

          <div>
            {note.files.map((file, index) => (
              <div key={index} className="my-2">
                <h4 className="font-medium">{file.title}</h4>
                {file.fileUrl ? (
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    Download
                  </a>
                ) : file.optionalUrl ? (
                  <a href={file.optionalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    View Resource
                  </a>
                ) : (
                  <p>No link available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudyMaterialType;
