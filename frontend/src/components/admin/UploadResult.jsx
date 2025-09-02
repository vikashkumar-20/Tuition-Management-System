import React, { useState } from 'react';
import axios from 'axios';
import './UploadResult.css'; // External CSS File

const UploadResult = () => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [subject, setSubject] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!name || !rollNo || !studentClass || !subject || !image) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const imageData = new FormData();
      imageData.append('image', image);

      const res1 = await axios.post('http://localhost:5000/api/result/upload-result-image', imageData);
      const imageUrl = res1.data.imageUrl;

      await axios.post('http://localhost:5000/api/result/upload-result-data', {
        name,
        rollNo,
        class: studentClass,
        subject,
        image: imageUrl,
      });

      alert("Result Uploaded Successfully!");

      setName('');
      setRollNo('');
      setStudentClass('');
      setSubject('');
      setImage(null);

    } catch (error) {
      console.log(error);
      alert("Error Uploading Result");
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
