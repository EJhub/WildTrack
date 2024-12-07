import React, { useEffect, useState } from 'react';
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
  TablePagination,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const LibrarianManageTeacher = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [grade, setGrade] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/library-hours/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching library hours summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
  };

  // Handle Update action
  const handleUpdate = (id) => {
    console.log(`Updating teacher with ID: ${id}`);
    // Add your update logic here (e.g., navigate to an update form or call an API to edit data)
  };

  // Handle Delete action
  const handleDelete = (id) => {
    console.log(`Deleting teacher with ID: ${id}`);
    // Add your delete logic here (e.g., make a DELETE API call)
    const newData = data.filter((item) => item.id !== id);
    setData(newData);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              marginBottom: 3,
              textAlign: 'left',
            }}
          >
            Manage Teacher Activity
          </Typography>

          {/* Search and Filters Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginBottom: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search teachers..."
              size="small"
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
              }}
            />
            <IconButton sx={{ color: 'gray' }}>
            </IconButton>
          </Box>

          {/* Action Buttons Section */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              marginBottom: 2,
              flexWrap: 'wrap',
              justifyContent: 'flex-end', // Align buttons to the right
            }}
          >
            <Button
              variant="contained"
              color="black"
              sx={{
                fontWeight: 'bold',
                padding: '10px 20px',
                backgroundColor: '#FFB300', // Dark yellow for the buttons
                '&:hover': { backgroundColor: '#F57C00' }, // Slightly darker yellow on hover
              }}
            >
              Activity Log
            </Button>
            <Button
              variant="contained"
              color="black"
              sx={{
                fontWeight: 'bold',
                padding: '10px 20px',
                backgroundColor: '#FFB300', // Dark yellow for the buttons
                '&:hover': { backgroundColor: '#F57C00' }, // Slightly darker yellow on hover
              }}
            >
              Teacher
            </Button>
            <Button
              variant="contained"
              color="black"
              sx={{
                fontWeight: 'bold',
                padding: '10px 20px',
                backgroundColor: '#FFB300', // Dark yellow for the buttons
                '&:hover': { backgroundColor: '#F57C00' }, // Slightly darker yellow on hover
              }}
            >
              Add Teacher
            </Button>
          </Box>

          {/* Table Section */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)',
              boxShadow: 3,
              backgroundColor: '#fafafa', // Table container background color
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161', // Dark yellow header background
                    }}
                  >
                    ID Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161', // Dark yellow header background
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161', // Dark yellow header background
                    }}
                  >
                    Quarter's
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161', // Dark yellow header background
                    }}
                  >
                    Subject Enrolled
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161', // Dark yellow header background
                    }}
                  >
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
                        backgroundColor: index % 2 === 0 ? '#FFF8E1' : '#ffffff', // Alternating row colors (pale yellow)
                        '&:hover': { backgroundColor: '#FFB300' }, // Hover effect on rows
                      }}
                    >
                      <TableCell sx={{ color: '#000' }}>{student.idNumber}</TableCell>
                      <TableCell sx={{ color: '#000' }}>{`${student.firstName} ${student.lastName}`}</TableCell>
                      <TableCell sx={{ color: '#000' }}>{student.latestLibraryHourDate}</TableCell>
                      <TableCell sx={{ color: '#000' }}>{student.latestTimeIn}</TableCell>
                      <TableCell sx={{ color: '#000' }}>{student.latestTimeOut}</TableCell>
                      <TableCell sx={{ color: '#000' }}>{student.totalMinutes}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpdate(student.id)}
                          sx={{
                            marginRight: 1,
                            backgroundColor: '#FFB300',
                            '&:hover': { backgroundColor: '#F57C00' },
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleDelete(student.id)}
                          sx={{
                            backgroundColor: '#F44336',
                            '&:hover': { backgroundColor: '#D32F2F' },
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Section */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
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
      </Box>
    </>
  );
};

export default LibrarianManageTeacher;
