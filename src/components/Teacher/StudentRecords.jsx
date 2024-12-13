import React, { useEffect, useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
 
const StudentRecords = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
 
  // Fetch students with time-in and time-out
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Retrieve auth token if needed
        const response = await axios.get('http://localhost:8080/api/library-hours/with-user-details', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
 
        const formattedStudents = response.data.map((student) => ({
          idNumber: student.idNumber,
          name: `${student.firstName} ${student.lastName}`,
          gradeSection: student.gradeSection || 'N/A',
          progress: student.timeOut ? 'Completed' : 'In-progress',
          status: student.timeOut ? 'Approved' : 'Pending',
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
  }, []);
 
  // Handle search filter
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    setFilteredStudents(
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(value) || student.idNumber.toLowerCase().includes(value)
      )
    );
  };
 
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
 
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
 
  // Handle filter by date range and academic year
  const handleFilter = () => {
    const filtered = students.filter((student) => {
      const matchesDateFrom = dateFrom ? new Date(student.date) >= new Date(dateFrom) : true;
      const matchesDateTo = dateTo ? new Date(student.date) <= new Date(dateTo) : true;
      const matchesAcademicYear = academicYear
        ? student.academicYear === academicYear
        : true;
      return matchesDateFrom && matchesDateTo && matchesAcademicYear;
    });
    setFilteredStudents(filtered);
  };
 
  // Paginated rows
  const paginatedRows = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
 
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
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left', marginBottom: 3 }}
          >
            Student Records
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
            <Button
              onClick={handleFilter}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: '5px',
                backgroundColor: '#A85858',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                },
              }}
            >
              Filter
            </Button>
          </Box>
 
          {loading ? (
            <Typography>Loading student records...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  flexGrow: 1,
                  borderRadius: '15px',
                  overflow: 'auto',
                  maxHeight: 'calc(100vh - 250px)', // Ensures the table fits the remaining space
                  border: '1px solid #A85858',
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: '#A85858',
                        }}
                      >
                        ID Number
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: '#A85858',
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: '#A85858',
                        }}
                      >
                        Grade & Section
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: '#A85858',
                        }}
                      >
                        Progress
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: '#A85858',
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: '#A85858',
                        }}
                      >
                        Edit
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((student, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.idNumber}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.name}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.gradeSection}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.progress}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.status}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>
                          <IconButton color="primary">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
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