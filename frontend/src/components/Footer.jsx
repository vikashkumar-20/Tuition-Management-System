import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-contact">
          <p>
            Contact us:
            <span className="contact-item">
              <a href="mailto:ckstudyclasses@gmail.com">ckstudyclasses@gmail.com</a>
            </span>
            <span className="separator">|</span>
            <span className="contact-item">
              <a href="tel:+917290958765">+91 7290958765</a>
            </span>
          </p>
        </div>

        <div className="footer-social">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-icon">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="https://wa.me/917290958765" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-icon">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href="mailto:ckstudyclasses@gmail.com" aria-label="Email" className="social-icon">
            <i className="fas fa-envelope"></i>
          </a>
        </div>

        <div className="footer-copy">
          <p>© 2025 CK Study Classes | Empowering Students, Transforming Futures.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
