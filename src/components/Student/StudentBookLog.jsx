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

const BookLog = () => {
  
  const bookLogs = [
    { title: 'Book Title 1', author: 'Author 1', accessionNumber: '12345', dateRead: '2024-10-16' },
    { title: 'Book Title 2', author: 'Author 2', accessionNumber: '67890', dateRead: '2024-10-15' },
    { title: 'Book Title 3', author: 'Author 3', accessionNumber: '11223', dateRead: '2024-10-14' },
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <Typography variant="h4">Book Log</Typography>
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table aria-label="book log table">
              <TableHead>
                <TableRow>
                  <TableCell>Book Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Accession Number</TableCell>
                  <TableCell>Date Read</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.title}</TableCell>
                    <TableCell>{log.author}</TableCell>
                    <TableCell>{log.accessionNumber}</TableCell>
                    <TableCell>{log.dateRead}</TableCell>
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

export default BookLog;
