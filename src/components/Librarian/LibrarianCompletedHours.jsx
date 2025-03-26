import React, { useState, useContext, useEffect } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import { AuthContext } from '../AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Tooltip from '@mui/material/Tooltip';
// Import sort icons
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

const LibrarianCompletedHours = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredQuarter, setFilteredQuarter] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [subject, setSubject] = useState('');
  
  // Add sort state
  const [orderBy, setOrderBy] = useState('name'); // Default sort by date completed
  const [order, setOrder] = useState('asc'); // Default sort direction (newest first)
  
  // Available grade levels and subjects for filtering
  const gradeOptions = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", 
    "Grade 5", "Grade 6", "Grade 7", "Grade 8", 
    "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];
  
  const subjectOptions = [
    "English", "Mathematics", "Science", "Social Studies", 
    "Filipino", "MAPEH", "TLE", "Values Education", "Other"
  ];
  
  // Get user context
  const { user } = useContext(AuthContext);

  // Check if user is a librarian
  useEffect(() => {
    if (!user || user.role !== 'Librarian') {
      setError('You must be logged in as a librarian to view this page');
      setLoading(false);
    }
  }, [user]);

  // Effect to apply sorting when order or orderBy changes
  useEffect(() => {
    if (completedRecords.length > 0) {
      applySortAndFilter();
    }
  }, [order, orderBy]);

  // SortIndicator component for visual feedback
  const SortIndicator = ({ column }) => {
    if (orderBy !== column) {
      return <UnfoldMoreIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5, opacity: 0.5 }} />;
    }
    return order === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
      : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />;
  };

  // Function to handle sort requests
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Function to sort data
  const getSortedData = (data) => {
    if (!orderBy || !data.length) return data;
    
    return [...data].sort((a, b) => {
      // Handle null values
      if (a[orderBy] === null && b[orderBy] === null) return 0;
      if (a[orderBy] === null) return order === 'asc' ? -1 : 1;
      if (b[orderBy] === null) return order === 'asc' ? 1 : -1;
      
      // Special case for date sorting
      if (orderBy === 'dateCompleted') {
        const aDate = new Date(a[orderBy]);
        const bDate = new Date(b[orderBy]);
        return order === 'asc' 
          ? aDate - bDate 
          : bDate - aDate;
      }
      
      // For string values (most other columns)
      const aValue = String(a[orderBy]).toLowerCase();
      const bValue = String(b[orderBy]).toLowerCase();
      
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  // Function to apply sorting and filtering
  const applySortAndFilter = () => {
    // Apply search filter first
    const filtered = completedRecords.filter((record) => {
      const searchLower = search.toLowerCase();
      return (
        record.name?.toLowerCase().includes(searchLower) ||
        record.idNumber?.includes(search) ||
        record.gradeLevel?.toLowerCase().includes(searchLower) ||
        record.subject?.toLowerCase().includes(searchLower)
      );
    });
    
    // Then apply sorting
    return getSortedData(filtered);
  };

  // Function to fetch all completed library hours
  const fetchCompletedLibraryHours = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      
      // Add filter parameters
      if (params.gradeLevel) {
        queryParams.append('gradeLevel', params.gradeLevel);
      }
      
      if (params.subject) {
        queryParams.append('subject', params.subject);
      }
      
      if (params.quarter) {
        queryParams.append('quarter', params.quarter);
      }
      
      if (params.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      
      if (params.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }
      
      if (params.academicYear) {
        queryParams.append('academicYear', params.academicYear);
      }
      
      // Make API call to fetch all completed library hours
      const response = await axios.get(
        `http://localhost:8080/api/library-hours/completed?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCompletedRecords(response.data);
      setPage(0); // Reset to first page when loading new data
    } catch (err) {
      console.error('Error fetching completed library hours:', err);
      setError('Failed to fetch completed library hours. Please try again later.');
      toast.error('Failed to fetch completed library hours');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user && user.role === 'Librarian') {
      fetchCompletedLibraryHours();
    }
  }, [user]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Updated handler for Date From - implement mutual exclusivity with academicYear
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

  // Updated handler for Date To - implement mutual exclusivity with academicYear
  const handleDateToChange = (e) => {
    const value = e.target.value;
    
    // Clear academic year if date is set
    if (value) {
      setAcademicYear('');
    }
    
    setDateTo(value);
  };

  // Updated handler for Academic Year - implement mutual exclusivity with date filters
  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    
    // Clear date range if academic year is set
    if (value) {
      setDateFrom('');
      setDateTo('');
    }
    
    setAcademicYear(value);
  };

  // Apply filters with date validation
  const handleApplyFilters = () => {
    // Validate date range if both dates are provided
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Date From must be before or equal to Date To');
      return;
    }
    
    const filterParams = {
      dateFrom,
      dateTo,
      academicYear,
      quarter: filteredQuarter,
      gradeLevel,
      subject
    };
    
    // Remove empty parameters
    Object.keys(filterParams).forEach(key => {
      if (!filterParams[key]) delete filterParams[key];
    });
    
    fetchCompletedLibraryHours(filterParams);
  };

  // Reset filters
  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setFilteredQuarter('');
    setGradeLevel('');
    setSubject('');
    
    fetchCompletedLibraryHours();
  };

  // Get filtered and sorted records
  const filteredAndSortedRecords = applySortAndFilter();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get current page records
  const paginatedRecords = filteredAndSortedRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate statistics
  const totalRecords = filteredAndSortedRecords.length;
  const uniqueStudents = new Set(filteredAndSortedRecords.map(record => record.idNumber)).size;

  // Style for sortable headers
  const sortableHeaderStyle = {
    color: '#000', 
    fontWeight: 'bold', 
    backgroundColor: '#FFD700',
    p: 2,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#E6C200' // Darker shade on hover
    }
  };

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box sx={{ 
        display: 'flex', 
        height: '100vh',
        overflow: 'hidden' // Prevent outer document scrolling
      }}>
        <SideBar />
        <Box
          sx={{
            padding: '32px 32px 120px 32px', // Increased bottom padding
            flexGrow: 1,
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': { // Style scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          {/* Title and Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', color: '#000' }}
            >
              Completed Library Hours
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#000', fontWeight: 'bold' }}>
                Total no. of completed library hours: {totalRecords.toString().padStart(2, '0')}
              </Typography>
              <Typography sx={{ color: '#000', fontWeight: 'bold' }}>
                Total no. of Students: {uniqueStudents.toString().padStart(2, '0')}
              </Typography>
            </Box>
          </Box>

          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            border: '1px solid #ccc', 
            borderRadius: '5px',
            maxWidth: '320px',
            mb: 2,
            px: 1
          }}>
            <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            <TextField
              placeholder="Type here..."
              variant="standard"
              fullWidth
              value={search}
              onChange={handleSearch}
              sx={{
                '& .MuiInput-underline:before': { borderBottom: 'none' },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                '& .MuiInput-underline:after': { borderBottom: 'none' },
              }}
              InputProps={{
                disableUnderline: true
              }}
            />
          </Box>

          {/* Filter Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #ccc', 
              p: 1,
              opacity: academicYear ? 0.6 : 1,
              bgcolor: academicYear ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
            }}>
              <Typography sx={{ mr: 1, fontSize: '14px' }}>Date From</Typography>
              <TextField
                type="date"
                placeholder="dd/mm/yyyy"
                variant="outlined"
                size="small"
                value={dateFrom}
                onChange={handleDateFromChange}
                disabled={!!academicYear} // Disable if academicYear has a value
                sx={{ width: '140px' }}
                InputProps={{
                  sx: { 
                    borderRadius: 0,
                    height: '36px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }
                }}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #ccc', 
              p: 1,
              opacity: (academicYear || !dateFrom) ? 0.6 : 1,
              bgcolor: (academicYear || !dateFrom) ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
            }}>
              <Typography sx={{ mr: 1, fontSize: '14px' }}>Date To</Typography>
              <TextField
                type="date"
                placeholder="dd/mm/yyyy"
                variant="outlined"
                size="small"
                value={dateTo}
                onChange={handleDateToChange}
                disabled={!!academicYear || !dateFrom} // Disable if academicYear has a value or dateFrom is empty
                inputProps={{
                  min: dateFrom || undefined // Set minimum date to dateFrom
                }}
                sx={{ width: '140px' }}
                InputProps={{
                  sx: { 
                    borderRadius: 0,
                    height: '36px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }
                }}
              />
            </Box>
            
            <TextField
              select
              placeholder="Grade Level"
              variant="outlined"
              size="small"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              sx={{ 
                width: '180px',
                '& .MuiOutlinedInput-root': {
                  border: '1px solid #ccc',
                  borderRadius: 0
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (value) => value || "Grade Level"
              }}
            >
              <MenuItem value="">All Grades</MenuItem>
              {gradeOptions.map((grade) => (
                <MenuItem key={grade} value={grade}>{grade}</MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              placeholder="Subject"
              variant="outlined"
              size="small"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ 
                width: '180px',
                '& .MuiOutlinedInput-root': {
                  border: '1px solid #ccc',
                  borderRadius: 0
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (value) => value || "Subject"
              }}
            >
              <MenuItem value="">All Subjects</MenuItem>
              {subjectOptions.map((subj) => (
                <MenuItem key={subj} value={subj}>{subj}</MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              placeholder="Quarter"
              variant="outlined"
              size="small"
              value={filteredQuarter}
              onChange={(e) => setFilteredQuarter(e.target.value)}
              sx={{ 
                width: '180px',
                '& .MuiOutlinedInput-root': {
                  border: '1px solid #ccc',
                  borderRadius: 0
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (value) => value || "Quarter"
              }}
            >
              <MenuItem value="">All Quarters</MenuItem>
              <MenuItem value="First">First</MenuItem>
              <MenuItem value="Second">Second</MenuItem>
              <MenuItem value="Third">Third</MenuItem>
              <MenuItem value="Fourth">Fourth</MenuItem>
            </TextField>
            
            <TextField
              select
              placeholder="Academic Year"
              variant="outlined"
              size="small"
              value={academicYear}
              onChange={handleAcademicYearChange}
              disabled={!!dateFrom || !!dateTo} // Disable if either date has a value
              sx={{ 
                width: '180px',
                '& .MuiOutlinedInput-root': {
                  border: '1px solid #ccc',
                  borderRadius: 0
                },
                opacity: (dateFrom || dateTo) ? 0.6 : 1,
                bgcolor: (dateFrom || dateTo) ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (value) => value || "Academic Year"
              }}
            >
              <MenuItem value="">All Years</MenuItem>
              <MenuItem value="2025-2026">2025-2026</MenuItem>
              <MenuItem value="2024-2025">2024-2025</MenuItem>
              <MenuItem value="2023-2024">2023-2024</MenuItem>
              <MenuItem value="2022-2023">2022-2023</MenuItem>
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, md: 'auto' } }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleApplyFilters}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  height: '36px',
                  borderRadius: 0,
                  boxShadow: 'none',
                  fontWeight: 'bold',
                  '&:hover': { 
                    backgroundColor: '#E6C200',
                    boxShadow: 'none'
                  },
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetFilters}
                sx={{
                  height: '36px',
                  borderRadius: 0,
                  borderColor: '#ccc',
                  color: '#000',
                  '&:hover': { 
                    borderColor: '#999',
                    backgroundColor: '#f5f5f5'
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Table Container with integrated pagination */}
          <Paper sx={{ 
            flexGrow: 1,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible' // Allow table to expand beyond bounds if needed
          }}>
            <TableContainer sx={{ 
              flex: 1,
              overflow: 'visible' // Changed from 'auto' to 'visible'
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleRequestSort('idNumber')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by ID number">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          ID NUMBER <SortIndicator column="idNumber" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('name')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by name">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          NAME <SortIndicator column="name" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('gradeLevel')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by grade level">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          GRADE LEVEL <SortIndicator column="gradeLevel" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('subject')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by subject">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          SUBJECT <SortIndicator column="subject" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('quarter')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by quarter">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          QUARTER <SortIndicator column="quarter" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('dateCompleted')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by date completed">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          DATE COMPLETED <SortIndicator column="dateCompleted" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={32} sx={{ mr: 2 }} />
                        Loading completed library hours...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'error.main' }}>
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        No completed library hours found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map((record, index) => (
                      <TableRow 
                        key={index} 
                        hover
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <TableCell>{record.idNumber}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.gradeLevel}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>{record.quarter}</TableCell>
                        <TableCell>{record.dateCompleted}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Integrated pagination inside the table container */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 15, 25, 50]}
              component="div"
              count={filteredAndSortedRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                paddingTop: 2,
                paddingBottom: 2,
                backgroundColor: "transparent",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                width: "100%",
                position: "relative", // Ensure visibility
              }}
            />
          </Paper>

          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 40, width: '100%' }} />
        </Box>
      </Box>
    </>
  );
};

export default LibrarianCompletedHours;