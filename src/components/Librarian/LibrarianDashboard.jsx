import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  Divider, TablePagination, Select, MenuItem, TextField,
  IconButton, Tooltip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Alert, Chip, InputAdornment, FormControl
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from '../../utils/api'; // Import API utility instead of axios

// Icons
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClearIcon from '@mui/icons-material/Clear';

// Component Imports
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import ActiveStudentsDialog from './components/ActiveStudentsDialog';

const LibrarianDashboard = () => {
  // States
  const [statistics, setStatistics] = useState({
    studentsInsideLibrary: 0,
    totalRegisteredStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering States
  const [selectedSection, setSelectedSection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  
  // Dynamic Options States
  const [gradeLevels, setGradeLevels] = useState([]);
  const [gradeLevelsLoading, setGradeLevelsLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(true);
  
  // Applied filters tracking
  const [appliedFilters, setAppliedFilters] = useState({
    section: '',
    academicYear: '',
    gradeLevel: '',
    dateRange: { from: '', to: '' }
  });
  
  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Data States
  const [participantsData, setParticipantsData] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  const [completionRateLoading, setCompletionRateLoading] = useState(true);
  
  // Pending approvals states
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
  
  // Dialog and Action States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentRequirement, setCurrentRequirement] = useState(null);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Active Students Dialog State
  const [activeStudentsDialogOpen, setActiveStudentsDialogOpen] = useState(false);

  // Function to sort grade levels in the correct order
  const sortGradeLevels = (grades) => {
    return [...grades].sort((a, b) => {
      // Extract grade numbers for comparison
      const numA = parseInt(a.replace("Grade ", ""));
      const numB = parseInt(b.replace("Grade ", ""));
      
      // Sort numerically
      return numA - numB;
    });
  };

  // Fetch available grade levels
  useEffect(() => {
    const fetchGradeLevels = async () => {
      try {
        setGradeLevelsLoading(true);
        
        // Fetch grade levels using the api utility
        const gradesResponse = await api.get('/grade-sections/all');
        
        if (gradesResponse.data) {
          // Extract unique grade levels from the grade sections data
          const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
          
          // Format grade levels consistently if needed
          const formattedGrades = uniqueGrades.map(grade => 
            grade.includes('Grade') ? grade : `Grade ${grade}`
          );
          
          // Sort grade levels
          const sortedGrades = sortGradeLevels(formattedGrades);
          setGradeLevels(sortedGrades);
          
          console.log("Fetched grade levels:", sortedGrades);
        }
      } catch (err) {
        console.error("Error fetching grade levels:", err);
        toast.error("Failed to load grade levels");
        // Fallback to default grade levels
        setGradeLevels(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
      } finally {
        setGradeLevelsLoading(false);
      }
    };
    
    fetchGradeLevels();
  }, []);

  // Fetch academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setAcademicYearsLoading(true);
        
        const response = await api.get('/academic-years/all');
        
        if (response.data) {
          // Format academic years as needed
          const formattedYears = response.data.map(year => year.name || `${year.startYear}-${year.endYear}`);
          setAcademicYears(formattedYears);
        }
      } catch (err) {
        console.error("Error fetching academic years:", err);
        toast.error("Failed to load academic years");
        // Fallback to default academic years
        setAcademicYears(['2023-2024', '2024-2025', '2025-2026']);
      } finally {
        setAcademicYearsLoading(false);
      }
    };
    
    fetchAcademicYears();
  }, []);

  // Fetch sections when grade level changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedGradeLevel) {
        setSections([]);
        return;
      }
      
      try {
        setSectionsLoading(true);
        
        const response = await api.get(`/grade-sections/grade/${selectedGradeLevel}`);
        
        if (response.data) {
          // Extract section names from the response
          const sectionNames = response.data.map(section => section.sectionName);
          setSections(sectionNames);
        } else {
          setSections([]);
        }
      } catch (err) {
        console.error("Error fetching sections for grade:", err);
        toast.error("Failed to load sections for the selected grade");
        // Fallback to default sections
        setSections(['Section A', 'Section B', 'Section C']);
      } finally {
        setSectionsLoading(false);
      }
    };
    
    fetchSections();
  }, [selectedGradeLevel]);

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

  // Updated handler for Date From
  const handleDateFromChange = (event) => {
    const value = event.target.value;
    
    // If selecting a date, clear academic year
    // And ensure dateTo is not earlier than dateFrom
    if (value) {
      if (dateTo && new Date(value) > new Date(dateTo)) {
        // If dateFrom is later than dateTo, reset dateTo
        setDateTo('');
      }
      setSelectedAcademicYear('');
    }
    
    setDateFrom(value);
  };

  // Updated handler for Date To
  const handleDateToChange = (event) => {
    const value = event.target.value;
    
    // Clear academic year if date is set
    if (value) {
      setSelectedAcademicYear('');
    }
    
    setDateTo(value);
  };

  const handleGradeLevelChange = (event) => {
    setSelectedGradeLevel(event.target.value);
    // Clear section when grade level changes
    setSelectedSection('');
  };

  // Updated handler for Academic Year
  const handleAcademicYearChange = (event) => {
    const value = event.target.value;
    
    // Clear date range if academic year is set
    if (value) {
      setDateFrom('');
      setDateTo('');
    }
    
    setSelectedAcademicYear(value);
  };
  
  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
  };
  
  // Updated Apply Filters function with date validation
  const handleApplyFilters = () => {
    // Validate date range if both dates are provided
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Date From must be before or equal to Date To');
      return;
    }
    
    // Update applied filters state
    setAppliedFilters({
      section: selectedSection,
      academicYear: selectedAcademicYear,
      gradeLevel: selectedGradeLevel,
      dateRange: { from: dateFrom, to: dateTo }
    });
    
    // Show notification about applied filters
    let filterMsg = [];
    if (selectedGradeLevel) filterMsg.push(`Grade: ${selectedGradeLevel}`);
    if (selectedSection) filterMsg.push(`Section: ${selectedSection}`);
    if (selectedAcademicYear) filterMsg.push(`AY: ${selectedAcademicYear}`);
    if (dateFrom && dateTo) filterMsg.push(`Date: ${dateFrom} to ${dateTo}`);
    else if (dateFrom) filterMsg.push(`From: ${dateFrom}`);
    else if (dateTo) filterMsg.push(`To: ${dateTo}`);
    
    if (filterMsg.length > 0) {
      toast.info(`Applied filters: ${filterMsg.join(', ')}`);
    }
    
    // Fetch data with the new filters
    fetchDashboardData();
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSelectedSection('');
    setDateFrom('');
    setDateTo('');
    setSelectedGradeLevel('');
    setSelectedAcademicYear('');
    
    // Clear applied filters
    setAppliedFilters({
      section: '',
      academicYear: '',
      gradeLevel: '',
      dateRange: { from: '', to: '' }
    });
    
    toast.info('Filters cleared');
    
    // Fetch data without filters
    fetchDashboardData();
  };
  
  // Dialog handlers
  const handleOpenDialog = (requirement, action) => {
    setCurrentRequirement(requirement);
    setActionType(action);
    setRejectionReason('');
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Active Students Dialog handlers
  const handleOpenActiveStudentsDialog = () => {
    setActiveStudentsDialogOpen(true);
  };
  
  const handleCloseActiveStudentsDialog = () => {
    setActiveStudentsDialogOpen(false);
  };
  
  const handleConfirmAction = async () => {
    if (!currentRequirement || !actionType) return;
    
    setActionInProgress(true);
    
    try {
      const endpoint = actionType === 'approve' 
        ? `/library-hours-approval/approve/${currentRequirement.id}`
        : `/library-hours-approval/reject/${currentRequirement.id}`;
        
      const requestBody = actionType === 'reject' ? { reason: rejectionReason } : {};
      
      const response = await api.post(endpoint, requestBody);
      
      if (response.data.success) {
        // Show success message
        setSnackbarMessage(actionType === 'approve' 
          ? 'Library hours requirement approved successfully!' 
          : 'Library hours requirement rejected successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Remove from pending list
        setPendingApprovals(prev => prev.filter(item => item.id !== currentRequirement.id));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error("Error processing requirement:", err);
      setSnackbarMessage(`Error: ${err.message || 'Failed to process requirement'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setActionInProgress(false);
      setDialogOpen(false);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Format date for display - FIXED to handle timezone correctly
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Add time component to ensure correct date parsing
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // Main function to fetch dashboard data with filters
  const fetchDashboardData = () => {
    fetchStatistics();
    fetchParticipantsData();
    fetchCompletionRateData();
    // No need to refresh pending approvals as they are not affected by filters
  };

  // Fetch Data for Pending Approvals
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setApprovalsLoading(true);
        
        const response = await api.get('/library-hours-approval/pending');
        
        setPendingApprovals(response.data);
      } catch (err) {
        console.error("Error fetching pending approvals:", err);
        toast.error("Failed to load pending approvals");
      } finally {
        setApprovalsLoading(false);
      }
    };
    
    fetchPendingApprovals();
    // Refresh every 2 minutes
    const interval = setInterval(fetchPendingApprovals, 120000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Participants Data with Filters
  const fetchParticipantsData = async () => {
    try {
      setParticipantsLoading(true);
      
      // Build query parameters for filtering
      const params = new URLSearchParams();
      
      if (appliedFilters.gradeLevel) {
        params.append('gradeLevel', appliedFilters.gradeLevel);
      }
      
      if (appliedFilters.section) {
        params.append('section', appliedFilters.section);
      }
      
      if (appliedFilters.academicYear) {
        params.append('academicYear', appliedFilters.academicYear);
      }
      
      if (appliedFilters.dateRange.from) {
        params.append('dateFrom', appliedFilters.dateRange.from);
      }
      
      if (appliedFilters.dateRange.to) {
        params.append('dateTo', appliedFilters.dateRange.to);
      }
      
      // Set timeframe to monthly for the dashboard view
      params.append('timeframe', 'monthly');
      
      // Fetch data from API with filters
      const url = `/statistics/active-participants${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching participants data from:", url);
      
      const response = await api.get(url);
      setParticipantsData(response.data);
    } catch (err) {
      console.error('Error fetching participants data:', err);
      toast.error("Failed to load participants data");
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Fetch Completion Rate Data with Filters
  const fetchCompletionRateData = async () => {
    try {
      setCompletionRateLoading(true);
      
      // Build query parameters for filtering
      const params = new URLSearchParams();
      
      if (appliedFilters.gradeLevel) {
        params.append('gradeLevel', appliedFilters.gradeLevel);
      }
      
      if (appliedFilters.section) {
        params.append('section', appliedFilters.section);
      }
      
      if (appliedFilters.academicYear) {
        params.append('academicYear', appliedFilters.academicYear);
      }
      
      if (appliedFilters.dateRange.from) {
        params.append('dateFrom', appliedFilters.dateRange.from);
      }
      
      if (appliedFilters.dateRange.to) {
        params.append('dateTo', appliedFilters.dateRange.to);
      }
      
      // Set timeframe to monthly for the dashboard view
      params.append('timeframe', 'monthly');
      
      // Fetch data from API with filters
      const url = `/statistics/completion-rate${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching completion rate data from:", url);
      
      const response = await api.get(url);
      setBarData(response.data);
    } catch (err) {
      console.error('Error fetching completion rate data:', err);
      toast.error("Failed to load completion rate data");
    } finally {
      setCompletionRateLoading(false);
    }
  };

  // Fetch Main Statistics with Filters
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for filtering
      const params = new URLSearchParams();
      
      if (appliedFilters.gradeLevel) {
        params.append('gradeLevel', appliedFilters.gradeLevel);
      }
      
      if (appliedFilters.section) {
        params.append('section', appliedFilters.section);
      }
      
      // Note: The dashboard endpoint may or may not support all these filters
      // depending on how the backend is implemented
      
      const url = `/statistics/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching dashboard statistics from:", url);
      
      const response = await api.get(url);
      setStatistics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Error fetching statistics:', err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh statistics every 30 seconds (only the stats, not the charts)
    const statsInterval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(statsInterval);
  }, [appliedFilters]); // Re-fetch when applied filters change

  // Get chart titles with filter information
  const getParticipantsChartTitle = () => {
    let title = "Active Library Hours Participants";
    
    if (appliedFilters.academicYear) {
      title += ` - AY ${appliedFilters.academicYear}`;
    }
    
    if (appliedFilters.gradeLevel) {
      title += ` - ${appliedFilters.gradeLevel}`;
    }
    
    if (appliedFilters.section) {
      title += ` - ${appliedFilters.section}`;
    }
    
    return title;
  };
  
  const getCompletionRateChartTitle = () => {
    let title = "Library Hours Completion Rate";
    
    if (appliedFilters.academicYear) {
      title += ` - AY ${appliedFilters.academicYear}`;
    }
    
    if (appliedFilters.gradeLevel) {
      title += ` - ${appliedFilters.gradeLevel}`;
    }
    
    if (appliedFilters.section) {
      title += ` - ${appliedFilters.section}`;
    }
    
    return title;
  };

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh',
          overflow: 'hidden' // Prevent outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: '32px 32px 120px 32px', // Increased bottom padding even more
            flexGrow: 1,
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': { // Style scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
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
                  borderRadius: '15px',
                  boxShadow: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: '2px solid #8C383E',
                  cursor: 'pointer', // Add cursor pointer to indicate it's clickable
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 4
                  }
                }}
                onClick={handleOpenActiveStudentsDialog} // Add click handler
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, }}>
                  <AccessTimeIcon sx={{ color: '#8C383E', fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" component="div">
                    {loading ? 'Loading...' : statistics.studentsInsideLibrary}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    borderRadius: '15px',
                    '&:hover': { backgroundColor: '#FFC107' }
                  }}
                >
                  <CheckIcon sx={{ color: '#8C383E', mr: 1 }} />
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
                  borderRadius: '15px',
                  boxShadow: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: '2px solid #8C383E',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ color: '#8C383E', fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" component="div">
                    {loading ? 'Loading...' : statistics.totalRegisteredStudents}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    borderRadius: '15px',
                    '&:hover': { backgroundColor: '#FFC107' }
                  }}
                >
                  <CheckIcon sx={{ color: '#8C383E', mr: 1 }} />
                  Total Registered Students
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: '15px',
            boxShadow: 3,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#8C383E', fontWeight: 'bold' }}>
              Filter Dashboard Data
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              {/* Date From */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Date From:</Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={!!selectedAcademicYear} // Disable if academicYear has a value
                  sx={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '15px',
                    "& .Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  }}
                />
              </Grid>
              
              {/* Date To */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Date To:</Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={dateTo}
                  onChange={handleDateToChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={!!selectedAcademicYear || !dateFrom} // Disable if academicYear has a value or dateFrom is empty
                  inputProps={{
                    min: dateFrom || undefined // Set minimum date to dateFrom
                  }}
                  sx={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '15px',
                    "& .Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  }}
                />
              </Grid>
              
              {/* Grade Level */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Grade Level:</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedGradeLevel}
                    onChange={handleGradeLevelChange}
                    displayEmpty
                    disabled={gradeLevelsLoading}
                    sx={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '15px',
                      "& .Mui-disabled": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      }
                    }}
                  >
                    <MenuItem value="">All Grades</MenuItem>
                    {gradeLevelsLoading ? (
                      <MenuItem disabled>Loading grade levels...</MenuItem>
                    ) : (
                      gradeLevels.map((gradeLevel) => (
                        <MenuItem key={gradeLevel} value={gradeLevel}>
                          {gradeLevel}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Section */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Section:</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedSection}
                    onChange={handleSectionChange}
                    displayEmpty
                    disabled={!selectedGradeLevel || sectionsLoading}
                    sx={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '15px',
                      "& .Mui-disabled": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      }
                    }}
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {sectionsLoading ? (
                      <MenuItem disabled>Loading sections...</MenuItem>
                    ) : (
                      sections.map((section) => (
                        <MenuItem key={section} value={section}>
                          {section}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Academic Year */}
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Academic Year:</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedAcademicYear}
                    onChange={handleAcademicYearChange}
                    displayEmpty
                    disabled={academicYearsLoading || !!dateFrom || !!dateTo} // Disable if loading or if either date has a value
                    sx={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '15px',
                      "& .Mui-disabled": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      }
                    }}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {academicYearsLoading ? (
                      <MenuItem disabled>Loading academic years...</MenuItem>
                    ) : (
                      academicYears.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Filter Buttons */}
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<FilterAltIcon />}
                    onClick={handleApplyFilters}
                    sx={{ 
                      flex: 1,
                      backgroundColor: "#FFD700",
                      color: "#000",
                      borderRadius: '15px',
                      "&:hover": { backgroundColor: "#FFC107" }
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    sx={{ 
                      flex: 1,
                      borderColor: "#FFD700",
                      color: "#000",
                      borderRadius: '15px',
                      "&:hover": { 
                        backgroundColor: "rgba(255, 215, 0, 0.1)",
                        borderColor: "#FFD700"
                      }
                    }}
                    disabled={
                      !appliedFilters.section && 
                      !appliedFilters.academicYear && 
                      !appliedFilters.gradeLevel && 
                      !appliedFilters.dateRange.from && 
                      !appliedFilters.dateRange.to
                    }
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            {/* Active Filters Display */}
            {(appliedFilters.section || appliedFilters.academicYear || 
              appliedFilters.gradeLevel || 
              appliedFilters.dateRange.from || appliedFilters.dateRange.to) && (
              <Box sx={{ 
                mt: 1, 
                mb: 2, 
                p: 1.5, 
                bgcolor: 'rgba(255, 215, 0, 0.1)', 
                borderRadius: '15px',
                border: '1px solid rgba(255, 215, 0, 0.3)' 
              }}>
                <Typography variant="subtitle2" fontWeight="bold">Active Filters:</Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {appliedFilters.gradeLevel && (
                    <Chip 
                      label={`Grade: ${appliedFilters.gradeLevel}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderColor: '#FFD700', color: '#000' }}
                    />
                  )}
                  {appliedFilters.section && (
                    <Chip 
                      label={`Section: ${appliedFilters.section}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderColor: '#FFD700', color: '#000' }}
                    />
                  )}
                  {appliedFilters.academicYear && (
                    <Chip 
                      label={`Academic Year: ${appliedFilters.academicYear}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderColor: '#FFD700', color: '#000' }}
                    />
                  )}
                  {appliedFilters.dateRange.from && (
                    <Chip 
                      label={`From: ${appliedFilters.dateRange.from}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderColor: '#FFD700', color: '#000' }}
                    />
                  )}
                  {appliedFilters.dateRange.to && (
                    <Chip 
                      label={`To: ${appliedFilters.dateRange.to}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderColor: '#FFD700', color: '#000' }}
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Participants Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: '15px',
                boxShadow: 3,
                backgroundColor: "rgba(217, 140, 140, 0.8)", 
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#8C383E', fontWeight: 'bold' }}>
                  {getParticipantsChartTitle()}
                </Typography>
                <Box sx={{ height: 300 }}>
                  {participantsLoading ? (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <CircularProgress />
                    </Box>
                  ) : participantsData.length === 0 ? (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography>No data available for the selected filters</Typography>
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
                            value: 'Participants', 
                            angle: -90, 
                            position: 'center',
                            offset: 10
                          }}
                        />
                        <CartesianGrid stroke="#ffffff" strokeDasharray="5 5" />
                        <RechartsTooltip 
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
              <Paper sx={{ 
                p: 2, 
                borderRadius: '15px',
                boxShadow: 3,
                backgroundColor: "rgba(217, 140, 140, 0.8)", 
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#8C383E', fontWeight: 'bold' }}>
                  {getCompletionRateChartTitle()}
                </Typography>
                <Box sx={{ height: 300 }}>
                  {completionRateLoading ? (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <CircularProgress />
                    </Box>
                  ) : barData.length === 0 ? (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography>No data available for the selected filters</Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
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
                            value: 'Completion Rate (%)', 
                            angle: -90, 
                            position: 'center',
                            offset: 10
                          }}
                          domain={[0, 100]}
                        />
                        <CartesianGrid stroke="#ffffff" strokeDasharray="5 5" />
                        <Bar dataKey="rate" fill="#000000" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #000000' 
                          }}
                          formatter={(value) => [`${value}%`]}
                        />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Approvals Table */}
          <Paper sx={{ 
            width: '100%', 
            mb: 4, 
            borderRadius: '15px',
            boxShadow: 3,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            overflow: 'visible' // Changed from 'hidden' to 'visible'
          }}>
            <Typography variant="h6" sx={{ p: 2, color: '#8C383E', fontWeight: 'bold' }}>
              Pending Library Hours Requirement Approvals
            </Typography>
            <TableContainer sx={{ 
              maxHeight: 'none', // Remove any max height constraints
              overflow: 'visible' // Allow content to extend if needed
            }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#FFD700' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quarter</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grade Level</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Minutes Required</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvalsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                        <CircularProgress size={24} /> Loading approvals...
                      </TableCell>
                    </TableRow>
                  ) : pendingApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                        No pending approvals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingApprovals
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((approval) => (
                        <TableRow key={approval.id} sx={{ backgroundColor: 'rgba(205, 97, 97, 0.2)' }}>
                          <TableCell>{approval.subject}</TableCell>
                          <TableCell>{approval.quarter}</TableCell>
                          <TableCell>{approval.gradeLevel}</TableCell>
                          <TableCell>{approval.minutes} mins</TableCell>
                          <TableCell>{formatDate(approval.deadline)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Approve">
                                <IconButton 
                                  onClick={() => handleOpenDialog(approval, 'approve')}
                                  sx={{ color: '#4CAF50' }}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton 
                                  onClick={() => handleOpenDialog(approval, 'reject')}
                                  sx={{ color: '#F44336' }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={pendingApprovals.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                paddingTop: 2,
                paddingBottom: 2,
                backgroundColor: "transparent",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                width: "100%",
                position: "relative",
              }}
            />
          </Paper>
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 40, width: '100%' }} />
        </Box>
      </Box>
      
      {/* Confirmation Dialog - Updated UI */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: '15px',
            width: '320px',
            padding: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', ml: 1, color: '#8C383E' }}>
            {actionType === 'approve' ? "APPROVE DEADLINE" : "REJECT DEADLINE"}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        {currentRequirement && (
          <Box sx={{ px: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Subject:</strong> {currentRequirement.subject}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Grade Level:</strong> {currentRequirement.gradeLevel}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Quarter:</strong> {currentRequirement.quarter}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Minutes:</strong> {currentRequirement.minutes} mins
            </Typography>
            <Typography variant="body2">
              <strong>Due Date:</strong> {formatDate(currentRequirement.deadline)}
            </Typography>
          </Box>
        )}
        
        {actionType === 'reject' && (
          <Box sx={{ px: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Please provide reason for rejection:
            </Typography>
            <TextField
              id="rejection-reason"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              size="small"
              value={rejectionReason}
              onChange={handleRejectionReasonChange}
              sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained"
            disabled={actionInProgress}
            sx={{ 
              backgroundColor: '#FF0000', 
              color: '#ffffff', 
              fontWeight: 'bold',
              width: '80px',
              borderRadius: '15px',
              '&:hover': { backgroundColor: '#db0000' }
            }}
          >
            No
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained"
            disabled={actionInProgress || (actionType === 'reject' && rejectionReason.trim() === '')}
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#000000', 
              fontWeight: 'bold',
              width: '80px',
              borderRadius: '15px',
              '&:hover': { backgroundColor: '#FFC107' }
            }}
          >
            {actionInProgress ? (
              <CircularProgress size={20} sx={{ color: '#000000' }} />
            ) : (
              "Yes"
            )}
          </Button>
        </Box>
      </Dialog>
      
      {/* Active Students Dialog */}
      <ActiveStudentsDialog 
        open={activeStudentsDialogOpen} 
        onClose={handleCloseActiveStudentsDialog}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LibrarianDashboard;