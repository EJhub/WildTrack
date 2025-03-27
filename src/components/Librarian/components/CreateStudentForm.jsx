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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../../utils/api'; // Import the API utility
import SuccessDialog from './SuccessDialog';

const CreateStudentForm = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
    grade: "",
    section: "",
    academicYear: "",
    role: "Student"
  });

  // Form validation states
  const [formValid, setFormValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Store student name for success message
  const [studentName, setStudentName] = useState({ firstName: '', lastName: '' });
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Add validation functions
  const isLettersOnly = (text) => /^[A-Za-z\s]+$/.test(text);
  const isValidIdNumber = (id) => /^[0-9-]+$/.test(id);

  const sortGradeLevels = (grades) => {
    const gradeOrder = {
      'Nursery': 0,
      'Kinder': 1,
      'Preparatory': 2,
      'Grade 1': 3,
      'Grade 2': 4,
      'Grade 3': 5,
      'Grade 4': 6,
      'Grade 5': 7,
      'Grade 6': 8
    };

    return grades.sort((a, b) => gradeOrder[a] - gradeOrder[b]);
  };

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
      setIsLoading(false);
      setErrors({});
      setShowPasswordRequirements(false);
    }
  }, [open]);

  // Validate form whenever any input changes
  useEffect(() => {
    validateForm();
  }, [formData, errors]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch Grade Levels
        const gradesResponse = await api.get('/grade-sections/active');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        const sortedGrades = sortGradeLevels(uniqueGrades);
        setGradeOptions(sortedGrades);

        // Fetch Academic Years
        const academicYearsResponse = await api.get('/academic-years/active');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);

      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };

    if (open) {
      fetchDropdownOptions();
    }
  }, [open]);

  // Fetch sections when grade changes
  useEffect(() => {
    const fetchSectionOptions = async () => {
      if (formData.grade) {
        try {
          const sectionsResponse = await api.get(`/grade-sections/grade/${formData.grade}/active`);
          const sections = sectionsResponse.data.map(section => section.sectionName);
          setSectionOptions(sections);
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      }
    };

    fetchSectionOptions();
  }, [formData.grade]);

  // Validate password whenever it changes
  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  // Validate password confirmation
  useEffect(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [formData.password, formData.confirmPassword]);

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
      delete newErrors.firstName;
    }
    
    // Middle name validation (if provided)
    if (formData.middleName && !isLettersOnly(formData.middleName)) {
      newErrors.middleName = "Middle name should contain letters only";
    } else {
      delete newErrors.middleName;
    }
    
    // Last name validation
    if (formData.lastName && !isLettersOnly(formData.lastName)) {
      newErrors.lastName = "Last name should contain letters only";
    } else {
      delete newErrors.lastName;
    }
    
    setErrors(newErrors);
  };

  // Validate ID Number
  const validateIdNumber = () => {
    const newErrors = { ...errors };
    
    if (formData.idNumber && !isValidIdNumber(formData.idNumber)) {
      newErrors.idNumber = "ID Number should contain only numbers and dashes";
    } else {
      delete newErrors.idNumber;
    }
    
    setErrors(newErrors);
  };

  // Validate if all required fields are filled and valid
  const validateForm = () => {
    const requiredFields = [
      'firstName',
      'lastName',
      'idNumber',
      'password',
      'confirmPassword',
      'grade',
      'section',
      'academicYear'
    ];
    
    const allFieldsFilled = requiredFields.every(field => formData[field] && formData[field].trim() !== '');
    const noErrors = Object.keys(errors).length === 0;
    const isValid = allFieldsFilled && noErrors;
    
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
    
    // Check if all validations pass
    const isPasswordValid = Object.values(validations).every(Boolean);
    
    if (password && !isPasswordValid) {
      setErrors(prev => ({ ...prev, password: "Password doesn't meet all requirements" }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
    
    return isPasswordValid;
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for name fields (letters only)
    if (['firstName', 'middleName', 'lastName'].includes(name)) {
      // Allow only letters and spaces
      if (value === '' || isLettersOnly(value)) {
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
        }));
      }
      // Invalid input is ignored
    }
    // Validation for ID number (numbers and dashes only)
    else if (name === 'idNumber') {
      if (value === '' || isValidIdNumber(value)) {
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
        }));
      }
    }
    // Special handling for grade change
    else if (name === 'grade') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        section: '' // Reset section when grade changes
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    // Don't hide requirements if password field has input but requirements aren't met
    if (!formData.password || isPasswordValid()) {
      setShowPasswordRequirements(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      middleName: "",
      idNumber: "",
      password: "",
      confirmPassword: "",
      grade: "",
      section: "",
      academicYear: "",
      role: "Student"
    });
    setErrors({});
    setFormValid(false);
  };

  const getPasswordFeedback = () => {
    if (!formData.password) return null;
    
    if (!isPasswordValid()) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check before submission
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/students/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        idNumber: formData.idNumber,
        password: formData.password,
        grade: formData.grade,
        section: formData.section,
        academicYear: formData.academicYear,
        role: formData.role
      });

      // Store student name before resetting form
      setStudentName({
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
      console.error("Error adding student:", error);
      // Handle specific error messages from the backend
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        
        // Handle specific errors
        if (errorMessage.includes("Password")) {
          setErrors(prev => ({ ...prev, password: errorMessage }));
          setShowPasswordRequirements(true);
          document.getElementById('password')?.focus();
        } else if (errorMessage.includes("ID Number already exists")) {
          setErrors(prev => ({ ...prev, idNumber: "ID Number already exists" }));
          document.getElementById('idNumber')?.focus();
        } else if (errorMessage.includes("First name should contain")) {
          setErrors(prev => ({ ...prev, firstName: errorMessage }));
          document.getElementById('firstName')?.focus();
        } else if (errorMessage.includes("Middle name should contain")) {
          setErrors(prev => ({ ...prev, middleName: errorMessage }));
          document.getElementById('middleName')?.focus();
        } else if (errorMessage.includes("Last name should contain")) {
          setErrors(prev => ({ ...prev, lastName: errorMessage }));
          document.getElementById('lastName')?.focus();
        } else if (errorMessage.includes("ID Number should contain")) {
          setErrors(prev => ({ ...prev, idNumber: errorMessage }));
          document.getElementById('idNumber')?.focus();
        } else {
          // Generic error handling
          alert(errorMessage || "Failed to add student");
        }
      } else {
        alert("Failed to add student");
      }
      setIsLoading(false);
    }
  };

  // Handle success dialog close
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setIsLoading(false);
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
          p: 2 
        }}>
          <Typography variant="h6">Add Student</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="middleName"
                  name="middleName"
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.middleName}
                  helperText={errors.middleName}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
            </Grid>

            <TextField
              id="idNumber"
              name="idNumber"
              label="ID Number"
              value={formData.idNumber}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              sx={{ mt: 2 }}
              error={!!errors.idNumber}
              helperText={errors.idNumber}
            />

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={6}>
                <TextField
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!errors.password}
                  helperText={errors.password}
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
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={4}>
                <TextField
                  name="grade"
                  label="Grade"
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
              <Grid item xs={4}>
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
              <Grid item xs={4}>
                <TextField
                  name="role"
                  label="User Role"
                  select
                  value={formData.role}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled
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
                  <option value="Student">Student</option>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              name="academicYear"
              label="Academic Year"
              select
              value={formData.academicYear}
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
              <option value="">Select Academic Year</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
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
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - conditionally rendered */}
      {successDialogOpen && (
        <SuccessDialog 
          open={successDialogOpen}
          onClose={handleSuccessDialogClose}
          title="Added Successfully"
          message={`Student ${studentName.firstName} ${studentName.lastName} added successfully. You can now manage their details.`}
        />
      )}
    </>
  );
};

export default CreateStudentForm;