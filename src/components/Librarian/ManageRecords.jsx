import React, { useEffect, useState, useCallback } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress, // Added import for CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../../utils/api'; // Import the API utility

// Force prevent ALL form submissions globally
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Prevent the default form submission behavior completely
    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      console.log('Form submission prevented by override');
      return false;
    };
    
    // Intercept Enter key at the top level
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);
    
    // Disable all forms on the page
    document.querySelectorAll('form').forEach(form => {
      form.setAttribute('onsubmit', 'return false;');
    });
  });
}

const LibrarianManageRecords = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Store original unfiltered data
  const [loading, setLoading] = useState(true);
  const [tableRefreshing, setTableRefreshing] = useState(false); // Added state for table refreshing
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [searchText, setSearchText] = useState('');

  // New states for update functionality
  const [currentRecord, setCurrentRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Main prevent function to stop all default behaviors
  const preventDefaultAndStop = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);

  // Enhanced prevent function for Enter key
  const preventSubmitOnEnter = useCallback((e) => {
    if (e && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Enter submission prevented in field');
      return false;
    }
  }, []);

  // NEW: Global event handlers setup
  useEffect(() => {
    // Stop all form submissions globally
    const handleFormSubmit = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Form submission prevented by global handler');
      return false;
    };

    // Prevent enter key submission in text fields
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const target = e.target;
        const isTextField = 
          target.tagName === 'INPUT' && 
          (target.type === 'text' || target.type === 'date' || target.type === 'number');
        
        if (isTextField) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Enter key submission prevented in text field');
          return false;
        }
      }
    };

    // NEW: Handle clicks on buttons that might refresh
    const handleButtonClick = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
        
        // Only prevent default for buttons inside forms or with type="submit"
        if (button.closest('form') || button.type === 'submit') {
          e.preventDefault();
          e.stopPropagation();
          console.log('Button click prevented from submitting');
          return false;
        }
      }
    };

    // Apply the global handlers
    document.addEventListener('submit', handleFormSubmit, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('click', handleButtonClick, true);

    // Cleanup on component unmount
    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, []);

  // Fetch data using API utility
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        const response = await api.get('/library-hours/summary');
        const result = response.data;
        setData(result);
        setOriginalData(result); // Store original data for filtering
      } catch (error) {
        console.error('Error fetching library hours summary:', error);
      } finally {
        setLoading(false); // Stop loading
        setTableRefreshing(false); // Ensure table refreshing is off
      }
    };
    fetchData();
  }, []);

  // Table-only refresh function
  const refreshTableData = useCallback(async () => {
    setTableRefreshing(true); // Start table refreshing
    try {
      const response = await api.get('/library-hours/summary');
      const result = response.data;
      setData(result);
      setOriginalData(result);
    } catch (error) {
      console.error('Error refreshing library hours summary:', error);
    } finally {
      setTableRefreshing(false); // Stop table refreshing
    }
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    preventDefaultAndStop(event);
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    preventDefaultAndStop(event);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
  };

  // Handle Update action - improved to prevent refresh
  const handleUpdate = useCallback((record, event) => {
    preventDefaultAndStop(event);
    setCurrentRecord({...record}); // Create a copy to avoid direct mutation
    setOpen(true);
  }, [preventDefaultAndStop]);

  // Convert time to 24-hour format
  const convertTo24HourTime = useCallback((time) => {
    if (!time) return "00:00:00";
    
    const [timeStr, ampm] = time.includes(' ') ? time.split(' ') : [time, ''];
    const [hours, minutes] = timeStr.split(':');
    const isPM = ampm.toLowerCase() === 'pm' || time.toLowerCase().includes('pm');
    
    let formattedHours = parseInt(hours, 10);
    
    if (isPM && formattedHours < 12) formattedHours += 12;
    if (!isPM && formattedHours === 12) formattedHours = 0;
    
    return `${String(formattedHours).padStart(2, '0')}:${minutes ? minutes.trim() : '00'}:00`;
  }, []);

  // Handle Search with improved event handling
  const handleSearch = useCallback((e) => {
    preventDefaultAndStop(e);
    setSearchText(e.target.value);
  }, [preventDefaultAndStop]);

  // Handle Search Submit - improved to filter data
  const handleSearchSubmit = useCallback((e) => {
    preventDefaultAndStop(e);
    setTableRefreshing(true); // Start table refreshing
    console.log('Searching for:', searchText);
    
    // Apply search to filter data
    let filteredData = [...originalData];
    
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(student => 
        // Search through ID
        student.idNumber?.toString().toLowerCase().includes(searchLower) ||
        // Search through name
        `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchLower) ||
        // Search through date
        student.latestLibraryHourDate?.toLowerCase().includes(searchLower)
      );
    }
    
    setData(filteredData);
    setPage(0); // Reset to first page after search
    setTableRefreshing(false); // Stop table refreshing
  }, [searchText, originalData, preventDefaultAndStop]);

  // Reset all filters function
  const handleResetFilters = useCallback((e) => {
    if (e) preventDefaultAndStop(e);
    
    setTableRefreshing(true); // Start table refreshing
    
    // Reset all filter states
    setSearchText('');
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    
    // Reset data to original
    setData(originalData);
    setPage(0);
    
    setTableRefreshing(false); // Stop table refreshing
  }, [originalData, preventDefaultAndStop]);

  // Handle Filter Apply with improved event handling
  const handleFilterApply = useCallback((e) => {
    preventDefaultAndStop(e);
    setTableRefreshing(true); // Start table refreshing
    console.log('Applying filters:', { dateFrom, dateTo, academicYear });
    
    // Start with original or search-filtered data
    let filteredData = [...originalData];
    
    // Apply search text filter if present
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(student => 
        student.idNumber?.toString().toLowerCase().includes(searchLower) ||
        `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchLower) ||
        student.latestLibraryHourDate?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredData = filteredData.filter(student => {
        if (!student.latestLibraryHourDate) return false;
        const recordDate = new Date(student.latestLibraryHourDate);
        return recordDate >= fromDate;
      });
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      filteredData = filteredData.filter(student => {
        if (!student.latestLibraryHourDate) return false;
        const recordDate = new Date(student.latestLibraryHourDate);
        return recordDate <= toDate;
      });
    }
    
    // Filter by academic year
    if (academicYear) {
      // Academic years typically run from August/September to May/June
      // Adjust this logic based on your specific requirements
      const [startYear, endYear] = academicYear.split('-');
      const academicStartDate = new Date(`${startYear}-08-01`); // August 1st of start year
      const academicEndDate = new Date(`${endYear}-07-31`);    // July 31st of end year
      
      filteredData = filteredData.filter(student => {
        if (!student.latestLibraryHourDate) return false;
        const recordDate = new Date(student.latestLibraryHourDate);
        return recordDate >= academicStartDate && recordDate <= academicEndDate;
      });
    }
    
    // Update the filtered data
    setData(filteredData);
    // Reset pagination
    setPage(0);
    
    setTableRefreshing(false); // Stop table refreshing
  }, [dateFrom, dateTo, academicYear, searchText, originalData, preventDefaultAndStop]);

  // Handle field changes in the update modal - improved
  const handleFieldChange = useCallback((field, value, event) => {
    if (event) {
      preventDefaultAndStop(event);
    }
    
    if (!currentRecord) return;
    
    setCurrentRecord(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  }, [currentRecord, preventDefaultAndStop]);

  // Handle Update Submit - updated to accept a manual record and use the API utility
  const handleUpdateSubmit = useCallback((e, manualRecord = null) => {
    if (e) {
      preventDefaultAndStop(e);
    }
    
    setTableRefreshing(true); // Start table refreshing
    const recordToUpdate = manualRecord || currentRecord;
    
    const updateRecord = async () => {
      try {
        // Validate input with null checks
        if (!recordToUpdate || 
            !recordToUpdate.latestLibraryHourDate || 
            !recordToUpdate.latestTimeIn || 
            !recordToUpdate.latestTimeOut) {
          setError('Please fill in all required fields');
          setTableRefreshing(false);
          return;
        }

        const updatedData = {
          idNumber: recordToUpdate.idNumber,
          latestLibraryHourDate: new Date(recordToUpdate.latestLibraryHourDate)
            .toISOString()
            .split('T')[0], // Format date to yyyy-MM-dd
          latestTimeIn: convertTo24HourTime(recordToUpdate.latestTimeIn), // Convert to HH:mm:ss
          latestTimeOut: convertTo24HourTime(recordToUpdate.latestTimeOut), // Convert to HH:mm:ss
          totalMinutes: recordToUpdate.totalMinutes || 0,
        };

        // Use the API utility instead of fetch
        const response = await api.put('/library-hours/update-summary', updatedData);
        const result = response.data;
        console.log('Record updated successfully:', result);

        // Update local state to reflect changes
        setData((prevData) =>
          prevData.map((record) =>
            record.idNumber === recordToUpdate.idNumber ? { ...record, ...updatedData } : record
          )
        );
        
        // Also update original data
        setOriginalData((prevData) =>
          prevData.map((record) =>
            record.idNumber === recordToUpdate.idNumber ? { ...record, ...updatedData } : record
          )
        );

        setOpen(false); // Close the modal
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error updating record:', error);
        setError(error.message || 'Failed to update record');
      } finally {
        setTableRefreshing(false); // Stop table refreshing regardless of outcome
      }
    };

    updateRecord();
  }, [currentRecord, convertTo24HourTime, preventDefaultAndStop]);

  // Improved Update Modal Component with local state to prevent refresh issues
  const UpdateModal = () => {
    // Create local state for form values - removed idNumber, date, minutes
    const [formValues, setFormValues] = useState({
      timeIn: '',
      timeOut: ''
    });
    
    // Set initial values when modal opens - only keeping timeIn and timeOut
    useEffect(() => {
      if (currentRecord) {
        setFormValues({
          timeIn: currentRecord.latestTimeIn || '',
          timeOut: currentRecord.latestTimeOut || ''
        });
      }
    }, [currentRecord]);
    
    // Safe change handler that won't trigger form submission
    const handleInputChange = (field, value) => {
      setFormValues(prev => ({
        ...prev,
        [field]: value
      }));
    };
    
    // Only update the actual record when submit button is clicked
    // Preserve original values for fields we're not showing
    const submitChanges = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Update the currentRecord with local form values
      // Keeping the original idNumber, date and minutes values
      const updatedRecord = {
        ...currentRecord,
        latestTimeIn: formValues.timeIn,
        latestTimeOut: formValues.timeOut
      };
      
      // Call the existing update handler with the updated record
      handleUpdateSubmit(e, updatedRecord);
    };
    
    if (!currentRecord) return null;

    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <Dialog 
          open={open}
          onClose={() => setOpen(false)}
          disableRestoreFocus
          disableEnforceFocus
          disableAutoFocus
          disableEscapeKeyDown
          PaperProps={{
            sx: {
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90vw'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#F8C400', 
            color: 'black',
            fontWeight: 'bold',
            borderBottom: '1px solid #ddd'
          }}>
            Update Library Hours Record
          </DialogTitle>
          <DialogContent sx={{ padding: '24px 24px 16px' }}>
            {error && (
              <Typography color="error" sx={{ marginBottom: 2 }}>
                {error}
              </Typography>
            )}
            
            <Typography variant="body2" sx={{ marginBottom: 2, color: '#666' }}>
              Student ID: {currentRecord.idNumber} | {`${currentRecord.firstName || ''} ${currentRecord.lastName || ''}`}
            </Typography>
            
            <Typography variant="body2" sx={{ marginBottom: 3, color: '#666' }}>
              Date: {currentRecord.latestLibraryHourDate}
            </Typography>
            
            <TextField
              label="Time In"
              value={formValues.timeIn}
              onChange={(e) => {
                e.preventDefault();
                handleInputChange('timeIn', e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              fullWidth
              sx={{ 
                marginBottom: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
              inputProps={{ autoComplete: "off" }}
            />
            
            <TextField
              label="Time Out"
              value={formValues.timeOut}
              onChange={(e) => {
                e.preventDefault();
                handleInputChange('timeOut', e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
              inputProps={{ autoComplete: "off" }}
            />
          </DialogContent>
              
          <DialogActions sx={{ padding: '16px 24px 24px', justifyContent: 'center' }}>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              type="button"
              variant="outlined"
              sx={{
                borderRadius: '8px',
                color: 'black',
                borderColor: '#ccc',
                fontWeight: 'medium',
                minWidth: '100px',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#aaa',
                },
              }}
            >
              Cancel
            </Button>
            
            <Button 
              onClick={submitChanges}
              color="primary"
              type="button"
              variant="contained"
              sx={{
                borderRadius: '8px',
                backgroundColor: '#FFDF16',
                color: 'black',
                fontWeight: 'bold',
                minWidth: '100px',
                '&:hover': {
                  backgroundColor: '#FFEB3B',
                },
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };
    
  // Main component JSX with all the "form" elements replaced with divs
  return (
    <>
      <NavBar />
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh',
          overflow: 'hidden' // Prevent outer document scrolling
        }}
      >
        <SideBar />

        <Box
          sx={{
            padding: '32px 32px 120px 32px', // Increased bottom padding
            flexGrow: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
            '&::-webkit-scrollbar': { // Style scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
          onClick={preventDefaultAndStop}
        >
          <Typography
            variant="h4"
            sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left' }}
          >
            Manage Records
          </Typography>

          {/* Search and Filters Section - Changed from form to div */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
              gap: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Type here..."
              size="small"
              value={searchText}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  preventDefaultAndStop(e);
                  handleSearchSubmit(e);
                } else {
                  preventSubmitOnEnter(e);
                }
              }}
              onClick={preventDefaultAndStop}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '400px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSearchSubmit}
                      size="small"
                      type="button"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                autoComplete: "off"
              }}
            />
          </Box>

          {/* Additional Filters Section: Date, Academic Year - Changed from form to div */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginRight: '100px',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              marginBottom: 3,
            }}
            onClick={preventDefaultAndStop}
          >
            <TextField
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                preventDefaultAndStop(e);
                setDateFrom(e.target.value);
              }}
              onKeyDown={preventSubmitOnEnter}
              onClick={preventDefaultAndStop}
              sx={{ 
                backgroundColor: '#fff', 
                borderRadius: '15px', 
                flexGrow: 1, 
                maxWidth: '200px',
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 'medium',
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                autoComplete: "off"
              }}
            />

            <TextField
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(e) => {
                preventDefaultAndStop(e);
                setDateTo(e.target.value);
              }}
              onKeyDown={preventSubmitOnEnter}
              onClick={preventDefaultAndStop}
              sx={{ 
                backgroundColor: '#fff', 
                borderRadius: '15px', 
                flexGrow: 1, 
                maxWidth: '200px',
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 'medium',
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                autoComplete: "off"
              }}
            />

            <FormControl 
              sx={{ 
                backgroundColor: '#fff', 
                borderRadius: '15px', 
                minWidth: '250px',
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 'medium',
                }
              }}
              onClick={preventDefaultAndStop}
            >
              <InputLabel>Select Academic Year</InputLabel>
              <Select
                value={academicYear}
                onChange={(e) => {
                  preventDefaultAndStop(e);
                  setAcademicYear(e.target.value);
                }}
                label="Academic Year"
                size="small"
                onKeyDown={preventSubmitOnEnter}
              >
                <MenuItem value="">All Academic Years</MenuItem>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
                <MenuItem value="2026-2027">2026-2027</MenuItem>
              </Select>
            </FormControl>

            {/* Filter Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                type="button"
                variant="contained"
                onClick={(e) => {
                  preventDefaultAndStop(e);
                  handleFilterApply(e);
                }}
                sx={{
                  color: 'black',
                  backgroundColor: '#FFDF16',
                  fontSize: '11px',
                  border: '1px solid #FFEB3B',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#FFEB3B',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                Apply Filter
              </Button>
              
              <Button
                type="button"
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  color: 'black',
                  borderColor: '#ccc',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#aaa',
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Table Section */}
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'visible', 
              marginBottom: 5,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative', // For positioning the loading overlay
            }}
            onClick={preventDefaultAndStop}
          >
            {/* Loading or refreshing overlay */}
            {(loading || tableRefreshing) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <CircularProgress size={60} thickness={4} sx={{ color: '#800000' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#800000', fontWeight: 'bold' }}>
                  {loading ? 'Loading records...' : 'Refreshing data...'}
                </Typography>
              </Box>
            )}

            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', borderTopLeftRadius: '5px', color: 'black', backgroundColor: '#F8C400' }}>
                    ID Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    Time-In
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    Time-Out
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    Total Minutes Completed
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderTopRightRadius: '5px', color: 'black', backgroundColor: '#F8C400' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                        '&:hover': { backgroundColor: '#FCEAEA' },
                      }}
                    >
                      <TableCell>{student.idNumber}</TableCell>
                      <TableCell>{`${student.firstName || ''} ${student.lastName || ''}`}</TableCell>
                      <TableCell>{student.latestLibraryHourDate}</TableCell>
                      <TableCell>{student.latestTimeIn}</TableCell>
                      <TableCell>{student.latestTimeOut}</TableCell>
                      <TableCell>{student.totalMinutes}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="contained"
                          onClick={(e) => handleUpdate(student, e)}
                          sx={{
                            color: 'black',
                            backgroundColor: '#FFDF16',
                            fontSize: '11px',
                            border: '1px solid #FFEB3B',
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#FFEB3B',
                            },
                          }}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            
            {/* Integrated pagination inside the TableContainer */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                paddingTop: 2,
                paddingBottom: 2,
                backgroundColor: 'transparent',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                position: 'relative',
              }}
            />
          </TableContainer>
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 60, width: '100%' }} />

          {/* Update Modal */}
          <UpdateModal />
        </Box>
      </Box>
    </>
  );
};

export default LibrarianManageRecords;