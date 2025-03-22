import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
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
import { format, isAfter, isBefore } from 'date-fns';

const AddAcademicYear = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    startYear: null,
    endYear: null,
    quarters: {
      first: { startDate: null, endDate: null },
      second: { startDate: null, endDate: null },
      third: { startDate: null, endDate: null },
      fourth: { startDate: null, endDate: null }
    }
  });

  const handleYearChange = (yearType) => (newValue) => {
    // For year pickers, set to January 1st of selected year
    const yearDate = newValue 
      ? new Date(
          newValue.getFullYear(), 
          0, // January
          1, 
          0, 0, 0
        ) 
      : null;

    setFormData(prev => ({
      ...prev,
      [yearType]: yearDate
    }));
  };

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
      startYear: formData.startYear ? formData.startYear.getFullYear().toString() : '',
      endYear: formData.endYear ? formData.endYear.getFullYear().toString() : '',
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

  // Function to check if a date should be disabled
  const shouldDisableStartDate = (date, quarterKey) => {
    // No restrictions for start dates, but you could add custom logic here
    return false;
  };

  // Function to check if an end date should be disabled
  const shouldDisableEndDate = (date, quarterKey) => {
    const startDate = formData.quarters[quarterKey].startDate;
    // Disable end dates that are before the quarter's start date
    return startDate ? isBefore(date, startDate) : false;
  };

  // Function to check if end year should be disabled
  const shouldDisableEndYear = (date) => {
    const startYear = formData.startYear;
    // Disable end years that are before the start year
    return startYear ? isBefore(date, startYear) : false;
  };

  // Check if there are any validation errors
  const hasYearError = formData.endYear && formData.startYear && isBefore(formData.endYear, formData.startYear);
  
  const hasQuarterErrors = [
    formData.quarters.first.endDate && formData.quarters.first.startDate && 
      isBefore(formData.quarters.first.endDate, formData.quarters.first.startDate),
    formData.quarters.second.endDate && formData.quarters.second.startDate && 
      isBefore(formData.quarters.second.endDate, formData.quarters.second.startDate),
    formData.quarters.third.endDate && formData.quarters.third.startDate && 
      isBefore(formData.quarters.third.endDate, formData.quarters.third.startDate),
    formData.quarters.fourth.endDate && formData.quarters.fourth.startDate && 
      isBefore(formData.quarters.fourth.endDate, formData.quarters.fourth.startDate)
  ].some(error => error === true);
  
  const hasErrors = hasYearError || hasQuarterErrors;

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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Year"
                views={['year']}
                value={formData.startYear}
                onChange={handleYearChange('startYear')}
                slotProps={{ 
                  textField: { 
                    variant: 'outlined',
                    fullWidth: true
                  } 
                }}
              />
              <DatePicker
                label="End Year"
                views={['year']}
                value={formData.endYear}
                onChange={handleYearChange('endYear')}
                shouldDisableDate={shouldDisableEndYear}
                slotProps={{ 
                  textField: { 
                    variant: 'outlined',
                    fullWidth: true,
                    error: hasYearError,
                    helperText: hasYearError 
                      ? 'End year must be after start year' 
                      : ''
                  } 
                }}
              />
            </LocalizationProvider>
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
                    shouldDisableDate={(date) => shouldDisableStartDate(date, 'first')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.first.endDate}
                    onChange={handleDateChange('first', 'endDate')}
                    shouldDisableDate={(date) => shouldDisableEndDate(date, 'first')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true,
                        error: formData.quarters.first.endDate && formData.quarters.first.startDate && 
                               isBefore(formData.quarters.first.endDate, formData.quarters.first.startDate),
                        helperText: formData.quarters.first.endDate && formData.quarters.first.startDate && 
                                   isBefore(formData.quarters.first.endDate, formData.quarters.first.startDate) 
                                   ? 'End date must be after start date' : ''
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                </Box>
              </Box>

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
                    shouldDisableDate={(date) => shouldDisableStartDate(date, 'second')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.second.endDate}
                    onChange={handleDateChange('second', 'endDate')}
                    shouldDisableDate={(date) => shouldDisableEndDate(date, 'second')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true,
                        error: formData.quarters.second.endDate && formData.quarters.second.startDate && 
                               isBefore(formData.quarters.second.endDate, formData.quarters.second.startDate),
                        helperText: formData.quarters.second.endDate && formData.quarters.second.startDate && 
                                   isBefore(formData.quarters.second.endDate, formData.quarters.second.startDate) 
                                   ? 'End date must be after start date' : ''
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
                    shouldDisableDate={(date) => shouldDisableStartDate(date, 'third')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.third.endDate}
                    onChange={handleDateChange('third', 'endDate')}
                    shouldDisableDate={(date) => shouldDisableEndDate(date, 'third')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true,
                        error: formData.quarters.third.endDate && formData.quarters.third.startDate && 
                               isBefore(formData.quarters.third.endDate, formData.quarters.third.startDate),
                        helperText: formData.quarters.third.endDate && formData.quarters.third.startDate && 
                                   isBefore(formData.quarters.third.endDate, formData.quarters.third.startDate) 
                                   ? 'End date must be after start date' : ''
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
                    shouldDisableDate={(date) => shouldDisableStartDate(date, 'fourth')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.quarters.fourth.endDate}
                    onChange={handleDateChange('fourth', 'endDate')}
                    shouldDisableDate={(date) => shouldDisableEndDate(date, 'fourth')}
                    slotProps={{ 
                      textField: { 
                        variant: 'outlined',
                        fullWidth: true,
                        error: formData.quarters.fourth.endDate && formData.quarters.fourth.startDate && 
                               isBefore(formData.quarters.fourth.endDate, formData.quarters.fourth.startDate),
                        helperText: formData.quarters.fourth.endDate && formData.quarters.fourth.startDate && 
                                   isBefore(formData.quarters.fourth.endDate, formData.quarters.fourth.startDate) 
                                   ? 'End date must be after start date' : ''
                      } 
                    }}
                    format="MM/dd/yyyy"
                  />
                </Box>
              </Box>
            </Box>
          </LocalizationProvider>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={hasErrors}
              sx={{
                backgroundColor: hasErrors ? '#d3d3d3' : '#FFD700',
                color: hasErrors ? '#666' : '#000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: hasErrors ? '#d3d3d3' : '#FFC107' },
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