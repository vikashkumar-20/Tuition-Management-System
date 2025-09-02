import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import './SupportMaterial.css';
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
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
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadLimitReached, setDownloadLimitReached] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categoryList = [
    { label: "Notes", value: "notes" },
    { label: "Videos", value: "videos" },
    { label: "Practice Set", value: "practice-set" },
    { label: "Quiz", value: "quiz" },
  ];

  useEffect(() => {
    fetchMaterials();
    retrievePaymentInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const container = document.getElementById("video-player-container");
      if (container && !container.contains(e.target)) {
        setSelectedVideo(null);
      }
    };

    if (selectedVideo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedVideo]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/study-material/get?type=support-material");
      setMaterials(res.data || []);
    } catch (err) {
      setError(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const retrievePaymentInfo = () => {
    const savedCategory = sessionStorage.getItem("selectedCategory");
    const savedClass = sessionStorage.getItem("selectedClass");
    const savedSubject = sessionStorage.getItem("selectedSubject");
    const pendingDownload = sessionStorage.getItem("pendingDownload");
    const paymentSuccessStatus = sessionStorage.getItem("paymentSuccess");

    if (savedCategory && savedClass && savedSubject) {
      setSelectedCategory(savedCategory);
      setSelectedClass(savedClass);
      setSelectedSubject(savedSubject);
      setPaymentSuccess(paymentSuccessStatus === "true");
    }

    if (pendingDownload) {
      const downloadData = JSON.parse(pendingDownload);
      setSelectedCategory(downloadData.category);
      setSelectedClass(downloadData.className);
      setSelectedSubject(downloadData.subject);
      setPaymentSuccess(true);

      setTimeout(() => {
        handleDownloadOrView(downloadData.file);
        sessionStorage.removeItem("pendingDownload");
      }, 1000);
    }
  };

  const storePaymentInfo = () => {
    sessionStorage.setItem("selectedCategory", selectedCategory);
    sessionStorage.setItem("selectedClass", selectedClass);
    sessionStorage.setItem("selectedSubject", selectedSubject);
    sessionStorage.setItem("paymentSuccess", "true");
  };

  const clearSessionStorage = () => {
    sessionStorage.removeItem("selectedCategory");
    sessionStorage.removeItem("selectedClass");
    sessionStorage.removeItem("selectedSubject");
  };

  const classList = useMemo(() => {
    return selectedCategory
      ? [...new Set(materials.filter(item => item.category === selectedCategory).map(item => item.className))]
      : [];
  }, [selectedCategory, materials]);

  const subjectList = useMemo(() => {
    return selectedClass
      ? [...new Set(materials.filter(item =>
        item.category === selectedCategory && item.className === selectedClass
      ).map(item => item.subject))]
      : [];
  }, [selectedCategory, selectedClass, materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(item =>
      item.category === selectedCategory &&
      item.className === selectedClass &&
      item.subject === selectedSubject
    );
  }, [selectedCategory, selectedClass, selectedSubject, materials]);

  const handleDownloadOrView = (file) => {
    if (downloadLimitReached && !paymentSuccess) {
      sessionStorage.setItem("pendingDownload", JSON.stringify({
        category: selectedCategory,
        className: selectedClass,
        subject: selectedSubject,
        file,
      }));
      navigate("/payment");
      return;
    }

    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadCount((prevCount) => {
      const newCount = prevCount + 1;
      if (!paymentSuccess && newCount >= 2) {
        setDownloadLimitReached(true);
      }
      return newCount;
    });
  };

  const handlePaymentRedirect = (material, fileTitle) => {
    const materialId = material._id;
    const type = "support-material";  // Ensure the type is correctly set

    console.log("Type:", type); // Log type to check if it's correctly set

    navigate("/payment", {
      state: {
        from: {
          pathname: location.pathname,
          materialData: material,
          materialId,
          type, // Pass the type here
          className: selectedClass,
          subject: selectedSubject,
          category: selectedCategory,
          title: fileTitle
        }
      }
    });
  };

  const formatSubject = (subject) => {
    return subject?.replace(/\s+/g, '') || '';
  };

  return (
    <section id="support-material-section" className="support-material-container">
      <h2 className="support-title" id="support-title">Support Material</h2>

      {error && <p className="support-error" id="support-error-msg">{error}</p>}
      {loading && <p className="support-loading" id="support-loading">Loading...</p>}

      <div className="support-button-group category-group" id="support-category-group">
        {categoryList.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => {
              setSelectedCategory(value);
              setSelectedClass(null);
              setSelectedSubject(null);
            }}
            className={`support-button category-button ${selectedCategory === value ? "active" : ""}`}
            id={`support-category-${value}`}
          >
            {label}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="support-button-group class-group" id="support-class-group">
          {classList.length ? (
            classList.map((cls) => (
              <button
                key={cls}
                onClick={() => {
                  setSelectedClass(cls);
                  setSelectedSubject(null);
                }}
                className={`support-button class-button ${selectedClass === cls ? "active" : ""}`}
                id={`support-class-${cls}`}
              >
                {cls}
              </button>
            ))
          ) : (
            <p className="support-no-data" id="no-class-msg">No Class Available</p>
          )}
        </div>
      )}

      {selectedClass && (
        <div className="support-button-group subject-group" id="support-subject-group">
          {subjectList.length ? (
            subjectList.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                }}
                className={`support-button subject-button ${selectedSubject === sub ? "active" : ""}`}
                id={`support-subject-${sub}`}
              >
                {sub}
              </button>
            ))
          ) : (
            <p className="support-no-data" id="no-subject-msg">No Subject Available</p>
          )}
        </div>
      )}

      {selectedSubject && (
        <div className="support-materials-list" id="support-materials-list">
          {filteredMaterials.length === 0 && (
            <p className="support-no-data" id="no-material-msg">No material found.</p>
          )}

          {selectedCategory === "videos" ? (
            filteredMaterials.map((item) =>
              item.files.map((file, index) => {
                let embedUrl = file.fileUrl;

                if (file.fileUrl.includes("youtube.com/watch?v=")) {
                  const videoId = new URL(file.fileUrl).searchParams.get("v");
                  embedUrl = `https://www.youtube.com/embed/${videoId}`;
                } else if (file.fileUrl.includes("youtu.be/")) {
                  const videoId = file.fileUrl.split("youtu.be/")[1];
                  embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }

                return (
                  <div
                    key={index}
                    className="support-video-card"
                    id={`video-card-${index}`}
                    onClick={() => setSelectedVideo({ url: embedUrl, title: file.title })}
                  >
                    <div className="video-preview-wrapper">
                      <iframe
                        src={embedUrl}
                        title={file.title}
                        className="support-video-iframe-preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="support-file-title"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {file.title}
                    </a>
                  </div>
                );
              })
            )
          ) : (
            filteredMaterials.map((item) =>
              item.files.map((file, index) => {
                const filename = `support-material-${selectedClass}-${formatSubject(selectedSubject)}-${file.title}`;

                return (
                  <div key={index} className="support-card" id={`support-card-${index}`}>
                    <FontAwesomeIcon icon={faFilePdf} className="ncert-pdf-icon" />
                    <p className="support-file-title">{file.title}</p>

                    {selectedCategory === "quiz" ? (
                      <button
                        className="start-quiz-button"
                        onClick={() => {
                          // Extract quizId from fileUrl inside `files`
                          const quizId = item.files?.[0]?.fileUrl?.split("/").pop();
                          if (quizId) {
                            navigate(`/start-quiz/${quizId}`);
                          } else {
                            alert("Quiz ID not found in file URL.");
                          }
                        }}
                      >
                        Start Quiz
                      </button>
                    ) : (
                      <DownloadButton
                        type="support-material"
                        className={selectedCategory}
                        subject={selectedSubject}
                        fileUrl={file.fileUrl}
                        bookTitle={file.title}
                        filename={filename}
                        section={selectedCategory}
                        isYouTube={false}
                        item={{ ...item, materialId: item._id }}
                      />
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      )}

      {selectedVideo && (
        <div className="video-player-container" id="video-player-container">
          <h3 style={{ color: "#1d1b49", marginBottom: "10px" }}>{selectedVideo.title}</h3>
          <iframe
            src={selectedVideo.url}
            title={selectedVideo.title}
            width="800"
            height="450"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <button id="back-button" className="supportmaterial-back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
    </section>
  );
};

export default SupportMaterial;
