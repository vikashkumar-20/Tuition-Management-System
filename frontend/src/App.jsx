import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { auth } from "./firebaseConfig";

// Components
import Navbar from "./components/Navbar";
import HomeComponent from "./components/HomeComponent";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import Courses from "./components/Courses";
import StudyMaterial from "./components/StudyMaterial";
import ViewResults from "./components/ViewResults";
import SeekingUs from "./components/SeekingUs";
import AboutUs from "./components/AboutUs";
import NcertBooks from "./components/NcertBooks";
import PreviousYearQuestion from "./components/PreviousYearQuestions";
import SupportMaterial from "./components/SupportMaterial";
import StudyMaterialType from "./components/StudyMaterialType";
import AdminPanel from "./components/admin/AdminPanel";
import NcertSolutions from "./components/NcertSolutions";
import ContactUs from "./components/ContactUs";
import AuthForm from "./components/AuthForm";
import Quiz from "./components/admin/Quiz";
import StartQuiz from "./components/StartQuiz";
import LeaderBoard from "./components/LeaderBoard";
import PaymentPage from './components/PaymentPage';

import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Monitor auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Demo button click handler
  const handleDemoClick = useCallback(() => {
    navigate("/auth-form");
  }, [navigate]);

  // List of paths where Navbar should be hidden
  const hideNavbarPaths = [
    "/study-material/ncert-books",
    "/study-material/ncert-solutions",
    "/study-material/previous-questions",
    "/study-material/support-material",
    "/study-material/category",
    "/study-material/type",
    "/admin",  // Admin panel route
    "/signup",
    "/login",
    "/auth-form",
    "/start-quiz",
    "/leaderboard",
    "/quiz",
    "/payment"
  ];

  // Check if the current path requires hiding the Navbar
  const shouldHideNavbar = hideNavbarPaths.some((path) => location.pathname.startsWith(path));

  // Show loading screen while checking auth state
  if (authLoading) {
    return (
      <div className="loading-screen">
        <p>Loading, please wait...</p>
      </div>
    );
  }

  return (
    <>
      {/* Conditionally render Navbar based on current route */}
      {!shouldHideNavbar && <Navbar />}

      {/* Routes */}
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <div className="home-page">
              {/* Hero Section */}
              <div className="hero-section">
                <HomeComponent user={user} handleDemoClick={handleDemoClick} />
              </div>

              {/* Main Content Section */}
              <div className="main-content-section">
                <section id="courses" className="courses-section">
                  <Courses />
                </section>

                <section id="study-materials" className="study-materials-section">
                  <StudyMaterial />
                </section>

                <section id="results" className="results-section">
                  <ViewResults />
                </section>
              </div>

              {/* Footer Section */}
              <footer className="footer-section">
                <section id="seeking-us" className="seeking-us-section">
                  <SeekingUs />
                </section>

                <section id="about-us" className="about-us-section">
                  <AboutUs />
                </section>

                <section id="contact-us" className="contact-us-section">
                  <ContactUs />
                </section>
              </footer>
            </div>
          }
        />

        {/* Authentication Routes */}
        <Route path="/auth-form" element={<AuthForm onClose={() => navigate("/")} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Standalone Pages */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/results" element={<ViewResults />} />
        <Route path="/about-us" element={<AboutUs />} />

        {/* Study Material Routes */}
        <Route path="/study-material" element={<StudyMaterial />} />
        <Route path="/study-material/ncert-books" element={<NcertBooks />} />
        <Route path="/quiz/:quizId" element={<StartQuiz />} />


        <Route 
          path="/study-material/type/:type" element={
            <ProtectedRoute>
              <StudyMaterialType />
            </ProtectedRoute>} />
            
        <Route 
          path="/start-quiz/:quizId" element={
            <ProtectedRoute>
              <StartQuiz />
            </ProtectedRoute>} />

        <Route 
          path="/leaderboard/:userName" element={
            <ProtectedRoute>
            <LeaderBoard />
          </ProtectedRoute>
          } />

        {/* Protected Routes */}
        <Route
          path="/study-material/ncert-solutions"
          element={
            
              <NcertSolutions />
          
          }
        />
        <Route
          path="/study-material/previous-questions"
          element={
            
              <PreviousYearQuestion />
       
          }
        />
        <Route
          path="/study-material/support-material"
          element={
            
              <SupportMaterial />
         
          }
        />

        {/* Contact Us Route */}
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/create-quiz" element={<Quiz />} />
        

        {/* Payment Verification */}
        <Route path="/payment" element={<PaymentPage />} />

        
        
      </Routes>
    </>
  );
};

export default App;
