import React, { useState, useEffect, useRef } from 'react';
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
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

// Validation functions defined outside component to prevent recreation
const isLettersOnly = (text) => /^[A-Za-z\s]+$/.test(text);
const isValidIdNumber = (id) => /^[0-9-]+$/.test(id);

// Initial form state defined outside component
const initialFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  idNumber: '',
  subject: '',
  grade: [],
  section: [],
  role: 'Teacher',
};

// Initial errors state defined outside component
const initialNameErrors = {
  firstName: '',
  middleName: '',
  lastName: '',
  idNumber: ''
};

const CreateTeacherForm = ({ open, onClose }) => {
  // Use refs to prevent unnecessary re-renders
  const formDataRef = useRef(initialFormData);
  const [formData, setFormData] = useState(initialFormData);
  
  // Subject options
  const subjectOptions = ['English', 'Filipino'];
  
  // Form validation state
  const [formValid, setFormValid] = useState(false);
  
  // State to track if ID number exists
  const [idNumberExists, setIdNumberExists] = useState(false);

  // Validation errors
  const [nameErrors, setNameErrors] = useState(initialNameErrors);

  // Success dialog data
  const [teacherName, setTeacherName] = useState({ firstName: '', lastName: '' });
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  
  // Data fetching state
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [gradeSectionMapping, setGradeSectionMapping] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Flag to track if form has been initialized
  const initRef = useRef(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });

  // Initialize form when opened
  useEffect(() => {
    if (open && !initRef.current) {
      initRef.current = true;
      
      // Reset form data
      formDataRef.current = initialFormData;
      setFormData(initialFormData);
      
      // Reset errors
      setNameErrors(initialNameErrors);
      setIdNumberExists(false);
      
      // Reset validation
      setFormValid(false);
      
      // Fetch data
      fetchGradeData();
    } else if (!open) {
      // Reset initialization flag when dialog closes
      initRef.current = false;
    }
  }, [open]);

  // Fetch grade data once when form opens
  const fetchGradeData = async () => {
    try {
      const gradesResponse = await api.get('/grade-sections/active');
      
      if (!gradesResponse || !gradesResponse.data) {
        setSnackbar({
          open: true,
          message: 'Failed to fetch grade data - empty response',
          severity: 'error',
        });
        return;
      }
      
      const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
      
      // Use functional updates to avoid dependency on current state
      setGradeOptions(uniqueGrades);
      setGradeSectionMapping(gradesResponse.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch grade options',
        severity: 'error',
      });
    }
  };

  // Update sections when grade changes - this is the only automatic state update
  useEffect(() => {
    // Skip if form isn't initialized yet
    if (!initRef.current) return;
    
    if (formData.grade.length > 0 && gradeSectionMapping.length > 0) {
      // Filter sections that belong to the selected grades
      const relevantSections = gradeSectionMapping
        .filter(item => formData.grade.includes(item.gradeLevel))
        .map(item => item.sectionName);
      
      // Remove duplicates
      const uniqueSections = [...new Set(relevantSections)];
      
      // Update sections
      setSectionOptions(uniqueSections);
      
      // Update sections in form data if needed
      if (formData.section.length > 0) {
        const validSections = formData.section.filter(section => uniqueSections.includes(section));
        if (validSections.length !== formData.section.length) {
          // Only update if needed to avoid infinite loop
          setFormData(prev => ({
            ...prev,
            section: validSections
          }));
        }
      }
    } else if (formData.grade.length === 0) {
      // Clear sections when no grade is selected
      setSectionOptions([]);
      if (formData.section.length > 0) {
        setFormData(prev => ({
          ...prev,
          section: []
        }));
      }
    }
  }, [formData.grade, gradeSectionMapping]);

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    let isValid = true;
    
    // Apply validation based on field type
    if (['firstName', 'middleName', 'lastName'].includes(name)) {
      isValid = value === '' || isLettersOnly(value);
    } else if (name === 'idNumber') {
      isValid = value === '' || isValidIdNumber(value);
      if (isValid) {
        // Reset ID number exists error
        setIdNumberExists(false);
      }
    }
    
    // Only update if input is valid
    if (isValid) {
      setFormData(prev => ({ ...prev, [name]: updatedValue }));
      
      // Clear error for this field if it exists
      if (nameErrors[name]) {
        setNameErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
    
    // Validate form after input change
    validateForm({ ...formData, [name]: updatedValue });
  };

  // Multi-select change handler
  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate form after selection change
    validateForm({ ...formData, [name]: value });
  };

  // Validate form and update validation state
  const validateForm = (data = formData) => {
    const currentData = data || formData;
    const errors = { ...initialNameErrors };
    
    // Validate name fields
    if (currentData.firstName && !isLettersOnly(currentData.firstName)) {
      errors.firstName = "First name should contain letters only";
    }
    
    if (currentData.middleName && !isLettersOnly(currentData.middleName)) {
      errors.middleName = "Middle name should contain letters only";
    }
    
    if (currentData.lastName && !isLettersOnly(currentData.lastName)) {
      errors.lastName = "Last name should contain letters only";
    }
    
    // Validate ID Number
    if (currentData.idNumber && !isValidIdNumber(currentData.idNumber)) {
      errors.idNumber = "ID Number should contain only numbers and dashes";
    }
    
    // Update error state if needed
    setNameErrors(errors);
    
    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'subject'];
    const allFieldsFilled = requiredFields.every(field => 
      currentData[field] && currentData[field].toString().trim() !== ''
    );
    
    const gradeSelected = currentData.grade && currentData.grade.length > 0;
    const sectionSelected = currentData.section && currentData.section.length > 0;
    const noErrors = !errors.firstName && !errors.middleName && !errors.lastName && !errors.idNumber;
    const idValid = !idNumberExists;
    
    const isValid = allFieldsFilled && gradeSelected && sectionSelected && noErrors && idValid;
    setFormValid(isValid);
    
    return isValid;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Format data for API
      const dataToSubmit = { 
        ...formData,
        grade: formData.grade.join(','),
        section: formData.section.join(',')
      };
      
      const response = await api.post('/teachers/register', dataToSubmit);
      
      // Prepare success data
      const teacherData = {
        name: {
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        password: response.data.temporaryPassword || ''
      };
      
      // Close form
      onClose();
      
      // Show success dialog after a slight delay
      setTimeout(() => {
        setTeacherName(teacherData.name);
        setTemporaryPassword(teacherData.password);
        setSuccessDialogOpen(true);
      }, 100);
    } catch (error) {
      console.error('Error creating teacher:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        
        if (errorMsg.includes("ID Number already exists")) {
          setIdNumberExists(true);
        } else if (errorMsg.includes("First name should contain")) {
          setNameErrors(prev => ({...prev, firstName: errorMsg}));
        } else if (errorMsg.includes("Middle name should contain")) {
          setNameErrors(prev => ({...prev, middleName: errorMsg}));
        } else if (errorMsg.includes("Last name should contain")) {
          setNameErrors(prev => ({...prev, lastName: errorMsg}));
        } else if (errorMsg.includes("ID Number should contain")) {
          setNameErrors(prev => ({...prev, idNumber: errorMsg}));
        } else {
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
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: '' });
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
            >
              <MenuItem value="">Select Subject</MenuItem>
              {subjectOptions.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
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
      </Dialog>

      {/* Separate Snackbar component */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Success Dialog - completely separate from the form */}
      {successDialogOpen && (
        <SuccessDialog 
          open={successDialogOpen}
          onClose={handleSuccessDialogClose}
          title="Added Successfully"
          message={`Teacher ${teacherName.firstName} ${teacherName.lastName} added successfully.`}
          temporaryPassword={temporaryPassword}
        />
      )}
    </>
  );
};

export default CreateTeacherForm;