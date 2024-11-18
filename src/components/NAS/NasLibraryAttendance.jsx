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
    { profile: '/path/to/image2.jpg', name: 'Student 3', timeIn: '9:30 AM', timeOut: '11:45 AM', status: 'Present' },
    { profile: '/path/to/image2.jpg', name: 'Student 4', timeIn: '9:30 AM', timeOut: '11:45 AM', status: 'Present' },
    // Add more entries as needed
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 4, backgroundColor: '#fff' }}>
          <Typography
            variant="h4"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              marginBottom: 3,
              textAlign: 'left',
            }}
          >
            Library Attendance
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              maxHeight: '63vh', // Makes the table container responsive
              overflowY: 'auto',
              opacity: 0.95,
              borderRadius: '15px 15px 0 0',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)',
                      borderRight: '1px solid #ffffff',
                    }}
                  >
                    Profile
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)',
                      borderRight: '1px solid #ffffff',
                    }}
                  >
                    Student Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)',
                      borderRight: '1px solid #ffffff',
                    }}
                  >
                    Time In
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)',
                      borderRight: '1px solid #ffffff',
                    }}
                  >
                    Time Out
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      textAlign: 'center',
                      background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)',
                      borderRight: '1px solid #ffffff',
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        background: '#A85858',
                        borderRight: '1px solid #ffffff',
                      }}
                    >
                      <Avatar
                        alt={entry.name}
                        src={entry.profile}
                        sx={{ width: 80, height: 80, margin: 'auto' }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        background: '#A85858',
                        borderRight: '1px solid #ffffff',
                      }}
                    >
                      {entry.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        background: '#A85858',
                        borderRight: '1px solid #ffffff',
                      }}
                    >
                      {entry.timeIn}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        background: '#A85858',
                        borderRight: '1px solid #ffffff',
                      }}
                    >
                      {entry.timeOut}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        background: '#A85858',
                        borderRight: '1px solid #ffffff',
                      }}
                    >
                      {entry.status}
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

export default LibraryAttendance;
