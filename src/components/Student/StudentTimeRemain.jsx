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

const StudentTimeRemain = () => {
  const [open, setOpen] = useState(false); // State to control modal open/close
  const navigate = useNavigate(); // Initialize the navigate hook

  const students = [
    { id: '19-2134-332', name: 'Xevery', requiredMinutes: '150 Minutes', totalMinutes: '21:00 Minutes', remainingMinutes: '129:00 Minutes' },
    { id: '22-3451-124', name: 'Brent', requiredMinutes: '150 Minutes', totalMinutes: '0:00 Minutes', remainingMinutes: '150:00 Minutes' },
    { id: '18-0853-687', name: 'Junrey', requiredMinutes: '150 Minutes', totalMinutes: '0:00 Minutes', remainingMinutes: '150:00 Minutes' },
    { id: '21-4238-785', name: 'David', requiredMinutes: '150 Minutes', totalMinutes: '0:00 Minutes', remainingMinutes: '150:00 Minutes' },
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
            <Typography variant="h4">Student Time Remaining</Typography>

            <Typography variant="subtitle1" sx={{ textAlign: 'right' }}>
              REQUIRED TOTAL MINUTES: 150 MINUTES <br />
              TOTAL MINUTES: 150 MINUTES
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>ID Number</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Required Total Minutes</TableCell>
                  <TableCell>Total Minutes</TableCell>
                  <TableCell>Remaining Minutes</TableCell>
                  <TableCell>Add Book</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.requiredMinutes}</TableCell>
                    <TableCell>{student.totalMinutes}</TableCell>
                    <TableCell>{student.remainingMinutes}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" size="small" onClick={handleClickOpen}>
                        Insert Book
                      </Button>
                    </TableCell>
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

export default StudentTimeRemain;
