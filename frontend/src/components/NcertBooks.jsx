import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./NcertBooks.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import DownloadButton from "./DownloadButton";

const NcertBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/study-material/get?type=ncert-books")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setBooks(res.data);
        } else {
          throw new Error("Expected an array from backend");
        }
      })
      .catch((err) => setError(`Failed to load books: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const classList = useMemo(() => [...new Set(books.map((book) => book.className))], [books]);

  const subjectList = useMemo(
    () =>
      selectedClass
        ? [...new Set(books.filter((book) => book.className === selectedClass).map((book) => book.subject))]
        : [],
    [selectedClass, books]
  );

  const filteredBooks = useMemo(() => {
    return selectedClass && selectedSubject
      ? books.filter(
        (book) =>
          book.className === selectedClass &&
          book.subject === selectedSubject
      )
      : [];
  }, [selectedClass, selectedSubject, books]);

  return (
    <div className="ncert-books-container" id="ncert-books-section">
      <h3 className="ncert-books-title">NCERT BOOKS</h3>

      <div className="ncert-class-buttons">
        {classList.map((cls) => (
          <button
            key={cls}
            className={`ncert-class-button ${selectedClass === cls ? "active" : ""}`}
            onClick={() => {
              setSelectedClass(cls);
              setSelectedSubject(null);
            }}
          >
            {cls}
          </button>
        ))}
      </div>

      {selectedClass && (
        <div className="ncert-subject-buttons">
          {subjectList.map((subject) => (
            <button
              key={subject}
              className={`ncert-subject-button ${selectedSubject === subject ? "active" : ""}`}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="ncert-loading">Loading...</div>}
      {error && <div className="ncert-error">{error}</div>}

      <div className="ncert-books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) =>
            book.files.map((file) => (
              <div key={file._id} className="ncert-book-card">
                <FontAwesomeIcon icon={faFilePdf} className="ncert-pdf-icon" />
                <h4 className="ncert-book-title">{file.title}</h4>
                {file.fileUrl ? (
                  <DownloadButton
                  fileUrl={file.fileUrl}
                  bookTitle={file.title}
                  className={selectedClass}
                  subject={selectedSubject}
                  section="ncert-books"
                  type="ncert-books"
                  item={{
                    _id: file._id,
                    type: 'ncert-books',
                  }}
                />
                ) : (
                  <div className="ncert-no-file">No file available</div>
                )}
              </div>
            ))
          )
        ) : (
          <div className="ncert-no-books">No Books Found</div>
        )}
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
    </div>
  );
};

export default NcertBooks;
