import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext"; // Ensure you have an AuthContext setup

const ForgotPassword = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // New state for success message
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Access AuthContext for user login

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/reset-password", {
        email: credentials.username, // Send the email for reset
      });

      if (response.status === 200) {
        setSuccess("Password reset request is successful. Please check your email to verify and change your password.");
        setTimeout(() => navigate("/login"), 5000); // Redirect after 5 seconds
      }
    } catch (err) {
      console.error("Reset Password error:", err.response?.data || err);

      setError(err.response?.data?.error || "Failed to reset password. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/Login"); // Redirect to home page or any other page
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.blurBorder}>
          <div style={styles.loginBox}>
            <h2 style={styles.title}>Forgot Password</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>} {/* Display success message */}
            <form onSubmit={handleLogin}>
              <h5 style={styles.label}>Email</h5>
              <input
                type="text"
                name="username"
                placeholder="@cit.edu"
                autoComplete="username"
                style={styles.input}
                value={credentials.username}
                onChange={handleInputChange}
              />
              <div style={styles.buttonContainer}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  background: {
    position: "relative",
    backgroundImage: `url('CITU-GLE Building.png')`,
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    filter: "brightness(0.8) contrast(1.5) saturate(1.1)",
  },
  container: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  blurBorder: {
    width: "320px",
    padding: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    boxShadow: `
      0px 0px 15px 5px rgba(255, 255, 255, 0.2),
      0px 0px 20px 5px rgba(255, 255, 255, 0.2),
      0px 0px 25px 10px rgba(255, 255, 255, 0.2)`,
    textAlign: "center",
  },
  loginBox: {
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "25px",
  },
  label: {
    textAlign: "left",
    color: "black",
    marginBottom: "5px",
    fontSize: "14px",
    marginLeft: "6px",
  },
  input: {
    width: "90%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid black",
    fontSize: "16px",
  },
  buttonContainer: {
    display: "flex",                // Enables flexbox layout
    justifyContent: "space-between", // Distributes buttons evenly with space between
    width: "100%",                  // Ensure the container spans the full width
    gap: "10px",                    // Adds space between the buttons
  },
  cancelButton: {
    width: "48%",                   // Set button width to allow them to fit side by side
    padding: "10px",
    backgroundColor: "#FFDF16",     // Yellow color for Cancel button
    color: "black",
    border: "none",                 // Removes the border
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  
  submitButton: {
    width: "48%",                   // Set button width to allow them to fit side by side
    padding: "10px",
    backgroundColor: "#781B1B",     // Blue color for Reset Password button  
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ForgotPassword;
