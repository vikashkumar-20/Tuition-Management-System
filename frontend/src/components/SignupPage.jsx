import React, { useState } from "react";
import axios from "axios";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { saveUserToFirestore } from "../firestoreService";
import { useNavigate, Link } from "react-router-dom";
import './SignupPage.css'

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

  const handleSendOtp = async () => {
    if (!formData.email) return setError("Please enter your email.");
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/otp/send-otp", {
        email: formData.email,
      });
      setOtpSent(true);
      alert("OTP sent to your email.");
    } catch {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      if (res.data.verified) {
        setOtpVerified(true);
        alert("OTP verified!");
      } else {
        setError("Invalid OTP.");
      }
    } catch {
      setError("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;
    if (!otpVerified) return setError("Please verify OTP.");
    if (!name || !email || !password || !confirmPassword)
      return setError("All fields are required.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });
      await saveUserToFirestore({
        uid: userCredential.user.uid,
        name,
        email,
      });

      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container" id="signup-container">
      <h2 className="signup-heading" id="signup-heading">Sign Up</h2>
      {error && <p className="signup-error" id="signup-error">{error}</p>}

      <form
        className="signup-form"
        id="signup-form"
        onSubmit={handleSignup}
      >
        <input
          className="signup-input"
          id="signup-name"
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          id="signup-email"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <button
          className="signup-button"
          id="send-otp-button"
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
              id="signup-otp"
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
            />
            <button
              className="signup-button"
              id="verify-otp-button"
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
          id="signup-password"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          id="signup-confirm-password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button
          className="signup-button"
          id="signup-submit-button"
          type="submit"
          disabled={!otpVerified || loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="signup-login-text" id="signup-login-text">
        Already have an account?{" "}
        <Link className="signup-login-link" id="signup-login-link" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
