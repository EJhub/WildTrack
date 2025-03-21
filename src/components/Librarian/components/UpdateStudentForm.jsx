import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';
import ConfirmUpdateDialog from './ConfirmUpdateDialog';

const UpdateStudentForm = ({ open, onClose, user, onUpdate }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    idNumber: '',
    grade: '',
    section: '',
    role: 'Student',
    academicYear: '',
  });
  
  // State for reset password
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // State for dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // State to manage form visibility while confirmation dialog is open
  const [formVisible, setFormVisible] = useState(true);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  
  const roles = ['Student'];

  // Fetch dropdown options when component mounts
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch Grade Levels
        const gradesResponse = await axios.get('http://localhost:8080/api/grade-sections/all');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        setGradeOptions(uniqueGrades);

        // Fetch Academic Years
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/all');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);

      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Fetch sections when grade changes
  useEffect(() => {
    const fetchSectionsForGrade = async () => {
      if (userData.grade) {
        try {
          const response = await axios.get(`http://localhost:8080/api/grade-sections/grade/${userData.grade}`);
          const sections = response.data.map(section => section.sectionName);
          setSectionOptions(sections);
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      }
    };

    fetchSectionsForGrade();
  }, [userData.grade]);

  // Populate form data when user changes
  useEffect(() => {
    if (user && open) {
      setFormVisible(true);
      const fetchSectionsAndPopulateForm = async () => {
        try {
          // Fetch sections for the user's grade
          if (user.grade) {
            const response = await axios.get(`http://localhost:8080/api/grade-sections/grade/${user.grade}`);
            const sections = response.data.map(section => section.sectionName);
            setSectionOptions(sections);
          }

          // Set user data
          setUserData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            middleName: user.middleName || '',
            idNumber: user.idNumber || '',
            grade: user.grade || '',
            section: user.section || '',
            role: user.role || 'Student',
            academicYear: user.academicYear || '',
          });
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      };

      fetchSectionsAndPopulateForm();
    }
  }, [user, open]);

  if (!open) return null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Special handling for grade change
    if (name === 'grade') {
      setUserData(prevData => ({
        ...prevData,
        [name]: value,
        section: '' // Reset section when grade changes
      }));
    } else {
      setUserData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle open reset password dialog
  const handleResetPasswordClick = () => {
    setResetPasswordDialogOpen(true);
  };

  // Handle close reset password dialog
  const handleCloseResetPasswordDialog = () => {
    setResetPasswordDialogOpen(false);
    if (passwordResetSuccess) {
      setPasswordResetSuccess(false);
      setTemporaryPassword('');
    }
  };

  // Handle confirm reset password
  const handleConfirmResetPassword = async () => {
    setLoading(true);
    
    try {
      // Generate temporary password (in a real app, this would come from the server)
      const tempPass = "Change123!";
      
      // Call API to reset password
      const response = await axios.post('http://localhost:8080/api/users/reset-password', {
        userId: user.id,
        tempPassword: tempPass
      });
      
      // Set the temporary password to display
      setTemporaryPassword(tempPass);
      setPasswordResetSuccess(true);
      
      setSnackbar({
        open: true,
        message: 'Password has been reset successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to reset password',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy temporary password to clipboard
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setSnackbar({
      open: true,
      message: 'Password copied to clipboard',
      severity: 'success'
    });
  };

  // Initial submit handler that triggers confirmation dialog
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Hide the form and show the confirmation dialog
    setFormVisible(false);
    setConfirmDialogOpen(true);
  };

  // Cancel update - close dialog and reopen form
  const handleCancelUpdate = () => {
    setConfirmDialogOpen(false);
    setFormVisible(true);
  };

  // Actual submission after confirmation
  const handleConfirmSubmit = async () => {
    setLoading(true);

    try {
      // Update student information
      const response = await axios.put(`http://localhost:8080/api/students/${user.id}`, {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`,
        gradeSection: `${userData.grade} - ${userData.section}`,
        academicYear: userData.academicYear,
      });

      setSnackbar({ open: true, message: 'Student updated successfully!', severity: 'success' });
      setLoading(false);
      onUpdate(response.data);
      // Keep form closed on success
      setConfirmDialogOpen(false);
      // Close the parent form component
      onClose();
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update user. Please try again.',
        severity: 'error',
      });
      // Reopen form on error so user can correct issues
      setFormVisible(true);
    }
  };

  return (
    <>
      {formVisible && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '450px',
            bgcolor: '#F5F5F5',
            boxShadow: 24,
            p: 4,
            borderRadius: '8px',
            zIndex: 1000,
            border: '1px solid #CCC',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Update Student
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
            onSubmit={handleSubmit}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Middle Name"
                  name="middleName"
                  value={userData.middleName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <TextField
              label="ID Number"
              name="idNumber"
              value={userData.idNumber}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Grade"
                  name="grade"
                  select
                  value={userData.grade}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  SelectProps={{
                    MenuProps: {
                      sx: { zIndex: 1500 },
                    },
                  }}
                >
                  {gradeOptions.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Section"
                  name="section"
                  select
                  value={userData.section}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  disabled={!userData.grade}
                  SelectProps={{
                    MenuProps: {
                      sx: { zIndex: 1500 },
                    },
                  }}
                >
                  {sectionOptions.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="User Role"
                  name="role"
                  select
                  value={userData.role}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  disabled
                  SelectProps={{
                    MenuProps: {
                      sx: { zIndex: 1500 },
                    },
                  }}
                >
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Academic Year"
              name="academicYear"
              select
              value={userData.academicYear}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: 1500 },
                },
              }}
            >
              {academicYearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Password Management
              </Typography>
              <Button 
                variant="contained"
                startIcon={<KeyIcon />}
                onClick={handleResetPasswordClick}
                sx={{ 
                  ml: 2, 
                  backgroundColor: '#f44336',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                  }
                }}
              >
                Reset Password
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  '&:hover': { backgroundColor: '#FFC107' },
                  width: '200px',
                }}
              >
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Confirmation Dialog for update */}
      <ConfirmUpdateDialog
        open={confirmDialogOpen}
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmSubmit}
        title="Confirm Update"
        message="Are you sure you want to save the changes? The new details will replace the current records."
      />

      {/* Reset Password Dialog - with higher z-index */}
      <Dialog 
        open={resetPasswordDialogOpen} 
        onClose={handleCloseResetPasswordDialog}
        maxWidth="sm"
        sx={{
          zIndex: 9999, // Ensure this is higher than any other elements
          '& .MuiDialog-paper': {
            position: 'relative',
            margin: '32px'
          }
        }}
      >
        <DialogTitle>
          {passwordResetSuccess ? "Password Reset Successful" : "Reset Student Password"}
        </DialogTitle>
        <DialogContent>
          {!passwordResetSuccess ? (
            <DialogContentText>
              Are you sure you want to reset the password for {userData.firstName} {userData.lastName}? 
              This will generate a temporary password that the student will need to change on their next login.
            </DialogContentText>
          ) : (
            <Box sx={{ mt: 2 }}>
              <DialogContentText sx={{ mb: 2 }}>
                The password for {userData.firstName} {userData.lastName} has been reset successfully.
              </DialogContentText>
              
              <Paper 
                elevation={3}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: '#e8f4f8',
                  border: '1px solid #b3e0ff'
                }}
              >
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  {temporaryPassword}
                </Typography>
                <IconButton 
                  onClick={handleCopyPassword}
                  color="primary"
                  size="small"
                >
                  <ContentCopyIcon />
                </IconButton>
              </Paper>
              
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                Please share this temporary password with the student. They will be required to change it when they next log in.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!passwordResetSuccess ? (
            <>
              <Button onClick={handleCloseResetPasswordDialog} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmResetPassword} 
                color="primary" 
                variant="contained"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleCloseResetPasswordDialog} 
              color="primary" 
              variant="contained"
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpdateStudentForm;