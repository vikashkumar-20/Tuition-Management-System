import React, { useState } from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const AuthForm = ({ onClose }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    motherName: "",
    class: "",
    mobile: "",
    email: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [hasError, setHasError] = useState({
    name: false,
    motherName: false,
    class: false,
    mobile: false,
    email: false,
    address: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setHasError((prev) => ({ ...prev, [e.target.name]: false }));
  };

  const handleClear = () => {
    setFormData({
      name: "",
      motherName: "",
      class: "",
      mobile: "",
      email: "",
      address: "",
    });
    setError("");
    setHasError({
      name: false,
      motherName: false,
      class: false,
      mobile: false,
      email: false,
      address: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const errors = {
      name: !formData.name,
      motherName: !formData.motherName,
      class: !formData.class,
      mobile: !formData.mobile,
      email: !formData.email,
      address: !formData.address,
    };
    setHasError(errors);
  
    if (Object.values(errors).some((field) => field)) {
      setError("Please fill in all the fields before submitting.");
      return;
    }
  
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      setError("Name should not contain numbers.");
      setHasError((prev) => ({ ...prev, name: true }));
      return;
    }
  
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Mobile number must be exactly 10 digits.");
      setHasError((prev) => ({ ...prev, mobile: true }));
      return;
    }
  
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setHasError((prev) => ({ ...prev, email: true }));
      return;
    }
  
    // ✅ Send data to backend
    try {
      const response = await fetch("http://localhost:5000/api/demo-booking/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.message || "Form submitted successfully!");
        handleClear();
        onClose(); // ✅ Close the modal
        navigate("/"); // ✅ Navigate to home
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Server error. Please try again later.");
    }
  };
  

  return (
    <div className="auth-container">
      <div className="close-icon-container" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} className="close-icon" />
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Book Your Demo Class</h1>

        <label>Enter your name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={hasError.name ? "input-error" : ""}
        />

        <label>Enter your mother's name:</label>
        <input
          type="text"
          name="motherName"
          value={formData.motherName}
          onChange={handleChange}
          className={hasError.motherName ? "input-error" : ""}
        />

        <label>Class:</label>
        <select
          name="class"
          value={formData.class}
          onChange={handleChange}
          className={hasError.class ? "input-error" : ""}
        >
          <option value="">Select option</option>
          <option value="11th">11th</option>
          <option value="12th">12th</option>
          <option value="DU - Sol">DU - Sol</option>
          <option value="IGNOU">IGNOU</option>
          <option value="NIOS">NIOS</option>
        </select>

        <label>Enter your mobile number:</label>
        <input
          type="number"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          className={hasError.mobile ? "input-error" : ""}
        />

        <label>Enter your email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={hasError.email ? "input-error" : ""}
        />

        <label>Enter your address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={hasError.address ? "input-error" : ""}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="auth-actions">
          <button type="button" onClick={handleClear}>
            Clear
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
