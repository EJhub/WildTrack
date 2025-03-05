import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Grid,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Success Dialog Component
const SuccessDialog = ({ open, onClose, title, message }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: '#4CAF50', color: 'white' }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">{message}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              bgcolor: '#FFD700',
              color: 'black',
              '&:hover': { bgcolor: '#FFC107' }
            }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const RegisterLibrarian = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    idNumber: '',
    position: '',
    department: '',
    password: '',
    confirmPassword: '',
    role: 'Librarian'
  });
  
  // Store name for success message
  const [librarianName, setLibrarianName] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
      setLoading(false);
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      idNumber: '',
      position: 'Elementary School Librarian',
      department: 'BasicEd - Elementary School',
      password: '',
      confirmPassword: '',
      role: 'Librarian'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Passwords do not match!',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8080/api/librarians/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        idNumber: formData.idNumber,
        password: formData.password,
        position: formData.position,
        department: formData.department,
        role: formData.role
      });

      // Store librarian name before resetting form
      setLibrarianName({
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Explicitly close the form first
      onClose();
      
      // Show the success dialog after a brief delay
      setTimeout(() => {
        setSuccessDialogOpen(true);
      }, 100);
      
    } catch (error) {
      console.error("Error registering librarian:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to register librarian",
        severity: 'error'
      });
      setLoading(false);
    }
  };

  // Handle success dialog close
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setLoading(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          backgroundColor: '#FFF'
        }}>
          <Typography variant="h6">Register New Librarian</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="middleName"
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
            />

            <TextField
              name="idNumber"
              label="ID Number"
              value={formData.idNumber}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
            />
            
            <TextField
              name="role"
              label="Role"
              value={formData.role}
              fullWidth
              disabled
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
            />

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={6}>
                <TextField
                  name="position"
                  label="Position"
                  value={formData.position}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="department"
                  label="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={6}>
                <TextField
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      {successDialogOpen && (
        <SuccessDialog 
          open={successDialogOpen}
          onClose={handleSuccessDialogClose}
          title="Registration Successful"
          message={`Librarian ${librarianName.firstName} ${librarianName.lastName} has been successfully registered.`}
        />
      )}

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegisterLibrarian;