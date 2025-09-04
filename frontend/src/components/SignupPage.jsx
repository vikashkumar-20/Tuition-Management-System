import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { saveUserToFirestore } from "../firestoreService";
import { useNavigate, Link } from "react-router-dom";
import API from "../api"; // make sure path is correct
import './SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!formData.email) return setError("Please enter your email.");
    try {
      setLoading(true);
      await API.post("/otp/send-otp", { email: formData.email });
      setOtpSent(true);
      setOtpVerified(false); // Reset OTP verified if resent
      alert("OTP sent to your email.");
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!formData.otp) return setError("Please enter the OTP.");
    try {
      setLoading(true);
      const res = await API.post("/otp/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      if (res.data.verified || res.data.success) {
        setOtpVerified(true);
        alert("OTP verified successfully!");
      } else {
        setOtpVerified(false);
        setError(res.data.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpVerified(false);
      setError("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Signup after OTP verified
  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!otpVerified) return setError("Please verify OTP before signing up.");
    if (!name || !email || !password || !confirmPassword)
      return setError("All fields are required.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      setLoading(true);
      const auth = getAuth();

      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(userCredential.user, { displayName: name });

      // Save user info in Firestore
      await saveUserToFirestore({
        uid: userCredential.user.uid,
        name,
        email,
      });

      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-heading">Sign Up</h2>
      {error && <p className="signup-error">{error}</p>}

      <form className="signup-form" onSubmit={handleSignup}>
        <input
          className="signup-input"
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <button
          className="signup-button"
          type="button"
          onClick={handleSendOtp}
          disabled={loading}
        >
          {otpSent ? "Resend OTP" : "Send OTP"}
        </button>

        {otpSent && !otpVerified && (
          <>
            <input
              className="signup-input"
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
            />
            <button
              className="signup-button"
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              Verify OTP
            </button>
          </>
        )}

        <input
          className="signup-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button
          className="signup-button"
          type="submit"
          disabled={!otpVerified || loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="signup-login-text">
        Already have an account?{" "}
        <Link className="signup-login-link" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
