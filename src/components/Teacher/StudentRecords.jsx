import React from 'react';
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
  const students = [
    { idNumber: '2009-40034', name: 'Tricia O. Araneta', gradeSection: '5 - Hope', progress: 'Completed', status: 'Approved' },
    { idNumber: '22-3451-124', name: 'Brent Ilustrisimo', gradeSection: '5 - Faith', progress: 'In-progress', status: '-' },
    // Additional student entries...
  ];

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
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#A85858' }}>ID Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#A85858' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#A85858' }}>Grade & Section</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#A85858' }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#A85858' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#A85858' }}>Edit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
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
        </Box>
      </Box>
    </>
  );
};

export default StudentRecords;
