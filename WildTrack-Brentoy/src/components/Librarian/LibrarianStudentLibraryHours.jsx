import React from 'react';
import NavBar from './components/NavBar';  // Importing NavBar
import SideBars from './components/SideBars';  // Importing the updated SideBars component
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, TextField, InputAdornment, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';  // Three lines icon for menu
import SearchIcon from '@mui/icons-material/Search';  // Search icon
import FilterListIcon from '@mui/icons-material/FilterList';  // A-Z filter icon

const LibrarianStudentLibraryHours = () => {
  const data = [
    { id: '2009-40034', name: 'Tricia O. Araneta', date: 'October 10, 2024', timeIn: '8:27:05 AM', timeOut: '8:45:05 AM', minutes: '13 minutes' },
    { id: '19-2134-332', name: 'Xevery Jan C. Bolo', date: 'October 10, 2024', timeIn: '8:27:06 AM', timeOut: '8:45:06 AM', minutes: '13 minutes' },
  ];

  return (
    <>
      <NavBar /> {/* Adding the NavBar */}
      <Box sx={{ display: 'flex' }}>
        {/* Adding the SideBars */}
        <SideBars />

        {/* Main content area */}
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#ffffff' }}>
          <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2 }}>
            Student Library Hours
          </Typography>

          {/* Search and filter section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 2 }}>
            {/* Menu Icon */}
            <IconButton sx={{ marginRight: 2 }}>
              <MenuIcon />
            </IconButton>

            {/* Search field with "Type here..." placeholder */}
            <TextField
              variant="outlined"
              placeholder="Type here..."
              size="small"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: '250px',
                paddingRight: '30px',  // Space for the search icon
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Filter A-Z */}
            <IconButton sx={{ marginLeft: 2 }}>
              <FilterListIcon />
            </IconButton>
          </Box>

          {/* Table displaying student library hours */}
          <TableContainer component={Paper} sx={{ opacity: 0.9, borderRadius: '10px' }}>
            <Table aria-label="student library hours table">
              <TableHead sx={{ backgroundColor: '#CD6161' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>ID Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Latest Library Hour Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Latest Time-In</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Latest Time-Out</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Completed Minutes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ backgroundColor: '#CD6161', color: '#000' }}>{student.id}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', color: '#000' }}>{student.name}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', color: '#000' }}>{student.date}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', color: '#000' }}>{student.timeIn}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', color: '#000' }}>{student.timeOut}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', color: '#000' }}>{student.minutes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
};

export default LibrarianStudentLibraryHours;
  