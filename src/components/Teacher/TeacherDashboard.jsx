import React, { useState, useEffect, useContext, useCallback } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SetLibraryHours from './components/SetLibraryHours';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from '../AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';

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
  const [participantsData, setParticipantsData] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    studentsInsideLibrary: 0,
    totalRegisteredStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [quarter, setQuarter] = useState('');
  // New state for subject filter
  const [subject, setSubject] = useState('');
  const [teacherSubject, setTeacherSubject] = useState(''); // Store teacher's assigned subject
  const [teacherAssignments, setTeacherAssignments] = useState({
    assignedGrade: '',
    assignedSection: ''
  });
  const [availableSections, setAvailableSections] = useState([]);
  const [filteredSection, setFilteredSection] = useState(''); // Track the actually applied section filter
  const [filteredQuarter, setFilteredQuarter] = useState(''); // Track the actually applied quarter filter
  const [filteredSubject, setFilteredSubject] = useState(''); // Track the actually applied subject filter
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Function to fetch dashboard statistics with proper filtering
  const fetchDashboardStatistics = useCallback(async (filterParams = {}) => {
    try {
      setStatisticsLoading(true);
      const token = localStorage.getItem('token');
      
      // Create params for filtering
      const params = new URLSearchParams();
      
      // Add grade level filter if specified
      if (gradeLevel) {
        params.append('gradeLevel', gradeLevel);
      }
      
      // Only add section filter if it's in the filterParams
      if (filterParams.section) {
        params.append('section', filterParams.section);
      }
      
      // Always add teacher's subject filter if available
      if (teacherSubject) {
        params.append('subject', teacherSubject);
      }
      
      // Make API call with filters
      const url = `http://localhost:8080/api/statistics/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update statistics state with response data
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setStatisticsLoading(false);
    }
  }, [gradeLevel, teacherSubject]);

  // Function to fetch teacher assignments (grade, section, and subject)
  const fetchTeacherAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user || !user.idNumber) {
        return;
      }
      
      const response = await axios.get(`http://localhost:8080/api/users/${user.idNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the teacher's information
      if (response.data) {
        // Format grade to match the dropdown values (e.g., "2" to "Grade 2")
        let formattedGrade = '';
        if (response.data.grade) {
          formattedGrade = response.data.grade.includes('Grade') 
            ? response.data.grade 
            : `Grade ${response.data.grade}`;
        }
        
        // Get teacher's assigned subject
        const assignedSubject = response.data.subject || '';
        
        setTeacherAssignments({
          assignedGrade: formattedGrade,
          assignedSection: response.data.section || ''
        });
        
        // Set the teacher's subject
        setTeacherSubject(assignedSubject);
        
        // Pre-populate the subject filter with teacher's subject
        setSubject(assignedSubject);
        setFilteredSubject(assignedSubject);
        
        // Set the grade level filter to the teacher's assigned grade
        setGradeLevel(formattedGrade);
        
        console.log(`Teacher subject set to: ${assignedSubject}`);
        
        // Fetch all sections for this grade level
        try {
          const gradeSectionResponse = await axios.get(`http://localhost:8080/api/grade-sections/grade/${formattedGrade}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (gradeSectionResponse.data && gradeSectionResponse.data.length > 0) {
            // Store sections for dropdown
            setAvailableSections(gradeSectionResponse.data);
          }
        } catch (sectionError) {
          console.error("Error fetching grade sections:", sectionError);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      toast.error("Failed to load your assigned grade and section");
    }
  };

  // Initial setup when component mounts
  useEffect(() => {
    // Check if user is authenticated and has Teacher role
    if (!user || user.role !== 'Teacher') {
      toast.error("Unauthorized access. Please log in as a teacher.");
      logout();
      navigate('/login');
      return;
    }
    
    // Fetch teacher's assigned grade, section, and subject
    fetchTeacherAssignments();
  }, [user, logout, navigate]);

  // Effect for data fetching when grade level or teacher subject changes
  useEffect(() => {
    if (!user || !gradeLevel) return;
    
    // Fetch dashboard statistics when grade level changes
    fetchDashboardStatistics();
    
    // Function to fetch deadlines
    const fetchDeadlines = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Configure axios with auth token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Build query parameters - ALWAYS filter by teacher's grade level and subject
        const params = new URLSearchParams();
        if (gradeLevel) {
          params.append('gradeLevel', gradeLevel);
        }
        if (teacherSubject) {
          params.append('subject', teacherSubject);
        }
        
        // Fetch deadlines with filters
        const deadlinesResponse = await axios.get(`http://localhost:8080/api/set-library-hours${params.toString() ? `?${params.toString()}` : ''}`);
        setDeadlines(deadlinesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to fetch data: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch participants data
    const fetchParticipantsData = async () => {
      try {
        setParticipantsLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (gradeLevel) {
          params.append('gradeLevel', gradeLevel);
        }
        
        // Always use monthly view
        params.append('timeframe', 'monthly');
        
        // Always filter by teacher's subject
        if (teacherSubject) {
          params.append('subject', teacherSubject);
        }
        
        // Fetch participants data
        const url = `http://localhost:8080/api/statistics/active-participants${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axios.get(url);
        
        // Process the data for chart display
        const formattedData = response.data.map(item => ({
          name: getFullMonthName(item.month),
          participants: item.participants
        }));
        
        setParticipantsData(formattedData);
      } catch (err) {
        console.error('Error fetching participants data:', err);
        toast.error("Failed to load participants data");
      } finally {
        setParticipantsLoading(false);
      }
    };
    
    // Fetch all required data
    fetchDeadlines();
    fetchParticipantsData();
    
    // Set up refresh intervals
    const participantsInterval = setInterval(fetchParticipantsData, 300000); // 5 minutes
    const statisticsInterval = setInterval(() => fetchDashboardStatistics(), 60000); // 1 minute
    
    // Cleanup intervals when component unmounts
    return () => {
      clearInterval(participantsInterval);
      clearInterval(statisticsInterval);
    };
  }, [user, gradeLevel, teacherSubject, fetchDashboardStatistics]); // Added teacherSubject dependency

  // Helper function to convert month abbreviation to full name
  const getFullMonthName = (monthAbbr) => {
    const monthMap = {
      'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
      'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
      'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
    };
    return monthMap[monthAbbr] || monthAbbr;
  };

  // Modal handlers
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Add deadline handler
  const handleAddDeadline = async (data) => {
    try {
      // Add the teacher's assigned grade if not specified
      if (!data.gradeLevel && teacherAssignments.assignedGrade) {
        data.gradeLevel = teacherAssignments.assignedGrade;
      }
      
      // Always set the teacher's subject for new deadlines
      if (teacherSubject) {
        data.subject = teacherSubject;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/set-library-hours', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.data) throw new Error('Failed to add deadline');
      
      toast.success("Library hours requirement submitted for approval!");
      
      // Refresh deadlines - always filter by teacher's grade and subject
      const params = new URLSearchParams();
      if (gradeLevel) params.append('gradeLevel', gradeLevel);
      if (teacherSubject) params.append('subject', teacherSubject);
      
      const deadlinesResponse = await axios.get(`http://localhost:8080/api/set-library-hours${params.toString() ? `?${params.toString()}` : ''}`);
      setDeadlines(deadlinesResponse.data);
      
      handleClose();
    } catch (error) {
      console.error('Error adding deadline:', error);
      toast.error("Failed to add deadline: " + (error.response?.data?.message || error.message));
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter application handler - only called when filter button is clicked
  const applyFilters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Store the currently applied filters
      setFilteredSection(section);
      setFilteredQuarter(quarter);
      // Always use teacher's subject for filtering
      const subjectToFilter = teacherSubject || subject;
      setFilteredSubject(subjectToFilter);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (academicYear) params.append('academicYear', academicYear);
      if (gradeLevel) params.append('gradeLevel', gradeLevel);
      if (section) params.append('section', section);
      if (quarter) params.append('quarter', quarter);
      // Always include teacher's subject filter
      if (subjectToFilter) params.append('subject', subjectToFilter);
      
      // Fetch deadlines with filters
      const response = await axios.get(`http://localhost:8080/api/set-library-hours?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setDeadlines(response.data);
      
      // Build filter description for toast
      const filterDescriptions = [];
      if (section) filterDescriptions.push(`Section: ${section}`);
      if (quarter) filterDescriptions.push(`Quarter: ${quarter}`);
      if (subjectToFilter) filterDescriptions.push(`Subject: ${subjectToFilter}`);
      
      toast.info(`Filters applied: ${filterDescriptions.length > 0 ? filterDescriptions.join(', ') : 'None'}`);
      
      // Also refresh participants data with same filters
      const participantsParams = new URLSearchParams();
      if (gradeLevel) participantsParams.append('gradeLevel', gradeLevel);
      if (section) participantsParams.append('section', section);
      if (academicYear) participantsParams.append('academicYear', academicYear);
      if (quarter) participantsParams.append('quarter', quarter);
      if (subjectToFilter) participantsParams.append('subject', subjectToFilter);
      participantsParams.append('timeframe', 'monthly');
      
      const participantsUrl = `http://localhost:8080/api/statistics/active-participants${participantsParams.toString() ? `?${participantsParams.toString()}` : ''}`;
      const participantsResponse = await axios.get(participantsUrl);
      
      const formattedData = participantsResponse.data.map(item => ({
        name: getFullMonthName(item.month),
        participants: item.participants
      }));
      
      setParticipantsData(formattedData);

      // Refresh student count statistics with section filter
      await fetchDashboardStatistics({ section });
      
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error(`Failed to apply filters: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear filters but maintain teacher's subject filter
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setSection('');
    setQuarter('');
    setFilteredSection('');
    setFilteredQuarter('');
    // Maintain teacher's subject filter
    setSubject(teacherSubject);
    setFilteredSubject(teacherSubject);
    
    // Apply cleared filters
    toast.info("Filters cleared (subject filter maintained)");
    applyFilters();
  };

  // Prepare displayed deadlines for current page
  const displayedDeadlines = deadlines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  // Get appropriate label for student count based on filtering
  const getStudentCountLabel = () => {
    const gradeText = teacherAssignments.assignedGrade || gradeLevel || "";
    const subjectText = teacherSubject ? ` (${teacherSubject})` : "";
    
    if (filteredSection) {
      return `TOTAL REGISTERED ${gradeText} SECTION ${filteredSection}${subjectText} STUDENTS`;
    } else {
      return `TOTAL REGISTERED ${gradeText}${subjectText} STUDENTS`;
    }
  };

  // Get chart title based on active filters
  const getChartTitle = () => {
    const parts = [];
    parts.push("Active Library Hours Participants");
    
    if (filteredSection) {
      parts.push(`Section ${filteredSection}`);
    }
    
    if (filteredQuarter) {
      parts.push(`${filteredQuarter} Quarter`);
    }
    
    // Always show teacher's subject in chart title
    if (teacherSubject) {
      parts.push(`${teacherSubject}`);
    }
    
    return parts.join(' - ');
  };

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return filteredSection || filteredQuarter || dateFrom || dateTo || academicYear;
  };

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
          <Box sx={{ padding: 4 }}>
            {/* Top row with student stats and library hours button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4
            }}>
              {/* Total Registered Students Box */}
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  border: '1px solid #000000',
                  borderRadius: 2,
                  width: '300px'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ color: '#000000', fontSize: 40, mr: 2 }} />
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {statisticsLoading ? <CircularProgress size={24} /> : statistics.totalRegisteredStudents}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    '&:hover': { backgroundColor: '#FFD700' },
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    width: '100%',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                  }}
                >
                  <CheckIcon sx={{ color: '#800000', mr: 1 }} />
                  {getStudentCountLabel()}
                </Button>
              </Paper>

              {/* Set Library Hours Button */}
              <Button 
                variant="contained" 
                color="warning" 
                sx={{ 
                  backgroundColor: '#FFD700', 
                  color: '#000', 
                  height: '50px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  px: 3,
                  '&:hover': { backgroundColor: '#E6C300' }
                }} 
                onClick={handleClickOpen}
              >
                Set Library Hours
              </Button>
            </Box>

            {/* Filters Section */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Date From"
                    type="date"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Date To"
                    type="date"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Academic Year"
                    select
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  >
                    <MenuItem value="">Select Academic Year</MenuItem>
                    <MenuItem value="2024-2025">2024-2025</MenuItem>
                    <MenuItem value="2023-2024">2023-2024</MenuItem>
                    <MenuItem value="2022-2023">2022-2023</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Grade Level"
                    select
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    disabled={!!teacherAssignments.assignedGrade} // Disable if teacher has an assigned grade
                  >
                    <MenuItem value="">Choose here...</MenuItem>
                    <MenuItem value="Grade 1">Grade 1</MenuItem>
                    <MenuItem value="Grade 2">Grade 2</MenuItem>
                    <MenuItem value="Grade 3">Grade 3</MenuItem>
                    <MenuItem value="Grade 4">Grade 4</MenuItem>
                    <MenuItem value="Grade 5">Grade 5</MenuItem>
                    <MenuItem value="Grade 6">Grade 6</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Section"
                    select
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {availableSections.map((sectionItem) => (
                      <MenuItem key={sectionItem.id} value={sectionItem.sectionName}>
                       {sectionItem.sectionName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Quarter"
                    select
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                  >
                    <MenuItem value="">All Quarters</MenuItem>
                    <MenuItem value="First">First</MenuItem>
                    <MenuItem value="Second">Second</MenuItem>
                    <MenuItem value="Third">Third</MenuItem>
                    <MenuItem value="Fourth">Fourth</MenuItem>
                  </TextField>
                </Grid>
                
                {/* Subject Filter - Disabled and pre-filled with teacher's subject */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Subject"
                    select
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={teacherSubject || subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={!!teacherSubject} // Disable if teacher has an assigned subject
                  >
                    <MenuItem value="">All Subjects</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Filipino">Filipino</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                  <Button 
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    disabled={!hasActiveFilters()}
                  >
                    Clear Filters
                  </Button>
                  
                  <Button 
                    variant="contained"
                    startIcon={<FilterAltIcon />}
                    sx={{ 
                      backgroundColor: "#FFD700", 
                      color: "#000", 
                      "&:hover": { backgroundColor: "#FFC107" } 
                    }} 
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>

              {/* Active Filters Display */}
              {(hasActiveFilters() || teacherSubject) && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Active Filters:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {filteredSection && (
                      <Chip 
                        label={`Section: ${filteredSection}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {filteredQuarter && (
                      <Chip 
                        label={`Quarter: ${filteredQuarter}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {teacherSubject && (
                      <Chip 
                        label={`Subject: ${teacherSubject}`} 
                        size="small" 
                        color="secondary" 
                        variant="filled"
                      />
                    )}
                    {dateFrom && (
                      <Chip 
                        label={`From: ${dateFrom}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {dateTo && (
                      <Chip 
                        label={`To: ${dateTo}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {academicYear && (
                      <Chip 
                        label={`AY: ${academicYear}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Chart */}
            <Paper sx={{ padding: '16px', backgroundColor: 'rgba(215, 101, 101, 0.8)', marginBottom: '24px', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: '#000', marginBottom: '16px' }}>
                {getChartTitle()}
              </Typography>
              <Box sx={{ height: '350px' }}>
                {participantsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : participantsData.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography>No participants data available</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={participantsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
                      <XAxis 
                        dataKey="name" 
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
                          value: 'Number of Participants', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -5
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} participants`]}
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: '1px solid #000000' 
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="participants" 
                        name={`Participants${filteredQuarter ? ` (${filteredQuarter} Quarter)` : ''}${teacherSubject ? ` (${teacherSubject})` : ''}`}
                        fill="#FFD700" 
                        stroke="#000000"
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
              
              {/* Information about participant counting */}
              {(filteredQuarter || teacherSubject) && (
                <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> Each student is counted as 1 participant if they have any progress
                    {filteredQuarter && ` in ${filteredQuarter} Quarter`}
                    {teacherSubject && ` for ${teacherSubject}`}.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Assigned Deadline Table */}
            <Typography variant="h6" sx={{ textAlign: 'left', marginBottom: 2 }}>
              Assigned Deadlines for {teacherSubject || "All Subjects"}
              {hasActiveFilters() && " (Filtered)"}
            </Typography>

            <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : displayedDeadlines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {hasActiveFilters() ? 
                          `No deadlines found with the current filters for ${teacherSubject || "your subject"}` : 
                          `No deadlines found for ${teacherSubject || "your subject"}`}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedDeadlines.map((row, index) => (
                      <TableRow 
                        key={index} 
                        sx={{ 
                          backgroundColor: row.approvalStatus === 'APPROVED' ? 'rgba(76, 175, 80, 0.1)' : 
                                          row.approvalStatus === 'REJECTED' ? 'rgba(244, 67, 54, 0.1)' : 'white',
                          color: 'black',
                          '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' },
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
      <SetLibraryHours 
        open={open} 
        handleClose={handleClose} 
        handleSubmit={handleAddDeadline} 
        defaultGradeLevel={teacherAssignments.assignedGrade}
        defaultSubject={teacherSubject} // Pass the teacher's subject as the default
      />
    </>
  );
};

export default TeacherDashboard;