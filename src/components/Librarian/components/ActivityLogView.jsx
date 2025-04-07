import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  TablePagination,
  Alert,
  CircularProgress,
  Button,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, Info as InfoIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
// Import API utility
import api from '../../../utils/api';

const ActivityLogView = ({ currentView, setCurrentView }) => {
  // States for activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      
      // Make the API call - we'll apply filtering client-side
      const response = await api.get('/activity-logs', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      setActivityLogs(response.data);
      // Initialize filtered logs with all logs
      filterLogs(response.data, searchQuery);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError(`Failed to load activity logs: ${error.response?.data?.message || error.message}`);
      toast.error("Failed to load activity logs");
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on search query
  const filterLogs = (logs, query) => {
    if (!query.trim()) {
      setFilteredLogs(logs);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    const filtered = logs.filter((log) => {
      // Format date for searching
      const formattedDate = formatDate(log.timestamp).toLowerCase();
      
      // Check if any field contains the search query
      return (
        (log.userIdNumber && log.userIdNumber.toLowerCase().includes(lowercaseQuery)) ||
        (log.userName && log.userName.toLowerCase().includes(lowercaseQuery)) ||
        formattedDate.includes(lowercaseQuery)
      );
    });
    
    setFilteredLogs(filtered);
    // Reset to first page when search results change
    setPage(0);
  };

  // Initial data fetch
  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Apply filtering whenever search query changes
  useEffect(() => {
    filterLogs(activityLogs, searchQuery);
  }, [searchQuery, activityLogs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0); // Reset to the first page when the number of rows per page changes
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Refresh functionality
  const handleRefresh = () => {
    fetchActivityLogs();
  };

  // Format the date for display
  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get the logs for the current page
  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper for activity description
  const getActivityDescription = (activity) => {
    switch (activity) {
      case 'LIBRARY_HOURS_CREATED':
        return 'Created Library Hours';
      case 'LIBRARY_HOURS_APPROVED':
        return 'Approved Library Hours';
      case 'LIBRARY_HOURS_REJECTED':
        return 'Rejected Library Hours';
      default:
        return activity;
    }
  };

  return (
    <>
      {/* Top Controls Row - Search Bar and View Toggle Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 3,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: 2
        }}
      >
        {/* Left side - Search Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <TextField
            variant="outlined"
            placeholder="Search activity logs..."
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              backgroundColor: '#fff',
              borderRadius: '15px',
              maxWidth: { xs: '100%', sm: '400px' },
              width: '100%'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Search by ID Number, Name, or Date & Time" arrow>
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'result' : 'results'}
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            sx={{
              color: '#800000',
              borderColor: '#800000',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#800000',
              }
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Right side - Toggle Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={currentView === "Activity Log" ? "contained" : "outlined"}
            onClick={() => setCurrentView && setCurrentView("Activity Log")}
            sx={{
              color: currentView === 'Activity Log' ? '#800000' : '#800000',
              backgroundColor: currentView === 'Activity Log' ? '#FFEB3B' : 'white',
              border: '1px solid #800000',
              fontWeight: 'bold',
              height: '40px',
              '&:hover': {
                backgroundColor: '#FFEB3B',
                color: '#800000',
              },
            }}
          >
            ACTIVITY LOG
          </Button>

          <Button
            variant={currentView === "Teachers" ? "contained" : "outlined"}
            onClick={() => setCurrentView && setCurrentView("Teachers")}
            sx={{
              color: currentView === 'Teachers' ? '#800000' : '#800000',
              backgroundColor: currentView === 'Teachers' ? '#FFEB3B' : 'white',
              border: '1px solid #800000',
              fontWeight: 'bold',
              height: '40px',
              '&:hover': {
                backgroundColor: '#FFEB3B',
                color: '#800000',
              },
            }}
          >
            TEACHERS
          </Button>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Activity Logs Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                ID NUMBER
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                NAME
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                ACTIVITY
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                DATE & TIME
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Loading activity logs...
                  </Box>
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {searchQuery ? 'No activity logs match your search.' : 'No activity logs found.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log, index) => (
                <TableRow
                  key={log.id || index}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#FFF8E1' : '#ffffff',
                    '&:hover': { backgroundColor: '#FFB300' },
                  }}
                >
                  <TableCell>{log.userIdNumber}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    {log.description || getActivityDescription(log.activity)}
                  </TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 2,
            width: '100%',
          }}
        />
      </Box>
    </>
  );
};

export default ActivityLogView;