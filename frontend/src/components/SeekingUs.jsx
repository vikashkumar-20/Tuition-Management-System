import React from 'react';
import './SeekingUs.css';

const SeekingUs = () => {
  const cardsData = [
    {
      header: "One Stop Solutions For All Subjects",
      content: "We provide multiple solutions with respect to all the subjects. Our objective is not just to make things easier for them to understand but also facile enough to let them grasp the root meanings of everything."
    },
    {
      header: "A Student-Centred Approach To Teaching",
      content: "Our teachers actively guide the students in all necessary areas, and the focus of entire classes is the student. This student-centered approach allows them to steer the ship."
    },
    {
      header: "Six Years, 100% Result",
      content: "We feel immense pride that all our students have been passing with flying colors for 6 years, and this will last forever."
    },
    {
      header: "Real-Time Doubt Solution",
      content: "“The student should never hesitate to question.” One of our prime objectives is not to produce rote learners but to nurture students who have the confidence and ability to question things around them."
    }
  ];

  return (
    
      <div className="seekingus-section">
        <h2 className="seekingus-header">Seeking Us!!</h2>

        <div className="seekingus-topsection">
          {cardsData.map((card, index) => (
            <div key={index} className="seekingus-card">
              <h3 className="seekingus-card-header">{card.header}</h3>
              <p className="seekingus-card-content">{card.content}</p>
            </div>
          ))}
        </div>
      </div>
    
  );
};

export default SeekingUs;