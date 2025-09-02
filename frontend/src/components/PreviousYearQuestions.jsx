import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import './PreviousYearQuestion.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { getAuth } from 'firebase/auth';
import DownloadButton from './DownloadButton';

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

  // Auto-download if redirected back after payment
  useEffect(() => {
    const state = location.state?.from; // safe access to location.state.from
    const matId = state?.materialId;
    if (location.state?.resumeDownload && matId) {
      const foundItem = pyq.find(item =>
        `${item.type}-${item.className}-${item.subject}-${item.title}` === matId
      );
      if (foundItem && foundItem.files.length > 0) {
        const file = foundItem.files[0];
        console.log('Auto-download initiated for file:', file);
        downloadFile(file.fileUrl);
      }
    }
  }, [pyq, location]);

  // Load all PYQ on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/study-material/get?type=previous-year-questions")
      .then((res) => setPyq(res.data))
      .catch((error) => {
        setError("Failed to load PYQ");
        console.error("Error loading PYQ data:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Restore class/subject on return from payment
  useEffect(() => {
    const state = location.state;
    if (state?.className) setSelectedClass(state.className);
    if (state?.subject) setSelectedSubject(state.subject);
  }, [location]);

  const classList = useMemo(() => [...new Set(pyq.map((item) => item.className))], [pyq]);

  const subjectList = useMemo(() => {
    return selectedClass
      ? [...new Set(pyq.filter((item) => item.className === selectedClass)
        .map((item) => item.subject))]
      : [];
  }, [selectedClass, pyq]);

  const yearWiseData = useMemo(() => {
    return pyq
      .filter((item) => item.className === selectedClass && item.subject === selectedSubject)
      .sort((a, b) => b.year - a.year);
  }, [selectedClass, selectedSubject, pyq]);

  const checkIfPurchased = async (materialId) => {
    const user = getAuth().currentUser;
    if (!user) {
      console.log(`User not logged in, can't check purchase status for materialId: ${materialId}`);
      setLoginErrorFileId(materialId);
      return null;
    }
    console.log(`Checking purchase status for materialId: ${materialId}`);
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
    const materialId = `${item.type}-${item.className}-${item.subject}-${item.title || item.year || 'Untitled'}`;  // Ensure materialId is set here;
    console.log("Generated Material ID:", materialId);

    if (!materialId || !fileUrl) {
      console.error('Invalid materialId or fileUrl:', { materialId, fileUrl });
      return;
    }

    // Pass the correct materialId to checkIfPurchased
    const isPurchased = await checkIfPurchased(materialId);
    if (isPurchased === null) return;

    if (isPurchased) {
      console.log('User has purchased, downloading file:', fileUrl);
      downloadFile(fileUrl);
      setLoginErrorFileId(null);
    } else {
      if (downloadCount >= 2) {
        console.log('User needs to pay, redirecting to payment');

        const paymentState = {
          materialId: materialId,
          type: "previous-year-questions",
          pathname: location.pathname,
          materialData: {
            category: "SomeCategory", // Adjust as needed
            className: item.className,
            subject: item.subject,
            title: item.title || item.year || 'Untitled',
            year: item.year ? item.year.toString() : 'Unknown',
            uploadType: "PDF",
            s3Url: fileUrl
          }
        };

        console.log("Navigating to PaymentPage with state:", paymentState);
        localStorage.setItem("paymentData", JSON.stringify(paymentState));  // Ensure data is saved
        navigate('/payment', {
          state: {
            materialId,
            type: "previous-year-questions",
            className: item.className,
            subject: item.subject,
            pathname: location.pathname,
          },
        });
        
      } else {
        console.log('Free download available, starting download for file');
        downloadFile(fileUrl);
        setDownloadCount((prevCount) => prevCount + 1);
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
        {classList.map((cls) => (
          <button
            key={cls}
            className={`pyq-class-button ${selectedClass === cls ? "active" : ""}`}
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
        <div id="subject-selection" className="pyq-subject-buttons">
          {subjectList.map((subject) => (
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
          {yearWiseData.map((item) => (
            <div key={item._id} className="pyq-year-card">
              <FontAwesomeIcon icon={faFilePdf} className="pyq-pdf-icon" />
              <h4 className="pyq-year-title">{item.year}</h4>
              {item.files.map((file) => (
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
                    year: item.year,
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
