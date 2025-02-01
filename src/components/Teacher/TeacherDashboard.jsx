import React, { useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SetLibraryHours from './components/SetLibraryHours';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');

  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddDeadline = () => {
    // Add the functionality to handle adding deadlines
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
    plugins: {
      datalabels: {
        display: false, // Disable data labels
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Paper sx={{ padding: '16px', backgroundColor: '#FFD700', display: 'flex', alignItems: 'center', textAlign: 'center', borderRadius: 2, maxWidth: '250px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 2 }}>
                    <Typography variant="h6" sx={{ color: '#000' }}>⏰</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#000', fontSize: '24px' }}>1032</Typography>
                    <Box sx={{ marginTop: 1, padding: '4px 8px', backgroundColor: '#A44D4D', borderRadius: '8px', color: '#fff', display: 'inline-block' }}>
                      <Typography variant="body2"> Registered Students</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
              <Button variant="outlined" color="warning" sx={{ backgroundColor: '#FFD700', color: '#000', marginLeft: '16px' }} onClick={handleClickOpen}>
                Set Library Hours
              </Button>
            </Box>

            {/* Filters Section */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 3 }}>
              <TextField
                label="Date From"
                type="date"
                variant="outlined"
                size="small"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Date To"
                type="date"
                variant="outlined"
                size="small"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Academic Year"
                select
                variant="outlined"
                size="small"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
              >
                <MenuItem value="">Select Academic Year</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2022">2022</MenuItem>
              </TextField>
              <Button size="small" sx={{ backgroundColor: "#FFD700", color: "#000", "&:hover": { backgroundColor: "#FFC107" } }}>
                Filter
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 3 }}>
              <TextField
                label="Grade Level"
                select
                variant="outlined"
                size="small"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
              >
                <MenuItem value="">Choose here...</MenuItem>
                <MenuItem value="Grade 1">Grade 1</MenuItem>
                <MenuItem value="Grade 2">Grade 2</MenuItem>
                <MenuItem value="Grade 3">Grade 3</MenuItem>
              </TextField>
              <TextField
                label="Section"
                select
                variant="outlined"
                size="small"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
              >
                <MenuItem value="">Choose here...</MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
              </TextField>
            </Box>

            {/* Chart */}
            <Paper sx={{ padding: '1px', backgroundColor: 'rgba(215, 101, 101, 0.8)', marginBottom: '24px' }}>
              <Typography variant="h6" sx={{ color: '#000', marginBottom: '16px' }}>Active Library Hours Participants </Typography>
              <Box sx={{ height: '350px' }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Paper>

           
            {/* Assigned Deadline Table */}
          
            <Typography variant="h6" sx={{ textAlign: 'left' }}>
  Assigned Deadline
</Typography> 
<Box sx={{ display: 'flex', gap: 1, marginBottom: 2, justifyContent: 'flex-end', marginTop: '-30px'
}}>
  {/* Your content inside the Box */}
                <select style={{ backgroundColor: '#FFD700', padding: '4px 16px', borderRadius: '4px', cursor: 'pointer', border: 'none' }}>
                  <option>Grade</option>
                </select>
                <select style={{ backgroundColor: '#FFD700', padding: '4px 16px', borderRadius: '4px', cursor: 'pointer', border: 'none' }}>
                  <option>Subject</option>
                </select>
                <select style={{ backgroundColor: '#FFD700', padding: '4px 16px', borderRadius: '4px', cursor: 'pointer', border: 'none' }}>
                  <option>Minutes</option>
                </select>
                <Box sx={{ position: 'relative' }}>
  <input
    type="date"
    value={dateFrom} // You can bind this to state to capture the selected date
    onChange={(e) => setDateFrom(e.target.value)} // Set the date value on change
    style={{
      backgroundColor: '#FFD700',
      padding: '4px 16px', // Adjust padding as needed
      borderRadius: '4px',
      border: 'none',
      width: '100px', // Adjust width as needed
    }}
  />
</Box>

              </Box>
           
            
            <TableContainer>
  <Table>
    <TableHead>
    <TableRow sx={{ backgroundColor: '#781B1B' }}>
  <TableCell sx={{ color: 'white', borderTopLeftRadius: '10px' }}>Grade Level</TableCell>
  <TableCell sx={{ color: 'white' }}>Subject</TableCell>
  <TableCell sx={{ color: 'white' }}>Minutes Required</TableCell>
  <TableCell sx={{ color: 'white', borderTopRightRadius: '10px' }}>Due Date</TableCell>
</TableRow>

    </TableHead>

    <TableBody>
  {displayedDeadlines.map((row, index) => (
    <TableRow key={index} sx={{ backgroundColor: 'white', color: 'black' }}>
    <TableCell
      sx={{
        borderLeft: '1px solid rgb(2, 1, 1)', // Add border to the left side of the row
      
        borderBottom: '1px solid rgb(4, 4, 4)', // Add border to the bottom side of the row
      }}
    >
      {row.grade}
    </TableCell>
    <TableCell
      sx={{
       
        borderBottom: '1px solid rgb(4, 4, 4)', // Add border to the bottom side of the row
      }}
    >
      {row.subject}
    </TableCell>
    <TableCell
      sx={{
        borderBottom: '1px solid rgb(4, 4, 4)', // Add border to the bottom side of the row
      }}
    >
      {row.minutes}
    </TableCell>
    <TableCell
      sx={{
        borderRight: '1px solid rgb(4, 4, 4)', // Add border to the right side of the last cell
        borderBottom: '1px solid rgb(4, 4, 4)', // Add border to the bottom side of the last cell
     
      }}
    >
      {row.dueDate}
    </TableCell>
  </TableRow>
  

  ))}
</TableBody>

  </Table>
</TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
  <TablePagination
    rowsPerPageOptions={[5, 10, 15]}
    component="div"
    count={deadlines.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</Box>

           
          </Box>
        </Box>
      </Box>
      <SetLibraryHours open={open} handleClose={handleClose} handleSubmit={handleAddDeadline} />
    </>
  );
};

export default TeacherDashboard;
