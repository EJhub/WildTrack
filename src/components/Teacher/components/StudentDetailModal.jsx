import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  TablePagination,
  CircularProgress,
  Divider,
  InputAdornment,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DoneIcon from "@mui/icons-material/Done";
import WarningIcon from "@mui/icons-material/Warning";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import api from '../../../utils/api';

const StudentDetailModal = ({ open, handleClose, student, teacherSubject }) => {
  // State for toggling between requirements and journal view
  const [view, setView] = useState('requirements'); // 'requirements' or 'journal'
  
  // Requirements data states
  const [requirements, setRequirements] = useState([]);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [requirementsError, setRequirementsError] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  
  // Library hours data states (shown when a requirement is selected)
  const [libraryHours, setLibraryHours] = useState([]);
  const [loadingLibraryHours, setLoadingLibraryHours] = useState(false);
  const [libraryHoursError, setLibraryHoursError] = useState(null);
  const [libraryHoursSummary, setLibraryHoursSummary] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    averageMinutesPerSession: 0,
    percentOfRequirement: 0
  });
  
  // Journal data states
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [journalError, setJournalError] = useState(null);
  
  // Filter states for journal
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [journalSearch, setJournalSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  
  // Progress summary state
  const [progressSummary, setProgressSummary] = useState({
    totalRequirements: 0,
    completedRequirements: 0,
    inProgressRequirements: 0,
    overdueRequirements: 0,
    totalMinutesRequired: 0,
    totalMinutesRendered: 0,
    overallPercentage: 0
  });
  
  // Pagination states
  const [requirementsPage, setRequirementsPage] = useState(0);
  const [requirementsRowsPerPage, setRequirementsRowsPerPage] = useState(5);
  const [libraryHoursPage, setLibraryHoursPage] = useState(0);
  const [libraryHoursRowsPerPage, setLibraryHoursRowsPerPage] = useState(5);
  const [journalPage, setJournalPage] = useState(0);
  const [journalRowsPerPage, setJournalRowsPerPage] = useState(5);
  
  // Book summary dialog states
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState({ title: '', summary: '' });
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Fetch data when modal opens or student changes
  useEffect(() => {
    if (open && student && student.idNumber) {
      setView('requirements'); // Reset to requirements view when opening
      setSelectedRequirement(null); // Clear selected requirement
      fetchRequirements();
      fetchJournals();
    }
  }, [open, student]);

  // Add useEffect for real-time search functionality
  useEffect(() => {
    // Only apply search if we have journals loaded and if search has at least 2 characters
    if (journals.length > 0 && (journalSearch.length >= 2 || journalSearch.length === 0)) {
      // Use a small debounce to avoid excessive filtering while typing
      const timer = setTimeout(() => {
        applyJournalFilters();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [journalSearch]);

  // Function to fetch requirements
  const fetchRequirements = async () => {
    if (!student || !student.idNumber) return;
    
    setLoadingRequirements(true);
    setRequirementsError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Call active-progress endpoint to get the requirements
      const response = await api.get(`/library-progress/active-progress/${student.idNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRequirements(response.data || []);
      
      // Also fetch the summary data
      const summaryResponse = await api.get(
        `/library-progress/summary-with-init/${student.idNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setProgressSummary(summaryResponse.data || {
        totalRequirements: 0,
        completedRequirements: 0,
        inProgressRequirements: 0,
        overdueRequirements: 0,
        totalMinutesRequired: 0,
        totalMinutesRendered: 0,
        overallPercentage: 0
      });
      
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setRequirementsError('Failed to load requirements data');
      setRequirements([]);
    } finally {
      setLoadingRequirements(false);
    }
  };
  
  // Function to handle clicking on a requirement row with better logging
  const handleRequirementClick = (requirement) => {
    // Log what's being clicked to confirm the event is firing
    console.log("Requirement clicked:", requirement);
    
    // Make sure requirementId exists and is valid
    if (!requirement || !requirement.requirementId) {
      console.error("Missing requirementId in requirement:", requirement);
      setLibraryHoursError("Missing requirement information");
      return;
    }
    
    // Proceed with fetching library hours
    fetchLibraryHoursForRequirement(requirement);
  };
  
  // Function to fetch library hours for a specific requirement
  const fetchLibraryHoursForRequirement = async (requirement) => {
    if (!student || !student.idNumber || !requirement || !requirement.requirementId) return;
    
    setLoadingLibraryHours(true);
    setLibraryHoursError(null);
    setSelectedRequirement(requirement);
    
    // Add logging to help with debugging
    console.log("Fetching library hours for:", {
      studentId: student.idNumber,
      requirementId: requirement.requirementId,
      subject: requirement.subject
    });
    
    try {
      const token = localStorage.getItem('token');
      
      // Get ALL student's library hours first
      const allHoursResponse = await api.get(`/library-hours/user/${student.idNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allHours = allHoursResponse.data || [];
      console.log(`Total library hours for student: ${allHours.length}`);
      
      // Try to match by requirementId first (for newer records that have requirementId set)
      let hours = allHours.filter(hour => 
        hour.requirementId && String(hour.requirementId) === String(requirement.requirementId)
      );
      
      console.log(`Hours matching by requirementId: ${hours.length}`);
      
      // If no hours found by requirementId, fallback to matching by subject
      if (hours.length === 0 && requirement.subject) {
        console.log("No hours found by requirementId, trying subject matching...");
        
        hours = allHours.filter(hour => 
          hour.subject && 
          hour.subject.toLowerCase() === requirement.subject.toLowerCase()
        );
        
        console.log(`Hours matching by subject: ${hours.length}`);
      }
      
      setLibraryHours(hours);
      
      // Calculate summary information
      if (hours.length > 0) {
        let totalMinutes = 0;
        
        hours.forEach(hour => {
          if (hour.timeIn && hour.timeOut) {
            const inTime = new Date(hour.timeIn);
            const outTime = new Date(hour.timeOut);
            const diffMs = outTime - inTime;
            const diffMinutes = Math.floor(diffMs / 1000 / 60);
            
            if (diffMinutes > 0) {
              totalMinutes += diffMinutes;
            }
          }
        });
        
        const averageMinutes = hours.length > 0 ? Math.round(totalMinutes / hours.length) : 0;
        const percentOfRequirement = requirement.requiredMinutes > 0 
          ? Math.min(100, Math.round((totalMinutes / requirement.requiredMinutes) * 100)) 
          : 0;
        
        setLibraryHoursSummary({
          totalSessions: hours.length,
          totalMinutes: totalMinutes,
          averageMinutesPerSession: averageMinutes,
          percentOfRequirement: percentOfRequirement
        });
      } else {
        setLibraryHoursSummary({
          totalSessions: 0,
          totalMinutes: 0,
          averageMinutesPerSession: 0,
          percentOfRequirement: 0
        });
      }
    } catch (error) {
      console.error('Error fetching library hours:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      setLibraryHoursError('Failed to load library hours data');
      setLibraryHours([]);
    } finally {
      setLoadingLibraryHours(false);
    }
  };
  
  // Function to fetch journal entries
  const fetchJournals = async () => {
    if (!student || !student.idNumber) return;
    
    setLoadingJournal(true);
    setJournalError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get(`/journals/user/${student.idNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const journalList = response.data || [];
      setJournals(journalList);
      setFilteredJournals(journalList); // Initially show all
    } catch (error) {
      console.error('Error fetching journals:', error);
      setJournalError('Failed to load journal data');
      setJournals([]);
      setFilteredJournals([]);
    } finally {
      setLoadingJournal(false);
    }
  };
  
  // Function to go back from library hours to requirements view
  const handleBackToRequirements = () => {
    setSelectedRequirement(null);
    setLibraryHours([]);
  };
  
  // Function to check if a date is within the selected range
  const isWithinDateRange = (dateString) => {
    if (!dateFrom && !dateTo) return true; // No date filter applied
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
    
    let fromDate = null;
    let toDate = null;
    
    if (dateFrom) {
      fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
    }
    
    if (dateTo) {
      toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
    }
    
    const isAfterFrom = !fromDate || date >= fromDate;
    const isBeforeTo = !toDate || date <= toDate;
    
    return isAfterFrom && isBeforeTo;
  };
  
  // Function to apply filters to journals
  const applyJournalFilters = () => {
    if (!journals.length) {
      setFilteredJournals([]);
      return;
    }
    
    let filtered = journals;
    
    // Apply date filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter(journal => 
        journal.dateRead && isWithinDateRange(journal.dateRead)
      );
    }
    
    // Apply activity filter if selected
    if (activityFilter) {
      filtered = filtered.filter(journal => 
        journal.activity === activityFilter
      );
    }
    
    // Then apply search filter
    if (journalSearch) {
      const search = journalSearch.toLowerCase();
      filtered = filtered.filter(journal => 
        (journal.details && journal.details.toLowerCase().includes(search)) ||
        (journal.activity && journal.activity.toLowerCase().includes(search)) ||
        (journal.comment && journal.comment.toLowerCase().includes(search)) ||
        formatDate(journal.dateRead).toLowerCase().includes(search) ||
        (journal.entryNo && journal.entryNo.toLowerCase().includes(search))
      );
    }
    
    setFilteredJournals(filtered);
    setJournalPage(0); // Reset to first page when filtering
  };
  
  // Function to handle book title click and fetch summary
  const handleBookTitleClick = async (entry) => {
    if (!entry.bookTitle) return;
    
    setSelectedBook({ 
      title: entry.bookTitle,
      summary: entry.summary || ''
    });
    
    // If there's already a summary, show it right away
    if (entry.summary) {
      setSummaryDialogOpen(true);
      return;
    }
    
    // Otherwise, we need to fetch the summary
    setLoadingSummary(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Try to fetch the library hour details to get the summary
      const response = await api.get(`/library-hours/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.summary) {
        // Update the library hours entry with the summary
        const updatedLibraryHours = libraryHours.map(item => 
          item.id === entry.id ? { ...item, summary: response.data.summary } : item
        );
        
        setLibraryHours(updatedLibraryHours);
        
        // Update the selected book with the summary
        setSelectedBook({
          title: entry.bookTitle,
          summary: response.data.summary
        });
        
        setSummaryDialogOpen(true);
      } else {
        // No summary found, still open the dialog but with empty summary
        setSummaryDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching book summary:', error);
      // Still open the dialog even if there's an error
      setSummaryDialogOpen(true);
    } finally {
      setLoadingSummary(false);
    }
  };
  
  // Handle close summary dialog
  const handleCloseSummaryDialog = () => {
    setSummaryDialogOpen(false);
  };

  // Apply journal filters - Only happens when Apply button is clicked
  const handleApplyFilters = () => {
    applyJournalFilters();
  };
  
  // Reset all journal filters
  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setJournalSearch('');
    setActivityFilter('');
    
    // Reset to show all data
    setFilteredJournals(journals);
    setJournalPage(0);
  };
  
  // Calculate minutes between timeIn and timeOut
  const calculateMinutes = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "--";
    const inTime = new Date(timeIn);
    const outTime = new Date(timeOut);
    const diffMs = outTime - inTime;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes > 0 ? `${diffMinutes} mins` : "--";
  };

  // Calculate minutes as a number value (for calculations)
  const calculateMinutesValue = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const inTime = new Date(timeIn);
    const outTime = new Date(timeOut);
    const diffMs = outTime - inTime;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes > 0 ? diffMinutes : 0;
  };
  
  // Calculate requirements completion percentage
  const calculateRequirementsPercentage = () => {
    if (!progressSummary.totalRequirements) return 0;
    return (progressSummary.completedRequirements / progressSummary.totalRequirements) * 100;
  };
  
  // Status chip component with styling based on status
  const getStatusChip = (status) => {
    switch (status) {
      case "Completed":
        return (
          <Chip
            icon={<DoneIcon />}
            label="Completed"
            color="success"
            size="small"
          />
        );
      case "Overdue":
        return (
          <Chip
            icon={<WarningIcon />}
            label="Overdue"
            color="error"
            size="small"
          />
        );
      case "In Progress":
        return (
          <Chip
            icon={<PlayCircleOutlineIcon />}
            label="In Progress"
            color="primary"
            size="small"
          />
        );
      case "Not Started":
        return (
          <Chip
            icon={<ScheduleIcon />}
            label="Not Started"
            color="default"
            size="small"
          />
        );
      case "Paused":
        return (
          <Chip
            icon={<PauseCircleOutlineIcon />}
            label="Paused"
            color="secondary"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<ScheduleIcon />}
            label={status}
            color="primary"
            size="small"
          />
        );
    }
  };
  
  // Get the color for progress bar based on status
  const getProgressBarColor = (status) => {
    switch (status) {
      case "Completed":
        return "#4caf50"; // green
      case "Overdue":
        return "#f44336"; // red
      case "In Progress":
        return "#2196f3"; // blue
      case "Paused":
        return "#9c27b0"; // purple
      case "Not Started":
        return "#9e9e9e"; // grey
      default:
        return "#9e9e9e"; // grey for unknown status
    }
  };
  
  // Render stars for rating
  const renderStars = (rating) => {
    if (!rating) return "☆☆☆☆☆";
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <>
        {"★".repeat(fullStars)}
        {"☆".repeat(emptyStars)}
      </>
    );
  };
  
  // Check if date is valid
  const isValidDate = (dateString) => {
    return dateString && !isNaN(new Date(dateString).getTime());
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!isValidDate(dateString)) return "-";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format time for display
  const formatTime = (dateTimeString) => {
    if (!isValidDate(dateTimeString)) return "-";
    return new Date(dateTimeString).toLocaleTimeString();
  };
  
  // Toggle between requirements and journal view
  const toggleView = (newView) => {
    setView(newView);
    // If switching to requirements view, clear selected requirement
    if (newView === 'requirements') {
      setSelectedRequirement(null);
    }
  };
  
  // Get unique activity values from journal entries
  const getActivityOptions = () => {
    if (!journals.length) return [];
    
    // Get unique activity values using a Set
    const uniqueActivities = new Set(journals.map(journal => journal.activity).filter(Boolean));
    return Array.from(uniqueActivities);
  };
  
  // Pagination handlers for requirements
  const handleRequirementsChangePage = (event, newPage) => {
    setRequirementsPage(newPage);
  };
  
  const handleRequirementsChangeRowsPerPage = (event) => {
    setRequirementsRowsPerPage(parseInt(event.target.value, 10));
    setRequirementsPage(0);
  };
  
  // Pagination handlers for library hours
  const handleLibraryHoursChangePage = (event, newPage) => {
    setLibraryHoursPage(newPage);
  };
  
  const handleLibraryHoursChangeRowsPerPage = (event) => {
    setLibraryHoursRowsPerPage(parseInt(event.target.value, 10));
    setLibraryHoursPage(0);
  };
  
  // Pagination handlers for journal entries
  const handleJournalChangePage = (event, newPage) => {
    setJournalPage(newPage);
  };
  
  const handleJournalChangeRowsPerPage = (event) => {
    setJournalRowsPerPage(parseInt(event.target.value, 10));
    setJournalPage(0);
  };
  
  // Get displayed requirements based on pagination
  const displayedRequirements = requirements.slice(
    requirementsPage * requirementsRowsPerPage,
    requirementsPage * requirementsRowsPerPage + requirementsRowsPerPage
  );
  
  // Get displayed library hours based on pagination
  const displayedLibraryHours = libraryHours.slice(
    libraryHoursPage * libraryHoursRowsPerPage,
    libraryHoursPage * libraryHoursRowsPerPage + libraryHoursRowsPerPage
  );
  
  // Get displayed journal entries based on pagination
  const displayedJournals = filteredJournals.slice(
    journalPage * journalRowsPerPage,
    journalPage * journalRowsPerPage + journalRowsPerPage
  );
  
  // Activity options for dropdown
  const activityOptions = getActivityOptions();

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '15px',
            padding: 0,
            backgroundColor: '#8C383E', // Maroon background for the entire modal
            color: '#fff'
          }
        }}
      >
        {student && (
          <>
            {/* Student Header Area */}
            <Box sx={{ backgroundColor: '#8C383E', color: '#fff', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {student.idNumber} - {student.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="h6" component="div">
                    {student.grade} {student.section}
                  </Typography>
                </Box>
              </Box>
              
              {/* Stats Row - Summary Info - UPDATED to show Requirements instead of Minutes */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  Subject: {teacherSubject || "N/A"}
                </Typography>
                <Typography variant="body1">
                  Completed Requirements: {progressSummary.completedRequirements || 0} / {progressSummary.totalRequirements || 0}
                </Typography>
                <Typography variant="body1">
                  Overall Progress: {Math.round(calculateRequirementsPercentage())}%
                </Typography>
              </Box>
            </Box>
            
            {/* Toggle Buttons Row */}
            <Box sx={{ 
              backgroundColor: '#fff', 
              color: '#000',
              p: 2,
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant={view === 'requirements' ? "contained" : "outlined"}
                  onClick={() => toggleView('requirements')}
                  sx={view === 'requirements' ? {
                    backgroundColor: '#8C383E',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#9C484E' }
                  } : {
                    borderColor: '#8C383E',
                    color: '#8C383E',
                    '&:hover': { backgroundColor: 'rgba(140, 56, 62, 0.1)' }
                  }}
                >
                  Library Requirements
                </Button>
                
                <Button 
                  variant={view === 'journal' ? "contained" : "outlined"}
                  onClick={() => toggleView('journal')}
                  sx={view === 'journal' ? {
                    backgroundColor: '#8C383E',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#9C484E' }
                  } : {
                    borderColor: '#8C383E',
                    color: '#8C383E',
                    '&:hover': { backgroundColor: 'rgba(140, 56, 62, 0.1)' }
                  }}
                >
                  Journal
                </Button>
              </Box>
            </Box>
            
            {/* Content Area */}
            <DialogContent sx={{ backgroundColor: '#f5f5f5', p: 0 }}>
              {/* Requirements View */}
              {view === 'requirements' && !selectedRequirement && (
                <Box>
                  {/* Summary Cards for Requirements */}
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ 
                          backgroundColor: 'rgba(76, 175, 80, 0.8)', 
                          color: 'white',
                          borderRadius: '15px',
                          boxShadow: 3 
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Completed Requirements
                            </Typography>
                            <Typography variant="h3" component="div">
                              {progressSummary.completedRequirements || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              out of {progressSummary.totalRequirements || 0} total requirements
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Card sx={{ 
                          backgroundColor: 'rgba(33, 150, 243, 0.8)', 
                          color: 'white',
                          borderRadius: '15px',
                          boxShadow: 3 
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              In Progress
                            </Typography>
                            <Typography variant="h3" component="div">
                              {progressSummary.inProgressRequirements || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              requirements currently in progress
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Card sx={{ 
                          backgroundColor: 'rgba(244, 67, 54, 0.8)', 
                          color: 'white',
                          borderRadius: '15px',
                          boxShadow: 3 
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Overdue Requirements
                            </Typography>
                            <Typography variant="h3" component="div">
                              {progressSummary.overdueRequirements || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              requirements past deadline
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* UPDATED Overall Progress Card to show Requirements Completion Instead of Minutes */}
                      <Grid item xs={12} md={3}>
                        <Card sx={{ 
                          backgroundColor: 'rgba(255, 193, 7, 0.8)', 
                          color: 'white',
                          borderRadius: '15px',
                          boxShadow: 3 
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Overall Progress
                            </Typography>
                            <Typography variant="h3" component="div">
                              {Math.round(calculateRequirementsPercentage())}%
                            </Typography>
                            <Box sx={{ 
                              mt: 1,
                              mb: 1
                            }}>
                              <Typography variant="body2">
                                {progressSummary.completedRequirements || 0} of {progressSummary.totalRequirements || 0} requirements completed
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              position: 'relative',
                              height: 10
                            }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={calculateRequirementsPercentage()}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  backgroundColor: 'rgba(255,255,255,0.3)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#fff',
                                  }
                                }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Requirements Table */}
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>SUBJECT</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>QUARTER</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>TASK</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>CREATED BY</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>REQUIRED MINUTES</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>MINUTES RENDERED</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>DEADLINE</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>PROGRESS</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>STATUS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loadingRequirements ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              <CircularProgress size={24} />
                              <Typography sx={{ ml: 2 }}>Loading requirements...</Typography>
                            </TableCell>
                          </TableRow>
                        ) : requirementsError ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              <Typography color="error">{requirementsError}</Typography>
                            </TableCell>
                          </TableRow>
                        ) : displayedRequirements.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              No requirements found for this student
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayedRequirements.map((req, index) => (
                            <TableRow 
                              key={index}
                              hover
                              onClick={() => handleRequirementClick(req)}
                              sx={{ 
                                cursor: 'pointer',
                                backgroundColor: req.isCompleted ? "rgba(76, 175, 80, 0.1)" :
                                                req.status === "In Progress" ? "rgba(33, 150, 243, 0.1)" : 
                                                req.status === "Not Started" ? "rgba(158, 158, 158, 0.05)" : "transparent",
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                              }}
                            >
                              <TableCell>{req.subject}</TableCell>
                              <TableCell>{req.quarter}</TableCell>
                              <TableCell>
                                {req.task ? (
                                  req.task.length > 30 
                                    ? `${req.task.substring(0, 30)}...` 
                                    : req.task
                                ) : "No task description"}
                              </TableCell>
                              <TableCell>{req.creatorName || "Unknown Teacher"}</TableCell>
                              <TableCell>{req.requiredMinutes} mins</TableCell>
                              <TableCell>{req.minutesRendered} mins</TableCell>
                              <TableCell>
                                {formatDate(req.deadline)}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={req.progressPercentage}
                                      sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: getProgressBarColor(req.status)
                                        }
                                      }}
                                    />
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" color="textSecondary">
                                      {Math.round(req.progressPercentage)}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>{getStatusChip(req.status)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={requirements.length}
                      rowsPerPage={requirementsRowsPerPage}
                      page={requirementsPage}
                      onPageChange={handleRequirementsChangePage}
                      onRowsPerPageChange={handleRequirementsChangeRowsPerPage}
                    />
                  </TableContainer>
                </Box>
              )}
              
              {/* Library Hours View (when a requirement is selected) */}
              {view === 'requirements' && selectedRequirement && (
                <Box>
                  {/* Requirement Header */}
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Button 
                        variant="outlined"
                        onClick={handleBackToRequirements}
                        sx={{
                          borderColor: '#8C383E',
                          color: '#8C383E',
                          '&:hover': { backgroundColor: 'rgba(140, 56, 62, 0.1)' }
                        }}
                      >
                        Back to Requirements
                      </Button>
                      
                      <Box>
                        <Typography variant="h6" component="div" color="#000">
                          {selectedRequirement.subject} - {selectedRequirement.quarter} Quarter - {getStatusChip(selectedRequirement.status)}
                        </Typography>
                        <Typography variant="body2" color="#000" sx={{ mt: 1 }}>
                          {selectedRequirement.minutesRendered} of {selectedRequirement.requiredMinutes} minutes completed ({Math.round(selectedRequirement.progressPercentage)}%)
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Task Description Card */}
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        mt: 2,
                        mb: 2,
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Task Description
                      </Typography>
                      <Typography>
                        {selectedRequirement.task || "No task description provided."}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Created by: {selectedRequirement.creatorName || "Unknown Teacher"}
                      </Typography>
                    </Paper>
                    
                    {/* UPDATED: Library Hours Summary Card with Required Time instead of Contribution */}
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        mt: 2,
                        mb: 2,
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Library Sessions Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="textSecondary">Total Sessions:</Typography>
                          <Typography variant="body1" fontWeight="bold">{libraryHoursSummary.totalSessions}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="textSecondary">Total Minutes:</Typography>
                          <Typography variant="body1" fontWeight="bold">{libraryHoursSummary.totalMinutes} mins</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="textSecondary">Average per Session:</Typography>
                          <Typography variant="body1" fontWeight="bold">{libraryHoursSummary.averageMinutesPerSession} mins</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2" color="textSecondary">Required Time:</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedRequirement ? selectedRequirement.requiredMinutes : 0} mins</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                  
                  {/* Library Hours Table for Selected Requirement */}
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>DATE</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>TIME IN</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>BOOK TITLE</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>TIME OUT</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>MINUTES</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>CONTRIBUTION</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loadingLibraryHours ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <CircularProgress size={24} />
                              <Typography sx={{ ml: 2 }}>Loading library hours...</Typography>
                            </TableCell>
                          </TableRow>
                        ) : libraryHoursError ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography color="error">{libraryHoursError}</Typography>
                            </TableCell>
                          </TableRow>
                        ) : displayedLibraryHours.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No library hours found for this requirement
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayedLibraryHours.map((entry, index) => {
                            const minutesValue = calculateMinutesValue(entry.timeIn, entry.timeOut);
                            const contributionPercent = selectedRequirement.requiredMinutes > 0 
                              ? Math.round((minutesValue / selectedRequirement.requiredMinutes) * 100) 
                              : 0;
                              
                            return (
                              <TableRow key={index}>
                                <TableCell>{formatDate(entry.timeIn)}</TableCell>
                                <TableCell>{formatTime(entry.timeIn)}</TableCell>
                                <TableCell>
                                  {entry.bookTitle ? (
                                    <Button
                                      onClick={() => handleBookTitleClick(entry)}
                                      disabled={loadingSummary}
                                      sx={{
                                        textTransform: 'none',
                                        color: entry.summary ? '#0000FF' : 'rgba(0, 0, 0, 0.87)', // Blue for books with summaries
                                        fontWeight: entry.summary ? 'bold' : 'normal',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                          backgroundColor: 'transparent',
                                        },
                                        padding: '0',
                                        justifyContent: 'flex-start',
                                      }}
                                    >
                                      {entry.bookTitle}
                                    </Button>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell>{entry.timeOut ? formatTime(entry.timeOut) : '-'}</TableCell>
                                <TableCell>{calculateMinutes(entry.timeIn, entry.timeOut)}</TableCell>
                                <TableCell>
                                  {contributionPercent > 0 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress 
                                          variant="determinate" 
                                          value={Math.min(100, contributionPercent)}
                                          sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            '& .MuiLinearProgress-bar': {
                                              backgroundColor: '#4caf50'
                                            }
                                          }}
                                        />
                                      </Box>
                                      <Box>
                                        <Typography variant="body2" color="textSecondary">
                                          {contributionPercent}%
                                        </Typography>
                                      </Box>
                                    </Box>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                    
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={libraryHours.length}
                      rowsPerPage={libraryHoursRowsPerPage}
                      page={libraryHoursPage}
                      onPageChange={handleLibraryHoursChangePage}
                      onRowsPerPageChange={handleLibraryHoursChangeRowsPerPage}
                    />
                  </TableContainer>
                </Box>
              )}
              
              {/* Journal View */}
              {view === 'journal' && (
                <Box>
                  {/* Journal Filters */}
                  <Box sx={{ 
                    backgroundColor: '#fff', 
                    color: '#000',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    {/* Search Bar - Now Above Everything */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <TextField 
                        label="Search journal entries"
                        size="small"
                        value={journalSearch}
                        onChange={(e) => setJournalSearch(e.target.value)}
                        placeholder="Type to search..."
                        sx={{ 
                          width: '25%',
                          backgroundColor: '#fff'
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: journalSearch && (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="clear search"
                                onClick={() => {
                                  setJournalSearch('');
                                  // Reset to show all journals immediately when cleared
                                  setFilteredJournals(journals);
                                }}
                                edge="end"
                                size="small"
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    
                    {/* Filters Row */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      alignItems: 'center', 
                      flexWrap: 'wrap' 
                    }}>
                      {/* Date Filters */}
                      <TextField 
                        label="Date From" 
                        type="date"
                        size="small"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      
                      <TextField 
                        label="Date To" 
                        type="date"
                        size="small"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        disabled={!dateFrom}
                        InputLabelProps={{ shrink: true }}
                      />
                      
                      {/* Activity Filter */}
                      <FormControl 
                        size="small" 
                        sx={{ 
                          minWidth: 150,
                          backgroundColor: '#fff'
                        }}
                      >
                        <InputLabel id="activity-filter-label">Activity</InputLabel>
                        <Select
                          labelId="activity-filter-label"
                          id="activity-filter"
                          value={activityFilter}
                          label="Activity"
                          onChange={(e) => setActivityFilter(e.target.value)}
                        >
                          <MenuItem value="">All Activities</MenuItem>
                          <MenuItem value="Read Book">Read Book</MenuItem>
                          <MenuItem value="Used Computer">Used Computer</MenuItem>
                          <MenuItem value="Read Periodical">Read Periodical</MenuItem>
                          {activityOptions.map((activity) => (
                            !['Read Book', 'Used Computer', 'Read Periodical'].includes(activity) && (
                              <MenuItem key={activity} value={activity}>
                                {activity}
                              </MenuItem>
                            )
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Button 
                        variant="contained" 
                        onClick={handleApplyFilters}
                        sx={{ 
                          backgroundColor: '#FFD700',
                          color: '#000',
                          '&:hover': { backgroundColor: '#FFC107' }
                        }}
                      >
                        Filter
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        onClick={handleResetFilters}
                        sx={{ 
                          borderColor: '#FFD700',
                          color: '#000',
                          '&:hover': { 
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                            borderColor: '#FFD700'
                          }
                        }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Journal Table */}
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>ENTRY NO.</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>DATE</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>ACTIVITY</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>DETAILS</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>COMMENTS</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>RATING</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loadingJournal ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <CircularProgress size={24} />
                              <Typography sx={{ ml: 2 }}>Loading journal entries...</Typography>
                            </TableCell>
                          </TableRow>
                        ) : journalError ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography color="error">{journalError}</Typography>
                            </TableCell>
                          </TableRow>
                        ) : displayedJournals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No journal entries found
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayedJournals.map((journal) => (
                            <TableRow key={journal.id}>
                              <TableCell>{journal.entryNo || '-'}</TableCell>
                              <TableCell>{formatDate(journal.dateRead)}</TableCell>
                              <TableCell>{journal.activity || 'Read Book'}</TableCell>
                              <TableCell>{journal.details || journal.title}</TableCell>
                              <TableCell>{journal.comment || '—'}</TableCell>
                              <TableCell>{renderStars(journal.rating)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredJournals.length}
                      rowsPerPage={journalRowsPerPage}
                      page={journalPage}
                      onPageChange={handleJournalChangePage}
                      onRowsPerPageChange={handleJournalChangeRowsPerPage}
                    />
                  </TableContainer>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
      
      {/* Book Summary Dialog */}
      <Dialog
        open={summaryDialogOpen}
        onClose={handleCloseSummaryDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '15px',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '25px',
            backgroundColor: '#FFDF16',
            color: '#000',
          }}
        >
          What I Learned: {selectedBook.title}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: '#FFDF16',
            padding: '30px',
          }}
        >
          {loadingSummary ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                padding: '16px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                minHeight: '200px',
              }}
            >
              <Typography
                sx={{
                  whiteSpace: 'pre-wrap', // Preserve line breaks
                  color: '#000',
                }}
              >
                {selectedBook.summary || 'No summary available for this book.'}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            backgroundColor: '#FFDF16',
            padding: 2,
          }}
        >
          <Button
            onClick={handleCloseSummaryDialog}
            variant="contained"
            sx={{
              borderRadius: '10px',
              width: '120px',
              backgroundColor: '#A44444',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#BB5252',
              },
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentDetailModal;