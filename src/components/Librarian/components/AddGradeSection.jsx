import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AddGradeSection = ({ open, onClose, onGradeSectionAdded }) => {
  const [formData, setFormData] = useState({
    gradeLevel: '',
    sections: [{
      name: '',
      advisor: '',
      numberOfStudents: ''
    }]
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAddSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { name: '', advisor: '', numberOfStudents: '' }]
    });
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = formData.sections.map((section, i) => {
      if (i === index) {
        return { ...section, [field]: value };
      }
      return section;
    });

    setFormData({
      ...formData,
      sections: newSections
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Transform the data to match backend expectations
      const gradeSections = formData.sections.map(section => ({
        gradeLevel: formData.gradeLevel,
        sectionName: section.name,
        advisor: section.advisor,
        numberOfStudents: parseInt(section.numberOfStudents),
        status: 'active'
      }));

      // Send each section to the backend
      const promises = gradeSections.map(section =>
        fetch('http://localhost:8080/api/grade-sections/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(section),
        })
      );

      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: 'Grade and sections added successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        gradeLevel: '',
        sections: [{
          name: '',
          advisor: '',
          numberOfStudents: ''
        }]
      });

      // Notify parent component to refresh data
      if (onGradeSectionAdded) {
        onGradeSectionAdded();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error adding grade sections:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add grade sections. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Add Grade and Section
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Grade Level</Typography>
              <Select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                fullWidth
                displayEmpty
                required
              >
                <MenuItem value="">Select Grade Level</MenuItem>
                {[1, 2, 3, 4, 5, 6].map((grade) => (
                  <MenuItem key={grade} value={`Grade ${grade}`}>
                    Grade {grade}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Sections</Typography>
                <Button
                  onClick={handleAddSection}
                  sx={{
                    color: '#800000',
                    '&:hover': { backgroundColor: 'transparent' }
                  }}
                >
                  Add Section
                </Button>
              </Box>

              {formData.sections.map((section, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    display: 'flex',
                    gap: 2,
                    position: 'relative'
                  }}
                >
                  <TextField
                    label="Name"
                    value={section.name}
                    onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                    size="small"
                    fullWidth
                    required
                  />
                  <TextField
                    label="Advisor"
                    value={section.advisor}
                    onChange={(e) => handleSectionChange(index, 'advisor', e.target.value)}
                    size="small"
                    fullWidth
                    required
                  />
                  <TextField
                    label="Number of Students"
                    value={section.numberOfStudents}
                    onChange={(e) => handleSectionChange(index, 'numberOfStudents', e.target.value)}
                    size="small"
                    type="number"
                    fullWidth
                    required
                  />
                  {formData.sections.length > 1 && (
                    <Button
                      onClick={() => {
                        const newSections = formData.sections.filter((_, i) => i !== index);
                        setFormData({
                          ...formData,
                          sections: newSections
                        });
                      }}
                      sx={{
                        position: 'absolute',
                        right: -10,
                        top: -10,
                        color: '#800000',
                        minWidth: 'auto',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: '#ff0000'
                        }
                      }}
                    >
                      ✕
                    </Button>
                  )}
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  px: 4,
                  '&:hover': { backgroundColor: '#FFC107' }
                }}
              >
                Submit
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

export default AddGradeSection;