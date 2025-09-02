// Courses.js
import React from "react";
import './Courses.css';

const coursesData = [
  {
    title: "Class 11th",
    courses: ["Political Science", "History"],
  },
  {
    title: "Class 12th",
    courses: ["Political Science", "Geography", "History", "Sociology", "Physical Education", "Hindi"],
  },
  {
    title: "Graduation",
    courses: ["Political Science", "Programme"],
  },
  {
    title: "Post Graduation",
    courses: ["Political Science"],
  },
];

const Courses = () => {
  return (
    <div className="course-container">
      <section className="coursesection" id="courses-section">
        <h2 id="courses-header">COURSES OFFERED</h2>
        <div className="courses">
          {coursesData.map((course, index) => (
            <div key={index} className="courses-section">
              <h3>{course.title}</h3>
              <ul>
                {course.courses.map((courseItem, idx) => (
                  <li key={idx}>{courseItem}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Courses;
