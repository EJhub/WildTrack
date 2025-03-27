import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import api from "../../utils/api"; // Import the API utility instead of axios

const ForgotPassword = () => {
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setIdNumber(e.target.value);
    // Clear any error/success messages when the user types
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleCancel = () => {
    navigate("/login");
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!idNumber) {
      setError("Please enter your ID number");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if the user exists - use the API utility
      const userResponse = await api.get(`/users/${idNumber}`);
      
      if (userResponse.data) {
        // User exists, now create notification for librarians - use the API utility
        const notificationResponse = await api.post("/notifications/password-reset-request", {
          userId: userResponse.data.id,
          idNumber: idNumber,
          userName: `${userResponse.data.firstName} ${userResponse.data.lastName}`
        });
        
        setSuccess("Password reset request sent to librarian. You will be notified when your password is reset.");
        
        // Clear the form
        setIdNumber("");
      }
    } catch (err) {
      console.error("Error requesting password reset:", err);
      
      if (err.response?.status === 404) {
        setError("User not found. Please check your ID number and try again.");
      } else {
        setError("An error occurred while requesting password reset. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.blurBorder}>
          <div style={styles.loginBox}>
            <h2 style={styles.title}>Forgot Password</h2>
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            {success && <p style={{ color: "green", fontSize: "14px" }}>{success}</p>}
            <form onSubmit={handleRequestReset}>
              <h5 style={styles.label}>ID Number</h5>
              <input
                type="text"
                name="idNumber"
                placeholder="Enter your ID number"
                style={styles.input}
                value={idNumber}
                onChange={handleInputChange}
                disabled={isLoading || success}
              />
              <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '15px' }}>
                {!success ? (
                  <p style={{ color: '#666', fontSize: '13px' }}>
                    Enter your ID number and a notification will be sent to the librarian to reset your password.
                  </p>
                ) : (
                  <p style={{ color: '#666', fontSize: '13px' }}>
                    Please check with the librarian for your temporary password.
                  </p>
                )}
              </div>
              <div style={styles.buttonContainer}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={styles.cancelButton}
                  disabled={isLoading}
                >
                  {success ? "Login" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                  disabled={isLoading || success}
                >
                  {isLoading ? (
                    <CircularProgress size={20} style={{ color: "white" }} />
                  ) : (
                    "Request Reset"
                  )}
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
    marginBottom: "10px",
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
    backgroundColor: "#781B1B",     // Maroon color for Request Reset button
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default ForgotPassword;