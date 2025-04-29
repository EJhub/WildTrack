import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  IconButton, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toast } from "react-toastify";
import api from '../../../utils/api'; // Import API utility

const ActiveStudentsDialog = ({ open, onClose }) => {
  // State for student data
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Load student data when dialog opens
  useEffect(() => {
    if (open) {
      fetchActiveStudents();
    }
  }, [open]);
  
  // Function to fetch active students from the API
  const fetchActiveStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/statistics/active-students');
      setStudents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching active students:', err);
      setError('Failed to load students currently inside the library');
      toast.error('Failed to load students currently inside the library');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page on search
  };
  
  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.grade && student.grade.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.section && student.section.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Format time from ISO string
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '15px',
          boxShadow: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ color: '#8C383E', fontSize: 32, mr: 1 }} />
          <DialogTitle sx={{ p: 0, color: '#8C383E', fontWeight: 'bold' }}>
            Students Currently Inside Library
          </DialogTitle>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#8C383E' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ p: 3, pt: 0 }}>
        {/* Search bar */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, ID, grade or section..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8C383E' }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '15px',
                backgroundColor: '#fff'
              }
            }}
          />
        </Box>
        
        {/* Students table */}
        <TableContainer component={Paper} sx={{ 
          borderRadius: '15px',
          boxShadow: 2,
          maxHeight: '60vh'
        }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FFD700' }}>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#FFD700' }}>ID Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#FFD700' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#FFD700' }}>Grade & Section</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#FFD700' }}>Time In</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={40} sx={{ color: '#8C383E' }} />
                    <Typography sx={{ mt: 2 }}>Loading students...</Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    {searchQuery ? (
                      <Typography>No students found matching "{searchQuery}"</Typography>
                    ) : (
                      <Typography>No students are currently inside the library</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                // Display paginated students
                filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <TableRow key={student.id} sx={{ '&:hover': { backgroundColor: 'rgba(217, 140, 140, 0.1)' } }}>
                      <TableCell>{student.idNumber}</TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${student.grade || 'N/A'} - ${student.section || 'N/A'}`} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(217, 140, 140, 0.3)', 
                            fontWeight: 'bold',
                            color: '#8C383E' 
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: '#8C383E' }} />
                          {formatTime(student.timeIn)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {!loading && !error && filteredStudents.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              mt: 2,
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          />
        )}
        
        {/* Summary text */}
        <Typography sx={{ mt: 2, textAlign: 'center', color: '#8C383E' }}>
          Total Students Inside: {filteredStudents.length}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveStudentsDialog;