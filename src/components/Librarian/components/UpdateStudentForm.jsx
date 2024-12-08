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
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const UpdateStudentForm = ({ open, onClose, user, onUpdate }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    grade: '',
    section: '',
    role: 'Student',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  
  const roles = ['Student'];

  const grades = [1, 2, 3, 4, 5, 6];
  const sections = ["A", "B", "C"];

  // Reset the form when the modal is opened or user changes
  useEffect(() => {
    if (user && open) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        idNumber: user.idNumber || '',
        grade: user.grade || '',
        section: user.section || '',
        role: user.role || 'Student',
      });
    }
  }, [user, open]);

  if (!open) return null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:8080/api/students/${user.id}`, { // Use user.id to target the correct student
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`, // Combined name is not necessary unless required by your backend
        gradeSection: `${userData.grade} - ${userData.section}`, // If needed, this is to represent the combination of grade and section
      });
      setLoading(false);
      onUpdate(response.data); // Update the user in the parent component's list
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
      onClose();
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update user. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        bgcolor: '#F5F5F5',
        boxShadow: 24,
        p: 4,
        borderRadius: '8px',
        zIndex: 1500,
        border: '1px solid #CCC',
        overflow: 'visible',
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
          gap: 3,
        }}
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
      <Grid container spacing={2}>
        <Grid item xs={6}>
        <TextField
          label="First Name"
          name="firstName"
          value={userData.firstName}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        </Grid>
        <Grid item xs={6}>
        <TextField
          label="Last Name"
          name="lastName"
          value={userData.lastName}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
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
        />
         {/* Grade Dropdown */}
         <TextField
          label="Grade"
          name="grade"
          select
          value={userData.grade}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          SelectProps={{
            MenuProps: {
              sx: { zIndex: 1500 },
            },
          }}
        >
          {grades.map((grade) => (
            <MenuItem key={grade} value={`Grade ${grade}`}> {/* Full grade text like "Grade 1" */}
              Grade {grade}
            </MenuItem>
          ))}
        </TextField>
        {/* Section Dropdown */}
        <TextField
          label="Section"
          name="section"
          select
          value={userData.section}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          SelectProps={{
            MenuProps: {
              sx: { zIndex: 1500 },
            },
          }}
        >
          {sections.map((section) => (
            <MenuItem key={section} value={section}> {/* Sections A, B, C */}
              Section {section}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="User Role"
          name="role"
          select
          value={userData.role}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
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
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#FFC107' },
          }}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </Box>

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
    </Box>
  );
};

export default UpdateStudentForm;
