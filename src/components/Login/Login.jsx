import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [credentials, setCredentials] = useState({ idNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        idNumber: credentials.idNumber,
        password: credentials.password,
      });

      const { token, role, idNumber } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("idNumber", idNumber);

      login({ token, role, idNumber });

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
      console.error("Login error:", err.response?.data || err);

      if (err.response?.data?.error === "Invalid credentials") {
        setError("Incorrect ID Number or Password");
      } else if (err.response?.status === 404) {
        setError("User not found. Please check your ID Number.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again.");
      }
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
                />
                {
                (credentials.password || showPassword) && (
                  <button
                    type="button"
                    style={styles.iconButton}
                    onClick={() => setShowPassword(!showPassword)}
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
              <button type="submit" style={styles.signInButton}>Sign in</button>
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