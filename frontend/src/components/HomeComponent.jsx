import React from 'react';

const HomeComponent = ({ user, handleDemoClick }) => {
  return (
    <section className="hero-section">
      <h1>Welcome to CK Study Classes - Empowering Your Success!</h1>
      <p>Book your demo classes and start your learning journey today!</p>
      {!user && (
        <button className="demo-btn" onClick={handleDemoClick}>
          Book a Demo
        </button>
      )}
    </section>
  );
};

export default HomeComponent;
