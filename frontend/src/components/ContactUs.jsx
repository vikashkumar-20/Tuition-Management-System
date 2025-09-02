import React from "react";
import { Link } from "react-router-dom";
import "./ContactUs.css";  // Ensure this CSS file is properly linked.

const ContactUs = () => {
  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { text: "Home", to: "/" },
        { text: "Courses", to: "#courses" },
        { text: "About", to: "#about-us" },
        { text: "Contact", to: "#contact-us" },
      ],
    },
    {
      title: "Follow Us",
      links: [
        { icon: "facebook-f", href: "https://facebook.com" },
        { icon: "instagram", href: "https://instagram.com" },
        { icon: "whatsapp", href: "https://wa.me/917290958765" },
        { icon: "youtube", href: "https://youtube.com" },
      ],
    },
  ];

  return (
    <footer id="contact-us" className="contact">
      <div className="contact-container">
        <div id="top" className="contact-section">
          <h2>About Us</h2>
          <p>
            We are committed to providing high-quality educational resources
            to students worldwide.
          </p>
        </div>

        {/* Render footer sections */}
        {footerSections.map((section, index) => (
          <div key={index} className="contact-section">
            <h2>{section.title}</h2>
            <ul>
              {section.links.map((link, index) => (
                <li key={index}>
                  {link.to ? (
                    <a href={link.to} className="nav-link">
                      {link.text}
                    </a>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon"
                    >
                      <i className={`fab fa-${link.icon}`}></i>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="contact-section">
          <h2>Contact</h2>
          <p>
            <i className="fas fa-envelope"></i>
            <a href="mailto:ckstudyclasses@gmail.com">
              ckstudyclasses@gmail.com
            </a>
            <i className="fas fa-phone-alt"></i>
            <a href="tel:+917290958765"> +91 7290958765</a>
          </p>
        </div>
      </div>

      <div className="contact-bottom">
        <p>© 2025 YourWebsite. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default ContactUs;
