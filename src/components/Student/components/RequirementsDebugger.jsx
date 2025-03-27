import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import { toast } from 'react-toastify';
import api from '../../utils/api'; // Import the API utility instead of axios

const RequirementsDebugger = ({ idNumber, requirements, onComplete }) => {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const processHours = async () => {
    if (!selectedRequirement) {
      toast.error('Please select a requirement to update');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      // Make sure the token is set
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Get the requirement details
      const requirement = requirements.find(req => req.requirementId == selectedRequirement);
      
      const response = await api.post(
        '/debug/process-hours',
        {
          idNumber: idNumber,
          subject: requirement.subject,
          requirementId: requirement.requirementId
        }
      );
      
      if (response.data.success) {
        toast.success('Hours processed successfully! Refreshing requirements...');
        handleClose();
        if (onComplete) {
          onComplete();
        }
      } else {
        toast.error(response.data.message || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing hours:', error);
      toast.error('Error processing hours. Check console for details.');
    } finally {
      setProcessing(false);
    }
  };

  // Only show debug button in development environment
  if (process.env.NODE_ENV !== 'development' && !window.location.hostname.includes('localhost')) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        startIcon={<BugReportIcon />}
        onClick={handleOpen}
        sx={{ ml: 2 }}
      >
        Debug
      </Button>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Debug Requirements Progress</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This tool will force process the most recent library hours entry for the selected requirement.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Requirement</InputLabel>
            <Select
              value={selectedRequirement}
              onChange={(e) => setSelectedRequirement(e.target.value)}
              label="Select Requirement"
            >
              {requirements.map(req => (
                <MenuItem key={req.requirementId} value={req.requirementId}>
                  {req.subject} - {req.quarter.value} Quarter ({req.minutesRendered}/{req.requiredMinutes} mins)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="caption" color="text.secondary">
            Note: This will modify your most recent library hours entry to be counted toward the selected requirement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={processHours} 
            variant="contained" 
            color="warning"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Processing...' : 'Process Hours'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RequirementsDebugger;