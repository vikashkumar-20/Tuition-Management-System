import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudyMaterial.css";

const studyMaterials = [
  {
    id: "ncert-books",
    img: "/images/Card-img01.jpg",
    title: "NCERT BOOKS",
    backTitle: "CLASS",
    backContent: ["11th", "12th", "Other Classes"],
    buttonText: "Download E-Books"
  },
  {
    id: "previous-questions",
    img: "/images/Card-img04.jpg",
    title: "PREVIOUS QUESTIONS",
    backTitle: "Exam Papers",
    backContent: ["Past 10 Years", "Question Papers"],
    buttonText: "Download Papers"
  },
  {
    id: "support-material",
    img: "/images/Card-img03.jpg",
    title: "SUPPORT MATERIAL",
    backTitle: "Study Notes",
    backContent: ["Chapter Wise & Hand Written Notes", "Videos", "Practice Set"],
    buttonText: "Get Notes"
  },
  {
    id: "ncert-solutions",
    img: "/images/Card-img02.png",
    title: "NCERT SOLUTIONS",
    backTitle: "Solutions",
    backContent: ["For All Subjects"],
    buttonText: "View Solutions"
  },
];

const StudyMaterial = () => {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/study-material/${id}`);
  };

  return (
    <div className="study-material-section">
      <div className="study-material-header">
        <h3 id="study-material-heading">Study Material</h3>
      </div>

      <div className="study-material-content">
        {studyMaterials.map((item) => (
          <div className="flip-card" key={item.id}>
            <div className="flip-card-inner">

              {/* Front Side */}
              <div className="flip-card-front">
                <img src={item.img} alt={item.title} className="study-img" />
                <h4>{item.title}</h4>
              </div>

              {/* Back Side (Only Text, No Image) */}
              <div className="flip-card-back">
                <h2>{item.backTitle}</h2>
                {item.backContent.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
                <button
                  className="open-material-button"
                  onClick={() => handleCardClick(item.id)}
                >
                  {item.buttonText}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterial;
