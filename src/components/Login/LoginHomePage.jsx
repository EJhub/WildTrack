import React from "react";
import { Box, Typography, Button, Container, Grid, Paper, useMediaQuery, createTheme, ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoginNavBar from "./component/AppBar";

// Create a theme using the school's colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#BC383E", // Maroon from primary colors
      light: "#d15a5f",
      dark: "#8c2a2e",
    },
    secondary: {
      main: "#F8C400", // Yellow-orange from primary colors
      light: "#ffcf33",
      dark: "#c69b00",
    },
    background: {
      default: "#EBEBEB", // Light gray from primary colors
      paper: "#FFFFFF",   // White from primary colors
    },
    text: {
      primary: "#000000", // Black from primary colors
      secondary: "#781B1B", // Dark red from secondary colors
    },
    // Custom colors for different roles
    librarian: {
      main: "#610A0C", // Deep burgundy from secondary colors
      light: "#781B1B", // Dark red for hover
    },
    student: {
      main: "#F8C400", // Yellow-orange from primary colors
      light: "#FFDF16", // Bright yellow for hover
    },
    teacher: {
      main: "#AA8F0B", // Olive/gold from secondary colors
      light: "#DCC532", // Darker yellow/mustard for hover
    },
    checkin: {
      main: "#BC383E", // Maroon from primary colors
      light: "#d15a5f", // Lighter maroon for hover
    },
    checkout: {
      main: "#781B1B", // Dark red from secondary colors
      light: "#8a2020", // Lighter dark red for hover
    },
  },
  typography: {
    fontFamily: '"Libre Baskerville", "Garamond", "Times New Roman", serif',
    h2: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          textTransform: "none",
          fontWeight: 600,
          padding: "12px 24px",
          transition: "all 0.3s ease",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      },
    },
  },
});

function LogInHomepage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleNavigation = (role) => {
    if (role === "Librarian") {
      navigate("/librarian/Login");
    } else {
      navigate("/Login", { state: { role } });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* NavBar Component */}
        <LoginNavBar />

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            background: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.55)), url('CITU-GLE Building.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\" viewBox=\"0 0 200 200\"><path d=\"M0,100 L200,100 M100,0 L100,200\" stroke=\"%23FFDF16\" stroke-width=\"0.5\" opacity=\"0.03\"/></svg>')",
              pointerEvents: "none",
            }
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  mb: 2,
                }}
              >
                CIT-U Elementary Library Time Tracker
              </Typography>

              <Typography
                variant={isMobile ? "body1" : "h5"}
                sx={{
                  mb: 6,
                  maxWidth: "800px",
                  mx: "auto",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                Simplifying library access and time tracking for students and educators.
              </Typography>

              <Paper
                elevation={3}
                sx={{
                  maxWidth: "900px",
                  mx: "auto",
                  bgcolor: "rgba(255, 255, 255, 0.2)", // Transparent white background
                  backdropFilter: "blur(10px)",
                  p: { xs: 3, md: 5 },
                  mb: 6,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  position: "relative",
                  // Removed gradient line at the top
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ 
                    color: "#FFFFFF", // Changed to white
                    mt: 4, 
                    mb: 3, 
                    fontWeight: "bold",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                  }}
                >
                  Select Your Role
                </Typography>

                <Grid
                  container
                  spacing={3}
                  justifyContent="center"
                  sx={{ mb: 5 }}
                >
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#EBEBEB", // Gray background
                        color: "#BC383E", // Maroon text
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect x=\"0\" y=\"0\" width=\"100\" height=\"100\" fill=\"none\" stroke=\"%23BC383E\" stroke-width=\"1\" stroke-dasharray=\"5,5\" opacity=\"0.2\"/></svg>')",
                          opacity: 0.1,
                        },
                        "&:hover": { 
                          bgcolor: "#D6D6D6", // Slightly lighter gray on hover
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 12px rgba(188, 56, 62, 0.3)",
                        },
                        py: 1.8,
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,1)",
                        border: "1px solid #CCCCCC",
                        fontFamily: "Libre Baskerville, serif",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                      onClick={() => handleNavigation("Librarian")}
                    >
                      Librarian
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#EBEBEB", // Gray background 
                        color: "#BC383E", // Maroon text
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><line x1=\"0\" y1=\"0\" x2=\"100\" y2=\"100\" stroke=\"%23BC383E\" stroke-width=\"0.5\" opacity=\"0.1\"/><line x1=\"100\" y1=\"0\" x2=\"0\" y2=\"100\" stroke=\"%23BC383E\" stroke-width=\"0.5\" opacity=\"0.1\"/></svg>')",
                          opacity: 0.1,
                        },
                        "&:hover": { 
                          bgcolor: "#D6D6D6", // Slightly lighter gray on hover
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 12px rgba(188, 56, 62, 0.3)",
                        },
                        py: 1.8,
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,1)",
                        border: "1px solid #CCCCCC",
                        fontFamily: "Libre Baskerville, serif",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                      onClick={() => handleNavigation("Student")}
                    >
                      Student
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#EBEBEB", // Gray background
                        color: "#BC383E", // Maroon text
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"20\" viewBox=\"0 0 100 20\"><line x1=\"0\" y1=\"10\" x2=\"100\" y2=\"10\" stroke=\"%23BC383E\" stroke-width=\"0.5\" stroke-dasharray=\"8,4\" opacity=\"0.15\"/></svg>')",
                          opacity: 0.15,
                        },
                        "&:hover": { 
                          bgcolor: "#D6D6D6", // Slightly lighter gray on hover
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 12px rgba(188, 56, 62, 0.3)",
                        },
                        py: 1.8,
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,1)",
                        border: "1px solid #CCCCCC",
                        fontFamily: "Libre Baskerville, serif",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                      onClick={() => handleNavigation("Teacher")}
                    >
                      Teacher
                    </Button>
                  </Grid>
                </Grid>

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ 
                    color: "#FFFFFF", // Changed to white
                    mt: 4, 
                    mb: 3,
                    fontWeight: "bold",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                  }}
                >
                  Quick Access
                </Typography>

                <Grid
                  container
                  spacing={3}
                  justifyContent="center"
                >
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#EBEBEB", // Gray background
                        color: "#BC383E", // Maroon text
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><path d=\"M0,0 L120,120 M120,0 L0,120\" stroke=\"%23BC383E\" stroke-width=\"0.5\" opacity=\"0.1\"/><path d=\"M60,0 L60,120 M0,60 L120,60\" stroke=\"%23BC383E\" stroke-width=\"0.5\" opacity=\"0.1\"/></svg>')",
                          opacity: 0.1,
                        },
                        "&:hover": { 
                          bgcolor: "#D6D6D6", // Slightly lighter gray on hover
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 12px rgba(188, 56, 62, 0.3)",
                        },
                        py: 1.8,
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,1)",
                        border: "1px solid #CCCCCC",
                        fontFamily: "Libre Baskerville, serif",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                      onClick={() => navigate("/InputIn")}
                    >
                      Time In
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "#EBEBEB", // Gray background
                        color: "#BC383E", // Maroon text
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect x=\"0\" y=\"0\" width=\"50\" height=\"50\" fill=\"%23BC383E\" opacity=\"0.03\"/><rect x=\"50\" y=\"50\" width=\"50\" height=\"50\" fill=\"%23BC383E\" opacity=\"0.03\"/></svg>')",
                          opacity: 0.1,
                        },
                        "&:hover": { 
                          bgcolor: "#D6D6D6", // Slightly lighter gray on hover
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 12px rgba(188, 56, 62, 0.3)",
                        },
                        py: 1.8,
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,1)",
                        border: "1px solid #CCCCCC",
                        fontFamily: "Libre Baskerville, serif",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                      onClick={() => navigate("/InputOut")}
                    >
                      Time Out
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Container>
        </Box>

        {/* Removed footer as requested */}
      </Box>
    </ThemeProvider>
  );
}

export default LogInHomepage;