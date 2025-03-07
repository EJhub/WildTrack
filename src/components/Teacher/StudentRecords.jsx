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
  };

  // Reset filters
  const handleResetFilters = () => {
    setQuarter('');
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setSearch('');
    setFilteredStudents(students);
  };

  const paginatedRows = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const tableHeaderStyle = {
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#781B1B',
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 4,
            backgroundColor: '#fff',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'auto',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left', marginBottom: 3 }}
          >
            Student Records - {teacherGradeLevel} - {teacherSubject || "Loading..."}
          </Typography>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 2 }}>
            <TextField
              placeholder="Search by name or ID..."
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

            {/* Quarter Filter */}
            <TextField
              label="Quarter"
              select
              variant="outlined"
              size="small"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', minWidth: '200px' }}
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
              <MenuItem value="2023-2024">2023-2024</MenuItem>
              <MenuItem value="2022-2023">2022-2023</MenuItem>
              <MenuItem value="2021-2022">2021-2022</MenuItem>
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={handleFilter}
                size="small" 
                sx={{ 
                  backgroundColor: "#FFD700", 
                  color: "#000", 
                  "&:hover": { backgroundColor: "#FFC107" } 
                }}
              >
                Apply Filters
              </Button>
              
              <Button 
                onClick={handleResetFilters}
                size="small" 
                variant="outlined"
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
            <>
              <TableContainer
                component={Paper}
                sx={{
                  flexGrow: 1,
                  borderRadius: '10px',
                  overflow: 'auto',
                  maxHeight: 'calc(100vh - 280px)',
                  border: "0.1px solid rgb(96, 92, 92)",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeaderStyle}>ID Number</TableCell>
                      <TableCell sx={tableHeaderStyle}>Name</TableCell>
                      <TableCell sx={tableHeaderStyle}>Grade & Section</TableCell>
                      <TableCell sx={tableHeaderStyle}>Subject</TableCell>
                      <TableCell sx={tableHeaderStyle}>Quarter</TableCell>
                      <TableCell sx={tableHeaderStyle}>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map((student, index) => (
                        <TableRow key={index} hover>
                          <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.idNumber}</TableCell>
                          <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.name}</TableCell>
                          <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.gradeSection}</TableCell>
                          <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.subject}</TableCell>
                          <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.quarter}</TableCell>
                          <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>
                            <Chip
                              label={student.progress}
                              size="small"
                              color={
                                student.progress === 'Completed' ? 'success' :
                                student.progress === 'In-progress' ? 'primary' : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          {quarter 
                            ? `No students found with ${teacherSubject} in ${quarter} Quarter` 
                            : `No students found with ${teacherSubject}`}
                        </TableCell>
                      </TableRow>
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
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default StudentRecords;