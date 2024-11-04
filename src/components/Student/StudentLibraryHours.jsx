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
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const StudentLibraryHours = () => {
  const [open, setOpen] = useState(false); // State to control modal open/close
  const navigate = useNavigate(); // Initialize the navigate hook

  const students = [
    { date: '01/2/2024', TimeIn: '2:00pm', TimeOut: '21:00 Minutes', Minutes: '129:00 Minutes' },
    { date: '02/2/2024', TimeIn: '3:00pm', TimeOut: '0:00 Minutes', Minutes: '150:00 Minutes' },
    { date: '10/2/2024', TimeIn: '4:00pm', TimeOut: '0:00 Minutes', Minutes: '150:00 Minutes' },
    { date: '30/2/2024', TimeIn: '5:00pm', TimeOut: '0:00 Minutes', Minutes: '150:00 Minutes' },
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
        <Box sx={{ padding: 4, flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <Typography variant="h4">Library Hours</Typography>

           
          </Box>

          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow sx={{
                  backgroundColor:"#D9D9D9",
                }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Book Title</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>MINUTES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.date}>
                    <TableCell>{student.date}</TableCell>
                    <TableCell>{student.TimeIn}</TableCell>
                    <Button variant="contained" color="primary" size="small" onClick={handleClickOpen}>
                        Insert Book
                      </Button>
                    <TableCell>{student.TimeOut}</TableCell>
                    <TableCell>{student.Minutes}</TableCell>
                  
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
