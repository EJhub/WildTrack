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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
    deadline: null, // Changed from separate month, day, year to a single date
    task: '' // Added task field
  });

  const [loading, setLoading] = useState(false);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [assignedGradeLevels, setAssignedGradeLevels] = useState([]);

  // Parse default grade level into array if it's a comma-separated string
  useEffect(() => {
    if (defaultGradeLevel) {
      // Convert to array if it's a string with commas
      const gradesArray = typeof defaultGradeLevel === 'string' 
        ? defaultGradeLevel.split(',').map(g => g.trim())
        : [defaultGradeLevel];
      
      setAssignedGradeLevels(gradesArray);
      
      // If only one grade is assigned, set it as the default
      if (gradesArray.length === 1) {
        setFormData(prev => ({ ...prev, gradeLevel: gradesArray[0] }));
      }
    }
  }, [defaultGradeLevel]);

  // Set defaults when component mounts or when defaults change
  useEffect(() => {
    // Initialize with next month as default deadline
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    if (open) {
      setFormData(prev => ({ 
        ...prev,
        // Only set default grade if there's exactly one assigned grade
        gradeLevel: assignedGradeLevels.length === 1 ? assignedGradeLevels[0] : prev.gradeLevel,
        subject: defaultSubject || 'English',
        deadline: nextMonth, // Set as Date object
        task: '' // Reset task field when reopening
      }));
    }
  }, [defaultSubject, open, assignedGradeLevels]);

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
        
        // Filter to only include grades that are assigned to the teacher
        if (assignedGradeLevels.length > 0) {
          setGradeOptions(uniqueGrades.filter(grade => 
            assignedGradeLevels.some(assignedGrade => grade === assignedGrade)
          ));
        } else {
          setGradeOptions(uniqueGrades);
        }
      } catch (error) {
        console.error('Error fetching grade levels:', error);
        toast.error('Failed to load grade levels');
      }
    };

    if (open) {
      fetchGradeLevels();
    }
  }, [open, assignedGradeLevels]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, deadline: newDate });
  };

  const validateForm = () => {
    const { minutes, gradeLevel, quarter, deadline, task } = formData;
    if (!minutes || !gradeLevel || !quarter || !deadline) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    // Validate date
    if (deadline < new Date()) {
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
      const formattedDeadline = formData.deadline 
        ? formData.deadline.toISOString().split('T')[0] 
        : null;

      // Create the payload with the formatted date and task
      const payload = {
        minutes: formData.minutes,
        gradeLevel: formData.gradeLevel,
        subject: formData.subject,
        quarter: formData.quarter,
        deadline: formattedDeadline,
        task: formData.task, // Include task in payload
        createdById: user?.id // Add teacher's ID to track who created this requirement
      };

      // Call the provided handleSubmit function
      await handleSubmit(payload);
      
      // Reset form but retain defaults
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setFormData({
        minutes: '',
        gradeLevel: assignedGradeLevels.length === 1 ? assignedGradeLevels[0] : '',
        subject: defaultSubject || 'English',
        quarter: '',
        deadline: nextMonth,
        task: '' // Reset task
      });
    } catch (error) {
      console.error('Error setting library hours:', error);
      toast.error('Failed to set library hours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
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
                disabled={assignedGradeLevels.length === 1}
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

            {/* Task Field */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Typography sx={{ color: '#000', textAlign: 'left' }}>
                Task Description:
              </Typography>
              <TextField
                name="task"
                multiline
                rows={3}
                variant="outlined"
                value={formData.task}
                onChange={handleInputChange}
                placeholder="Describe the reading task requirements..."
                sx={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '10px', 
                  width: '100%' 
                }}
                inputProps={{ maxLength: 1000 }}
              />
              <Typography variant="caption" sx={{ color: '#000', textAlign: 'right' }}>
                {formData.task.length}/1000 characters
              </Typography>
            </Box>

            {/* Deadline Field */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>
                Deadline:
              </Typography>
              <DatePicker
                label="Select Deadline"
                value={formData.deadline}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    sx={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '10px', 
                      width: '200px' 
                    }} 
                  />
                )}
                minDate={new Date()} // Prevent selecting past dates
              />
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
    </LocalizationProvider>
  );
};

export default SetLibraryHours;