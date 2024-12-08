import React, { useState, useEffect } from 'react';
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
  Button,
  TablePagination,
  IconButton,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add'; // Add icon for Add Student button
 
const ManageStudent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
 
  // Static Data: Dummy data simulating the API response
  const staticData = [
    {
      idNumber: '2009-40034',
      firstName: 'Tricia',
      lastName: 'O. Araneta',
      grade: '5',
      section: 'Hope',
      subject: 'English & Filipino',
    },
    {
      idNumber: '2009-40035',
      firstName: 'John',
      lastName: 'Doe',
      grade: '6',
      section: 'A',
      subject: 'Math & Science',
    },
    // Add more rows here as needed
  ];
 
  // Fetch data (using static data here)
  useEffect(() => {
    setData(staticData);
    setLoading(false);
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
 
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
 
  // Filter the data based on the search query
  const filteredData = data.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.idNumber.includes(searchQuery)
  );
 
  // Add Student Button click handler
  const handleAddStudent = () => {
    alert('Add Student button clicked');
    // Implement your Add Student logic here
  };
 
  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
 
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left' }}
          >
            Manage Students
          </Typography>
 
          {/* Add Student Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
            <Button
              variant="outlined"
              onClick={handleAddStudent}
              sx={{
                color: '#FFEB3B', // Yellow text color
                backgroundColor: 'white', // White background
                border: '1px solid #800000', // Light maroon border
                borderRadius: '50px', // Rounded corners for pill shape
                paddingX: 3,
                paddingY: 1.5,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: '#800000', // Light maroon background on hover
                  color: '#FFEB3B', // Keep text yellow on hover
                },
              }}
            >
              <AddIcon sx={{ marginRight: 1 }} /> {/* Add Icon */}
              Add Student
            </Button>
          </Box>
 
          {/* Search Bar */}
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
              placeholder="Search by name or ID..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '400px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
 
          {/* Table Section */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '15px',
              boxShadow: 3,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)',
              marginTop: 3,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    ID Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    GRADE & SECTION
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    LIBRARY HOUR ASSOCIATED SUBJECT
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFF', // Alternating row colors
                        '&:hover': { backgroundColor: '#FCEAEA' }, // Hover effect
                      }}
                    >
                      <TableCell>{student.idNumber}</TableCell>
                      <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                      <TableCell>{`${student.grade} - ${student.section}`}</TableCell>
                      <TableCell>{student.subject}</TableCell>
                      <TableCell>
                        {/* Custom style for Update and Delete buttons */}
                        <Button
                          variant="outlined"
                          sx={{
                            color: '#800000', // Light Maroon Text Color
                            backgroundColor: 'white', // White background
                            border: '1px solid #FFEB3B', // Yellow border
                            marginRight: 1,
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#FFEB3B', // Yellow on hover
                              color: '#800000', // Light Maroon text on hover
                            },
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            color: '#800000', // Light Maroon Text Color
                            backgroundColor: 'white', // White background
                            border: '1px solid #FFEB3B', // Yellow border
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#FFEB3B', // Yellow on hover
                              color: '#800000', // Light Maroon text on hover
                            },
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
            count={filteredData.length}
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
 
export default ManageStudent;