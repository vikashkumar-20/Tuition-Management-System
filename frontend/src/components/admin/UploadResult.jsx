import React, { useState } from "react";
import axios from "axios";
import "./UploadResult.css"; // External CSS File

const UploadResult = () => {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ API base from environment
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleUpload = async () => {
    if (!name || !rollNo || !studentClass || !subject || !image) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload file to S3
      const imageData = new FormData();
      imageData.append("file", image);

      const uploadRes = await axios.post(
        `${API_BASE}/result/upload-result-image`,
        imageData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const imageUrl = uploadRes.data.fileUrl;
      if (!imageUrl) {
        throw new Error("Image upload failed. No URL returned.");
      }

      // 2. Save result data in DB
      await axios.post(`${API_BASE}/result/upload-result-data`, {
        name,
        rollNo,
        studentClass,
        subject,
        image: imageUrl,
      });

      alert("✅ Result Uploaded Successfully!");

      // 3. Reset form
      setName("");
      setRollNo("");
      setStudentClass("");
      setSubject("");
      setImage(null);

      // Reset file input manually
      document.querySelector(".upload-result-file").value = "";
    } catch (error) {
      console.error("❌ Upload Error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message || "Error uploading result. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-result-container">
      <h2 className="upload-result-title">Upload Result</h2>

      <input
        type="text"
        className="upload-result-input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        className="upload-result-input"
        placeholder="Roll No"
        value={rollNo}
        onChange={(e) => setRollNo(e.target.value)}
      />
      <input
        type="text"
        className="upload-result-input"
        placeholder="Class"
        value={studentClass}
        onChange={(e) => setStudentClass(e.target.value)}
      />
      <input
        type="text"
        className="upload-result-input"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        type="file"
        accept="image/*,.pdf" // ✅ Allow only images or PDFs
        className="upload-result-file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button
        className="upload-result-btn"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload Result"}
      </button>
    </div>
  );
};

export default UploadResult;
