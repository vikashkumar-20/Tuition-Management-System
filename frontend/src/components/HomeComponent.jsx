import React from 'react';
import './HomeComponent.css';

const HomeComponent = ({ user, handleDemoClick }) => {
  return (
    <section className="home-section" id="home-section">
      <h1 className="home-title" id="home-title">
        Welcome to CK Study Classes - Empowering Your Success!
      </h1>
      <p className="home-subtitle" id="home-subtitle">
        Book your demo classes and start your learning journey today!
      </p>
      {!user && (
        <button className="home-demo-btn" id="home-demo-btn" onClick={handleDemoClick}>
          Book a Demo
        </button>
      )}
    </section>
  );
};

export default HomeComponent;
