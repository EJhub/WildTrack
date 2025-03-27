import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  IconButton,
  Modal,
  Alert,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../../AuthContext';
import api from '../../../utils/api'; // Import the API utility instead of axios

const TeacherReportForm = ({ open, onClose, onSubmitSuccess }) => {
  const { user } = useContext(AuthContext);
  
  // Form state
  const [reportData, setReportData] = useState({
    issue: '',
    description: '',
    role: 'Teacher' // Default role for teachers
  });
  
  // Alert/notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleSubmitReport = async () => {
    // Validation
    if (!reportData.issue.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide an issue.',
        severity: 'error'
      });
      return;
    }
    
    if (!reportData.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a description.',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Create the report object to send to the backend
      const reportPayload = {
        userId: user?.id,
        userIdNumber: user?.idNumber,
        userName: `${user?.firstName} ${user?.lastName}`,
        issue: reportData.issue,
        description: reportData.description,
        role: reportData.role,
        status: 'Pending', // Initial status
        dateSubmitted: new Date().toISOString()
      };
      
      // Send the report to the backend API using the API utility
      const response = await api.post('/reports/submit', reportPayload);
      
      console.log('Report submitted:', response.data);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Report submitted successfully!',
        severity: 'success'
      });
      
      // Reset form
      setReportData({
        issue: '',
        description: '',
        role: 'Teacher'
      });
      
      // Notify parent component about successful submission
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit report. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (!open) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="report-form-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            maxWidth: '90%',
            bgcolor: '#F5F5F5',
            boxShadow: 24,
            borderRadius: '8px',
            p: 0,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #e0e0e0',
              bgcolor: '#781B1B',
              color: 'white'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
              Submit Report
            </Typography>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 1, fontWeight: 'bold' }}>Issue:</FormLabel>
              <TextField
                name="issue"
                value={reportData.issue}
                onChange={handleInputChange}
                fullWidth
                placeholder="Enter the issue title"
                variant="outlined"
                size="small"
              />
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 1, fontWeight: 'bold' }}>Description:</FormLabel>
              <TextField
                name="description"
                value={reportData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Provide details about the issue"
                variant="outlined"
                size="small"
              />
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel sx={{ mb: 1, fontWeight: 'bold' }}>Role:</FormLabel>
              <Select
                name="role"
                value={reportData.role}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled
              >
                
                <MenuItem value="Teacher">Teacher</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleSubmitReport}
                sx={{ 
                  bgcolor: '#FFD700', 
                  color: 'black',
                  '&:hover': { bgcolor: '#e6c300' },
                  px: 4,
                  fontWeight: 'bold'
                }}
              >
                Submit Report
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TeacherReportForm;