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
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';

const BookLog = () => {
  
  const bookLogs = [
    { title: 'Little Red Riding Hood', author: 'Charles Perrault', accessionNumber: 'LB0001', dateRead: 'October 18, 2024', rating: '★★★★☆' },
    { title: 'Book Title 2', author: 'Author 2', accessionNumber: '67890', dateRead: 'October 17, 2024', rating: '★★★☆☆' },
    { title: 'Book Title 3', author: 'Author 3', accessionNumber: '11223', dateRead: 'October 16, 2024', rating: '★★★★★' },
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundImage: 'url("/studentbackground.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 3 }}>
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2, paddingTop: 5}}>Book Log</Typography>
            
            {/* Search bar positioned below the title and aligned to the left */}
            <TextField
              variant="outlined"
              placeholder="Type here..."
              size="small"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: '250px',
                marginBottom: 2,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <FilterListIcon sx={{ cursor: 'pointer', marginRight: 1 }} />
                    <SortByAlphaIcon sx={{ cursor: 'pointer' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ opacity: 0.9, borderRadius: "10px" }}>
            <Table aria-label="book log table">
              <TableHead sx={{ backgroundColor: '#D9D9D9'}}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>BOOK TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>AUTHOR</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ACCESSION NUMBER</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>DATE READ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>RATING</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.title}</TableCell>
                    <TableCell>{log.author}</TableCell>
                    <TableCell>{log.accessionNumber}</TableCell>
                    <TableCell>{log.dateRead}</TableCell>
                    <TableCell>{log.rating}</TableCell>
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
