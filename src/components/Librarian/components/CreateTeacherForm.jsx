import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper,
  Select,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../../utils/api'; // Import the API utility
import SuccessDialog from './SuccessDialog'; // Import the success dialog component

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateTeacherForm = ({ open, onClose }) => {
  // Add validation functions
  const isLettersOnly = (text) => /^[A-Za-z\s]+$/.test(text);
  const isValidIdNumber = (id) => /^[0-9-]+$/.test(id);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'Teacher',
    subject: '',
    grade: [], // Changed to array for multi-select
    section: [], // Changed to array for multi-select
    idNumber: '',
  });
  
  // Subject options
  const subjectOptions = ['English', 'Filipino'];
  
  // Form validation states
  const [formValid, setFormValid] = useState(false);
  
  // Password validation states
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });
  
  // State to track if password validation passes
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [idNumberExists, setIdNumberExists] = useState(false);

  // Add validation errors for name fields and ID Number
  const [nameErrors, setNameErrors] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    idNumber: ''
  });

  // Add state to store teacher name for success message
  const [teacherName, setTeacherName] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });

  // Ensure form state is always synchronized with parent open prop
  useEffect(() => {
    if (!open) {
      // Reset form state completely if parent says we're closed
      resetForm();
      setLoading(false);
      setShowPasswordRequirements(false);
      setPasswordsMatch(true);
      setIdNumberExists(false);
      setNameErrors({
        firstName: '',
        middleName: '',
        lastName: '',
        idNumber: ''
      });
    }
  }, [open]);

  // Validate form whenever form data changes
  useEffect(() => {
    validateForm();
  }, [formData, isPasswordValid, passwordsMatch, idNumberExists, nameErrors]);

  // Fetch grade options when modal opens
  useEffect(() => {
    const fetchGradeOptions = async () => {
      try {
        const gradesResponse = await api.get('/grade-sections/active');
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

    if (open) {
      fetchGradeOptions();
    }
  }, [open]);

  // Store the complete grade-section mapping
  const [gradeSectionMapping, setGradeSectionMapping] = useState([]);

  // Fetch all grade-section data when form opens
  useEffect(() => {
    const fetchGradeSectionData = async () => {
      try {
        const response = await api.get('/grade-sections/active');
        setGradeSectionMapping(response.data);
      } catch (error) {
        console.error('Error fetching grade-section data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch grade and section data',
          severity: 'error',
        });
      }
    };

    if (open) {
      fetchGradeSectionData();
    }
  }, [open]);

  // Update available sections when grades change
  useEffect(() => {
    if (formData.grade.length > 0 && gradeSectionMapping.length > 0) {
      // Filter sections that belong to the selected grades
      const relevantSections = gradeSectionMapping
        .filter(item => formData.grade.includes(item.gradeLevel))
        .map(item => item.sectionName);
      
      // Remove duplicates
      const uniqueSections = [...new Set(relevantSections)];
      setSectionOptions(uniqueSections);
      
      // Clear section selection if none of the selected sections belong to the selected grades
      if (formData.section.length > 0) {
        const validSections = formData.section.filter(section => uniqueSections.includes(section));
        if (validSections.length !== formData.section.length) {
          setFormData(prev => ({
            ...prev,
            section: validSections
          }));
        }
      }
    } else {
      // Clear sections when no grade is selected
      setSectionOptions([]);
      setFormData(prev => ({
        ...prev,
        section: []
      }));
    }
  }, [formData.grade, gradeSectionMapping]);

  // Validate password whenever it changes
  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  // Check if passwords match whenever either password field changes
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(true); // Don't show error if confirm field is empty
    }
  }, [formData.password, formData.confirmPassword]);

  // Validate name fields
  useEffect(() => {
    validateNameFields();
  }, [formData.firstName, formData.middleName, formData.lastName]);

  // Validate ID number field
  useEffect(() => {
    validateIdNumber();
  }, [formData.idNumber]);

  // Validate name fields
  const validateNameFields = () => {
    const errors = { ...nameErrors };
    
    // First name validation
    if (formData.firstName && !isLettersOnly(formData.firstName)) {
      errors.firstName = "First name should contain letters only";
    } else {
      errors.firstName = '';
    }
    
    // Middle name validation (if provided)
    if (formData.middleName && !isLettersOnly(formData.middleName)) {
      errors.middleName = "Middle name should contain letters only";
    } else {
      errors.middleName = '';
    }
    
    // Last name validation
    if (formData.lastName && !isLettersOnly(formData.lastName)) {
      errors.lastName = "Last name should contain letters only";
    } else {
      errors.lastName = '';
    }
    
    setNameErrors(errors);
    return !errors.firstName && !errors.middleName && !errors.lastName;
  };

  // Validate ID Number
  const validateIdNumber = () => {
    let error = '';
    
    if (formData.idNumber && !isValidIdNumber(formData.idNumber)) {
      error = "ID Number should contain only numbers and dashes";
    }
    
    setNameErrors(prev => ({
      ...prev,
      idNumber: error
    }));
    
    return !error;
  };

  // Validate if all required fields are filled and valid
  const validateForm = () => {
    const requiredFields = [
      'firstName',
      'lastName',
      'idNumber',
      'password',
      'confirmPassword',
      'subject'
    ];
    
    const allFieldsFilled = requiredFields.every(field => formData[field] && formData[field].toString().trim() !== '');
    const gradeSelected = formData.grade && formData.grade.length > 0;
    const sectionSelected = formData.section && formData.section.length > 0;
    const namesValid = validateNameFields();
    const idNumberValid = validateIdNumber() && !idNumberExists;
    const isValid = allFieldsFilled && isPasswordValid && passwordsMatch && namesValid && idNumberValid && gradeSelected && sectionSelected;
    
    setFormValid(isValid);
    return isValid;
  };

  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    
    setPasswordValidation(validations);
    const valid = Object.values(validations).every(Boolean);
    setIsPasswordValid(valid);
    return valid;
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
        // Reset ID number exists error when user changes the ID
        setIdNumberExists(false);
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Handle multi-select change for grade and section
  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    // Don't hide requirements if password field has input but requirements aren't met
    if (!formData.password || isPasswordValid) {
      setShowPasswordRequirements(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      role: 'Teacher',
      subject: '',
      grade: [],
      section: [],
      idNumber: '',
    });
    
    // Reset validation states
    setIsPasswordValid(false);
    setPasswordsMatch(true);
    setIdNumberExists(false);
    setFormValid(false);
    setNameErrors({
      firstName: '',
      middleName: '',
      lastName: '',
      idNumber: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Additional validation before submission
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Format selected grades and sections as comma-separated strings
      const dataToSubmit = { 
        ...formData,
        grade: formData.grade.join(','),
        section: formData.section.join(',')
      };
      
      // Remove confirmPassword before sending to the server
      delete dataToSubmit.confirmPassword;
      
      const response = await api.post('/teachers/register', dataToSubmit);
      if (response.status === 200) {
        // Store the teacher name before resetting the form
        setTeacherName({
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        
        // Explicitly close the form first - this is important
        onClose();
        
        // Then show the success dialog
        setTimeout(() => {
          setSuccessDialogOpen(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error creating teacher:', error.response?.data);
      
      // Handle specific error messages from the backend
      if (error.response && error.response.data && error.response.data.error) {
        const errorMsg = error.response.data.error;
        
        // Handle ID Number already exists error
        if (errorMsg.includes("ID Number already exists")) {
          setIdNumberExists(true);
          document.getElementById('idNumber')?.focus();
        } 
        // Handle name validation errors
        else if (errorMsg.includes("First name should contain")) {
          setNameErrors(prev => ({...prev, firstName: errorMsg}));
          document.getElementById('firstName')?.focus();
        }
        else if (errorMsg.includes("Middle name should contain")) {
          setNameErrors(prev => ({...prev, middleName: errorMsg}));
          document.getElementById('middleName')?.focus();
        }
        else if (errorMsg.includes("Last name should contain")) {
          setNameErrors(prev => ({...prev, lastName: errorMsg}));
          document.getElementById('lastName')?.focus();
        }
        else if (errorMsg.includes("ID Number should contain")) {
          setNameErrors(prev => ({...prev, idNumber: errorMsg}));
          document.getElementById('idNumber')?.focus();
        }
        // Handle password validation error
        else if (errorMsg.includes("Password")) {
          setShowPasswordRequirements(true);
          document.getElementById('password')?.focus();
          setSnackbar({
            open: true,
            message: errorMsg,
            severity: 'error',
          });
        } 
        // Handle other errors
        else {
          setSnackbar({
            open: true,
            message: errorMsg,
            severity: 'error',
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create teacher. Please try again.',
          severity: 'error',
        });
      }
      
      setLoading(false);
    }
  };

  // Handle success dialog close
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setLoading(false);
    // No need to call onClose() here as form is already closed
  };

  const getPasswordFeedback = () => {
    if (!formData.password) return null;
    
    if (!isPasswordValid) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 1, 
            color: 'error.main',
            fontSize: '0.75rem'
          }}
        >
          <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
          Password doesn't meet all requirements
        </Box>
      );
    }
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 1, 
          color: 'success.main',
          fontSize: '0.75rem'
        }}
      >
        <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
        Password meets all requirements
      </Box>
    );
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          backgroundColor: '#FFF',
        }}>
          <Typography variant="h6">Add Teacher</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="First Name"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  error={!!nameErrors.firstName}
                  helperText={nameErrors.firstName}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Middle Name"
                  name="middleName"
                  id="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  error={!!nameErrors.middleName}
                  helperText={nameErrors.middleName}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  error={!!nameErrors.lastName}
                  helperText={nameErrors.lastName}
                />
              </Grid>
            </Grid>

            <TextField
              label="ID Number"
              name="idNumber"
              id="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
              sx={{ mt: 2 }}
              error={idNumberExists || !!nameErrors.idNumber}
              helperText={idNumberExists ? "ID Number already exists" : nameErrors.idNumber}
            />

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={6}>
                <TextField
                  label="Password"
                  name="password"
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  variant="outlined"
                  fullWidth
                  required
                  sx={{ mt: 2 }}
                />
                {getPasswordFeedback()}
                <Collapse in={showPasswordRequirements}>
                  <Paper elevation={0} sx={{ mt: 1, p: 1, bgcolor: 'background.paper', border: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <InfoIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                      Password requirements:
                    </Typography>
                    <List dense disablePadding>
                      {[
                        { id: 'minLength', label: 'At least 8 characters' },
                        { id: 'hasUpperCase', label: 'At least one uppercase letter' },
                        { id: 'hasLowerCase', label: 'At least one lowercase letter' },
                        { id: 'hasNumber', label: 'At least one number' },
                        { id: 'hasSpecial', label: 'At least one special character' }
                      ].map((req) => (
                        <ListItem key={req.id} disablePadding sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            {passwordValidation[req.id] ? 
                              <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} /> : 
                              <CancelIcon fontSize="small" sx={{ color: 'error.main' }} />
                            }
                          </ListItemIcon>
                          <ListItemText 
                            primary={req.label} 
                            primaryTypographyProps={{ 
                              variant: 'caption',
                              color: passwordValidation[req.id] ? 'success.main' : 'error.main'
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Collapse>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  required
                  sx={{ mt: 2 }}
                  error={!passwordsMatch && formData.confirmPassword !== ''}
                  helperText={!passwordsMatch && formData.confirmPassword !== '' ? "Passwords do not match" : null}
                />
              </Grid>
            </Grid>

            <TextField
              label="Role"
              name="role"
              value={formData.role}
              variant="outlined"
              fullWidth
              disabled
              sx={{ mt: 2 }}
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
              sx={{ mt: 2 }}
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

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={6}>
                {/* Grade Level Multi-Select */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="grade-multiple-chip-label">Grade Level</InputLabel>
                  <Select
                    labelId="grade-multiple-chip-label"
                    id="grade-multiple-chip"
                    multiple
                    name="grade"
                    value={formData.grade}
                    onChange={handleMultiSelectChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Grade Level" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {gradeOptions.map((grade) => (
                      <MenuItem
                        key={grade}
                        value={grade}
                      >
                        {grade}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                {/* Section Multi-Select */}
                <FormControl fullWidth sx={{ mt: 2 }} disabled={formData.grade.length === 0}>
                  <InputLabel id="section-multiple-chip-label">Section</InputLabel>
                  <Select
                    labelId="section-multiple-chip-label"
                    id="section-multiple-chip"
                    multiple
                    name="section"
                    value={formData.section}
                    onChange={handleMultiSelectChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Section" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {sectionOptions.length > 0 ? (
                      sectionOptions.map((section) => (
                        <MenuItem
                          key={section}
                          value={section}
                        >
                          {section}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        {formData.grade.length === 0 
                          ? "Select grade(s) first" 
                          : "No sections available for selected grade(s)"}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formValid}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  '&:hover': { backgroundColor: '#FFC107' },
                  width: '200px'
                }}
              >
                {loading ? 'Creating...' : 'Submit'}
              </Button>
            </Box>
          </form>
        </DialogContent>

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
      </Dialog>

      {/* Success Dialog - completely separate from the form */}
      {successDialogOpen && (
        <SuccessDialog 
          open={successDialogOpen}
          onClose={handleSuccessDialogClose}
          title="Added Successfully"
          message={`Teacher ${teacherName.firstName} ${teacherName.lastName} added successfully. You can now manage their details.`}
        />
      )}
    </>
  );
};

export default CreateTeacherForm;