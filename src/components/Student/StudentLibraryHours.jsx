import React, { useState } from 'react';
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
import Button from '@mui/material/Button';
import Addbook from './components/Addbook';
import { useNavigate } from 'react-router-dom';

const StudentLibraryHours = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const students = [
    { date: 'October 18, 2024', timeIn: '8:25:09 AM', bookTitle: 'Little Red Riding Hood', timeOut: '8:42:02 AM', minutes: '16 minutes' },
    { date: 'October 18, 2024', timeIn: '2:25:04 PM', bookTitle: '', timeOut: '-', minutes: '-' },
  ];

  const handleClickOpen = () => {
    navigate("/studentDashboard/TimeRemaining/Addbook");
    setOpen(true);
  };

  const handleClose = () => {
    navigate("/studentDashboard/TimeRemaining");
    setOpen(false);
  };

  const handleSubmit = (bookDetails) => {
    console.log('Submitted book details:', bookDetails);
    setOpen(false);
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
            display: 'flex',
            flexDirection: 'column',
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden', // Prevents unnecessary overflow
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', paddingTop: 5 }}>
              Library Hours
            </Typography>
          </Box>

          {/* Table Container */}
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              opacity: 0.9,
              borderRadius: '15px',
              overflow: 'auto', // Allows scrolling if the content exceeds the container
            }}
          >
            <Table stickyHeader aria-label="library hours table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{backgroundColor: "#D9D9D9", fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{backgroundColor: "#D9D9D9", fontWeight: 'bold' }}>Time In</TableCell>
                  <TableCell sx={{backgroundColor: "#D9D9D9", fontWeight: 'bold' }}>Book Title</TableCell>
                  <TableCell sx={{backgroundColor: "#D9D9D9", fontWeight: 'bold' }}>Time Out</TableCell>
                  <TableCell sx={{backgroundColor: "#D9D9D9", fontWeight: 'bold' }}>Minutes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>{student.date}</TableCell>
                    <TableCell>{student.timeIn}</TableCell>
                    <TableCell>
                      {student.bookTitle ? (
                        student.bookTitle
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleClickOpen}
                          sx={{
                            backgroundColor: '#FFD700',
                            color: '#000',
                            borderRadius: '15px',
                            '&:hover': { backgroundColor: '#FFC107' },
                          }}
                        >
                          Insert Book
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{student.timeOut}</TableCell>
                    <TableCell>{student.minutes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Popup Form */}
      <Addbook open={open} handleClose={handleClose} handleSubmit={handleSubmit} />
    </>
  );
};

export default StudentLibraryHours;
