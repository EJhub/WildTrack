import React, { useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SetLibraryHours from './components/SetLibraryHours';
import { useNavigate } from 'react-router-dom';
 
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
 
const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
 
  const handleClickOpen = () => {
    navigate("/TeacherDashboard/Home/SetLibraryHours");
    setOpen(true);
  };
 
  const handleClose = () => {
    navigate("/TeacherDashboard/Home");
    setOpen(false);
  };
 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
 
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
 
  const chartData = {
    labels: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    datasets: [
      {
        label: 'Library Hours',
        data: [2, 3, 1, 4, 2, 5, 3, 4, 5, 2, 3, 4],
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };
 
  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
 
  const deadlines = [
    { grade: '5', subject: 'Filipino', minutes: '150', dueDate: '12/15/24' },
    { grade: '4', subject: 'Filipino', minutes: '110', dueDate: '12/15/24' },
    { grade: '3', subject: 'Math', minutes: '120', dueDate: '12/16/24' },
    { grade: '2', subject: 'Science', minutes: '100', dueDate: '12/17/24' },
    { grade: '1', subject: 'English', minutes: '90', dueDate: '12/18/24' },
    { grade: 'K', subject: 'Arts', minutes: '80', dueDate: '12/19/24' },
  ];
 
  const displayedDeadlines = deadlines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
 
  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
          <Box sx={{ padding: 4 }}>
            {/* Total Library Hours Card */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <Paper
                sx={{
                  padding: '16px',
                  backgroundColor: 'rgba(215, 101, 101, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  maxWidth: '250px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#000' }}>⏰</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#000', fontSize: '24px' }}>1032</Typography>
                    <Box
                      sx={{
                        marginTop: 1,
                        padding: '4px 8px',
                        backgroundColor: '#A44D4D',
                        borderRadius: '8px',
                        color: '#fff',
                        display: 'inline-block',
                      }}
                    >
                      <Typography variant="body2">Student Library Hours</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
              <Button
                variant="outlined"
                color="warning"
                sx={{ backgroundColor: '#FFD700', color: '#000', marginLeft: '16px', border: 'solid 2px #000' }}
                onClick={handleClickOpen}
              >
                Set Library Hours
              </Button>
            </Box>
 
            {/* Chart */}
            <Paper sx={{ padding: '1px', backgroundColor: 'rgba(215, 101, 101, 0.8)', marginBottom: '24px' }}>
              <Typography variant="h6" sx={{ color: '#000', marginBottom: '16px' }}>Student Library Hours</Typography>
              <Box sx={{ height: '250px' }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Paper>
 
            {/* Assigned Deadline Table */}
            <Paper sx={{ padding: '16px', backgroundColor: 'rgba(215, 101, 101, 0.8)', width: '100%', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ color: '#000', marginBottom: '16px', textAlign: 'left' }}>Assigned Deadline</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#D76565', color: '#fff' }}>Grade Level</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#D76565', color: '#fff' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#D76565', color: '#fff' }}>Minutes Required</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#D76565', color: '#fff' }}>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedDeadlines.map((row, index) => (
                      <TableRow key={index} sx={{ backgroundColor: '#A85858' }}>
                        <TableCell>{row.grade}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>{row.minutes}</TableCell>
                        <TableCell>{row.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
             
            </Paper>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15]}
              component="div"
              count={deadlines.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                display: 'flex',
                justifyContent: 'center', // Centers horizontally
                alignItems: 'center', // Centers vertically if needed
              }}
            />
 
           
          </Box>
         
        </Box>
      </Box>
 
      <SetLibraryHours open={open} handleClose={handleClose} handleSubmit={(data) => console.log(data)} />
    </>
  );
};
 
export default TeacherDashboard;