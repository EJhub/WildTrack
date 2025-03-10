import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';

const ReportsView = ({ refreshTrigger }) => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminComments, setAdminComments] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get URL parameters to check if a specific report should be opened
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reportIdFromURL = queryParams.get('reportId');

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // For administrators or librarians, fetch all reports
        // For students or teachers, fetch only their own reports
        let response;
        if (user && (user.role === 'Admin' || user.role === 'Librarian')) {
          response = await axios.get('http://localhost:8080/api/reports/all');
        } else if (user) {
          response = await axios.get(`http://localhost:8080/api/reports/user/idNumber/${user.idNumber}`);
        }
        
        if (response && response.data) {
          // Sort reports with newest first based on submission date
          const sortedReports = response.data.sort((a, b) => 
            new Date(b.dateSubmitted) - new Date(a.dateSubmitted)
          );
          setReports(sortedReports);
          
          // If a report ID was specified in the URL, find and open that report
          if (reportIdFromURL) {
            const reportToOpen = sortedReports.find(report => report.id.toString() === reportIdFromURL);
            if (reportToOpen) {
              handleViewDetails(reportToOpen);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load reports. Please try again later.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user, refreshTrigger, reportIdFromURL]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setAdminComments(report.adminComments || '');
    setDetailsOpen(true);
    
    // Optionally clear the reportId from URL to prevent reopening on refresh
    // This is optional and depends on your UX requirements
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('reportId');
    window.history.replaceState({}, '', newUrl);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedReport(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAdminCommentsChange = (event) => {
    setAdminComments(event.target.value);
  };

  const handleUpdateReportStatus = async (newStatus) => {
    if (!selectedReport) return;
    
    try {
      const updatedReport = {
        ...selectedReport,
        status: newStatus,
        adminComments: adminComments
      };
      
      let response;
      if (newStatus === 'Resolved') {
        response = await axios.put(
          `http://localhost:8080/api/reports/${selectedReport.id}/resolve`,
          { adminComments: adminComments }
        );
      } else {
        response = await axios.put(
          `http://localhost:8080/api/reports/${selectedReport.id}`,
          updatedReport
        );
      }
      
      if (response && response.data) {
        setSnackbar({
          open: true,
          message: `Report status updated to ${newStatus}`,
          severity: 'success'
        });
        
        // Update the report in the local state
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === selectedReport.id ? response.data : report
          )
        );
        
        // Close the dialog
        handleCloseDetails();
      }
    } catch (error) {
      console.error('Error updating report:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update report status',
        severity: 'error'
      });
    }
  };

  // Filter reports based on search term and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userIdNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesRole = roleFilter === 'All' || report.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FFF59D', color: '#7D6608' }; // Yellow
      case 'In Progress':
        return { bg: '#90CAF9', color: '#0D47A1' }; // Blue
      case 'Resolved':
        return { bg: '#A5D6A7', color: '#1B5E20' }; // Green
      default:
        return { bg: '#E0E0E0', color: '#616161' }; // Grey
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Filters and Search */}
      <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <TextField
          label="Search Reports"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="action" />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Status:
            </Typography>
            <Select
              size="small"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              IconComponent={ExpandMoreIcon}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="action" />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Role:
            </Typography>
            <Select
              size="small"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              IconComponent={ExpandMoreIcon}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Teacher">Teacher</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      {/* Reports Table */}
      <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Submitted By</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Issue</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date Submitted</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading reports...</TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No reports found</TableCell>
              </TableRow>
            ) : (
              filteredReports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => {
                  const statusColor = getStatusColor(report.status);
                  return (
                    <TableRow 
                      key={report.id} 
                      hover
                      // Highlight the row if it matches the URL report ID
                      sx={report.id.toString() === reportIdFromURL ? {
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      } : {}}
                    >
                      <TableCell>#{report.id}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {report.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.userIdNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          maxWidth: '250px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {report.issue}
                        </Typography>
                      </TableCell>
                      <TableCell>{report.role}</TableCell>
                      <TableCell>{formatDate(report.dateSubmitted)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={report.status} 
                          size="small"
                          sx={{ 
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            fontWeight: 'bold'
                          }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(report)}
                          sx={{ 
                            color: '#781B1B',
                            '&:hover': { bgcolor: 'rgba(120, 27, 27, 0.1)' }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredReports.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Report Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails} 
        fullWidth 
        maxWidth="md"
      >
        {selectedReport && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: '#f5f5f5', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6">Report Details #{selectedReport.id}</Typography>
                <Chip 
                  label={selectedReport.status} 
                  size="small"
                  sx={{ 
                    backgroundColor: getStatusColor(selectedReport.status).bg,
                    color: getStatusColor(selectedReport.status).color,
                    fontWeight: 'bold',
                    mt: 0.5
                  }} 
                />
              </Box>
              <IconButton onClick={handleCloseDetails} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Issue Information */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Issue
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedReport.issue}
                    </Typography>
                  </Paper>
                </Box>

                {/* Description */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Description
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="body1">
                      {selectedReport.description}
                    </Typography>
                  </Paper>
                </Box>

                {/* Metadata - Two Columns */}
                <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                  {/* Left Column */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Submitted By
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {selectedReport.userName}
                      </Typography>
                      <Typography variant="body2">
                        ID: {selectedReport.userIdNumber}
                      </Typography>
                      <Typography variant="body2">
                        Role: {selectedReport.role}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Right Column */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Dates
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Submitted:</strong> {formatDate(selectedReport.dateSubmitted)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Resolved:</strong> {formatDate(selectedReport.dateResolved)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>

                {/* Admin Comments */}
                {(selectedReport.adminComments || user?.role === 'Admin' || user?.role === 'Librarian') && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Admin Comments
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                      {(user?.role === 'Admin' || user?.role === 'Librarian') && selectedReport.status !== 'Resolved' ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Enter resolution comments..."
                          variant="outlined"
                          size="small"
                          value={adminComments}
                          onChange={handleAdminCommentsChange}
                        />
                      ) : (
                        <Typography variant="body1">
                          {selectedReport.adminComments || 'No comments yet.'}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={handleCloseDetails}>Close</Button>
              
              {(user?.role === 'Admin' || user?.role === 'Librarian') && selectedReport.status !== 'Resolved' && (
                <Button 
                  variant="contained"
                  onClick={() => handleUpdateReportStatus(
                    selectedReport.status === 'Pending' ? 'In Progress' : 'Resolved'
                  )}
                  sx={{ 
                    bgcolor: '#FFD700', 
                    color: 'black',
                    '&:hover': { bgcolor: '#e6c300' },
                  }}
                >
                  {selectedReport.status === 'Pending' ? 'Mark In Progress' : 'Resolve Issue'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsView;