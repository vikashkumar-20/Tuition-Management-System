import { useState } from 'react';
import UploadResult from './UploadResult';
import UploadStudyMaterial from './UploadStudyMaterial';
import DeleteStudyMaterial from './DeleteStudyMaterial';
import DeleteResult from './DeleteResult';
import LeaderboardAdmin from './LeaderboardAdmin'; 

import './AdminPanel.css';

const AdminPanel = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div className="admin-panel-container" id="admin-panel">
      <h2 className="admin-panel-heading">Admin Panel</h2>

      <div className="admin-panel-form-group">
        <label className="admin-panel-label">Select Option</label>
        <select
          className="admin-panel-select"
          value={selectedOption}
          onChange={handleOptionChange}
        >
          <option value="">Select</option>
          <option value="study-material">Upload Study Material</option>
          <option value="result">Upload Result</option>
          <option value="delete-study-material">Delete Study Material</option>
          <option value="delete-result">Delete Result</option>
          <option value="leaderboard">View Leaderboard</option> {/* ← new option */}
        </select>
      </div>

      <div className="admin-panel-content">
        {selectedOption === "study-material" && <UploadStudyMaterial />}
        {selectedOption === "result" && <UploadResult />}
        {selectedOption === "delete-study-material" && <DeleteStudyMaterial />}
        {selectedOption === "delete-result" && <DeleteResult />}
        {selectedOption === "leaderboard" && <LeaderboardAdmin />}
      </div>
    </div>
  );
};

export default AdminPanel;
