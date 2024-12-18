import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext"; // Ensure AuthContext is properly set up

const Login = () => {
  const [credentials, setCredentials] = useState({ idNumber: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Context to handle global login state

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        idNumber: credentials.idNumber, // Send idNumber instead of email
        password: credentials.password,
      });

      // Extract the token and user role
      const { token, role, idNumber } = response.data;

      // Save credentials to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("idNumber", idNumber);

      // Update AuthContext
      login({ token, role, idNumber });

      // Redirect based on user role
      if (role === "Student") {
        navigate(`/studentDashboard/TimeRemaining?id=${idNumber}`);
      } else if (role === "Librarian") {
        navigate("/librarianDashboard");
      } else if (role === "Teacher") {
        navigate("/TeacherDashboard/Home");
      } else if (role === "NAS") {
        navigate("/nasDashboard/Home");
      } else {
        throw new Error("Invalid role returned from the server.");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.blurBorder}>
          <div style={styles.loginBox}>
            <h2 style={styles.title}>Sign in</h2>
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            <form onSubmit={handleLogin}>
              {/* ID Number Input */}
              <input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                autoComplete="username"
                style={styles.input}
                value={credentials.idNumber}
                onChange={handleInputChange}
              />
              {/* Password Input */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                style={styles.input}
                value={credentials.password}
                onChange={handleInputChange}
              />
              {/* Sign-in Button */}
              <button type="submit" style={styles.signInButton}>
                Sign in
              </button>
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
    backgroundImage: `url('CITU-GLE Building.png')`, // Replace with your image path
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    filter: "brightness(0.85)",
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
    boxShadow: `0px 0px 15px 5px rgba(0, 0, 0, 0.1)`,
    textAlign: "center",
  },
  loginBox: {
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  input: {
    width: "90%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  signInButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
};

export default Login;
