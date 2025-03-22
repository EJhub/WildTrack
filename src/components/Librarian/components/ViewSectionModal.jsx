import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography
} from '@mui/material';

const ViewSectionModal = ({ open, onClose, section, onUpdateSection }) => {
  const [formData, setFormData] = useState({
    sectionName: '',
    advisor: '',
    numberOfStudents: 0
  });

  // Reset form data when section changes or modal opens
  useEffect(() => {
    if (section) {
      setFormData({
        sectionName: section.sectionName || '',
        advisor: section.advisor || '',
        numberOfStudents: section.numberOfStudents || 0
      });
    }
  }, [section, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'numberOfStudents' ? (parseInt(value, 10) || 0) : value
    });
  };

  const handleUpdate = () => {
    onUpdateSection(section.id, formData);
    onClose();
  };

  if (!section) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: '#FFD700', color: '#000' }}>
        Section Details
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold">Grade Level:</Typography>
            <Typography variant="body1">{section.gradeLevel}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold">Status:</Typography>
            <Box
              sx={{
                backgroundColor: section.status === 'active' ? '#90EE90' : '#FFB6C1',
                borderRadius: '16px',
                px: 2,
                py: 0.5,
                display: 'inline-block',
                mt: 1,
                mb: 2
              }}
            >
              {section.status}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Section Name"
              name="sectionName"
              value={formData.sectionName}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Advisor"
              name="advisor"
              value={formData.advisor}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Number of Students"
              name="numberOfStudents"
              type="number"
              value={formData.numberOfStudents}
              onChange={handleChange}
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleUpdate} 
          variant="contained" 
          sx={{ 
            bgcolor: '#FFD700', 
            color: 'black',
            '&:hover': { bgcolor: '#FFC107' } 
          }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSectionModal;