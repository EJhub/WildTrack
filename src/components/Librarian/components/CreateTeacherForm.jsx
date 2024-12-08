import React, { useState } from 'react';
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
    startQuarter: '', // Add start quarter
    endQuarter: '', // Add end quarter
    idNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });

  const subjects = ['Math', 'Science', 'History', 'English', 'Art', 'Physical Education']; // Example subjects
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']; // Example quarters

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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
      startQuarter: '',
      endQuarter: '',
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
      !formData.startQuarter ||
      !formData.endQuarter ||
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
      quarter: `${formData.startQuarter}-${formData.endQuarter}`, // Combine start and end quarters
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

  const filteredEndQuarters = () => {
    // If no start quarter is selected, return all quarters for the end quarter
    if (!formData.startQuarter) return quarters;

    // Otherwise, filter out quarters that are before the selected start quarter
    const startQuarterIndex = quarters.indexOf(formData.startQuarter);
    return quarters.slice(startQuarterIndex);
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
                  sx: { zIndex: 15000 }, // Ensure dropdown is above other elements
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
                  sx: { zIndex: 15000 }, // Ensure dropdown is above other elements
                },
              }}
            >
              {filteredEndQuarters().map((quarter) => (
                <MenuItem key={quarter} value={quarter}>
                  {quarter}
                </MenuItem>
              ))}
            </TextField>
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
