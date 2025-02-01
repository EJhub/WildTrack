import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

const PersonalInformation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const idNumber = queryParams.get("id");

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!idNumber) {
        setError("ID number is missing from the URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/users/${idNumber}`);
        setUserInfo(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("Failed to fetch user information. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [idNumber]);

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();

    try {
      await axios.put("http://localhost:8080/api/users/change-password", {
        id: userInfo.id,
        currentPassword,
        newPassword,
      });

      // Password change successful
      alert("Password changed successfully!");
      handleCloseChangePasswordModal();
    } catch (error) {
      // Handle error
      console.error("Error changing password:", error);
      alert("Failed to change password. Please try again.");
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
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
          <br></br>
          <Paper
            sx={{
              backgroundColor: "rgba(120, 27, 27, 0.8)", // Transparent red with 80% opacity
              padding: 4,
              marginTop: "20px",
              borderRadius: 2,
              maxWidth: 400,
              width: "90%",
              height: "auto",
              textAlign: "center",
              boxShadow: "0px 8px 20px rgba(150, 33, 33, 0.8)", // Stronger, more prominent outer shadow
            }}
          >
            <Typography
              variant="h4"
              sx={{ color: "white", fontWeight: "bold", marginBottom: 2 }}
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
                border: "2px solid white",
                marginBottom: 2,
              }}
            />
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" sx={{color: "white", marginBottom: 1, textAlign: "left" }}>
                Name:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  padding: 1,
                  textAlign: "center",
                  width: "96%",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {userInfo.firstName} {userInfo.lastName}
              </Box>
            </Box>

            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" sx={{ color: "white", marginBottom: 1, textAlign: "left" }}>
                ID Number:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  padding: 1,
                  textAlign: "center",
                  width: "96%",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {userInfo.idNumber}
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, marginBottom: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", width: "45%" }}>
                <Typography variant="body1" sx={{ color: "white", marginBottom: 1, textAlign: "left" }}>
                  Grade Level:
                </Typography>
                <Box
                  component="div"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                    padding: 1,
                    textAlign: "center",
                    width: "90%",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {userInfo.grade}
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", width: "45%" }}>
                <Typography variant="body1" sx={{ color: "white", marginBottom: 1, textAlign: "left" }}>
                  Section:
                </Typography>
                <Box
                  component="div"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                    padding: 1,
                    textAlign: "center",
                    width: "90%",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {userInfo.section}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", marginBottom: 2 }}>
              <Typography variant="body1" sx={{ color: "white", marginBottom: 1, textAlign: "left" }}>
                Email:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                  padding: 1,
                  textAlign: "center",
                  width: "96%",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {userInfo.email}
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 2, alignItems: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column", width: "70%" }}>
                <Typography variant="body1" sx={{ color: "white", marginBottom: 1, textAlign: "left" }}>
                  Password:
                </Typography>
                <Box
                  component="div"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                    padding: 1,
                    textAlign: "center",
                    width: "90%",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  ******
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", marginLeft: 0 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleChangePassword}
                  sx={{
                    width: "140px",
                    height: "35px",
                    fontSize: "12px",
                    marginTop: "30px",
                    padding: "6px 16px",
                    marginLeft: "10px",
                  }}
                >
                  Change Pas...
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Modal open={showChangePasswordModal} onClose={handleCloseChangePasswordModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <form onSubmit={handleSubmitChangePassword}>
            <TextField
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
              Save New Password
            </Button>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default PersonalInformation;