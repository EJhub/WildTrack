import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  Divider, TablePagination, Select, MenuItem, TextField,
  Container, IconButton, Tooltip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Alert
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';

// Icons
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Component Imports
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';

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
  
  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Data States
  const [participantsData, setParticipantsData] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  
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

  // Constants
  const gradeLevels = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  const sections = ['Section A', 'Section B', 'Section C'];
  const academicYears = ['2024-2025', '2025-2026', '2026-2027'];

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
  
  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
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
  
  const handleConfirmAction = async () => {
    if (!currentRequirement || !actionType) return;
    
    setActionInProgress(true);
    const token = localStorage.getItem("token");
    
    try {
      const endpoint = actionType === 'approve' 
        ? `/api/library-hours-approval/approve/${currentRequirement.id}`
        : `/api/library-hours-approval/reject/${currentRequirement.id}`;
        
      const requestBody = actionType === 'reject' ? { reason: rejectionReason } : {};
      
      const response = await axios.post(`http://localhost:8080${endpoint}`, requestBody, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Fetch Data Effects
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setApprovalsLoading(true);
        const token = localStorage.getItem("token");
        
        const response = await axios.get('http://localhost:8080/api/library-hours-approval/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
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
        toast.error("Failed to load participants data");
      } finally {
        setParticipantsLoading(false);
      }
    };

    fetchParticipantsData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchParticipantsData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Completion Rate Data
  useEffect(() => {
    const fetchCompletionRateData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/statistics/completion-rate');
        if (!response.ok) throw new Error('Failed to fetch completion rate data');
        const data = await response.json();
        setBarData(data);
      } catch (err) {
        console.error('Error fetching completion rate data:', err);
        toast.error("Failed to load completion rate data");
      }
    };

    fetchCompletionRateData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchCompletionRateData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Main Statistics Fetch
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
        toast.error("Failed to load dashboard statistics");
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
      <ToastContainer />
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
              <Paper sx={{ p: 2, backgroundColor: '#D98C8C', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Library Hours Completion Rate
                </Typography>
                <Box sx={{ height: 300 }}>
                  {barData.length === 0 ? (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography>Loading completion rate...</Typography>
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
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h6" sx={{ p: 2 }}>
              Pending Library Hours Requirement Approvals
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#FFD700' }}>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Quarter</TableCell>
                    <TableCell>Grade Level</TableCell>
                    <TableCell>Minutes Required</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
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
                        <TableRow key={approval.id} sx={{ backgroundColor: '#CD6161' }}>
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
            />
          </Paper>
        </Container>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {actionType === 'approve' ? "Approve Library Hours Requirement" : "Reject Library Hours Requirement"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'approve' 
              ? "Are you sure you want to approve this library hours requirement? Approved requirements will be visible to students."
              : "Are you sure you want to reject this library hours requirement? Please provide a reason for the rejection."}
          </DialogContentText>
          {currentRequirement && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Subject:</strong> {currentRequirement.subject}
              </Typography>
              <Typography variant="body1">
                <strong>Quarter:</strong> {currentRequirement.quarter}
              </Typography>
              <Typography variant="body1">
                <strong>Grade Level:</strong>{currentRequirement.gradeLevel}
              </Typography>
              <Typography variant="body1">
                <strong>Minutes Required:</strong> {currentRequirement.minutes}
              </Typography>
              <Typography variant="body1">
                <strong>Due Date:</strong> {formatDate(currentRequirement.deadline)}
              </Typography>
            </Box>
          )}
          
          {actionType === 'reject' && (
            <TextField
              margin="dense"
              id="rejection-reason"
              label="Reason for Rejection"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={handleRejectionReasonChange}
              sx={{ mt: 3 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" disabled={actionInProgress}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={actionType === 'approve' ? "success" : "error"} 
            variant="contained"
            disabled={actionInProgress || (actionType === 'reject' && rejectionReason.trim() === '')}
          >
            {actionInProgress ? (
              <CircularProgress size={24} />
            ) : (
              actionType === 'approve' ? "Approve" : "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
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
    </Box>
  );
};

export default LibrarianDashboard;