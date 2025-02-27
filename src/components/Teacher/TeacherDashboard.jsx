import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import Chip from '@mui/material/Chip';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SetLibraryHours from './components/SetLibraryHours';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from '../AuthContext';

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
  const [deadlines, setDeadlines] = useState([]);
  const [libraryHours, setLibraryHours] = useState([]);
  const [studentCountData, setStudentCountData] = useState({ labels: [], counts: [] });
  const [loading, setLoading] = useState(true);
  const [quarter, setQuarter] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    // Check if user is authenticated and has Teacher role
    if (!user || user.role !== 'Teacher') {
      toast.error("Unauthorized access. Please log in as a teacher.");
      logout();
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Configure axios with auth token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch library hours for participants
        const libraryResponse = await axios.get('http://localhost:8080/api/library-hours/all');
        const libraryData = libraryResponse.data;
        setLibraryHours(libraryData);

        // Initialize all months with zero counts
        const monthCounts = months.reduce((acc, month) => {
          acc[month] = 0;
          return acc;
        }, {});

        // Process library hours and group by month
        libraryData.forEach((item) => {
          const timeInMonth = new Date(item.timeIn).toLocaleString('default', { month: 'long' });
          monthCounts[timeInMonth] += 1;

          if (item.timeOut) {
            const timeOutMonth = new Date(item.timeOut).toLocaleString('default', { month: 'long' });
            monthCounts[timeOutMonth] += 1;
          }
        });

        setStudentCountData({
          labels: months,
          counts: months.map((month) => monthCounts[month]),
        });

        // Fetch deadlines
        const deadlinesResponse = await axios.get('http://localhost:8080/api/set-library-hours');
        setDeadlines(deadlinesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to fetch data: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, logout, navigate]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddDeadline = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/set-library-hours', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.data) throw new Error('Failed to add deadline');
      
      toast.success("Library hours requirement submitted for approval!");
      
      // Refresh deadlines
      const deadlinesResponse = await axios.get('http://localhost:8080/api/set-library-hours');
      const deadlinesData = await deadlinesResponse.data;
      setDeadlines(deadlinesData);
      
      handleClose();
    } catch (error) {
      console.error('Error adding deadline:', error);
      toast.error("Failed to add deadline: " + (error.response?.data?.message || error.message));
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (academicYear) params.append('academicYear', academicYear);
      if (gradeLevel) params.append('gradeLevel', gradeLevel);
      if (section) params.append('section', section);
      if (quarter) params.append('quarter', quarter);
      
      const response = await axios.get(`http://localhost:8080/api/set-library-hours?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setDeadlines(response.data);
      toast.info("Filters applied successfully");
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error(`Failed to apply filters: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const displayedDeadlines = deadlines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const chartData = {
    labels: studentCountData.labels,
    datasets: [
      {
        label: 'Library Hours',
        data: studentCountData.counts,
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
        display: false,
      },
    },
  };

  // Generate status chip based on approval status
  const getStatusChip = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip
            label="Approved"
            color="success"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        );
      case 'REJECTED':
        return (
          <Chip
            label="Rejected"
            color="error"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        );
      case 'PENDING':
      default:
        return (
          <Chip
            label="Pending Approval"
            color="warning"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        );
    }
  };

  return (
    <>
      <ToastContainer />
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
                    <Typography variant="h6" sx={{ color: '#000', fontSize: '24px' }}>{libraryHours.length}</Typography>
                    <Box sx={{ marginTop: 1, padding: '4px 8px', backgroundColor: '#A44D4D', borderRadius: '8px', color: '#fff', display: 'inline-block' }}>
                      <Typography variant="body2">Registered Students</Typography>
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
              <Button size="small" sx={{ backgroundColor: "#FFD700", color: "#000", "&:hover": { backgroundColor: "#FFC107" } }} onClick={applyFilters}>
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
                label="Quarter"
                select
                variant="outlined"
                size="small"
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
              >
                <MenuItem value="">All Quarters</MenuItem>
                <MenuItem value="First">First Quarter</MenuItem>
                <MenuItem value="Second">Second Quarter</MenuItem>
                <MenuItem value="Third">Third Quarter</MenuItem>
                <MenuItem value="Fourth">Fourth Quarter</MenuItem>
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
              <Typography variant="h6" sx={{ color: '#000', marginBottom: '16px' }}>Active Library Hours Participants</Typography>
              <Box sx={{ height: '350px' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography>Loading chart data...</Typography>
                  </Box>
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </Box>
            </Paper>

            {/* Assigned Deadline Table */}
            <Typography variant="h6" sx={{ textAlign: 'left' }}>Assigned Deadline</Typography>
            <Box sx={{ display: 'flex', gap: 1, marginBottom: 2, justifyContent: 'flex-end', marginTop: '-30px' }}>
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
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    backgroundColor: '#FFD700',
                    padding: '4px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    width: '100px',
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
                    <TableCell sx={{ color: 'white' }}>Quarter</TableCell>
                    <TableCell sx={{ color: 'white' }}>Minutes Required</TableCell>
                    <TableCell sx={{ color: 'white' }}>Due Date</TableCell>
                    <TableCell sx={{ color: 'white', borderTopRightRadius: '10px' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : displayedDeadlines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No deadlines found</TableCell>
                    </TableRow>
                  ) : (
                    displayedDeadlines.map((row, index) => (
                      <TableRow 
                        key={index} 
                        sx={{ 
                          backgroundColor: row.approvalStatus === 'APPROVED' ? 'rgba(76, 175, 80, 0.1)' : 
                                          row.approvalStatus === 'REJECTED' ? 'rgba(244, 67, 54, 0.1)' : 'white',
                          color: 'black' 
                        }}
                      >
                        <TableCell sx={{ borderLeft: '1px solid rgb(2, 1, 1)', borderBottom: '1px solid rgb(4, 4, 4)' }}>
                          {row.gradeLevel}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
                          {row.subject}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
                          {row.quarter}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
                          {row.minutes}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
                          {new Date(row.deadline).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid rgb(4, 4, 4)', borderBottom: '1px solid rgb(4, 4, 4)' }}>
                          {getStatusChip(row.approvalStatus)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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