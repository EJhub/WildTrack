import React, { useEffect, useState, useContext } from "react";
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
import IconButton from "@mui/material/IconButton";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../AuthContext"; // Import AuthContext

const PersonalInformation = () => {
  // Get user information from AuthContext
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    // Only fetch user info once authentication is complete
    if (!authLoading) {
      fetchUserInfo();
    }
  }, [authLoading, user]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!isAuthenticated || !user || !user.idNumber) {
        setError("Unauthorized access. Please log in.");
        setLoading(false);
        return;
      }
  
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/users/${user.idNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserInfo(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Handle unauthorized error
        window.location.href = '/login'; // Redirect to login if session expired
      } else {
        console.error("Error fetching user info:", err);
        setError("Failed to fetch user information. Please try again later.");
      }
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    // Reset password visibility
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    setPasswordError("");

    try {
      await axios.put("http://localhost:8080/api/users/change-password", {
        id: userInfo.id,
        currentPassword,
        newPassword,
      });

      alert("Password changed successfully!");
      handleCloseChangePasswordModal();
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(error.response?.data?.error || "Failed to change password. Please try again.");
    }
  };

  const handleProfilePictureClick = () => {
    setShowProfilePictureModal(true);
  };

  const handleCloseProfilePictureModal = () => {
    setShowProfilePictureModal(false);
    setProfilePicture(null);
  };

  const handleUploadProfilePicture = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSaveProfilePicture = async () => {
    if (profilePicture) {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);
      formData.append('userId', userInfo.id);
  
      try {
        const response = await axios.post('http://localhost:8080/api/users/upload-profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        // Update the user info with the new profile picture URL
        setUserInfo(prevInfo => ({
          ...prevInfo,
          profilePictureUrl: response.data.profilePictureUrl
        }));
  
        // Refresh the profile picture display
        fetchUserInfo();
        handleCloseProfilePictureModal();
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Failed to upload profile picture');
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${userInfo.id}/profile-picture`);
      
      setUserInfo(prevInfo => ({
        ...prevInfo,
        profilePictureUrl: null
      }));

      handleCloseProfilePictureModal();
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture');
    }
  };

  // Toggle password visibility functions
  const toggleOldPasswordVisibility = () => setShowOldPassword(!showOldPassword);
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Show loading indicator while auth or data is loading
  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: "flex", height: "100vh" }}>
          <SideBar />
          <Box
            sx={{
              padding: 4,
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading user information...</Typography>
          </Box>
        </Box>
      </>
    );
  }

  // Show error if there's any
  if (error) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: "flex", height: "100vh" }}>
          <SideBar />
          <Box
            sx={{
              padding: 4,
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" color="error">{error}</Typography>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Box 
        sx={{ 
          display: "flex", 
          height: "100vh",
          overflow: "hidden" // Prevent outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            flexGrow: 1,
            padding: "32px 32px 64px 32px", // Increased bottom padding
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "auto", // Enable scrolling for main content
            height: "100%", // Fill available height
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start", // Changed from center to flex-start for better scrolling
            '&::-webkit-scrollbar': { // Show scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          <Paper
            sx={{
              backgroundColor: "rgba(120, 27, 27, 0.8)",
              padding: 4,
              marginTop: "20px",
              marginBottom: "50px", // Added margin bottom
              borderRadius: 2,
              maxWidth: 400,
              width: "90%",
              height: "auto",
              textAlign: "center",
              boxShadow: "0px 8px 20px rgba(150, 33, 33, 0.8)",
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
              src={userInfo.profilePictureUrl ? 
                `http://localhost:8080${userInfo.profilePictureUrl}` : 
                "/default-avatar.png"
              }
              sx={{
                width: 150,
                height: 150,
                borderRadius: "10px",
                margin: "auto",
                border: "2px solid white",
                marginBottom: 2,
                cursor: 'pointer'
              }}
              onClick={handleProfilePictureClick}
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
                  onClick={handleChangePassword}
                  sx={{
                    width: "auto",
                    height: "35px",
                    fontSize: "12px",
                    marginTop: "30px",
                    padding: "6px 16px",
                    marginLeft: "10px",
                    backgroundColor: '#FFD700',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: '#FFC107',
                    }
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Updated Change Password Modal */}
      <Modal open={showChangePasswordModal} onClose={handleCloseChangePasswordModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 5,
            borderRadius: 1,
            width: 320,
            p: 0,
            overflow: "hidden"
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
            p: 2
          }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Change Password
            </Typography>
            <IconButton 
              onClick={handleCloseChangePasswordModal}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box component="form" onSubmit={handleSubmitChangePassword} sx={{ p: 2, pt: 1 }}>
            {passwordError && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {passwordError}
              </Typography>
            )}
            
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Old Password:
              </Typography>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    paddingRight: '40px' // Space for the icon
                  }}
                  required
                />
                <IconButton
                  onClick={toggleOldPasswordVisibility}
                  size="small"
                  style={{
                    position: 'absolute',
                    right: '2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666'
                  }}
                >
                  {showOldPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </div>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                New Password:
              </Typography>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    paddingRight: '40px' // Space for the icon
                  }}
                  required
                />
                <IconButton
                  onClick={toggleNewPasswordVisibility}
                  size="small"
                  style={{
                    position: 'absolute',
                    right: '2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666'
                  }}
                >
                  {showNewPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </div>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Confirm New Password:
              </Typography>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    paddingRight: '40px' // Space for the icon
                  }}
                  required
                />
                <IconButton
                  onClick={toggleConfirmPasswordVisibility}
                  size="small"
                  style={{
                    position: 'absolute',
                    right: '2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666'
                  }}
                >
                  {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </div>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                type="submit" 
                sx={{
                  backgroundColor: '#FFD700',
                  color: 'black',
                  textTransform: 'none',
                  borderRadius: '4px',
                  width: '80px',
                  height: '32px',
                  '&:hover': {
                    backgroundColor: '#FFC000',
                  }
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal 
        open={showProfilePictureModal} 
        onClose={handleCloseProfilePictureModal}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Profile Picture
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: 250, 
              border: '2px dashed grey',
              borderRadius: 2,
              mb: 2
            }}
          >
           <Avatar
            src={profilePicture ? 
              URL.createObjectURL(profilePicture) : 
              (userInfo.profilePictureUrl ? 
                `http://localhost:8080${userInfo.profilePictureUrl}` : 
                "/default-avatar.png"
              )
            }
            sx={{ 
              width: 200, 
              height: 200, 
              borderRadius: 2 
            }}
          />

          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ 
                color: '#800000', 
                borderColor: '#800000',
                '&:hover': { 
                  backgroundColor: '#800000',
                  color: 'white'
                }
              }}
            >
              Upload
              <input 
                type="file" 
                hidden 
                accept="image/*"
                onChange={handleUploadProfilePicture}
              />
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveProfilePicture}
              sx={{ 
                color: '#800000', 
                borderColor: '#800000',
                '&:hover': { 
                  backgroundColor: '#800000',
                  color: 'white'
                }
              }}
            >
              Remove
            </Button>
          </Box>

          <Button
            variant="contained"
            onClick={handleSaveProfilePicture}
            disabled={!profilePicture}
            sx={{
              mt: 2,
              backgroundColor: '#FFD700',
              color: '#000',
              '&:hover': { backgroundColor: '#FFC107' },
              width: '100%'
            }}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default PersonalInformation;