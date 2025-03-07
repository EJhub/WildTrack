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
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import { AuthContext } from '../AuthContext'; // Import AuthContext
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompletedLibraryHours = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredQuarter, setFilteredQuarter] = useState('');
  
  // Teacher information
  const [teacherGradeLevel, setTeacherGradeLevel] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  
  // Get user context
  const { user } = useContext(AuthContext);

  // First fetch teacher info to get assigned grade level and subject
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (!user || user.role !== 'Teacher' || !user.idNumber) {
        setError('You must be logged in as a teacher to view completed library hours');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/users/${user.idNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          // Get teacher's grade level
          if (response.data.grade) {
            // Format grade to match expected format (e.g., "2" to "Grade 2")
            const formattedGrade = response.data.grade.includes('Grade') 
              ? response.data.grade 
              : `Grade ${response.data.grade}`;
            
            setTeacherGradeLevel(formattedGrade);
          } else {
            setError('No grade level assigned to this teacher');
          }
          
          // Get teacher's subject
          if (response.data.subject) {
            setTeacherSubject(response.data.subject);
          } else {
            setError('No subject assigned to this teacher');
          }
        }
      } catch (err) {
        console.error('Error fetching teacher info:', err);
        setError('Failed to fetch teacher information');
        toast.error('Failed to fetch teacher information');
      }
    };

    fetchTeacherInfo();
  }, [user]);

  // Function to fetch completed library hours data
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
      
      // Always include teacher's grade level and subject
      if (teacherGradeLevel) {
        queryParams.append('gradeLevel', teacherGradeLevel);
      }
      
      if (teacherSubject) {
        queryParams.append('subject', teacherSubject);
      }
      
      // Add other filter parameters
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
      
      // Make API call to fetch completed library hours
      const response = await axios.get(
        `http://localhost:8080/api/library-hours/completed?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCompletedRecords(response.data);
    } catch (err) {
      console.error('Error fetching completed library hours:', err);
      setError('Failed to fetch completed library hours. Please try again later.');
      toast.error('Failed to fetch completed library hours');
    } finally {
      setLoading(false);
    }
  };

  // Effect to load data when teacher info is available
  useEffect(() => {
    if (teacherGradeLevel && teacherSubject) {
      fetchCompletedLibraryHours();
    }
  }, [teacherGradeLevel, teacherSubject]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Apply filters
  const handleApplyFilters = () => {
    const filterParams = {
      dateFrom,
      dateTo,
      academicYear,
      quarter: filteredQuarter
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
    
    fetchCompletedLibraryHours();
  };

  // Filter locally by search term (for client-side filtering)
  const filteredStudents = completedRecords.filter((record) => {
    const matchesSearch =
      record.name?.toLowerCase().includes(search.toLowerCase()) ||
      record.idNumber?.includes(search);

    return matchesSearch;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get current page records
  const paginatedRecords = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'auto',
            backgroundColor: '#fff',
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left', marginBottom: 3 }}
          >
            Completed Library Hours - {teacherGradeLevel} - {teacherSubject}
          </Typography>
          <Typography sx={{ color: '#000', fontWeight: 'bold', textAlign: 'right', marginTop: '-40px'}}>
            Total no. of completed library hours: {filteredStudents.length}
            <br />
            Total no. of students: {new Set(filteredStudents.map(record => record.idNumber)).size}
          </Typography>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 2 }}>
            <TextField
              placeholder="Type here.."
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearch}
              sx={{
                backgroundColor: '#f1f1f1',
                borderRadius: '28px',
                width: { xs: '100%', sm: '360px' },
                '& .MuiOutlinedInput-root': { padding: '5px 10px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MenuIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Filter Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Date From"
              type="date"
              variant="outlined"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Date To"
              type="date"
              variant="outlined"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
              InputLabelProps={{ shrink: true }}
            />
            {/* Quarter filter */}
            <TextField
              label="Quarter"
              select
              variant="outlined"
              size="small"
              value={filteredQuarter}
              onChange={(e) => setFilteredQuarter(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', minWidth: '150px' }}
            >
              <MenuItem value="">All Quarters</MenuItem>
              <MenuItem value="First">First</MenuItem>
              <MenuItem value="Second">Second</MenuItem>
              <MenuItem value="Third">Third</MenuItem>
              <MenuItem value="Fourth">Fourth</MenuItem>
            </TextField>
            <TextField
              label="Academic Year"
              select
              variant="outlined"
              size="small"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', minWidth: '200px' }}
            >
              <MenuItem value="">Select Academic Year</MenuItem>
              <MenuItem value="2024-2025">2024-2025</MenuItem>
              <MenuItem value="2023-2024">2023-2024</MenuItem>
              <MenuItem value="2022-2023">2022-2023</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={handleApplyFilters}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  height: '40px',
                  '&:hover': { backgroundColor: '#FFC107' },
                }}
              >
                Apply Filters
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  height: '40px',
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 345px)',
              border: '1px solid #A85858',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    ID Number
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Subject
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Quarter
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Date Completed
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={32} sx={{ mr: 2 }} />
                      Loading completed library hours...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'error.main' }}>
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No completed library hours found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{record.idNumber}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>{record.quarter}</TableCell>
                      <TableCell>{record.dateCompleted}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ alignSelf: 'center', marginTop: 2 }}
          />
        </Box>
      </Box>
    </>
  );
};

export default CompletedLibraryHours;