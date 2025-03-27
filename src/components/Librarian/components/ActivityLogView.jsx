import React, { useState, useEffect } from 'react';
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
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
// Import API utility
import api from '../../../utils/api';

const ActivityLogView = ({ currentView, setCurrentView }) => {
  // States for activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States for search/filtering
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('2023-2024');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  
  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  // Fetch teachers for the dropdown
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const response = await api.get('/teachers/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTeachers(response.data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    
    fetchTeachers();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      
      // Prepare the request params
      const params = {};
      if (academicYear) params.academicYear = academicYear;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (searchQuery) params.query = searchQuery;
      if (selectedTeacher) params.userId = selectedTeacher;
      
      const response = await api.get('/activity-logs', {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        params: params
      });
      
      setActivityLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError(`Failed to load activity logs: ${error.response?.data?.message || error.message}`);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
    // Don't auto-refetch when filters change since we want manual filter application
  }, []); 

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0); // Reset to the first page when the number of rows per page changes
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handler for Date From with mutual exclusivity
  const handleDateFromChange = (e) => {
    const value = e.target.value;
    
    // If selecting a date, clear academic year
    // And ensure dateTo is not earlier than dateFrom
    if (value) {
      if (dateTo && new Date(value) > new Date(dateTo)) {
        // If dateFrom is later than dateTo, reset dateTo
        setDateTo('');
      }
      setAcademicYear('');
    }
    
    setDateFrom(value);
  };

  // Handler for Date To with mutual exclusivity
  const handleDateToChange = (e) => {
    const value = e.target.value;
    
    // Clear academic year if date is set
    if (value) {
      setAcademicYear('');
    }
    
    setDateTo(value);
  };

  // Handler for Academic Year with mutual exclusivity
  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    
    // Clear date range if academic year is set
    if (value) {
      setDateFrom('');
      setDateTo('');
    }
    
    setAcademicYear(value);
  };

  // Apply search and filters with validation
  const applyFilters = () => {
    // Validate date range if both dates are provided
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Date From must be before or equal to Date To');
      return;
    }
    
    fetchActivityLogs();
  };

  // Handle Enter key press in search field
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      applyFilters();
    }
  };

  // Format the date for display
  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format teacher name for display in dropdown
  const formatTeacherName = (teacher) => {
    if (!teacher) return '';
    
    if (teacher.middleName && teacher.middleName.trim() !== '') {
      return `${teacher.firstName} ${teacher.middleName.charAt(0)}. ${teacher.lastName}`;
    }
    return `${teacher.firstName} ${teacher.lastName}`;
  };

  // Get the logs for the current page
  const paginatedLogs = activityLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      {/* Top Controls Row - Search Bar and View Toggle Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 3,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: 2
        }}
      >
        {/* Left side - Search Bar */}
        <TextField
          variant="outlined"
          placeholder="Search activity logs..."
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '15px',
            flexGrow: 1,
            maxWidth: { xs: '100%', sm: '400px' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Right side - Toggle Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={currentView === "Activity Log" ? "contained" : "outlined"}
            onClick={() => setCurrentView && setCurrentView("Activity Log")}
            sx={{
              color: currentView === 'Activity Log' ? '#800000' : '#800000',
              backgroundColor: currentView === 'Activity Log' ? '#FFEB3B' : 'white',
              border: '1px solid #800000',
              fontWeight: 'bold',
              height: '40px',
              '&:hover': {
                backgroundColor: '#FFEB3B',
                color: '#800000',
              },
            }}
          >
            Activity Log
          </Button>

          <Button
            variant={currentView === "Teachers" ? "contained" : "outlined"}
            onClick={() => setCurrentView && setCurrentView("Teachers")}
            sx={{
              color: currentView === 'Teachers' ? '#800000' : '#800000',
              backgroundColor: currentView === 'Teachers' ? '#FFEB3B' : 'white',
              border: '1px solid #800000',
              fontWeight: 'bold',
              height: '40px',
              '&:hover': {
                backgroundColor: '#FFEB3B',
                color: '#800000',
              },
            }}
          >
            Teachers
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginRight: '100px',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          marginBottom: 3,
        }}
      >
        <TextField
          label="Date From"
          type="date"
          value={dateFrom}
          onChange={handleDateFromChange}
          disabled={!!academicYear} // Disable if academicYear has a value
          sx={{ 
            backgroundColor: '#fff', 
            borderRadius: '15px', 
            flexGrow: 1, 
            maxWidth: '200px',
            '& .Mui-disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              opacity: 0.7
            }
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          label="Date To"
          type="date"
          value={dateTo}
          onChange={handleDateToChange}
          disabled={!!academicYear || !dateFrom} // Disable if academicYear has a value or dateFrom is empty
          inputProps={{
            min: dateFrom || undefined // Set minimum date to dateFrom
          }}
          sx={{ 
            backgroundColor: '#fff', 
            borderRadius: '15px', 
            flexGrow: 1, 
            maxWidth: '200px',
            '& .Mui-disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              opacity: 0.7
            }
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl sx={{ 
          backgroundColor: '#fff', 
          borderRadius: '15px', 
          minWidth: '200px',
          '& .Mui-disabled': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            opacity: 0.7
          }
        }}>
          <InputLabel>Academic Year</InputLabel>
          <Select
            value={academicYear}
            onChange={handleAcademicYearChange}
            label="Academic Year"
            size="small"
            disabled={!!dateFrom || !!dateTo} // Disable if either date filter has a value
          >
            <MenuItem value="">All Years</MenuItem>
            <MenuItem value="2023-2024">2023-2024</MenuItem>
            <MenuItem value="2024-2025">2024-2025</MenuItem>
            <MenuItem value="2025-2026">2025-2026</MenuItem>
            <MenuItem value="2026-2027">2026-2027</MenuItem>
          </Select>
        </FormControl>
        
        {/* New Teacher Filter */}
        <FormControl sx={{ backgroundColor: '#fff', borderRadius: '15px', minWidth: '200px' }}>
          <InputLabel>Teacher</InputLabel>
          <Select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            label="Teacher"
            size="small"
          >
            <MenuItem value="">All Teachers</MenuItem>
            {teachers.filter(t => t.role === 'Teacher').map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>
                {formatTeacherName(teacher)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton onClick={applyFilters} color="primary">
          <FilterListIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Activity Logs Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                Log ID
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                Date & Time
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                Activity
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                Description
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Loading activity logs...
                  </Box>
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No activity logs found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log, index) => (
                <TableRow
                  key={log.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#FFF8E1' : '#ffffff',
                    '&:hover': { backgroundColor: '#FFB300' },
                  }}
                >
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{log.userRole}</TableCell>
                  <TableCell>
                    {log.activity === 'LIBRARY_HOURS_CREATED' ? 'Created Library Hours' :
                     log.activity === 'LIBRARY_HOURS_APPROVED' ? 'Approved Library Hours' :
                     log.activity === 'LIBRARY_HOURS_REJECTED' ? 'Rejected Library Hours' :
                     log.activity}
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={activityLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 2,
            width: '100%',
          }}
        />
      </Box>
    </>
  );
};

export default ActivityLogView;