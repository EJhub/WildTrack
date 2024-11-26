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
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
    { name: 'John Mark', grade: 'Grade 10', section: 'B', hoursCompleted: 30 },
  ];

  return (
    <>
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
            overflow: 'hidden', // Prevents unnecessary overflow
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left' }}
          >
            Students List
          </Typography>

          {/* Search Box */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-end' },
              marginBottom: 3,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: { xs: '100%', sm: '300px' },
                '& .MuiOutlinedInput-root': { padding: '5px 10px' },
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

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)' // Adjusts height dynamically
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#CD6161' }}
                  >
                    Students Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#CD6161' }}
                  >
                    Grade
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#CD6161' }}
                  >
                    Section
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#CD6161' }}
                  >
                    Hours Completed
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                      '&:hover': { backgroundColor: '#FCEAEA' },
                    }}
                  >
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell>{student.hoursCompleted}</TableCell>
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
