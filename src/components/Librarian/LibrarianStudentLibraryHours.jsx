import React from 'react';
import NavBar from './components/NavBar'; // Importing NavBar
import SideBar from './components/SideBar'; // Importing the updated SideBars component
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, TextField, InputAdornment, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Three lines icon for menu
import SearchIcon from '@mui/icons-material/Search'; // Search icon
import FilterListIcon from '@mui/icons-material/FilterList'; // A-Z filter icon

const LibrarianStudentLibraryHours = () => {
  const data = [
    { id: '2009-40034', name: 'Tricia O. Araneta', date: 'October 10, 2024', timeIn: '8:27:05 AM', timeOut: '8:45:05 AM', minutes: '13 minutes' },
    { id: '19-2134-332', name: 'Xevery Jan C. Bolo', date: 'October 10, 2024', timeIn: '8:27:06 AM', timeOut: '8:45:06 AM', minutes: '13 minutes' },
    // Add more sample data here...
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />

        {/* Main content area */}
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
            Student Library Hours
          </Typography>

          {/* Search and filter section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
              gap: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            {/* Menu Icon */}
            <IconButton>
              <MenuIcon />
            </IconButton>

            {/* Search field */}
            <TextField
              variant="outlined"
              placeholder="Type here..."
              size="small"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '300px' },
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
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Box>

          {/* Table displaying student library hours */}
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}
                  >
                    ID Number
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}
                  >
                    Latest Library Hour Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}
                  >
                    Latest Time-In
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}
                  >
                    Latest Time-Out
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}
                  >
                    Completed Minutes
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((student, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                      '&:hover': { backgroundColor: '#FCEAEA' },
                    }}
                  >
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.date}</TableCell>
                    <TableCell>{student.timeIn}</TableCell>
                    <TableCell>{student.timeOut}</TableCell>
                    <TableCell>{student.minutes}</TableCell>
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
