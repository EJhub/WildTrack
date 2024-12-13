import React, { useState } from 'react';
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
 
const SetLibraryHours = ({ open, handleClose, handleSubmit }) => {
  const [formData, setFormData] = useState({
    minutes: '',
    gradeLevel: '',
    subject: 'English', // Default subject
    month: '',
    day: '',
    year: '',
  });
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
 
  const onSubmit = () => {
    handleSubmit(formData);
    handleClose();
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
          border: '2px solid #000',
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: '#F8C400', // Updated color for title background
          color: '#000',
        }}
      >
        <h2>Set Library Hours</h2>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: '#F8C400', // Updated color for content background
          padding: '30px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
          {/* Minutes Field */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>Minutes:</Typography>
            <TextField
              name="minutes"
              type="number"
              variant="outlined"
              value={formData.minutes}
              onChange={handleInputChange}
              sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '100px' }}
              inputProps={{ min: 0 }}
            />
          </Box>
 
          {/* Grade Level Field */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>Grade Level:</Typography>
            <TextField
              name="gradeLevel"
              select
              variant="outlined"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '200px' }}
            >
              {[...Array(12).keys()].map((grade) => (
                <MenuItem key={grade} value={grade + 1}>{`Grade ${grade + 1}`}</MenuItem>
              ))}
            </TextField>
          </Box>
 
          {/* Subject Field */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>Subject:</Typography>
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
            <Typography sx={{ color: '#000', width: '100px', textAlign: 'left' }}>Deadline:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TextField
                label="Month"
                name="month"
                type="number"
                variant="outlined"
                value={formData.month}
                onChange={handleInputChange}
                sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '60px' }}
                inputProps={{ min: 1, max: 12 }}
              />
              <Typography sx={{ color: '#000', marginTop: 0.5 }}>Month</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TextField
                label="Day"
                name="day"
                type="number"
                variant="outlined"
                value={formData.day}
                onChange={handleInputChange}
                sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '60px' }}
                inputProps={{ min: 1, max: 31 }}
              />
              <Typography sx={{ color: '#000', marginTop: 0.5 }}>Day</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TextField
                label="Year"
                name="year"
                type="number"
                variant="outlined"
                value={formData.year}
                onChange={handleInputChange}
                sx={{ backgroundColor: '#fff', borderRadius: '10px', width: '80px' }}
                inputProps={{ min: new Date().getFullYear() }}
              />
              <Typography sx={{ color: '#000', marginTop: 0.5 }}>Year</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
 
      {/* Dialog Actions */}
      <DialogActions
        sx={{
          justifyContent: 'center',
          backgroundColor: '#F8C400', // Updated color for actions background
          padding: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            borderRadius: '10px',
            width: '120px',
            backgroundColor: '#BB5252',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#A44444',
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          sx={{
            borderRadius: '10px',
            width: '120px',
            backgroundColor: '#000',
            color: '#F8C400',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
        >
          SUBMIT
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
export default SetLibraryHours;