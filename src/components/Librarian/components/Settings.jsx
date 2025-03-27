import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  Avatar,
  Modal,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../../AuthContext';
import api from '../../../utils/api'; // Import the API utility
import RegisterLibrarian from './RegisterLibrarian';
import ConfirmUpdateDialog from './ConfirmUpdateDialog';

// Main Settings component
const Settings = ({ open, onClose }) => {
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('User Profile');
  
  // State to control the RegisterLibrarian dialog
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  
  // State to control the ConfirmUpdate dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Profile picture states
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    employeeId: '',
    position: '',
    department: '',
    profilePictureUrl: null
  });
  
  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Alert/notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Initialize form data from user context
  useEffect(() => {
    if (user) {
      setProfileData({
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        employeeId: user.idNumber || '',
        position: user.position || 'Elementary School Librarian',
        department: user.department || 'BasicEd - Elementary School',
        profilePictureUrl: user.profilePictureUrl || null
      });
    }
  }, [user]);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.id) {
        try {
          const response = await api.get(`/users/${user.idNumber}`);
          const userData = response.data;
          
          setProfileData({
            name: `${userData.firstName || ''} ${userData.lastName || ''}`,
            employeeId: userData.idNumber || '',
            position: userData.position || '',
            department: userData.department || '',
            profilePictureUrl: userData.profilePictureUrl || null
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setSnackbar({
            open: true,
            message: 'Failed to load user profile.',
            severity: 'error'
          });
        }
      }
    };
    
    if (open) {
      fetchUserProfile();
    }
  }, [user, open]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  
  // Handle showing the confirmation dialog
  const handleShowUpdateConfirmation = () => {
    setConfirmDialogOpen(true);
  };
  
  // Profile Picture functions
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
      formData.append('userId', user.id);
  
      try {
        const response = await api.post('/users/upload-profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        // Update the profile data with the new profile picture URL
        setProfileData(prevData => ({
          ...prevData,
          profilePictureUrl: response.data.profilePictureUrl
        }));
  
        // Close the modal
        handleCloseProfilePictureModal();
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Profile picture updated successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        setSnackbar({
          open: true,
          message: 'Failed to upload profile picture',
          severity: 'error'
        });
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await api.delete(`/users/${user.id}/profile-picture`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update the profile data to remove the profile picture URL
      setProfileData(prevData => ({
        ...prevData,
        profilePictureUrl: null
      }));

      // Close the modal
      handleCloseProfilePictureModal();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Profile picture removed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove profile picture',
        severity: 'error'
      });
    }
  };
  
  // The updated profile update function that uses the librarian API
  const handleProfileUpdate = async () => {
    try {
      // Parse the full name to get first and last name
      const nameParts = profileData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      // Build the request body with all required User fields
      const userUpdateData = {
        firstName: firstName,
        lastName: lastName,
        idNumber: profileData.employeeId,
        role: 'Librarian', // This is required for the librarian controller validation
        position: profileData.position,
        department: profileData.department,
        // Include other required fields that might be in the User entity
        email: user.email, // Preserve the existing email
        // Add other fields that are required by your User entity but might not be displayed in the form
      };
      
      // Call the librarian API endpoint
      await api.put(`/librarians/${user.id}`, userUpdateData);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handlePasswordUpdate = async () => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match!',
        severity: 'error'
      });
      return;
    }
    
    try {
      await api.put("/users/change-password", {
        id: user.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Clear form fields on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error changing password:", error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change password. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // Open the RegisterLibrarian dialog
  const handleRegisterClick = () => {
    setRegisterModalOpen(true);
  };
  
  // Handle closing the RegisterLibrarian dialog
  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
    
    // Optionally show a success message
    setSnackbar({
      open: true,
      message: 'Librarian registered successfully!',
      severity: 'success'
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Get the base URL for images from environment
  const getBaseURL = () => {
    // Use the same base URL as the API
    if (import.meta.env.PROD) {
      return 'https://backend-5erg.onrender.com';
    }
    return '';
  };
  
  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '650px',
          bgcolor: '#F5F5F5',
          boxShadow: 24,
          borderRadius: '8px',
          zIndex: 1300,
          p: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
            Settings
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content Container */}
        <Box
          sx={{
            display: 'flex',
            height: '400px',
          }}
        >
          {/* Sidebar */}
          <Box
            sx={{
              width: '150px',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #e0e0e0',
            }}
          >
            <Button
              sx={{
                py: 2,
                borderRadius: 0,
                textAlign: 'left',
                justifyContent: 'flex-start',
                pl: 3,
                backgroundColor: activeSection === 'User Profile' ? '#FFD700' : 'transparent',
                '&:hover': { backgroundColor: activeSection === 'User Profile' ? '#FFD700' : '#f5f5f5' },
                color: 'black',
                fontWeight: activeSection === 'User Profile' ? 'bold' : 'normal',
              }}
              onClick={() => setActiveSection('User Profile')}
            >
              User Profile
            </Button>
            <Button
              sx={{
                py: 2,
                borderRadius: 0,
                textAlign: 'left',
                justifyContent: 'flex-start',
                pl: 3,
                backgroundColor: activeSection === 'User Account' ? '#FFD700' : 'transparent',
                '&:hover': { backgroundColor: activeSection === 'User Account' ? '#FFD700' : '#f5f5f5' },
                color: 'black',
                fontWeight: activeSection === 'User Account' ? 'bold' : 'normal',
              }}
              onClick={() => setActiveSection('User Account')}
            >
              User Account
            </Button>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, p: 3 }}>
            {activeSection === 'User Profile' ? (
              // User Profile Section
              <Box sx={{ display: 'flex' }}>
                {/* Profile Picture Box - Updated with Avatar */}
                <Box sx={{ mr: 3, width: '170px', height: '170px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Avatar
                    alt={profileData.name}
                    src={profileData.profilePictureUrl ? 
                      `${getBaseURL()}${profileData.profilePictureUrl}` : 
                      "/default-avatar.png"
                    }
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: "10px",
                      border: "2px solid #FFD700",
                      cursor: 'pointer'
                    }}
                    onClick={handleProfilePictureClick}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Name:</Typography>
                    <TextField
                      fullWidth
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      size="small"
                     
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Employee ID Number:</Typography>
                    <TextField
                      fullWidth
                      name="employeeId"
                      value={profileData.employeeId}
                      onChange={handleProfileChange}
                      size="small"
                      
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Position:</Typography>
                    <TextField
                      fullWidth
                      name="position"
                      value={profileData.position}
                      onChange={handleProfileChange}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Department:</Typography>
                    <TextField
                      fullWidth
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleRegisterClick}
                      sx={{ 
                        bgcolor: '#FFD700', 
                        color: 'black',
                        '&:hover': { bgcolor: '#e6c300' },
                        px: 3
                      }}
                    >
                      Register
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleShowUpdateConfirmation}
                      sx={{ 
                        bgcolor: '#FFD700', 
                        color: 'black',
                        '&:hover': { bgcolor: '#e6c300' },
                        px: 3
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>
              </Box>
            ) : (
              // User Account Section
              <Box sx={{ pt: 2, px: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Current Password:</Typography>
                  <TextField
                    fullWidth
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>New Password:</Typography>
                  <TextField
                    fullWidth
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Confirm New Password:</Typography>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handlePasswordUpdate}
                    sx={{ 
                      bgcolor: '#FFD700', 
                      color: 'black',
                      '&:hover': { bgcolor: '#e6c300' },
                      px: 4
                    }}
                  >
                    Update
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* Register Librarian Dialog */}
      <RegisterLibrarian 
        open={registerModalOpen} 
        onClose={handleCloseRegisterModal} 
      />

      {/* Confirmation Dialog */}
      <ConfirmUpdateDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleProfileUpdate}
        title="Confirm Update"
        message="Are you sure you want to update your position and department information?"
      />

      {/* Profile Picture Modal */}
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
                (profileData.profilePictureUrl ? 
                  `${getBaseURL()}${profileData.profilePictureUrl}` : 
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
                color: '#FFD700', 
                borderColor: '#FFD700',
                '&:hover': { 
                  backgroundColor: '#FFD700',
                  color: 'black'
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
                color: '#FFD700', 
                borderColor: '#FFD700',
                '&:hover': { 
                  backgroundColor: '#FFD700',
                  color: 'black'
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

export default Settings;