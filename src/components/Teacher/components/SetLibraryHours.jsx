import React, { useState } from 'react';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8080/api/set-library-hours';

const SetLibraryHoursDialog = ({ open, handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    minutes: '',
    gradeLevel: '',
    subject: 'English',
    quarter: '', // Added quarter field
    month: '',
    day: '',
    year: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { minutes, gradeLevel, quarter, month, day, year } = formData;
    if (!minutes || !gradeLevel || !quarter || !month || !day || !year) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    // Validate date
    const date = new Date(year, month - 1, day);
    if (date < new Date()) {
      toast.error('Deadline cannot be in the past');
      return false;
    }
    
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(API_BASE_URL, formData);
      toast.success('Library hours set successfully!');
      if (onSuccess) onSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error('Error setting library hours:', error);
      toast.error('Failed to set library hours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '15px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: '#FFDF16',
          color: '#000',
        }}
      >
        Set Library Hours
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: '#FFDF16',
          padding: '30px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
          {/* Minutes Field */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>
              Minutes:
            </Typography>
            <TextField
              name="minutes"
              type="number"
              variant="outlined"
              value={formData.minutes}
              onChange={handleInputChange}
              placeholder="00"
              sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '100px' }}
              inputProps={{ min: 0, style: { textAlign: 'center' } }}
              required
            />
          </Box>

          {/* Grade Level Field */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>
              Grade Level:
            </Typography>
            <TextField
              name="gradeLevel"
              select
              variant="outlined"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '200px' }}
              required
            >
              {[...Array(4).keys()].map((grade) => (
                <MenuItem key={grade} value={grade + 1}>{`Grade ${grade + 1}`}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Quarter Field */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>
              Quarter:
            </Typography>
            <TextField
              name="quarter"
              select
              variant="outlined"
              value={formData.quarter}
              onChange={handleInputChange}
              sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '200px' }}
              required
            >
              <MenuItem value="First">First Quarter</MenuItem>
              <MenuItem value="Second">Second Quarter</MenuItem>
              <MenuItem value="Third">Third Quarter</MenuItem>
              <MenuItem value="Fourth">Fourth Quarter</MenuItem>
            </TextField>
          </Box>

          {/* Subject Field */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>
              Subject:
            </Typography>
            <RadioGroup
              row
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              sx={{ display: 'flex', gap: 2 }}
            >
              <FormControlLabel
                value="English"
                control={<Radio sx={{ color: '#000', '&.Mui-checked': { color: '#000' } }} />}
                label="English"
                sx={{ color: '#000' }}
              />
              <FormControlLabel
                value="Filipino"
                control={<Radio sx={{ color: '#000', '&.Mui-checked': { color: '#000' } }} />}
                label="Filipino"
                sx={{ color: '#000' }}
              />
            </RadioGroup>
          </Box>

          {/* Deadline Fields */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>
              Deadline:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                { name: 'month', label: 'Month', max: 12, width: '60px' },
                { name: 'day', label: 'Day', max: 31, width: '60px' },
                { name: 'year', label: 'Year', min: new Date().getFullYear(), width: '80px' },
              ].map((field) => (
                <Box key={field.name} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <TextField
                    name={field.name}
                    type="number"
                    variant="outlined"
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    sx={{ backgroundColor: '#fff', borderRadius: '10px', width: field.width }}
                    inputProps={{ 
                      min: field.min || 1, 
                      max: field.max,
                      style: { textAlign: 'center' }
                    }}
                    required
                  />
                  <Typography sx={{ color: '#000', marginTop: 0.5 }}>{field.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'center',
          backgroundColor: '#FFDF16',
          padding: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            borderRadius: '10px',
            width: '120px',
            backgroundColor: '#E49B0F',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#AA8F0B',
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: '10px',
            width: '120px',
            backgroundColor: "#A44444",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#BB5252",
            },
          }}
        >
          {loading ? 'SUBMITTING...' : 'SUBMIT'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetLibraryHoursDialog;
