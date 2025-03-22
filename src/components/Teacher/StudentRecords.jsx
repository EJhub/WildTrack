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
        setFilteredStudents(formattedStudents);
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

  // Search functionality
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    setFilteredStudents(
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(value) || 
          student.idNumber.toLowerCase().includes(value)
      )
    );
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

  // Filter functionality
  const handleFilter = () => {
    // Apply quarter and date filters
    const filtered = students.filter((student) => {
      const matchesQuarter = quarter ? student.quarter === quarter : true;
      const matchesDateFrom = dateFrom ? new Date(student.date) >= new Date(dateFrom) : true;
      const matchesDateTo = dateTo ? new Date(student.date) <= new Date(dateTo) : true;
      const matchesAcademicYear = academicYear ? student.academicYear === academicYear : true;
      return matchesQuarter && matchesDateFrom && matchesDateTo && matchesAcademicYear;
    });
    setFilteredStudents(filtered);
    setPage(0); // Reset to first page when filtering
  };

  // Reset filters
  const handleResetFilters = () => {
    setQuarter('');
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setSearch('');
    setFilteredStudents(students);
    setPage(0); // Reset to first page when resetting filters
  };

  // Get displayed rows based on pagination
  const displayedRows = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                }}
              />
              
              <TextField
                name="dateTo"
                type="date"
                size="small"
                label="Date To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
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
                onChange={(e) => setAcademicYear(e.target.value)}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  minWidth: '150px',
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
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>ID Number</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Grade & Section</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Quarter</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Progress</TableCell>
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