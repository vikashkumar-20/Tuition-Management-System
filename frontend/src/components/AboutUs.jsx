// AboutUs.js
import React from "react";
import "./AboutUs.css";

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

        {/* Get in Touch */}
        <div className="about-section" id="contact-section">
          <h2>Get in Touch</h2>
          <p>We are always here to guide you on your educational journey. Reach out to us for inquiries or admissions:</p>
          <p>Email: <a href="mailto:ckstudyclasses@gmail.com">ckstudyclasses@gmail.com</a></p>
          <p>Phone: <a href="tel:+91-7290958765">+91-7290958765</a></p>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="about-bottom">
        <p>© 2025 CK Study Classes | Empowering Students, Transforming Futures.</p>
      </div>
    </section>
  );
};

export default About;
