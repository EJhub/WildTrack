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
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundImage: 'url("/studentbackground.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>Library Hours</Typography>
          </Box>

          <TableContainer component={Paper} sx={{ opacity: 0.9 }}>
            <Table aria-label="library hours table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#D9D9D9" }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Time In</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Book Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Time Out</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Minutes</TableCell>
              </TableRow>
            </TableHead>

              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>{student.date}</TableCell>
                    <TableCell>{student.timeIn}</TableCell>
                    <TableCell>
                      {student.bookTitle ? student.bookTitle : (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={handleClickOpen}
                          sx={{ backgroundColor: '#FFD700', color: '#000', borderRadius:'15px', '&:hover': { backgroundColor: '#FFC107' } }}
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

      {/* Popup Form Component */}
      <Addbook open={open} handleClose={handleClose} handleSubmit={handleSubmit} />
    </>
  );
};

export default StudentLibraryHours;
