import React, { useState, useEffect } from "react";
import API from "../api"; // ✅ use centralized axios instance
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./DownloadButton.css";

const normalizeId = (str = "") => str.toLowerCase().replace(/\s+/g, "-");

const DownloadButton = ({ className, subject, fileUrl, bookTitle, section, item, type }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [globalDownloadCount, setGlobalDownloadCount] = useState(0);
  const [purchased, setPurchased] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const globalKey = `${currentUser.uid}-global-downloads`;
        const savedCount = localStorage.getItem(globalKey);
        if (savedCount) setGlobalDownloadCount(Number(savedCount));

        await checkIfPurchased(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkIfPurchased = async (uid) => {
    const materialId = `${type}-${normalizeId(className)}-${normalizeId(subject)}-${normalizeId(item.title || item.year || "Untitled")}`;
    try {
      const res = await API.post("/payment/check-purchase", {
        userId: uid,
        materialId,
        type,
        className,
        subject,
      });
      setPurchased(res.data.purchased);
    } catch (err) {
      console.error("Purchase check failed:", err);
    }
  };

  const initiateDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${bookTitle || item.title || "file"}.pdf`; // ✅ user-friendly filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess(true);
  };

  const handleDownload = () => {
    setError(null);

    if (!user) {
      setError("You must be logged in to download.");
      return;
    }

    if (type === "ncert-books") {
      initiateDownload(fileUrl);
      return;
    }

    const globalKey = `${user.uid}-global-downloads`;

    if (purchased) {
      initiateDownload(fileUrl);
      return;
    }

    if (globalDownloadCount >= 2) {
      const paymentState = {
        materialId: `${type}-${normalizeId(className)}-${normalizeId(subject)}-${normalizeId(item.title || item.year || "Untitled")}`,
        type,
        pathname: window.location.pathname,
        materialData: {
          category: section,
          className,
          subject,
          title: item.title || item.year || "Untitled",
          year: item.year?.toString() || "Unknown",
          uploadType: "PDF",
          s3Url: fileUrl,
        },
      };

      localStorage.setItem("paymentData", JSON.stringify(paymentState));
      navigate("/payment", { state: { from: paymentState } });
      return;
    }

    // free download
    initiateDownload(fileUrl);
    const newCount = globalDownloadCount + 1;
    setGlobalDownloadCount(newCount);
    localStorage.setItem(globalKey, newCount);
  };

  return (
    <div>
      <button onClick={handleDownload} disabled={success} className="download-btn">
        {success ? "Downloaded" : "Download"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {user && type !== "ncert-books" && !purchased && globalDownloadCount < 2 && (
        <p>{2 - globalDownloadCount} free download(s) left.</p>
      )}

      {user && type !== "ncert-books" && !purchased && globalDownloadCount >= 2 && (
        <p>Limit reached. Please proceed to payment.</p>
      )}
    </div>
  );
};

export default DownloadButton;
