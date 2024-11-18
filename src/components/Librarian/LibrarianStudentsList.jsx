import React from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const LibrarianStudentsList = () => {
  const students = [
    { name: 'John Doe', grade: 'Grade 10', section: 'A', hoursCompleted: 30 },
    { name: 'Maria Smith', grade: 'Grade 10', section: 'C', hoursCompleted: 30 },
    { name: 'Scarlet', grade: 'Grade 10', section: 'D', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 3 }}>
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2, paddingTop: 5 }}>
              Students List
            </Typography>

            {/* Search field with bold text and aligned right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: 2 }}>
              <TextField
                variant="outlined"
                placeholder="Search"
                size="small"
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  width: '250px',
                  paddingRight: '30px', // Space for the search icon on the right
                  fontWeight: 'bold', // Make the text inside the search bar bold
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Table with the specified size */}
          <TableContainer component={Paper} sx={{ opacity: 0.9, borderRadius: '10px' }}>
            <Table
              aria-label="students table"
              sx={{
                width: '100%', // Maximize the table width
                height: 89, // Set the height to 89px
              }}
            >
              {/* Table Header with background color #CD6161 */}
              <TableHead sx={{ backgroundColor: '#CD6161' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000' }}>Students Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000' }}>Section</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000' }}>Hours Completed</TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body with background color #FFFFFF */}
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index} sx={{ backgroundColor: '#FFFFFF' }}>
                    <TableCell sx={{ fontWeight: 'normal', color: '#000', border: '1px solid #000' }}>
                      {student.name}
                    </TableCell> {/* Students Name with black text */}
                    <TableCell sx={{ color: '#000', border: '1px solid #000' }}>{student.grade}</TableCell>
                    <TableCell sx={{ color: '#000', border: '1px solid #000' }}>{student.section}</TableCell>
                    <TableCell sx={{ color: '#000', border: '1px solid #000' }}>
                      {student.hoursCompleted}
                    </TableCell>
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

export default LibrarianStudentsList;
