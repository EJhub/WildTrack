import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api"; // Import the custom API utility
import { AuthContext } from "../AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CircularProgress } from "@mui/material";

const Login = () => {
  const [credentials, setCredentials] = useState({ idNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Add global event listener for Enter key - similar to InputIdLogin component
  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      if (e.key === "Enter" || e.keyCode === 13) {
        handleLogin(e);
      }
    };

    // Add the event listener when component mounts
    document.addEventListener("keydown", handleGlobalKeyPress);

    // Cleanup the event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [credentials]); // Re-attach when credentials changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Multiple event handlers for redundancy (similar to InputIdLogin)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent any default behavior
      handleLogin(e);
    }
  };
  
  // Backup handler using keyCode for older browsers/environments
  const handleKeyUp = (e) => {
    if (e.keyCode === 13 || e.key === "Enter") {
      e.preventDefault();
      handleLogin(e);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    setError(null);

    try {
      // 1. Make login request to get authentication token
      const response = await api.post("/login", {
        idNumber: credentials.idNumber,
        password: credentials.password,
      });

      const { token, role, idNumber, requirePasswordChange, userId } = response.data;
      
      // If it's a librarian, redirect to librarian login
      if (role === "Librarian") {
        setError("Please use the Librarian Login page");
        setIsLoading(false);
        setTimeout(() => {
          navigate("/librarian/Login");
        }, 1500);
        return;
      }

      // 2. Store auth data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("idNumber", idNumber);
      
      // Store the password reset requirement flag if present
      if (requirePasswordChange) {
        localStorage.setItem("requirePasswordChange", "true");
        localStorage.setItem("userId", userId || "");
      }

      // 3. Configure api to use the token for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 4. Wait for the login context to be fully updated
      // This is critical - we need to await this
      await login({ token, role, idNumber, requirePasswordChange, userId });

      // 5. Check if password change is required
      if (requirePasswordChange) {
        navigate("/change-password", { 
          state: { 
            fromReset: true,
            userId: userId || ""
          } 
        });
      } else {
        // Navigate to the appropriate dashboard based on role
        if (role === "Student") {
          navigate(`/studentDashboard/TimeRemaining`);
        } else if (role === "Teacher") {
          navigate("/TeacherDashboard/Home");
        } else if (role === "NAS") {
          navigate("/nasDashboard/Home");
        } else {
          throw new Error("Invalid role returned from the server.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle specific error cases
      if (err.response?.data?.error === "temporary_password_incorrect") {
        setError(err.response.data.message || "Please request the temporary password from the Librarian.");
      } else if (err.response?.data?.error === "invalid_credentials") {
        setError("Incorrect ID Number or Password");
      } else if (err.response?.status === 404) {
        setError("User not found. Please check your ID Number.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again.");
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
            <h2 style={styles.title}>Sign in</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            <form onSubmit={handleLogin}>
              <input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                autoComplete="username"
                style={styles.input}
                value={credentials.idNumber}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                disabled={isLoading}
              />
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  style={styles.input}
                  value={credentials.password}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  disabled={isLoading}
                />
                {
                (credentials.password || showPassword) && (
                  <button
                    type="button"
                    style={styles.iconButton}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <span style={{ color: credentials.password ? "#007bff" : "#A9A9A9" }}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </button>
                )}
              </div>
              <div style={{ ...styles.links, marginTop: "-10px", marginRight: "-200px" }}>
                <a href="/ResetPassword" style={styles.link}>Forgot Password?</a>
              </div>
              <br />
              <button 
                type="submit" 
                style={styles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} style={{ color: "white" }} />
                ) : (
                  "Sign in"
                )}
              </button>
              <p>
                <span style={{ color: 'black' }}>Don't have an account? </span>
                <a href="/register" style={styles.link}>Sign up</a>
              </p>
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
  input: {
    width: "90%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  iconButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "16px",
  },
  signInButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#781B1B",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center", 
    height: "42px",
  },
  links: {
    marginTop: "15px",
    fontSize: "14px",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
};

export default Login;