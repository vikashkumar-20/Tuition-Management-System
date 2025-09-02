import React, { useState } from 'react';
import axios from 'axios';
import './UploadStudyMaterial.css';
import CreateQuiz from "./Quiz";

const UploadStudyMaterial = () => {
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // File Size Validation: Max 10MB
    if (file && file.size > 10 * 1024 * 1024) {
      setLoading(false);
      setErrorMessage('File size exceeds the maximum limit of 10MB.');
      return;
    }

    try {
      let fileUrl = '';

      if (uploadType === 'PDF' || uploadType === 'Image') {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResponse = await axios.post(
          'http://localhost:5000/api/study-material/upload/file',
          formData
        );
        fileUrl = uploadResponse.data.fileUrl;
      } else if (uploadType === 'URL') {
        fileUrl = url;
      }

      const metadata = {
        type,
        className,
        subject,
        title,
        uploadType,
        s3Url: fileUrl,
      };

      if (type === 'previous-year-questions') {
        metadata.year = year;
      }

      if (type === 'support-material') {
        metadata.category = category;
      }

      await axios.post('http://localhost:5000/api/study-material/upload/metadata', metadata);

      // Reset all fields
      setType('');
      setCategory('');
      setClassName('');
      setSubject('');
      setYear('');
      setTitle('');
      setUploadType('');
      setUrl('');
      setFile(null);
      setSuccessMessage('Uploaded Successfully!');
    } catch (err) {
      console.error('Error uploading study material:', err);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="upload-study-material">
      <h2>Upload Study Material</h2>
      {loading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Common Fields */}
      <div className="form-fields">
        {/* Type */}
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">Select Type</option>
          <option value="ncert-books">NCERT Books</option>
          <option value="previous-year-questions">Previous Year Questions</option>
          <option value="support-material">Support Material</option>
          <option value="ncert-solutions">NCERT Solutions</option>
        </select>

        {type && (
          <>
            {/* Class */}
            <input
              type="text"
              placeholder="Class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />

            {/* Subject */}
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Year - Only for Previous Year Questions */}
            {type === 'previous-year-questions' && (
              <input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            )}

            {/* Category - Only for Support Material */}
            {type === 'support-material' && (
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                <option value="notes">Notes</option>
                <option value="videos">Videos</option>
                <option value="practice-set">Practice Set</option>
                <option value="create-quiz">Create Quiz</option>
              </select>
            )}
          </>
        )}
      </div>

      {/* Conditional Rendering */}
      {type === 'support-material' && category === 'create-quiz' ? (
        <div style={{ marginTop: '20px' }}>
          <CreateQuiz />
        </div>
      ) : (
        type && (
          <form onSubmit={handleSubmit}>
            {/* Upload Type */}
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} required disabled={loading}>
              <option value="">Select Upload Type</option>
              <option value="PDF">PDF</option>
              <option value="Image">Image</option>
              <option value="URL">URL</option>
            </select>

            {/* File or URL Input */}
            {uploadType === 'PDF' || uploadType === 'Image' ? (
              <input type="file" onChange={(e) => setFile(e.target.files[0])} required disabled={loading} />
            ) : uploadType === 'URL' ? (
              <input
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required disabled={loading}
              />
            ) : null}

            {/* Upload Button */}
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

        )
      )}
    </div>
  );
};

export default UploadStudyMaterial;
