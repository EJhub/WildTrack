import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../../AuthContext'; // Import AuthContext
import api from '../../../utils/api'; // Import the API utility

const SetLibraryHours = ({ open, handleClose, handleSubmit, defaultGradeLevel, defaultSubject }) => {
  const { user } = useContext(AuthContext); // Get current user from context
  const [formData, setFormData] = useState({
    minutes: '',
    gradeLevel: '',
    subject: 'English',
    quarter: '',
    month: '',
    day: '',
    year: ''
  });

  const [loading, setLoading] = useState(false);
  const [gradeOptions, setGradeOptions] = useState([]);

  // Set defaults when component mounts or when defaults change
  useEffect(() => {
    // Initialize with current date parts for deadline
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    if (open) {
      setFormData(prev => ({ 
        ...prev, 
        gradeLevel: defaultGradeLevel || '', 
        subject: defaultSubject || 'English',
        month: nextMonth.getMonth() + 1,
        day: nextMonth.getDate(),
        year: nextMonth.getFullYear()
      }));
    }
  }, [defaultGradeLevel, defaultSubject, open]);

  // Fetch grade levels when dialog opens
  useEffect(() => {
    const fetchGradeLevels = async () => {
      try {
        const token = localStorage.getItem('token');
        // Set token in API utility headers
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        const gradesResponse = await api.get('/grade-sections/all');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        setGradeOptions(uniqueGrades);
      } catch (error) {
        console.error('Error fetching grade levels:', error);
        toast.error('Failed to load grade levels');
      }
    };

    if (open) {
      fetchGradeLevels();
    }
  }, [open]);

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
      // Format the date for the backend
      const deadline = new Date(
        parseInt(formData.year),
        parseInt(formData.month) - 1,
        parseInt(formData.day)
      ).toISOString().split('T')[0];

      // Create the payload with the formatted date
      const payload = {
        minutes: formData.minutes,
        gradeLevel: formData.gradeLevel,
        subject: formData.subject,
        quarter: formData.quarter,
        deadline: deadline,
        createdById: user?.id // Add teacher's ID to track who created this requirement
      };

      // Call the provided handleSubmit function
      await handleSubmit(payload);
      
      // Reset form but retain defaults
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData({
        minutes: '',
        gradeLevel: defaultGradeLevel || '',
        subject: defaultSubject || 'English',
        quarter: '',
        month: nextMonth.getMonth() + 1,
        day: nextMonth.getDate(),
        year: nextMonth.getFullYear()
      });
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
              disabled={!!defaultGradeLevel} // Disable if default is provided
            >
              <MenuItem value="">Select Grade</MenuItem>
              {gradeOptions.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {typeof grade === 'number' ? `Grade ${grade}` : grade}
                </MenuItem>
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
            {defaultSubject ? (
              // If default subject is provided, show it as text
              <Typography sx={{ color: '#000', fontWeight: 'bold' }}>
                {defaultSubject}
              </Typography>
            ) : (
              // Otherwise show radio buttons
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
            )}
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

export default SetLibraryHours;