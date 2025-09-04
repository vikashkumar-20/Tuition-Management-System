import React, { useState, useEffect, useMemo } from "react";
import API from "../api";
import './SupportMaterial.css';
import { faFilePdf, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import DownloadButton from "./DownloadButton";

const SupportMaterial = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categoryList = [
    { label: "Notes", value: "notes" },
    { label: "Videos", value: "videos" },
    { label: "Practice Set", value: "practice-set" },
    { label: "Quiz", value: "quiz" },
  ];

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await API.get("/study-material?type=support-material");
        setMaterials(res.data || []);
      } catch (err) {
        setError(`Failed to load: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const classList = useMemo(() => {
    return selectedCategory
      ? [...new Set(materials
          .filter(item => item.category === selectedCategory)
          .map(item => item.className))]
      : [];
  }, [selectedCategory, materials]);

  const subjectList = useMemo(() => {
    return selectedClass
      ? [...new Set(materials
          .filter(item => item.category === selectedCategory && item.className === selectedClass)
          .map(item => item.subject))]
      : [];
  }, [selectedCategory, selectedClass, materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(item =>
      item.category === selectedCategory &&
      item.className === selectedClass &&
      item.subject === selectedSubject
    );
  }, [selectedCategory, selectedClass, selectedSubject, materials]);

  const formatSubject = (subject) => subject?.replace(/\s+/g, '') || '';

  return (
    <section id="support-material-section" className="support-material-container">
      <h2 className="support-title">Support Material</h2>

      {error && <p className="support-error">{error}</p>}
      {loading && <p className="support-loading">Loading...</p>}

      {/* Category Buttons */}
      <div className="support-button-group category-group">
        {categoryList.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setSelectedCategory(value); setSelectedClass(null); setSelectedSubject(null); }}
            className={`support-button category-button ${selectedCategory === value ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Class Buttons */}
      {selectedCategory && (
        <div className="support-button-group class-group">
          {classList.length ? classList.map((cls) => (
            <button
              key={cls}
              onClick={() => { setSelectedClass(cls); setSelectedSubject(null); }}
              className={`support-button class-button ${selectedClass === cls ? "active" : ""}`}
            >
              {cls}
            </button>
          )) : <p>No Class Available</p>}
        </div>
      )}

      {/* Subject Buttons */}
      {selectedClass && (
        <div className="support-button-group subject-group">
          {subjectList.length ? subjectList.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`support-button subject-button ${selectedSubject === sub ? "active" : ""}`}
            >
              {sub}
            </button>
          )) : <p>No Subject Available</p>}
        </div>
      )}

      {/* Materials List */}
      {selectedSubject && (
        <div className="support-materials-list">
          {filteredMaterials.length === 0 && <p>No material found.</p>}

          {filteredMaterials.map((item) =>
            item.files?.map((file, index) => {
              const url = file.fileUrl || file.optionalUrl;
              if (!url && selectedCategory !== "quiz") return null;

              // Videos
              if (selectedCategory === "videos") {
                let embedUrl = url.includes("youtube.com/watch?v=")
                  ? `https://www.youtube.com/embed/${new URL(url).searchParams.get("v")}`
                  : url.includes("youtu.be/")
                    ? `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`
                    : url;

                return (
                  <div key={index} className="support-video-card" onClick={() => setSelectedVideo({ url: embedUrl, title: file.title })}>
                    <div className="video-preview-wrapper">
                      <iframe src={embedUrl} title={file.title} className="support-video-iframe-preview" allowFullScreen></iframe>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>{file.title}</a>
                  </div>
                );
              } 

              // Quiz
              else if (selectedCategory === "quiz") {
                const quizId = file.fileUrl?.split("/quiz/")[1]; // Extract Quiz ID from URL
                return (
                  <div key={index} className="support-quiz-card">
                    <p>{item.title}</p>
                    {quizId && (
                      <button className="start-quiz-button" onClick={() => navigate(`/quiz/${quizId}`)}>
                        Start Quiz
                      </button>
                    )}
                  </div>
                );
              }

              // Other Materials (PDF/Notes)
              else {
                return (
                  <div key={index} className="support-card">
                    <FontAwesomeIcon icon={faFilePdf} className="ncert-pdf-icon" />
                    <p>{file.title}</p>
                    <DownloadButton
                      type="support-material"
                      className={selectedCategory}
                      subject={selectedSubject}
                      fileUrl={url}
                      bookTitle={file.title}
                      filename={`support-material-${selectedClass}-${formatSubject(selectedSubject)}-${file.title}`}
                      section={selectedCategory}
                      isYouTube={false}
                      item={{ ...item, materialId: item._id }}
                    />
                  </div>
                );
              }
            })
          )}
        </div>
      )}

      {/* Selected Video Player */}
      {selectedVideo && (
        <div className="video-player-container">
          <h3>{selectedVideo.title}</h3>
          <iframe src={selectedVideo.url} title={selectedVideo.title} width="800" height="450" allowFullScreen></iframe>
        </div>
      )}

      <button className="supportmaterial-back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
    </section>
  );
};

export default SupportMaterial;
