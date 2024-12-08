import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Snackbar, Grid, Typography, IconButton, Alert } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

const UpdateTeacherForm = ({ teacherData, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    subject: '',
    startQuarter: '',  // Initialize as empty string
    endQuarter: '',    // Initialize as empty string
    role: 'Teacher'    // Default role set to 'Teacher'
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: ''
  });

  const subjects = ["Math", "Science", "History", "English", "Art", "Physical Education"];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const roles = ["Teacher"]; // You can expand the roles as needed

  // This function will return the available end quarters based on the selected startQuarter
  const getAvailableEndQuarters = (startQuarter) => {
    const startIndex = quarters.indexOf(startQuarter);
    return quarters.slice(startIndex);  // Return all quarters starting from the selected startQuarter
  };

  useEffect(() => {
    if (teacherData) {
      setFormData({
        firstName: teacherData.firstName || '',
        lastName: teacherData.lastName || '',
        idNumber: teacherData.idNumber || '',
        subject: teacherData.subject || '',
        startQuarter: teacherData.startQuarter || '',  // Ensure default if empty
        endQuarter: teacherData.endQuarter || '',      // Ensure default if empty
        role: teacherData.role || 'Teacher' // Default to 'Teacher' if no role
      });
    }
  }, [teacherData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate form fields
    if (!formData.firstName || !formData.lastName || !formData.idNumber || !formData.subject || !formData.startQuarter || !formData.endQuarter || !formData.role) {
      setSnackbar({ open: true, message: 'All fields are required!', severity: 'warning' });
      return;
    }

    setLoading(true);

    const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        subject: formData.subject,
        quarter: `${formData.startQuarter}-${formData.endQuarter}`, // Combine start and end quarters
        idNumber: formData.idNumber,
      };
  

    try {
      // Make API request to update teacher data
      const response = await axios.put(`http://localhost:8080/api/teachers/${teacherData.id}`, payload);
      setSnackbar({ open: true, message: 'Teacher updated successfully!', severity: 'success' });
      onUpdate(); // Refresh the data after successful update
      onClose(); // Close the form
    } catch (error) {
      console.error('Error updating teacher:', error);

      // Log detailed error information to help debug the problem
      if (error.response) {
        console.error('Error Response:', error.response.data);
        setSnackbar({
          open: true,
          message: error.response.data.error || 'Failed to update teacher. Please try again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: 'Network error. Please try again later.', severity: 'error' });
      }
    } finally {
      setLoading(false);
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
          Update Teacher
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
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>
        <TextField
          label="ID Number"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Subject"
          name="subject"
          select
          value={formData.subject}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          SelectProps={{
            MenuProps: {
              sx: { zIndex: 15000 }, // Ensure dropdown is above other elements
            },
          }}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject} value={subject}>
              {subject}
            </MenuItem>
          ))}
        </TextField>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Start Quarter"
              name="startQuarter"
              select
              value={formData.startQuarter}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: 15000 },
                },
              }}
            >
              {quarters.map((quarter) => (
                <MenuItem key={quarter} value={quarter}>
                  {quarter}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Quarter"
              name="endQuarter"
              select
              value={formData.endQuarter}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: 15000 },
                },
              }}
            >
              {getAvailableEndQuarters(formData.startQuarter).map((quarter) => (
                <MenuItem key={quarter} value={quarter}>
                  {quarter}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <TextField
          label="Role"
          name="role"
          select
          value={formData.role}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          SelectProps={{
            MenuProps: {
              sx: { zIndex: 15000 },
            },
          }}
        >
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
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

export default UpdateTeacherForm;
