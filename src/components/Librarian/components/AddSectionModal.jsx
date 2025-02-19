import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AddSectionModal = ({ open, onClose, gradeLevel, onAddSection }) => {
  const [sectionData, setSectionData] = useState({
    sectionName: '',
    advisor: '',
    numberOfStudents: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSectionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!sectionData.sectionName || !sectionData.advisor || !sectionData.numberOfStudents) {
      alert('Please fill in all fields');
      return;
    }

    // Prepare data to be sent
    const formattedData = {
      gradeLevel: gradeLevel, // Pass the grade level from parent
      sectionName: sectionData.sectionName,
      advisor: sectionData.advisor,
      numberOfStudents: parseInt(sectionData.numberOfStudents),
      status: 'active'
    };

    onAddSection(formattedData);
    onClose();

    // Reset form
    setSectionData({
      sectionName: '',
      advisor: '',
      numberOfStudents: ''
    });
  };

  return (
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
        p: 2 
      }}>
        <Typography variant="h6">Add Section</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2 
          }}>
            <TextField
              name="sectionName"
              label="Name"
              value={sectionData.sectionName}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              name="advisor"
              label="Advisor"
              value={sectionData.advisor}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              name="numberOfStudents"
              label="Number of Students"
              type="number"
              value={sectionData.numberOfStudents}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 1 }}
              variant="outlined"
            />

            <Button 
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                mt: 1,
                '&:hover': { 
                  backgroundColor: '#FFC107' 
                }
              }}
            >
              Submit
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSectionModal;