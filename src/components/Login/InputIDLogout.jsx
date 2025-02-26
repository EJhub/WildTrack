import React, { useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  TextField,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Container,
  Paper,
  Grid,
} from "@mui/material";
import LoginNavBar from "./component/AppBar";
import axios from "axios";

function InputIDLogout() {
  const [idInput, setIdInput] = useState("");
  const [studentDetails, setStudentDetails] = useState({
    name: "John Doe",
    idNumber: "24-1234-213",
    grade: "6",
    section: "Hope",
    date: "October 22, 2024",
    timeOut: "8:23:08 AM",
    profilePictureUrl: null,
  });
  const [error, setError] = useState(null);
  const [recentLogouts, setRecentLogouts] = useState([]);

  const handleInputChange = (e) => {
    setIdInput(e.target.value);
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      try {
        // Call backend API with the entered ID Number for time-out
        const response = await axios.post("http://localhost:8080/api/time-out", { idNumber: idInput });

        const { student } = response.data;

        const currentTime = new Date();
        const timeOut = response.data.timeOut || currentTime.toLocaleTimeString();
        const date = response.data.date || currentTime.toLocaleDateString();

        // Create student details object
        const newStudentDetails = {
          name: `${student.firstName} ${student.lastName || ""}`,
          idNumber: student.idNumber,
          grade: student.grade || "",
          section: student.section || "",
          date: date,
          timeOut: timeOut,
          profilePictureUrl: student.profilePictureUrl,
        };

        // Update the displayed student details
        setStudentDetails(newStudentDetails);

        // Add to recent logouts (at the beginning)
        setRecentLogouts(prevLogouts => {
          // Create a new array with the current student at the beginning
          const updatedLogouts = [
            {
              ...student,
              timeOut: timeOut,
            },
            ...prevLogouts
          ];
          
          // Keep only the most recent 5 logouts
          return updatedLogouts.slice(0, 5);
        });

        setError(null);
        setIdInput(""); // Clear the input field
      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data?.error || "Student not found. Please check the ID number.");
      }
    }
  };

  // Get full image URL with base path if needed
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <LoginNavBar />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "url(/Tapin%20Background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          margin: -0.75,
          padding: 0,
          pt: { xs: 4, md: 8 },
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            marginTop: -20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              width: "100%",
              maxWidth: 1000,
              height: 400,
              borderRadius: "2%",
              overflow: "hidden",
              padding: 3,
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.85 ) 0%, rgba(253, 253, 253, 0.85) 100%)",
              position: "relative",
              ":before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "5%",
                backgroundColor: "rgba(120, 27, 27, 0.9)",
              },
              ":after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "5%",
                backgroundColor: "rgba(120, 27, 27, 0.9)",
              },
            }}
          >
            
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mr: { md: 3 },
                mb: { xs: 3, md: 0 },
                width: { xs: "100%", md: "30%" },
                height: "100%",
              }}
            >
             <Avatar
                src={getFullImageUrl(studentDetails.profilePictureUrl)}
                alt={studentDetails.name}
                sx={{
                  bgcolor: "white",
                  width: { xs: 180, md: 220 },
                  height: { xs: 220, md: 280 },
                  border: "2px solid #333",
                  borderRadius: 2,
                  position: "relative",
                  top: -15,
                }}
              >
                {!studentDetails.profilePictureUrl && <PersonIcon sx={{ fontSize: 80, color: "#333" }} />}
              </Avatar>
            </Box>
            <Box sx={{ 
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
              <Grid container spacing={2} sx={{ height: "100%" }}>
                <Grid item xs={12} md={5} sx={{ height: "100%" }}>
                  <Box 
                    sx={{ 
                      color: "white", 
                      textAlign: "left", 
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      pt: 6
                    }}
                  >
                    <Box sx={{ flex: "0 0 auto" }}>
                      <TextField
                        variant="outlined"
                        placeholder="Input your ID Number"
                        value={idInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        fullWidth
                        sx={{
                          mb: 2,
                          bgcolor: "#FFFFFF",
                          border: "1px solid black", 
                          borderRadius: "10px",
                        }}
                        
                        InputProps={{
                          sx: {
                            height: 45,
                          },
                        }}
                      />
                      {error && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          {error}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ flex: "1 1 auto", overflow: "hidden" }}>
                      <Typography variant="body1" sx={{ color: "black" }}>
                        <strong>Name:</strong> {studentDetails.name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "black" }}>
                        <strong>ID Number:</strong> {studentDetails.idNumber}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "black" }}>
                        <strong>Grade Level & Section:</strong> {studentDetails.grade} - {studentDetails.section}
                      </Typography>
                      <Box sx={{ my: 3 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, color: "black" }}>
                        TIME OUT
                      </Typography>
                      <Typography variant="body2" sx={{ color: "black" }}>
                        <strong>Date:</strong> {studentDetails.date}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "black" }}>
                        <strong>Time Out:</strong> {studentDetails.timeOut}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={7} sx={{ height: "100%" }}>
                  <Box sx={{ 
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    pl: { md: 2 }
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: "black" }}>
                      Recent Logouts
                    </Typography>
                    <List sx={{ 
                      flex: 1,
                      overflow: 'auto', 
                      height: 260,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      width: "100%"
                    }}>
                      {recentLogouts.length > 0 ? (
                        recentLogouts.map((student, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              padding: 1,
                              border: "1px solid #333",
                              borderRadius: 1,
                              mb: 1,
                              mx: 1,
                              display: "flex",
                              backgroundColor: "white",
                              boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
                              alignItems: "center",
                              width: "calc(100% - 16px)",
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                src={getFullImageUrl(student.profilePictureUrl)} 
                                sx={{ bgcolor: "#ccc" }} 
                              >
                                {!student.profilePictureUrl && <PersonIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight="bold">
                                  {student.idNumber}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" noWrap>{`${student.firstName} ${student.lastName || ""}`}</Typography>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {`${student.grade || ""} - ${student.section || ""}`}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                          No recent logouts
                        </Typography>
                      )}
                    </List>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default InputIDLogout;