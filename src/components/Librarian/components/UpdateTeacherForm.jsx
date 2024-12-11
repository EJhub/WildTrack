import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Snackbar, Grid, Typography, IconButton, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const UpdateTeacherForm = ({ teacherData, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    subject: '',
    grade: '', // Single grade as a text field
    section: '', // Single section as a text field
    role: 'Teacher', // Default role set to 'Teacher'
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });

  useEffect(() => {
    if (teacherData) {
      setFormData({
        firstName: teacherData.firstName || '',
        lastName: teacherData.lastName || '',
        idNumber: teacherData.idNumber || '',
        subject: teacherData.subject || '',
        grade: teacherData.grade || '',
        section: teacherData.section || '',
        role: teacherData.role || 'Teacher',
      });
    }
  }, [teacherData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Automatically prefix "Grade" for the grade field
    const newValue = name === 'grade' && value ? `Grade ${value.replace(/Grade\s*/i, '')}` : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleSubmit = async () => {
    // Validate form fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.idNumber ||
      !formData.subject ||
      !formData.grade ||
      !formData.section ||
      !formData.role
    ) {
      setSnackbar({ open: true, message: 'All fields are required!', severity: 'warning' });
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      idNumber: formData.idNumber,
      subject: formData.subject,
      grade: formData.grade, // Single grade
      section: formData.section, // Single section
      role: formData.role,
    };

    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:8080/api/teachers/${teacherData.id}`, payload);
      setSnackbar({ open: true, message: 'Teacher updated successfully!', severity: 'success' });
      onUpdate(); // Refresh the data after successful update
      onClose(); // Close the form
    } catch (error) {
      console.error('Error updating teacher:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update teacher. Please try again.',
        severity: 'error',
      });
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
          value={formData.subject}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Grade Level"
              name="grade"
              placeholder="Enter grade number (e.g., 1, 2, 3)"
              value={formData.grade}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Section"
              name="section"
              placeholder="Enter section (e.g., A, B, C)"
              value={formData.section}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>

        <TextField
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          disabled
        />

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
