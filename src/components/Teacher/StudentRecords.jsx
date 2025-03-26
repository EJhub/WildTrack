import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import { AuthContext } from '../AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
// Import icons for sort indicators
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

const StudentRecords = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [quarter, setQuarter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherGradeLevel, setTeacherGradeLevel] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Add sort state
  const [orderBy, setOrderBy] = useState('name'); // Default sort by name
  const [order, setOrder] = useState('asc'); // Default sort direction
  
  // Get current user from AuthContext
  const { user } = useContext(AuthContext);

  // First fetch teacher info to get assigned grade level and subject
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (!user || user.role !== 'Teacher' || !user.idNumber) {
        setError('You must be logged in as a teacher to view student records');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/users/${user.idNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          // Format grade to match expected format (e.g., "2" to "Grade 2")
          if (response.data.grade) {
            const formattedGrade = response.data.grade.includes('Grade') 
              ? response.data.grade 
              : `Grade ${response.data.grade}`;
            
            setTeacherGradeLevel(formattedGrade);
          }
          
          // Set the teacher's subject
          if (response.data.subject) {
            setTeacherSubject(response.data.subject);
          } else {
            setError('No subject assigned to this teacher. Please contact an administrator.');
          }
        }
      } catch (err) {
        console.error('Error fetching teacher info:', err);
        setError('Failed to fetch teacher information');
      }
    };

    fetchTeacherInfo();
  }, [user]);

  // Fetch students only after we have the teacher's subject
  useEffect(() => {
    const fetchStudents = async () => {
      if (!teacherSubject) return; // Only fetch if we have the teacher's subject
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch only students with the teacher's subject
        const response = await axios.get(`http://localhost:8080/api/students`, {
          params: {
            role: 'Student',
            gradeLevel: teacherGradeLevel,
            subject: teacherSubject,
            quarter: quarter || null // Add quarter filter if set
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Process the student data
        const formattedStudents = response.data.map((student) => ({
          idNumber: student.idNumber,
          name: `${student.firstName} ${student.lastName}`,
          gradeSection: student.gradeSection || `${student.grade} ${student.section}` || 'N/A',
          subject: teacherSubject, // Always use the teacher's subject
          quarter: student.quarter || '',
          progress: student.progress || 'Not started',
        }));

        setStudents(formattedStudents);
        
        // Apply default sorting to the initial data
        const sortedData = getSortedData(formattedStudents);
        setFilteredStudents(sortedData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch student records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [teacherSubject, teacherGradeLevel, quarter]);

  // Effect to reapply sorting when order or orderBy changes
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const sortedData = getSortedData(filteredStudents);
      setFilteredStudents(sortedData);
    }
  }, [order, orderBy]);

  // Function to handle sort requests
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // SortIndicator component for visual feedback
  const SortIndicator = ({ column }) => {
    if (orderBy !== column) {
      return <UnfoldMoreIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5, opacity: 0.5 }} />;
    }
    return order === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
      : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />;
  };

  // Sorting function
  const getSortedData = (data) => {
    if (!orderBy) return data;
    
    return [...data].sort((a, b) => {
      // Handle different data types appropriately
      
      // Handle null values
      if (a[orderBy] === null && b[orderBy] === null) return 0;
      if (a[orderBy] === null) return order === 'asc' ? -1 : 1;
      if (b[orderBy] === null) return order === 'asc' ? 1 : -1;
      
      // For string values (most columns)
      if (['idNumber', 'name', 'gradeSection', 'subject', 'quarter'].includes(orderBy)) {
        const aValue = String(a[orderBy]).toLowerCase();
        const bValue = String(b[orderBy]).toLowerCase();
        
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Special handling for progress column
      if (orderBy === 'progress') {
        // Define a priority order for progress statuses
        const progressPriority = {
          'Not started': 1,
          'In-progress': 2,
          'Completed': 3
        };
        
        const aValue = progressPriority[a.progress] || 0;
        const bValue = progressPriority[b.progress] || 0;
        
        return order === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      // Default comparison for any other columns
      return order === 'asc'
        ? (a[orderBy] < b[orderBy] ? -1 : 1)
        : (b[orderBy] < a[orderBy] ? -1 : 1);
    });
  };

  // Search functionality with sorting preserved
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(value) || 
        student.idNumber.toLowerCase().includes(value)
    );
    
    // Apply current sort to search results
    const sortedData = getSortedData(filtered);
    setFilteredStudents(sortedData);
    
    setPage(0); // Reset to first page when searching
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Date From change handler with mutual exclusivity logic
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

  // Date To change handler with mutual exclusivity logic
  const handleDateToChange = (e) => {
    const value = e.target.value;
    
    // If selecting a date, clear academic year
    if (value) {
      setAcademicYear('');
    }
    
    setDateTo(value);
  };

  // Academic Year change handler with mutual exclusivity logic
  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    
    // If selecting academic year, clear date filters
    if (value) {
      setDateFrom('');
      setDateTo('');
    }
    
    setAcademicYear(value);
  };

  // Filter functionality with sorting preserved
  const handleFilter = () => {
    // Apply quarter and date filters
    const filtered = students.filter((student) => {
      const matchesQuarter = quarter ? student.quarter === quarter : true;
      const matchesDateFrom = dateFrom ? new Date(student.date) >= new Date(dateFrom) : true;
      const matchesDateTo = dateTo ? new Date(student.date) <= new Date(dateTo) : true;
      const matchesAcademicYear = academicYear ? student.academicYear === academicYear : true;
      return matchesQuarter && matchesDateFrom && matchesDateTo && matchesAcademicYear;
    });
    
    // Apply current sort to filtered results
    const sortedData = getSortedData(filtered);
    setFilteredStudents(sortedData);
    
    setPage(0); // Reset to first page when filtering
  };

  // Reset filters but maintain sorting
  const handleResetFilters = () => {
    setQuarter('');
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setSearch('');
    
    // Apply current sort to all data
    const sortedData = getSortedData(students);
    setFilteredStudents(sortedData);
    
    setPage(0); // Reset to first page when resetting filters
  };

  // Get displayed rows based on pagination
  const displayedRows = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Common style for sortable table headers
  const sortableHeaderStyle = {
    fontWeight: "bold", 
    backgroundColor: "#8C383E", 
    color: "#fff",
    cursor: "pointer",
    '&:hover': {
      backgroundColor: "#9C484E" // Lighter shade on hover
    }
  };

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
            padding: '32px 32px 64px 32px', // Increased bottom padding
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
          <Typography
            variant="h4"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              textAlign: 'left',
              fontSize: '40px',
              marginTop: '15px',
              marginBottom: 3
            }}
          >
            Student Records - {teacherGradeLevel} - {teacherSubject || "Loading..."}
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 3,
            }}
          >
            <TextField
              placeholder="Search by name or ID..."
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearch}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: { xs: '100%', sm: '360px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Filters and Buttons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                name="dateFrom"
                type="date"
                size="small"
                label="Date From"
                value={dateFrom}
                onChange={handleDateFromChange}
                disabled={!!academicYear} // Disable if academicYear has a value
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              />
              
              <TextField
                name="dateTo"
                type="date"
                size="small"
                label="Date To"
                value={dateTo}
                onChange={handleDateToChange}
                disabled={!!academicYear || !dateFrom} // Disable if academicYear has a value or dateFrom is empty
                inputProps={{
                  min: dateFrom || undefined // Set minimum date to dateFrom
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              />

              {/* Quarter Filter */}
              <TextField
                name="quarter"
                label="Quarter"
                select
                variant="outlined"
                size="small"
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  minWidth: '150px',
                }}
              >
                <MenuItem value="">All Quarters</MenuItem>
                <MenuItem value="First">First</MenuItem>
                <MenuItem value="Second">Second</MenuItem>
                <MenuItem value="Third">Third</MenuItem>
                <MenuItem value="Fourth">Fourth</MenuItem>
              </TextField>
              
              <TextField
                name="academicYear"
                label="Academic Year"
                select
                variant="outlined"
                size="small"
                value={academicYear}
                onChange={handleAcademicYearChange}
                disabled={!!dateFrom || !!dateTo} // Disable if either date has a value
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  minWidth: '150px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              >
                <MenuItem value="">Select Academic Year</MenuItem>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2022-2023">2022-2023</MenuItem>
                <MenuItem value="2021-2022">2021-2022</MenuItem>
              </TextField>
              
              <Button
                variant="contained"
                onClick={handleFilter}
                sx={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                  "&:hover": { backgroundColor: "#FFC107" },
                }}
              >
                Filter
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  borderColor: "#FFD700",
                  color: "#000",
                  "&:hover": { 
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    borderColor: "#FFD700"
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading student records...</Typography>
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: '15px',
                boxShadow: 3,
                overflow: 'visible', // Changed from 'auto' to 'visible'
                marginTop: 3,
                marginBottom: 5, // Added bottom margin
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Table sx={{ flexGrow: 1 }}> {/* Removed stickyHeader */}
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleRequestSort('idNumber')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by ID number">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          ID Number <SortIndicator column="idNumber" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('name')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by name">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Name <SortIndicator column="name" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('gradeSection')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by grade & section">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Grade & Section <SortIndicator column="gradeSection" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('subject')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by subject">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Subject <SortIndicator column="subject" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('quarter')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by quarter">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Quarter <SortIndicator column="quarter" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleRequestSort('progress')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by progress">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Progress <SortIndicator column="progress" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No student records found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedRows.map((student, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{student.idNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.gradeSection}</TableCell>
                        <TableCell>{student.subject}</TableCell>
                        <TableCell>{student.quarter}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.progress}
                            size="small"
                            sx={{
                              backgroundColor: student.progress === 'Completed' ? '#1b8c3f' : 
                                              student.progress === 'In-progress' ? '#3f51b5' : '#e0e0e0',
                              color: student.progress === 'Not started' ? 'black' : 'white',
                              fontWeight: 'bold',
                              borderRadius: '16px',
                              padding: '0 10px',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStudents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  paddingTop: 2,
                  paddingBottom: 2, // Added bottom padding
                  backgroundColor: "transparent",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  position: "relative", // Ensure visibility
                }}
              />
            </TableContainer>
          )}
        </Box>
      </Box>
    </>
  );
};

export default StudentRecords;