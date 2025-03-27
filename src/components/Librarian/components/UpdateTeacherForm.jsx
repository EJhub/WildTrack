// Modified UpdateTeacherForm.js with name and ID validation
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Snackbar, 
  Grid, 
  Typography, 
  IconButton, 
  Alert, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '../../../utils/api'; // Import the API utility
import ConfirmUpdateDialog from './ConfirmUpdateDialog';

const UpdateTeacherForm = ({ teacherData, onClose, onUpdate }) => {
  // Add validation functions
  const isLettersOnly = (text) => /^[A-Za-z\s]+$/.test(text);
  const isValidIdNumber = (id) => /^[0-9-]+$/.test(id);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    idNumber: '',
    subject: '',
    grade: '',
    section: '',
    role: 'Teacher',
  });

  // Add error state for name and ID validation
  const [errors, setErrors] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    idNumber: ''
  });

  // Subject options
  const subjectOptions = ['English', 'Filipino'];

  // State for reset password
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [formVisible, setFormVisible] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });

  useEffect(() => {
    if (teacherData) {
      setFormVisible(true);
      setFormData({
        firstName: teacherData.firstName || '',
        middleName: teacherData.middleName || '',
        lastName: teacherData.lastName || '',
        idNumber: teacherData.idNumber || '',
        subject: teacherData.subject || '',
        grade: teacherData.grade || '',
        section: teacherData.section || '',
        role: teacherData.role || 'Teacher',
      });
    }
  }, [teacherData]);

  useEffect(() => {
    const fetchGradeOptions = async () => {
      try {
        const gradesResponse = await api.get('/grade-sections/all');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        setGradeOptions(uniqueGrades);
      } catch (error) {
        console.error('Error fetching grades:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch grade options',
          severity: 'error',
        });
      }
    };

    fetchGradeOptions();
  }, []);

  useEffect(() => {
    const fetchSectionOptions = async () => {
      if (formData.grade) {
        try {
          const sectionsResponse = await api.get(`/grade-sections/grade/${formData.grade}`);
          const sections = sectionsResponse.data.map(section => section.sectionName);
          setSectionOptions(sections);
        } catch (error) {
          console.error('Error fetching sections:', error);
          setSnackbar({
            open: true,
            message: 'Failed to fetch section options',
            severity: 'error',
          });
        }
      }
    };

    fetchSectionOptions();
  }, [formData.grade]);

  // Validate name fields
  useEffect(() => {
    validateNameFields();
  }, [formData.firstName, formData.middleName, formData.lastName]);

  // Validate ID Number field
  useEffect(() => {
    validateIdNumber();
  }, [formData.idNumber]);

  // Validate name fields
  const validateNameFields = () => {
    const newErrors = { ...errors };
    
    // First name validation
    if (formData.firstName && !isLettersOnly(formData.firstName)) {
      newErrors.firstName = "First name should contain letters only";
    } else {
      newErrors.firstName = '';
    }
    
    // Middle name validation (if provided)
    if (formData.middleName && !isLettersOnly(formData.middleName)) {
      newErrors.middleName = "Middle name should contain letters only";
    } else {
      newErrors.middleName = '';
    }
    
    // Last name validation
    if (formData.lastName && !isLettersOnly(formData.lastName)) {
      newErrors.lastName = "Last name should contain letters only";
    } else {
      newErrors.lastName = '';
    }
    
    setErrors(newErrors);
    return !newErrors.firstName && !newErrors.middleName && !newErrors.lastName;
  };

  // Validate ID Number
  const validateIdNumber = () => {
    const newErrors = { ...errors };
    
    if (formData.idNumber && !isValidIdNumber(formData.idNumber)) {
      newErrors.idNumber = "ID Number should contain only numbers and dashes";
    } else {
      newErrors.idNumber = '';
    }
    
    setErrors(newErrors);
    return !newErrors.idNumber;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for name fields (letters only)
    if (['firstName', 'middleName', 'lastName'].includes(name)) {
      // Allow only letters and spaces
      if (value === '' || isLettersOnly(value)) {
        setFormData(prevData => ({
          ...prevData,
          [name]: value
        }));
      }
      // Invalid input is ignored
    }
    // Validation for ID number (numbers and dashes only)
    else if (name === 'idNumber') {
      if (value === '' || isValidIdNumber(value)) {
        setFormData(prevData => ({
          ...prevData,
          [name]: value
        }));
      }
    }
    // Special handling for grade change
    else if (name === 'grade') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        section: ''
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
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
      const response = await api.post('/users/reset-password', {
        userId: teacherData.id,
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

  // Validate form before submission
  const validateForm = () => {
    // Validate name fields
    const namesValid = validateNameFields();
    
    // Validate ID number
    const idNumberValid = validateIdNumber();
    
    // Check if any required fields are empty
    const requiredFields = [
      'firstName',
      'lastName',
      'idNumber',
      'subject',
      'grade',
      'section'
    ];
    
    const allFieldsFilled = requiredFields.every(field => 
      formData[field] && formData[field].trim() !== ''
    );
    
    return namesValid && idNumberValid && allFieldsFilled;
  };

  // Initial submit handler that validates and opens the dialog
  const handleSubmit = () => {
    // Validate form first
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Please correct all errors before submitting.', 
        severity: 'error' 
      });
      return;
    }

    // Hide form and show confirmation dialog
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
    try {
      setLoading(true);
      
      // Update teacher information
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        idNumber: formData.idNumber,
        subject: formData.subject,
        grade: formData.grade,
        section: formData.section,
        role: formData.role,
      };

      await api.put(`/teachers/${teacherData.id}`, payload);
      
      setSnackbar({ open: true, message: 'Teacher information updated successfully!', severity: 'success' });
      
      onUpdate();
      setLoading(false);
      // Keep dialog and form closed after successful update
      setConfirmDialogOpen(false);
      // Close the entire form component
      onClose();
    } catch (error) {
      console.error('Error updating teacher:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update teacher. Please try again.',
        severity: 'error',
      });

      setLoading(false);
      // Reopen form on error
      setFormVisible(true);
      setConfirmDialogOpen(false);
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
            overflowY: 'auto'
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
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  error={!!errors.middleName}
                  helperText={errors.middleName}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName}
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
              required
              error={!!errors.idNumber}
              helperText={errors.idNumber}
            />

            {/* Subject field */}
            <TextField
              name="subject"
              label="Subject"
              select
              value={formData.subject}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              SelectProps={{
                native: true,
              }}
              InputLabelProps={{ 
                shrink: true, 
                style: { 
                  position: 'absolute', 
                  top: -10, 
                  left: -10, 
                  backgroundColor: 'white', 
                  padding: '0 5px', 
                  zIndex: 1 
                } 
              }}
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="grade"
                  label="Grade Level"
                  select
                  value={formData.grade}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                  InputLabelProps={{ 
                    shrink: true, 
                    style: { 
                      position: 'absolute', 
                      top: -10, 
                      left: -10, 
                      backgroundColor: 'white', 
                      padding: '0 5px', 
                      zIndex: 1 
                    } 
                  }}
                >
                  <option value="">Select Grade</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="section"
                  label="Section"
                  select
                  value={formData.section}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  disabled={!formData.grade}
                  SelectProps={{
                    native: true,
                  }}
                  InputLabelProps={{ 
                    shrink: true, 
                    style: { 
                      position: 'absolute', 
                      top: -10, 
                      left: -10, 
                      backgroundColor: 'white', 
                      padding: '0 5px', 
                      zIndex: 1 
                    } 
                  }}
                >
                  <option value="">Select Section</option>
                  {sectionOptions.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </TextField>
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
                variant="contained"
                onClick={handleSubmit}
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
          {passwordResetSuccess ? "Password Reset Successful" : "Reset Teacher Password"}
        </DialogTitle>
        <DialogContent>
          {!passwordResetSuccess ? (
            <DialogContentText>
              Are you sure you want to reset the password for {formData.firstName} {formData.lastName}? 
              This will generate a temporary password that the teacher will need to change on their next login.
            </DialogContentText>
          ) : (
            <Box sx={{ mt: 2 }}>
              <DialogContentText sx={{ mb: 2 }}>
                The password for {formData.firstName} {formData.lastName} has been reset successfully.
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
                Please share this temporary password with the teacher. They will be required to change it when they next log in.
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

export default UpdateTeacherForm;