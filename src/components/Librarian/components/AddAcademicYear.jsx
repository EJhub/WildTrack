import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import { format } from 'date-fns';

const AddAcademicYear = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    startYear: '',
    endYear: '',
    quarters: {
      first: { startDate: null, endDate: null },
      second: { startDate: null, endDate: null },
      third: { startDate: null, endDate: null },
      fourth: { startDate: null, endDate: null }
    }
  });

  const handleDateChange = (quarterKey, dateType) => (newValue) => {
    // Ensure the date is set to the start of the day
    const adjustedDate = newValue 
      ? new Date(
          newValue.getFullYear(), 
          newValue.getMonth(), 
          newValue.getDate(), 
          0, 0, 0
        ) 
      : null;

    setFormData(prev => ({
      ...prev,
      quarters: {
        ...prev.quarters,
        [quarterKey]: {
          ...prev.quarters[quarterKey],
          [dateType]: adjustedDate
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Transform the data to match backend entity
    const academicYearData = {
      startYear: formData.startYear,
      endYear: formData.endYear,
      firstQuarter: {
        startDate: formData.quarters.first.startDate 
          ? format(formData.quarters.first.startDate, 'yyyy-MM-dd') 
          : null,
        endDate: formData.quarters.first.endDate 
          ? format(formData.quarters.first.endDate, 'yyyy-MM-dd') 
          : null
      },
      secondQuarter: {
        startDate: formData.quarters.second.startDate 
          ? format(formData.quarters.second.startDate, 'yyyy-MM-dd') 
          : null,
        endDate: formData.quarters.second.endDate 
          ? format(formData.quarters.second.endDate, 'yyyy-MM-dd') 
          : null
      },
      thirdQuarter: {
        startDate: formData.quarters.third.startDate 
          ? format(formData.quarters.third.startDate, 'yyyy-MM-dd') 
          : null,
        endDate: formData.quarters.third.endDate 
          ? format(formData.quarters.third.endDate, 'yyyy-MM-dd') 
          : null
      },
      fourthQuarter: {
        startDate: formData.quarters.fourth.startDate 
          ? format(formData.quarters.fourth.startDate, 'yyyy-MM-dd') 
          : null,
        endDate: formData.quarters.fourth.endDate 
          ? format(formData.quarters.fourth.endDate, 'yyyy-MM-dd') 
          : null
      }
    };
  
    try {
      const response = await axios.post('http://localhost:8080/api/academic-years/create', academicYearData);
      console.log('Academic year created:', response.data);
      onClose();
    } catch (error) {
      console.error('Error creating academic year:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Add Academic Year
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              label="Start Year"
              fullWidth
              value={formData.startYear}
              onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
            />
            <TextField
              label="End Year"
              fullWidth
              value={formData.endYear}
              onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
            />
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Quarter Dates
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {/* First Quarter */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  First Quarter
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={formData.quarters.first.startDate}
                    onChange={handleDateChange('first', 'startDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.first.endDate}
                    onChange={handleDateChange('first', 'endDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                </Box>
              </Box>

              {/* Similar modifications for other quarters */}
              {/* Second Quarter */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Second Quarter
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={formData.quarters.second.startDate}
                    onChange={handleDateChange('second', 'startDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.second.endDate}
                    onChange={handleDateChange('second', 'endDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                </Box>
              </Box>

              {/* Third Quarter */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Third Quarter
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={formData.quarters.third.startDate}
                    onChange={handleDateChange('third', 'startDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.third.endDate}
                    onChange={handleDateChange('third', 'endDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                </Box>
              </Box>

              {/* Fourth Quarter */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Fourth Quarter
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={formData.quarters.fourth.startDate}
                    onChange={handleDateChange('fourth', 'startDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.fourth.endDate}
                    onChange={handleDateChange('fourth', 'endDate')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined' 
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                </Box>
              </Box>
            </Box>
          </LocalizationProvider>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#FFC107' },
                width: '200px'
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

export default AddAcademicYear;