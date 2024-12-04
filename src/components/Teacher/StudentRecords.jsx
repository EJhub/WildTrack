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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import MenuIcon from '@mui/icons-material/Menu';

const StudentRecords = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <IconButton color="primary">
              <FilterListIcon />
            </IconButton>
            <IconButton color="primary">
              <SortByAlphaIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Typography>Loading student records...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
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
                  {filteredStudents.map((student, index) => (
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
          )}
        </Box>
      </Box>
    </>
  );
};

export default StudentRecords;
