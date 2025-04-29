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
import api from '../../../utils/api'; // Import the API utility

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
  
  // Password validation states
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
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
      setPasswordCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      setPasswordsMatch(false);
      setPasswordFocused(false);
      setConfirmPasswordFocused(false);
    }
  }, [open]);

  // Validate password
  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
    
    // Also check if passwords match whenever password changes
    if (formData.confirmPassword) {
      setPasswordsMatch(password === formData.confirmPassword);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    
    // Validate password when changed
    if (name === 'password') {
      validatePassword(value);
    }
    
    // Check if passwords match when confirmPassword changes
    if (name === 'confirmPassword') {
      setPasswordsMatch(formData.password === value && formData.password !== '');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
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
    
    // Check if all password criteria are met
    const allCriteriaMet = Object.values(passwordCriteria).every(criterion => criterion === true);
    if (!allCriteriaMet) {
      setSnackbar({
        open: true,
        message: 'Password does not meet all requirements!',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/librarians/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
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

      // Explicitly close the form first with success=true parameter
      onClose(true);
      
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

  // Password requirements indicator component
  const PasswordRequirements = () => (
    <Box sx={{ mt: 1, mb: 1, pl: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        Password requirements:
      </Typography>
      {[
        { key: 'length', label: 'At least 8 characters' },
        { key: 'uppercase', label: 'At least one uppercase letter' },
        { key: 'lowercase', label: 'At least one lowercase letter' },
        { key: 'number', label: 'At least one number' },
        { key: 'special', label: 'At least one special character' }
      ].map((item) => (
        <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: passwordCriteria[item.key] ? 'success.main' : 'error.main',
              mr: 1
            }}
          />
          <Typography variant="caption" color={passwordCriteria[item.key] ? 'success.main' : 'text.secondary'}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={() => onClose(false)} 
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
          <IconButton onClick={() => onClose(false)}>
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
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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
                {/* Show password requirements when password field is focused or has content */}
                {(passwordFocused || formData.password) && <PasswordRequirements />}
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
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
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
                {/* Show password match indicator when confirm password field is focused or has content */}
                {(confirmPasswordFocused || formData.confirmPassword) && (
                  <Box sx={{ mt: 1, pl: 1 }}>
                    <Typography 
                      variant="caption" 
                      color={passwordsMatch ? 'success.main' : 'error.main'}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: passwordsMatch ? 'success.main' : 'error.main',
                          mr: 1
                        }}
                      />
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </Typography>
                  </Box>
                )}
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