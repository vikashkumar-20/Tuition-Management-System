import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";

// Components
import AdminRoute from "./components/admin/AdminRoute";
import NotFound from "./components/NotFound"
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Navbar from "./components/Navbar";
import HomeComponent from "./components/HomeComponent";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import Courses from "./components/Courses";
import StudyMaterial from "./components/StudyMaterial";
import ViewResults from "./components/ViewResults";
import SeekingUs from "./components/SeekingUs";
import AboutUs from "./components/About";
import NcertBooks from "./components/NcertBooks";
import PreviousYearQuestion from "./components/PreviousYearQuestions";
import SupportMaterial from "./components/SupportMaterial";
import StudyMaterialType from "./components/StudyMaterialType";
import AdminPanel from "./components/admin/AdminPanel";
import NcertSolutions from "./components/NcertSolutions";
import ContactUs from "./components/Footer";
import AuthForm from "./components/AuthForm";
import Quiz from "./components/admin/CreateQuiz";
import StartQuiz from "./components/StartQuiz";
import LeaderBoard from "./components/LeaderBoard";
import PaymentPage from "./components/PaymentPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// ✅ Layouts
const WithNavbar = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const WithoutNavbar = ({ children }) => <>{children}</>;

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDemoClick = useCallback(() => {
    navigate("/auth-form");
  }, [navigate]);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <p>Loading, please wait...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Routes with Navbar */}
      <Route
        path="/"
        element={
          <WithNavbar>
            <div className="container">
              {/* Hero Section */}
              <div className="hero-section">
                <HomeComponent user={user} handleDemoClick={handleDemoClick} />
              </div>

              {/* Main Content */}
              <div className="main-content-section">
                <section id="courses">
                  <Courses />
                </section>
                <section id="study-materials">
                  <StudyMaterial />
                </section>
                <section id="results">
                  <ViewResults />
                </section>
              </div>

              {/* Footer */}
              <footer>
                <section id="seeking-us">
                  <SeekingUs />
                </section>
                <section id="about-us">
                  <AboutUs />
                </section>
                <section id="contact-us">
                  <ContactUs />
                </section>
              </footer>
            </div>
          </WithNavbar>
        }
      />

      <Route
        path="/courses"
        element={
          <WithNavbar>
            <Courses />
          </WithNavbar>
        }
      />
      <Route
        path="/results"
        element={
          <WithNavbar>
            <ViewResults />
          </WithNavbar>
        }
      />
      <Route
        path="/about-us"
        element={
          <WithNavbar>
            <AboutUs />
          </WithNavbar>
        }
      />
      <Route
        path="/contact-us"
        element={
          <WithNavbar>
            <ContactUs />
          </WithNavbar>
        }
      />

      {/* Study Material */}
      <Route
        path="/study-material"
        element={
          <WithNavbar>
            <StudyMaterial />
          </WithNavbar>
        }
      />
      <Route path="/study-material/ncert-books" element={<WithoutNavbar><NcertBooks /></WithoutNavbar>} />
      <Route
        path="/study-material/ncert-solutions"
        element={
          <ProtectedRoute>
            <NcertSolutions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study-material/previous-questions"
        element={
          <ProtectedRoute>
            <PreviousYearQuestion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study-material/support-material"
        element={
          <ProtectedRoute>
            <SupportMaterial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study-material/type/:type"
        element={
          <ProtectedRoute>
            <StudyMaterialType />
          </ProtectedRoute>
        }
      />

      {/* Auth Pages (No Navbar) */}
      <Route path="/auth-form" element={<WithoutNavbar><AuthForm onClose={() => navigate("/")} /></WithoutNavbar>} />
      <Route path="/login" element={<WithoutNavbar><LoginPage /></WithoutNavbar>} />
      <Route path="/signup" element={<WithoutNavbar><SignupPage /></WithoutNavbar>} />


      {/* Quiz & Leaderboard */}
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <StartQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:userName"
        element={
          <ProtectedRoute>
            <LeaderBoard />
          </ProtectedRoute>
        }
      />
      {/* Consider removing /quiz/:quizId if not needed */}

      {/* Admin Panel (No Navbar) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <WithoutNavbar>
              <AdminPanel />
            </WithoutNavbar>
          </AdminRoute>
        }
      />
      <Route path="/create-quiz" element={<WithoutNavbar><Quiz /></WithoutNavbar>} />

      {/* Payment (No Navbar) */}
      <Route path="/payment" element={<WithoutNavbar><PaymentPage /></WithoutNavbar>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
