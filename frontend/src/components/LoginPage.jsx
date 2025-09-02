import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [step, setStep] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "", otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if ((step === "otp" || step === "reset") && resendDisabled) {
      if (resendTimer > 0) {
        timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      } else {
        setResendDisabled(false);
      }
    }
    return () => clearTimeout(timer);
  }, [resendTimer, resendDisabled, step]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLoginWithPassword = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      await axios.post("http://localhost:5000/api/otp/send-otp", { email: formData.email });
      setStep("otp");
      setResendDisabled(true);
      setResendTimer(30);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") setError("No user found.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else if (err.code === "auth/too-many-requests") setError("Too many attempts. Please try again later.");
      else setError("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      if (res.data.verified) {
        alert("Login successful!");
        navigate("/");
      } else {
        setError("Invalid OTP.");
      }
    } catch {
      setError("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/otp/send-otp", { email: formData.email });
      setStep("reset");
      setResendDisabled(true);
      setResendTimer(30);
      setError("");
    } catch {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/otp/update-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      if (res.data.success) {
        alert("Password reset successful!");
        setStep("login");
      } else {
        setError("Invalid OTP or failed reset.");
      }
    } catch {
      setError("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendDisabled(true);
      setResendTimer(30);
      await axios.post("http://localhost:5000/api/otp/send-otp", { email: formData.email });
    } catch {
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div id="login-container" className="login-container">
      <h2 id="login-heading">
        {step === "login"
          ? "Login"
          : step === "forgot"
          ? "Forgot Password"
          : step === "reset"
          ? "Reset Password"
          : "Enter OTP"}
      </h2>

      {error && <p id="login-error" className="error-text">{error}</p>}

      <form id="login-form">
        {step === "login" && (
          <>
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              className="login-input"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <button className="login-button" type="button" onClick={handleLoginWithPassword} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="forgot-link" onClick={() => setStep("forgot")}>
              Forgot Password?
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <input
              className="login-input"
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
            />
            <button className="login-button" type="button" onClick={handleOtpVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button className="login-button" type="button" onClick={handleResendOtp} disabled={resendDisabled}>
              {resendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </>
        )}

        {step === "forgot" && (
          <>
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
            />
            <button className="login-button" type="button" onClick={handleForgotPassword} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <input
              className="login-input"
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
            />
            <input
              className="login-input"
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <button className="login-button" type="button" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button className="login-button" type="button" onClick={handleResendOtp} disabled={resendDisabled}>
              {resendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </>
        )}
      </form>

      <p id="login-signup-text">
        Don’t have an account?{" "}
        <a id="login-signup-link" href="/signup">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
