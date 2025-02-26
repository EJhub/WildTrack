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
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import ConfirmUpdateDialog from './ConfirmUpdateDialog';

const UpdateStudentForm = ({ open, onClose, user, onUpdate }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    idNumber: '',
    grade: '',
    section: '',
    role: 'Student',
    academicYear: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [changePassword, setChangePassword] = useState(false);

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
            email: user.email || '',
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

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Initial submit handler that triggers confirmation dialog
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Validate password fields if password change is enabled
    if (changePassword) {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setSnackbar({ open: true, message: 'All password fields are required!', severity: 'warning' });
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setSnackbar({ open: true, message: 'New password and confirm password do not match!', severity: 'error' });
        return;
      }
    }
    
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

      // Handle password change if requested
      if (changePassword) {
        try {
          const passwordPayload = {
            id: user.id,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          };
          
          await axios.put('http://localhost:8080/api/users/change-password', passwordPayload);
          setSnackbar({ open: true, message: 'Student information and password updated successfully!', severity: 'success' });
        } catch (passwordError) {
          console.error('Error updating password:', passwordError);
          setSnackbar({ 
            open: true, 
            message: passwordError.response?.data?.error || 'Password update failed. Please check your current password.',
            severity: 'error'
          });
          setLoading(false);
          // Don't reopen form on error since the dialog is already closed
          return;
        }
      } else {
        setSnackbar({ open: true, message: 'Student updated successfully!', severity: 'success' });
      }

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
            zIndex: 1500,
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
              label="Email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
            />

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
                Change Password
              </Typography>
              <Button 
                variant="text" 
                onClick={() => setChangePassword(!changePassword)}
                sx={{ ml: 2 }}
              >
                {changePassword ? 'Cancel' : 'Change'}
              </Button>
            </Box>

            {changePassword && (
              <>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  fullWidth
                  required={changePassword}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      fullWidth
                      required={changePassword}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      fullWidth
                      required={changePassword}
                    />
                  </Grid>
                </Grid>
              </>
            )}

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

      {/* Confirmation Dialog */}
      <ConfirmUpdateDialog
        open={confirmDialogOpen}
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmSubmit}
        title="Confirm Update"
        message="Are you sure you want to save the changes? The new details will replace the current records."
      />

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