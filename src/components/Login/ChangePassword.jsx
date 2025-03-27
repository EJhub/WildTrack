import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { CircularProgress } from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../utils/api"; // Import the API utility instead of axios

const ChangePassword = () => {
  const { user, clearPasswordResetRequired } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Check if this is from a reset flow
  const isFromReset = location.state?.fromReset === true || localStorage.getItem("requirePasswordChange") === "true";
  const userId = location.state?.userId || user?.id || localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Log debug info when component mounts
    console.log("ChangePassword mounted:", {
      isFromReset,
      userId,
      locationState: location.state,
      user: user ? "User is logged in" : "No user in context"
    });
    
    // If not authenticated and not from reset, redirect to login
    if (!user && !isFromReset && !userId) {
      console.log("No authentication context, redirecting to login");
      navigate("/login");
    }
  }, [user, navigate, isFromReset, userId, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear messages when form changes
    setError(null);
    setSuccess(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const validatePassword = () => {
    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }

    // Check if new password is strong enough
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!validatePassword()) {
      setIsLoading(false);
      return;
    }

    try {
      const requestData = {
        id: userId,
        // If coming from reset, we may skip the current password check on the server
        currentPassword: isFromReset ? "resetflow" : formData.currentPassword,
        newPassword: formData.newPassword,
      };

      console.log("Submitting password change:", {
        userId,
        isFromReset,
        hasCurrentPassword: !!requestData.currentPassword,
      });

      // Use the api utility instead of direct axios call with hardcoded URL
      const response = await api.put("/users/change-password", requestData);

      console.log("Password change response:", response.data);
      setSuccess("Password changed successfully!");
      
      // Clear the requirePasswordChange flag in localStorage and context
      localStorage.removeItem("requirePasswordChange");
      localStorage.removeItem("userId");
      
      // Clear the flag in AuthContext
      if (clearPasswordResetRequired) {
        clearPasswordResetRequired();
      }
      
      // After successful change, redirect to dashboard after a short delay
      setTimeout(() => {
        const role = user?.role || localStorage.getItem("role");
        if (role === "Student") {
          navigate("/studentDashboard/TimeRemaining");
        } else if (role === "Teacher") {
          navigate("/TeacherDashboard/Home");
        } else if (role === "NAS") {
          navigate("/nasDashboard/Home");
        } else if (role === "Librarian") {
          navigate("/librarian/Dashboard");
        } else {
          navigate("/login");
        }
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err.response?.data || err);
      
      setError(
        err.response?.data?.error ||
          "An error occurred while changing your password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {isFromReset ? "Set New Password" : "Change Password"}
        </h2>
        
        {error && <p style={styles.errorText}>{error}</p>}
        {success && <p style={styles.successText}>{success}</p>}
        
        <form onSubmit={handleSubmit}>
          {!isFromReset && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password</label>
              <div style={styles.passwordField}>
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  style={styles.eyeButton}
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.passwordField}>
              <input
                type={showPassword.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                style={styles.eyeButton}
              >
                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.passwordField}>
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                style={styles.eyeButton}
              >
                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} style={{ color: "white" }} />
            ) : (
              "Save New Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    backgroundImage: `url('CITU-GLE Building.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    padding: "30px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  passwordField: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#555",
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#781B1B",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "45px",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
  },
  successText: {
    color: "green",
    textAlign: "center",
    marginBottom: "15px",
  },
};

export default ChangePassword;