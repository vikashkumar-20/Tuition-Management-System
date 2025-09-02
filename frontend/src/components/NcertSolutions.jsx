import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import './NcertSolutions.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { getAuth } from 'firebase/auth';
import DownloadButton from './DownloadButton';

const NcertSolutions = () => {
  const [solutions, setSolutions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginErrorFileId, setLoginErrorFileId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper to download file
  const downloadFile = (url) => {
    if (!url) {
      console.error('No file URL provided');
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Download started for: ${url}`);
  };

  // Load all NCERT Solutions on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/study-material/get?type=ncert-solutions")
      .then((res) => setSolutions(res.data))
      .catch((error) => {
        setError("Failed to load NCERT Solutions");
        console.error("Error loading solutions data:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Restore class/subject on return from payment
  useEffect(() => {
    const state = location.state;
    if (state?.className) setSelectedClass(state.className);
    if (state?.subject) setSelectedSubject(state.subject);
  }, [location]);

  const classList = useMemo(() => [...new Set(solutions.map((item) => item.className))], [solutions]);

  const subjectList = useMemo(() => {
    return selectedClass
      ? [...new Set(solutions.filter((item) => item.className === selectedClass)
        .map((item) => item.subject))]
      : [];
  }, [selectedClass, solutions]);

  const yearWiseData = useMemo(() => {
    return solutions
      .filter((item) => item.className === selectedClass && item.subject === selectedSubject)
      .sort((a, b) => b.year - a.year);
  }, [selectedClass, selectedSubject, solutions]);

  const checkIfPurchased = async (materialId) => {
    const user = getAuth().currentUser;
    if (!user) {
      console.log(`User not logged in, can't check purchase status for materialId: ${materialId}`);
      setLoginErrorFileId(materialId);
      return null;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/payment/check-purchase', {
        userId: user.uid,
        materialId: materialId
      });
      return response.data.purchased;
    } catch (error) {
      console.error('Error checking purchase:', error);
      setLoginErrorFileId(materialId);
      return false;
    }
  };

  const handleDownload = async (fileUrl, item) => {
    const materialId = `${item.type}-${item.className}-${item.subject}-${item.title || 'Untitled'}`;  // Ensure materialId is set here;

    if (!materialId || !fileUrl) {
      console.error('Invalid materialId or fileUrl:', { materialId, fileUrl });
      return;
    }

    // Pass the correct materialId to checkIfPurchased
    const isPurchased = await checkIfPurchased(materialId);
    if (isPurchased === null) return;

    if (isPurchased) {
      downloadFile(fileUrl);
      setLoginErrorFileId(null);
    } else {
      if (downloadCount >= 2) {
        const paymentState = {
          materialId: materialId,
          type: "ncert-solutions",
          pathname: location.pathname,
          materialData: {
            category: "SomeCategory", // Adjust as needed
            className: item.className,
            subject: item.subject,
            title: item.title || 'Untitled',
            year: item.year ? item.year.toString() : 'Unknown',
            uploadType: "PDF",
            s3Url: fileUrl
          }
        };

        localStorage.setItem("paymentData", JSON.stringify(paymentState));
        navigate('/payment', {
          state: {
            materialId,
            type: "ncert-solutions",
            className: item.className,
            subject: item.subject,
            pathname: location.pathname,
          },
        });
      } else {
        downloadFile(fileUrl);
        setDownloadCount((prevCount) => prevCount + 1);
        setLoginErrorFileId(null);
      }
    }
  };

  return (
    <div id="ncert-solutions-section" className="solutions-container">
      <h3 className="solutions-title">Ncert Solutions</h3>
      {loginErrorFileId && <p className="login-error">You must be logged in to download this file.</p>}
      {error && <p className="error-message">{error}</p>}
      <div id="class-selection" className="solutions-class-buttons">
        {classList.map((cls) => (
          <button
            key={cls}
            className={`solutions-class-button ${selectedClass === cls ? "active" : ""}`}
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
        <div id="subject-selection" className="solutions-subject-buttons">
          {subjectList.map((subject) => (
            <button
              key={subject}
              className={`solutions-subject-button ${selectedSubject === subject ? "active" : ""}`}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <p id="loading-message">Loading...</p>
      ) : selectedSubject && yearWiseData.length > 0 ? (
        <div id="year-wise-data" className="solutions-year-grid">
          {yearWiseData.map((item) => (
            <div key={item._id} className="solutions-year-card">
              <FontAwesomeIcon icon={faFilePdf} className="solutions-pdf-icon" />
              <h4 className="solutions-year-title">{item.year}</h4>
              {item.files.map((file) => (
                <DownloadButton
                  key={file._id}
                  type="ncert-solutions"
                  fileUrl={file.fileUrl}
                  bookTitle={file.title || item.title || `Solution ${item.year}`}
                  className={item.className}
                  subject={item.subject}
                  section="solutions-section"
                  item={item}
                />
              ))}
            </div>
          ))}
        </div>
      ) : selectedSubject ? (
        <p id="no-data-message">No solutions available for this selection.</p>
      ) : null}
      {downloadCount >= 2 && (
        <p id="payment-warning" className="solutions-warning">
          You've used all your free downloads. Please proceed to payment.
        </p>
      )}
      <button id="back-button" className="solutions-back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
    </div>
  );
};

export default NcertSolutions;
