import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import to access query parameters
import axios from "axios"; // Import Axios for API calls
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";

const PersonalInformation = () => {
  const location = useLocation(); // Get the location object
  const queryParams = new URLSearchParams(location.search); // Parse query parameters
  const idNumber = queryParams.get("id"); // Extract the `id` parameter
  const [userInfo, setUserInfo] = useState(null); // State to hold user info
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!idNumber) {
        setError("ID number is missing from the URL.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8080/api/users/${idNumber}`);
        setUserInfo(response.data); // Set the fetched user data to state
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("Failed to fetch user information. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [idNumber]); // Re-run this effect whenever idNumber changes

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>; // Show a loading message while fetching data
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    ); // Show an error message if something goes wrong
  }

  return (
    <>
      <NavBar />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <Box
          sx={{
            flexGrow: 1,
            padding: 3,
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            sx={{
              backgroundColor: "rgba(139, 61, 61, 0.8)",
              padding: 4,
              borderRadius: 2,
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{ color: "#000", fontWeight: "bold", marginBottom: 2 }}
            >
              Personal Information
            </Typography>
            <Avatar
              alt={`${userInfo.firstName} ${userInfo.lastName}`}
              src="/path/to/image.png"
              sx={{
                width: 150,
                height: 150,
                borderRadius: "10px",
                margin: "auto",
                marginBottom: 2,
              }}
            />
            <Box sx={{ marginBottom: 2 }}>
              <Typography
                variant="body1"
                sx={{ color: "#000", marginBottom: 1, textAlign: "left" }}
              >
                Name:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  padding: 1,
                  textAlign: "center",
                  width: "100%",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {userInfo.firstName} {userInfo.lastName}
              </Box>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography
                variant="body1"
                sx={{ color: "#000", marginBottom: 1, textAlign: "left" }}
              >
                ID Number:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  padding: 1,
                  textAlign: "center",
                  width: "100%",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {userInfo.idNumber}
              </Box>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography
                variant="body1"
                sx={{ color: "#000", marginBottom: 1, textAlign: "left" }}
              >
                Grade Level:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  padding: 1,
                  textAlign: "center",
                  width: "100%",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {userInfo.grade}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default PersonalInformation;
