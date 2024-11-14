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
import Avatar from '@mui/material/Avatar';

const LibraryAttendance = () => {
  const attendanceData = [
    { profile: '/path/to/image1.jpg', name: 'Student 1', timeIn: '8:00 AM', timeOut: '12:00 PM', status: 'Present' },
    { profile: '/path/to/image2.jpg', name: 'Student 2', timeIn: '9:30 AM', timeOut: '11:45 AM', status: 'Present' },
    { profile: '/path/to/image2.jpg', name: 'Student 2', timeIn: '9:30 AM', timeOut: '11:45 AM', status: 'Present' },
    { profile: '/path/to/image2.jpg', name: 'Student 2', timeIn: '9:30 AM', timeOut: '11:45 AM', status: 'Present' },
    // Add more entries as needed
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#fff'}}>
          <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign:"left", marginTop: 2 }}>Library Attendance</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 450, overflowY: 'auto', opacity: 0.95,borderRadius:'15px 15px 0 0'}}>
            <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000',borderRight: '1px solid #ffffff', width:'80px', textAlign: 'center', background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)'}}>Profile</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000',borderRight: '1px solid #ffffff', width:'200px',textAlign: 'center', background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)'}}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000',borderRight: '1px solid #ffffff',textAlign: 'center', background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)'   }}>Time In</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000', borderRight: '1px solid #ffffff', textAlign: 'center', background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)'  }}>Time Out</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000', borderRight: '1px solid #ffffff', textAlign: 'center', background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {attendanceData.map((entry, index) => (
                  <TableRow key={index} sx={{ borderBottom: '1px solid #ffffff' }}>
                    <TableCell sx={{ borderRight: '1px solid #ffffff', background: '#A85858' }}>
                      <Avatar alt={entry.name} src={entry.profile} sx={{ width: 160, height: 160, borderRadius: 0 }} />
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid #ffffff', background: '#A85858',textAlign: 'center' }}>{entry.name}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #ffffff', background: '#A85858',textAlign: 'center' }}>{entry.timeIn}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #ffffff', background: '#A85858',textAlign: 'center' }}>{entry.timeOut}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #ffffff', background: '#A85858',textAlign: 'center' }}>{entry.status}</TableCell>
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

export default LibraryAttendance;
