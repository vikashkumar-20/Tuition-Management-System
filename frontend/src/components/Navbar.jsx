import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown visibility

  useEffect(() => {
    if (auth.currentUser) {
      const name = auth.currentUser.displayName || auth.currentUser.email;
      setUserName(name);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    navigate("/");
  }, [navigate]);

  const handleNavigation = useCallback((path, scrollToTop = false) => {
    navigate(path);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMenuOpen(false);
  }, [navigate]);

  const handleScrollToContact = () => {
    navigate("/contact-us");
    const element = document.getElementById("contact-us");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const handleLeaderboard = () => {
    const quizId = localStorage.getItem("lastQuizId");
    if (!quizId) {
      alert("No recent quiz found. Please take a quiz first.");
      return;
    }
    if (!userName) {
      alert("User not identified.");
      return;
    }
    navigate(`/leaderboard/${userName}`);
  };

  const menuClass = useMemo(() => `nav-links ${menuOpen ? 'show' : ''}`, [menuOpen]);

  return (
    <header id="navbar-header">
      <div className="main-navbar" id="main-navbar">
        {/* Brand Logo Section */}
        <div className="brand-logo" id="brand-logo">
          <Link to="/" className="brand-name" id="brand-name">
            <h2 className="brand-title">CK</h2>
            <h3 className="brand-tagline">Study Classes</h3>
          </Link>
        </div>

        {/* Toggle Menu Icon */}
        <FontAwesomeIcon
          icon={menuOpen ? faTimes : faBars}
          className="menu-icon"
          id="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        />

        {/* Navigation Links */}
        <nav className={menuClass} id="navbar-links">
          <button className="nav-item" id="nav-home" onClick={() => handleNavigation("/", true)}>Home</button>
          <button className="nav-item" id="nav-courses" onClick={() => handleNavigation("/courses")}>Courses</button>

          {/* Study Materials Dropdown */}
          <div
            className="nav-item dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="nav-item" id="nav-materials" onClick={() => handleNavigation("/study-material")}>
              Study Materials
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleNavigation("/study-material/support-material")}>Quiz</button>
                <button className="dropdown-item" onClick={() => handleNavigation("/study-material/support-material")}>Notes</button>
                <button className="dropdown-item" onClick={() => handleNavigation("/study-material/support-material")}>Videos</button>
                <button className="dropdown-item" onClick={() => handleNavigation("/study-material/support-material")}>Practice Set</button>
                <button className="dropdown-item" onClick={() => handleNavigation("/study-material/ncert-books")}>Ncert Books</button>
                <button className="dropdown-item" onClick={() => handleNavigation("/study-material/previous-questions")}>Ncert Solutions</button>
                <button className="dropdown-item" onClick={() => handleNavigation("/study-material/previous-questions")}>Previous Year Questions</button>

                {/* Add Quiz Leaderboard in Dropdown */}
                {auth.currentUser && (
                  <button className="dropdown-item" onClick={handleLeaderboard}>Quiz LeaderBoard</button>
                )}
              </div>
            )}
          </div>

          <button className="nav-item" id="nav-results" onClick={() => handleNavigation("/results")}>Results</button>
          <button className="nav-item" id="nav-about" onClick={() => handleNavigation("/about-us")}>About Us</button>
          <button className="nav-item" id="nav-contact" onClick={handleScrollToContact}>Contact Us</button>
        </nav>

        {/* User Info / Auth Buttons */}
        <div className="auth-section" id="auth-section">
          {auth.currentUser ? (
            <div className="user-info" id="user-info">
              <span className="user-name" id="user-name">Welcome, {userName}</span>
              <button className="logout-btn" id="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" id="login-link">
              <button className="login-btn" id="login-btn">Login</button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
