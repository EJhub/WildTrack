import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  CircularProgress,
  Alert,
  Container
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined,
  Person
} from "@mui/icons-material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

const LibrarianLogin = () => {
  const [credentials, setCredentials] = useState({ idNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (error) setError(null);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Clone the axios instance to use without interceptors for this request
      const axiosInstance = axios.create();
      
      // Login request using custom instance
      const response = await axiosInstance.post("http://localhost:8080/api/login", {
        idNumber: credentials.idNumber,
        password: credentials.password,
      });

      const { token, role, idNumber } = response.data;

      // Validate that the user is a librarian
      if (role !== "Librarian") {
        setError("Access denied. This login is for librarians only.");
        setIsLoading(false);
        return;
      }

      // Store auth data 
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("idNumber", idNumber);

      // Configure axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update auth context
      await login({ token, role, idNumber });

      // Navigate to librarian dashboard
      navigate("/librarian/Home");
    } catch (err) {
      console.error("Login error:", err.response?.data || err);

      // Prevent any redirects from the interceptors
      e.preventDefault();
      e.stopPropagation();

      if (err.response?.data?.error === "Invalid credentials") {
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/library-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              width: "100%",
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%)",
              border: "1px solid #CD6161",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(to bottom, #CD6161, #8B3D3D)",
                  mb: 2,
                }}
              >
                <LibraryBooksIcon sx={{ fontSize: 40, color: "#FFD700" }} />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#8B3D3D",
                  textAlign: "center",
                }}
              >
                Librarian Access
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  textAlign: "center",
                  mt: 1,
                }}
              >
                Sign in to access the Library Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="idNumber"
                label="Librarian ID"
                name="idNumber"
                autoComplete="username"
                autoFocus
                value={credentials.idNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#8B3D3D" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#8B3D3D",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#8B3D3D",
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleInputChange}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "#8B3D3D" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#8B3D3D",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#8B3D3D",
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 1,
                }}
              >
                <Link
                  to="/ResetPassword"
                  style={{
                    color: "#8B3D3D",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: "linear-gradient(to bottom, #CD6161, #8B3D3D)",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": {
                    background: "linear-gradient(to bottom, #B85454, #7A3030)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <Box
              sx={{
                display: "flex", 
                justifyContent: "space-between",
                mt: 2,
                borderTop: "1px solid #ddd",
                pt: 2,
              }}
            >
              <Link
                to="/login"
                style={{
                  color: "#8B3D3D",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                Back to main login
              </Link>
              
              <Typography variant="body2" color="text.secondary">
                Need help? Contact{" "}
                <Link
                  to="/contact"
                  style={{
                    color: "#8B3D3D",
                    textDecoration: "none",
                  }}
                >
                  IT Support
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LibrarianLogin;