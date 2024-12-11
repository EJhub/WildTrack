import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const CreateTeacherForm = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Teacher', // Default to Teacher role
    subject: '',
    grade: '', // Separate grade
    section: '', // Input text for section
    idNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Automatically prefix "Grade" for the grade field
    const newValue = name === 'grade' && value ? `Grade ${value.replace(/Grade\s*/i, '')}` : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Teacher',
      subject: '',
      grade: '',
      section: '',
      idNumber: '',
    });
  };

  const handleSubmit = async () => {
    // Check if required fields are filled
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.role ||
      !formData.grade ||
      !formData.section ||
      !formData.subject ||
      !formData.idNumber
    ) {
      setSnackbar({ open: true, message: 'All fields are required!', severity: 'warning' });
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      subject: formData.subject,
      grade: formData.grade, // Send grade separately
      section: formData.section, // Send section as input text
      idNumber: formData.idNumber,
    };

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/api/teachers/register', payload);
      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Teacher created successfully!', severity: 'success' });
        resetForm(); // Reset the form fields after successful creation
      }
    } catch (error) {
      console.error('Error creating teacher:', error.response?.data);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to create teacher. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
          Create Teacher
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
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          disabled
        />
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
          {loading ? 'Creating...' : 'Create'}
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

export default CreateTeacherForm;
