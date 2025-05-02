import React, { useState, useEffect, useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { AuthContext } from '../../AuthContext';
import Alert from '@mui/material/Alert';

const EditLibraryHours = ({ open, handleClose, requirement, handleUpdate }) => {
  const [formData, setFormData] = useState({
    id: '',
    minutes: '',
    gradeLevel: '',
    subject: '',
    quarter: '',
    deadline: '',
    task: ''
  });
  
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { user } = useContext(AuthContext);

  // Initialize form data when requirement changes
  useEffect(() => {
    if (requirement) {
      try {
        // Format the deadline as YYYY-MM-DD for the date picker
        let formattedDeadline = '';
        if (requirement.deadline) {
          // Parse the date string correctly, ensuring we handle both MM/DD/YYYY and YYYY-MM-DD formats
          const dateObj = new Date(requirement.deadline);
          
          // Ensure valid date object
          if (!isNaN(dateObj.getTime())) {
            // Format as YYYY-MM-DD for the date input field
            const year = dateObj.getFullYear();
            // Month is 0-indexed in JS Date, so add 1 and pad with leading zero if needed
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            formattedDeadline = `${year}-${month}-${day}`;
          } else {
            console.error('Invalid date format:', requirement.deadline);
          }
        }
        
        const formattedData = {
          id: requirement.id || '',
          minutes: requirement.minutes || '',
          gradeLevel: requirement.gradeLevel || '',
          subject: requirement.subject || '',
          quarter: requirement.quarter || '',
          deadline: formattedDeadline,
          task: requirement.task || ''
        };
        
        // Store both current form data and original data
        setFormData(formattedData);
        setOriginalData(formattedData);
        
        // Clear validation errors and previous error messages
        setValidationErrors({});
        setError(null);
      } catch (err) {
        console.error('Error formatting date:', err);
        setError('Error loading requirement data. Please try again.');
      }
    }
  }, [requirement, open]);

  // Clear error when dialog closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.minutes) errors.minutes = "Minutes required is required";
    else if (parseInt(formData.minutes) <= 0) errors.minutes = "Minutes must be greater than 0";
    
    if (!formData.gradeLevel) errors.gradeLevel = "Grade level is required";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.quarter) errors.quarter = "Quarter is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Improved hasChanges function to better handle date comparison
  const hasChanges = () => {
    // Check each field individually
    if (formData.minutes !== originalData.minutes) return true;
    if (formData.quarter !== originalData.quarter) return true;
    if (formData.task !== originalData.task) return true;
    
    // Specific check for deadline
    if (formData.deadline !== originalData.deadline) return true;
    
    // No need to check gradeLevel and subject since they're disabled
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Clear general error when user starts editing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Check if anything has changed
    if (!hasChanges()) {
      toast.info("No changes detected");
      handleClose();
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    // Check if user is authenticated
    if (!user || !user.idNumber) {
      setError("You must be logged in to update library hours");
      toast.error("You must be logged in to update library hours");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get fresh token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Format data for submission - making sure all fields are included
      // IMPORTANT: Even though gradeLevel and subject are disabled in UI,
      // we still need to include them in the API request
      const updatedRequirement = {
        id: formData.id,
        minutes: parseInt(formData.minutes),
        gradeLevel: formData.gradeLevel, // Include even though field is disabled
        subject: formData.subject,       // Include even though field is disabled
        quarter: formData.quarter,
        task: formData.task
      };
      
      // Always send date parts if deadline is provided
      if (formData.deadline) {
        // Extract date parts from YYYY-MM-DD format
        const dateParts = formData.deadline.split('-');
        
        // Ensure all parts exist before using them
        if (dateParts.length === 3) {
          updatedRequirement.year = parseInt(dateParts[0]);
          updatedRequirement.month = parseInt(dateParts[1]);
          updatedRequirement.day = parseInt(dateParts[2]);
        } else {
          console.error('Invalid date format:', formData.deadline);
        }
      }
      
      // Explicitly set the request headers with the token
      try {
        const response = await api.put(`/set-library-hours/${formData.id}`, updatedRequirement, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data) {
          toast.success("Library hours requirement updated successfully!");
          // Call the parent component's update handler with the response data
          if (typeof handleUpdate === 'function') {
            handleUpdate(response.data);
          }
          handleClose();
        }
      } catch (requestError) {
        // Re-throw to be caught by the outer try/catch
        throw requestError;
      }
    } catch (error) {
      console.error('Error updating library hours:', error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error.response) {
        // Get the error message from the response
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to update this library hours requirement";
        } else if (error.response.status === 404) {
          errorMessage = "Library hours requirement not found";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid data provided";
        } else if (error.response.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else {
          errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Library Hours Requirement
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gradeLevel"
                label="Grade Level *"
                select
                fullWidth
                required
                value={formData.gradeLevel || ''}
                onChange={handleInputChange}
                error={!!validationErrors.gradeLevel}
                helperText={validationErrors.gradeLevel || "Grade level cannot be changed"}
                disabled={true}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value="">Select Grade</MenuItem>
                <MenuItem value="Grade 1">Grade 1</MenuItem>
                <MenuItem value="Grade 2">Grade 2</MenuItem>
                <MenuItem value="Grade 3">Grade 3</MenuItem>
                <MenuItem value="Grade 4">Grade 4</MenuItem>
                <MenuItem value="Grade 5">Grade 5</MenuItem>
                <MenuItem value="Grade 6">Grade 6</MenuItem>
                <MenuItem value="Grade 7">Grade 7</MenuItem>
                <MenuItem value="Grade 8">Grade 8</MenuItem>
                <MenuItem value="Grade 9">Grade 9</MenuItem>
                <MenuItem value="Grade 10">Grade 10</MenuItem>
                <MenuItem value="Grade 11">Grade 11</MenuItem>
                <MenuItem value="Grade 12">Grade 12</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="subject"
                label="Subject *"
                select
                fullWidth
                required
                value={formData.subject || ''}
                onChange={handleInputChange}
                error={!!validationErrors.subject}
                helperText={validationErrors.subject || "Subject cannot be changed"}
                disabled={true}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value="">Select Subject</MenuItem>
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Filipino">Filipino</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quarter"
                label="Quarter *"
                select
                fullWidth
                required
                value={formData.quarter || ''}
                onChange={handleInputChange}
                error={!!validationErrors.quarter}
                helperText={validationErrors.quarter}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value="">Select Quarter</MenuItem>
                <MenuItem value="First">First</MenuItem>
                <MenuItem value="Second">Second</MenuItem>
                <MenuItem value="Third">Third</MenuItem>
                <MenuItem value="Fourth">Fourth</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="minutes"
                label="Minutes Required *"
                type="number"
                fullWidth
                required
                value={formData.minutes || ''}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
                error={!!validationErrors.minutes}
                helperText={validationErrors.minutes}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="task"
                label="Task Description"
                fullWidth
                multiline
                rows={3}
                value={formData.task || ''}
                onChange={handleInputChange}
                error={!!validationErrors.task}
                helperText={validationErrors.task}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Deadline</Typography>
              <TextField
                name="deadline"
                type="date"
                fullWidth
                value={formData.deadline || ''}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                // Ensure the input is explicitly in YYYY-MM-DD format
                inputProps={{
                  min: "2020-01-01",
                  pattern: "\\d{4}-\\d{2}-\\d{2}"
                }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="secondary"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading || !hasChanges()}
          sx={{
            backgroundColor: '#781B1B',
            '&:hover': { backgroundColor: '#5D1515' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLibraryHours;