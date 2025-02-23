import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import { 
  Box, Typography, Grid, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  Divider, TablePagination, Select, MenuItem, TextField,
  Container
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const LibrarianDashboard = () => {
  // States
  const [statistics, setStatistics] = useState({
    studentsInsideLibrary: 0,
    totalRegisteredStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [participantsData, setParticipantsData] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);

  // Constants
  const gradeLevels = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  const sections = ['Section A', 'Section B', 'Section C'];
  const academicYears = ['2024-2025', '2025-2026', '2026-2027'];

  const approvals = [
    { 
      id: '2009-40034', 
      name: 'Tricia O. Araneta', 
      date: 'October 10, 2024', 
      minutes: '150 minutes', 
      approvalStatus: true, 
      status: 'Pending' 
    },
    // Add more mock data as needed
  ];

  // Chart data
  const lineData = [
    { month: 'Jan', participants: 400 },
    { month: 'Feb', participants: 450 },
    { month: 'Mar', participants: 420 }
    // Add more data as needed
  ];

  const barData = [
    { month: 'Jan', rate: 75 },
    { month: 'Feb', rate: 80 },
    { month: 'Mar', rate: 85 }
    // Add more data as needed
  ];

  // Event Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleDateFromChange = (event) => {
    setDateFrom(event.target.value);
  };

  const handleDateToChange = (event) => {
    setDateTo(event.target.value);
  };

  const handleGradeLevelChange = (event) => {
    setSelectedGradeLevel(event.target.value);
  };

  const handleAcademicYearChange = (event) => {
    setSelectedAcademicYear(event.target.value);
  };

  // Fetch Data
  useEffect(() => {
    const fetchParticipantsData = async () => {
      try {
        setParticipantsLoading(true);
        const response = await fetch('http://localhost:8080/api/statistics/active-participants');
        if (!response.ok) throw new Error('Failed to fetch participants data');
        const data = await response.json();
        setParticipantsData(data);
      } catch (err) {
        console.error('Error fetching participants data:', err);
      } finally {
        setParticipantsLoading(false);
      }
    };

    fetchParticipantsData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchParticipantsData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/statistics/dashboard');
        const data = await response.json();
        setStatistics(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
          {/* Summary Boxes */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Students Inside Library Box */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  border: '2px solid #000000',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ color: '#000000', fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" component="div">
                    {loading ? 'Loading...' : statistics.studentsInsideLibrary}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    '&:hover': { backgroundColor: '#FFD700' }
                  }}
                >
                  <CheckIcon sx={{ color: '#800000', mr: 1 }} />
                  Students Inside Library
                </Button>
              </Paper>
            </Grid>

            {/* Total Registered Students Box */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  border: '2px solid #000000',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ color: '#000000', fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" component="div">
                    {loading ? 'Loading...' : statistics.totalRegisteredStudents}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    '&:hover': { backgroundColor: '#FFD700' }
                  }}
                >
                  <CheckIcon sx={{ color: '#800000', mr: 1 }} />
                  Total Registered Students
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 3 }}>
            <Box>
              <Typography variant="subtitle1">Date From:</Typography>
              <input type="date" value={dateFrom} onChange={handleDateFromChange} />
            </Box>
            <Box>
              <Typography variant="subtitle1">Date To:</Typography>
              <input type="date" value={dateTo} onChange={handleDateToChange} />  
            </Box>
            <Box>
              <Typography variant="subtitle1">Grade Level:</Typography>
              <select value={selectedGradeLevel} onChange={handleGradeLevelChange}>
                <option value="">All</option>
                {gradeLevels.map((gradeLevel) => (
                  <option key={gradeLevel} value={gradeLevel}>
                    {gradeLevel}
                  </option>
                ))}
              </select>
            </Box>
            <Box>
              <Typography variant="subtitle1">Section:</Typography>
              <select value={selectedSection} onChange={handleSectionChange}>
                <option value="">All</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </Box>
            <Box>
              <Typography variant="subtitle1">Academic Year:</Typography>
              <select value={selectedAcademicYear} onChange={handleAcademicYearChange}>
                <option value="">All</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Box>
          </Box>
          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Participants Chart */}
            <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2, backgroundColor: '#D98C8C', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Active Library Hours Participants
        </Typography>
        <Box sx={{ height: 300 }}>
          {participantsLoading ? (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Typography>Loading data...</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={participantsData}>
                <XAxis 
                  dataKey="month" 
                  stroke="#000000"
                  label={{ 
                    value: 'Month', 
                    position: 'bottom',
                    offset: -5 
                  }}
                />
                <YAxis 
                  stroke="#000000"
                  label={{ 
                    value: 'Completed Sessions', 
                    angle: -90, 
                    position: 'center',
                  
                  }}
                />
                <CartesianGrid stroke="#ffffff" strokeDasharray="5 5" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #000000' 
                  }}
                  formatter={(value) => [`${value} participants`]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="participants" 
                  stroke="#000000" 
                  strokeWidth={2}
                  
                  dot={{ fill: '#000000' }}
                  activeDot={{ 
                    r: 8,
                    fill: '#FFD700' 
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>
    </Grid>

            {/* Completion Rate Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#D98C8C', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Library Hours Completion Rate
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="month" stroke="#000000" />
                      <YAxis stroke="#000000" />
                      <CartesianGrid stroke="#ffffff" strokeDasharray="5 5" />
                      <Bar dataKey="rate" fill="#000000" />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff' }} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Approvals Table */}
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h6" sx={{ p: 2 }}>
              Pending Approvals
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#FFD700' }}>
                  <TableRow>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Date Completed</TableCell>
                    <TableCell>Minutes</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvals
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((approval, index) => (
                      <TableRow key={index} sx={{ backgroundColor: '#CD6161' }}>
                        <TableCell>{approval.id}</TableCell>
                        <TableCell>{approval.name}</TableCell>
                        <TableCell>{approval.date}</TableCell>
                        <TableCell>{approval.minutes}</TableCell>
                        <TableCell>{approval.status}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <CheckIcon />
                            <CloseIcon />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={approvals.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default LibrarianDashboard;