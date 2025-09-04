import React from "react";
import "./About.css";

const About = () => {
  return (
    <section className="about" id="about-section">
      <div className="about-container">

        {/* About CK Study Classes */}
        
        <div className="about-section">
          <h2>About CK Study Classes</h2>
          <p>
            At CK Study Classes, we are passionate about shaping young minds through quality education.
            With a team of dedicated educators and a structured curriculum, we help students build strong
            conceptual foundations and achieve academic excellence.
          </p>
        </div>


         <div className="about-section">
          <h2>Why CK Study Classes?</h2>
          <ul>
            <li>Expert faculty with years of teaching experience.</li>
            <li>Student-centric approach with personalized attention.</li>
            <li>Regular mock tests and performance tracking.</li>
            <li>Interactive learning environment with innovative methods.</li>
            <li>A proven history of outstanding student achievements.</li>
          </ul>
        </div>



        {/* Our Vision */}
        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            We envision a world where every student receives the best education and is equipped with the knowledge
            and skills necessary to succeed. Our focus is on nurturing critical thinking, problem-solving abilities,
            and a lifelong love for learning.
          </p>
        </div>

        {/* Why Choose Us */}
       

      </div>

      {/* Bottom Section (Footer Contact Info stays here) */}
     
    </section>
  );
};

export default About;
