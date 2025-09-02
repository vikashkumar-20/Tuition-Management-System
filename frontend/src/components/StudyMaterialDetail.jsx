import React from "react";
import { useParams } from "react-router-dom";

const StudyMaterialDetail = () => {
  const { id } = useParams();  // Access the dynamic `id` from the URL

  return (
    <div className="material-detail">
      <h2>Details for {id}</h2>
      {/* You can fetch or display data dynamically here based on the `id` */}
      <p>This is the detail page for {id}. Here you can display links, files, or other relevant content.</p>
    </div>
  );
};

export default StudyMaterialDetail;
