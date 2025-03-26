import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import LoginNavBar from "./component/AppBar";
import { useNavigate } from "react-router-dom";

function LogInHomepage() {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    // Handle different redirections based on role
    if (role === "Librarian") {
      navigate("/librarian/Login");
    } else {
      // Both Student and Teacher go to /Login
      navigate("/Login", { state: { role } }); // Still pass role as state
    }
  };

  return (
    <>
      <LoginNavBar />
      <Box
        sx={{
          position: "relative",
          backgroundImage: `url('CITU-GLE Building.png')`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          width: "100vw",
          height: "100vh",
          display: "flex",
          marginTop: "-6px",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          filter: "brightness(0.8) contrast(1.5) saturate(1.1)",
          "::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            position: "relative",
            zIndex: 2,
            padding: 2,
            marginTop: 50,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: "80px", fontWeight: "bold" }}
          >
            CIT-U Elementary Library Time Tracker
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: "35px", marginTop: -5 }}
          >
            Simplifying library access and time tracking for students and
            educators.
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Box
                sx={{
                  backgroundColor: "#f44336",
                  padding: 1,
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => handleNavigation("Librarian")}
              >
                <Typography variant="button" color="white">
                  Librarian
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box
                sx={{
                  backgroundColor: "#2196f3",
                  padding: 1,
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => handleNavigation("Student")}
              >
                <Typography variant="button" color="white">
                  Student
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box
                sx={{
                  backgroundColor: "#4caf50",
                  padding: 1,
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => handleNavigation("Teacher")}
              >
                <Typography variant="button" color="white">
                  Teacher
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Added Quick Access buttons for InputIn and InputOut */}
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Access
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Box
                  sx={{
                    backgroundColor: "#ff9800", // Orange
                    padding: 1,
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/InputIn")}
                >
                  <Typography variant="button" color="white">
                    Check In
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    backgroundColor: "#9c27b0", // Purple
                    padding: 1,
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/InputOut")}
                >
                  <Typography variant="button" color="white">
                    Check Out
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default LogInHomepage;