import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { getAuth } from 'firebase/auth';
import DownloadButton from './DownloadButton';
import API from '../utils/API'; // Make sure your API instance is exported from utils/API.js
import './PreviousYearQuestion.css';

const PreviousYearQuestions = () => {
  const [pyq, setPyq] = useState([]);
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
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-download after payment
  useEffect(() => {
    const state = location.state?.from;
    const matId = state?.materialId;
    if (location.state?.resumeDownload && matId) {
      const foundItem = pyq.find(item =>
        `${item.type}-${item.className}-${item.subject}-${item.title}` === matId
      );
      if (foundItem && foundItem.files.length > 0) {
        downloadFile(foundItem.files[0].fileUrl);
      }
    }
  }, [pyq, location]);

  // Fetch PYQ data
  useEffect(() => {
    setLoading(true);
    API.get("/study-material/get?type=previous-year-questions")
      .then(res => setPyq(res.data))
      .catch(err => {
        console.error(err);
        setError("Failed to load PYQ data.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Restore class/subject after returning from payment
  useEffect(() => {
    const state = location.state;
    if (state?.className) setSelectedClass(state.className);
    if (state?.subject) setSelectedSubject(state.subject);
  }, [location]);

  const classList = useMemo(() => [...new Set(pyq.map(item => item.className))], [pyq]);

  const subjectList = useMemo(() => {
    return selectedClass
      ? [...new Set(pyq.filter(item => item.className === selectedClass).map(item => item.subject))]
      : [];
  }, [selectedClass, pyq]);

  const yearWiseData = useMemo(() => {
    return pyq
      .filter(item => item.className === selectedClass && item.subject === selectedSubject)
      .sort((a, b) => b.year - a.year);
  }, [selectedClass, selectedSubject, pyq]);

  const checkIfPurchased = async (materialId) => {
    const user = getAuth().currentUser;
    if (!user) {
      setLoginErrorFileId(materialId);
      return null;
    }
    try {
      const response = await API.post('/payment/check-purchase', {
        userId: user.uid,
        materialId
      });
      return response.data.purchased;
    } catch (err) {
      console.error(err);
      setLoginErrorFileId(materialId);
      return false;
    }
  };

  const handleDownload = async (fileUrl, item) => {
    const materialId = `${item.type}-${item.className}-${item.subject}-${item.title || item.year || 'Untitled'}`;
    if (!materialId || !fileUrl) return;

    const isPurchased = await checkIfPurchased(materialId);
    if (isPurchased === null) return;

    if (isPurchased) {
      downloadFile(fileUrl);
      setLoginErrorFileId(null);
    } else {
      if (downloadCount >= 2) {
        const paymentState = {
          materialId,
          type: "previous-year-questions",
          className: item.className,
          subject: item.subject,
          title: item.title || item.year || 'Untitled',
          year: item.year || 'Unknown',
          uploadType: "PDF",
          s3Url: fileUrl
        };
        localStorage.setItem("paymentData", JSON.stringify(paymentState));
        navigate('/payment', { state: { ...paymentState, pathname: location.pathname } });
      } else {
        downloadFile(fileUrl);
        setDownloadCount(prev => prev + 1);
        setLoginErrorFileId(null);
      }
    }
  };

  return (
    <div id="pyq-section" className="pyq-container">
      <h3 className="pyq-title">Previous Year Questions</h3>
      {loginErrorFileId && <p className="login-error">You must be logged in to download this file.</p>}
      {error && <p className="error-message">{error}</p>}

      <div id="class-selection" className="pyq-class-buttons">
        {classList.map(cls => (
          <button
            key={cls}
            className={`pyq-class-button ${selectedClass === cls ? "active" : ""}`}
            onClick={() => { setSelectedClass(cls); setSelectedSubject(null); }}
          >
            {cls}
          </button>
        ))}
      </div>

      {selectedClass && (
        <div id="subject-selection" className="pyq-subject-buttons">
          {subjectList.map(subject => (
            <button
              key={subject}
              className={`pyq-subject-button ${selectedSubject === subject ? "active" : ""}`}
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
        <div id="year-wise-data" className="pyq-year-grid">
          {yearWiseData.map(item => (
            <div key={item._id} className="pyq-year-card">
              <FontAwesomeIcon icon={faFilePdf} className="pyq-pdf-icon" />
              <h4 className="pyq-year-title">{item.year}</h4>
              {item.files.map(file => (
                <DownloadButton
                  key={file._id}
                  type="previous-year-questions"
                  fileUrl={file.fileUrl}
                  bookTitle={file.title || item.title || `PYQ ${item.year}`}
                  className={item.className}
                  subject={item.subject}
                  section="pyq-section"
                  item={{
                    _id: item._id,
                    type: 'previous-year-questions',
                    title: item.title || `PYQ ${item.year}`,
                    className: item.className,
                    subject: item.subject,
                    year: item.year
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : selectedSubject ? (
        <p id="no-data-message">No questions available for this selection.</p>
      ) : null}

      {downloadCount >= 2 && (
        <p id="payment-warning" className="pyq-warning">
          You've used all your free downloads. Please proceed to payment.
        </p>
      )}

      <button id="back-button" className="pyq-back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
    </div>
  );
};

export default PreviousYearQuestions;
