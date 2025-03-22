import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
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
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const LibrarianManageRecords = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [grade, setGrade] = useState('');

  // New states for update functionality
  const [currentRecord, setCurrentRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/library-hours/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching library hours summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
  };

  // Handle Update action
  const handleUpdate = (record) => {
    setCurrentRecord(record);
    setOpen(true);
  };

  // Convert time to 24-hour format
  const convertTo24HourTime = (time) => {
    const [hours, minutes] = time.split(':');
    const isPM = time.toLowerCase().includes('pm');
    let formattedHours = parseInt(hours, 10);
    if (isPM && formattedHours < 12) formattedHours += 12;
    if (!isPM && formattedHours === 12) formattedHours = 0;
    return `${String(formattedHours).padStart(2, '0')}:${minutes.trim()}:00`;
  };

  // Handle Update Submit
  const handleUpdateSubmit = async () => {
    try {
      // Validate input
      if (!currentRecord.latestLibraryHourDate || 
          !currentRecord.latestTimeIn || 
          !currentRecord.latestTimeOut) {
        setError('Please fill in all required fields');
        return;
      }

      const updatedData = {
        idNumber: currentRecord.idNumber,
        latestLibraryHourDate: new Date(currentRecord.latestLibraryHourDate)
          .toISOString()
          .split('T')[0], // Format date to yyyy-MM-dd
        latestTimeIn: convertTo24HourTime(currentRecord.latestTimeIn), // Convert to HH:mm:ss
        latestTimeOut: convertTo24HourTime(currentRecord.latestTimeOut), // Convert to HH:mm:ss
        totalMinutes: currentRecord.totalMinutes,
      };

      const response = await fetch('http://localhost:8080/api/library-hours/update-summary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update the record');
      }

      const result = await response.json();
      console.log('Record updated successfully:', result);

      // Update local state to reflect changes
      setData((prevData) =>
        prevData.map((record) =>
          record.idNumber === currentRecord.idNumber ? { ...record, ...updatedData } : record
        )
      );

      setOpen(false); // Close the modal
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error updating record:', error);
      setError(error.message || 'Failed to update record');
    }
  };

  // Handle Delete action
  const handleDelete = (id) => {
    console.log(`Deleting student with ID: ${id}`);
    // Add your delete logic here, e.g., make a DELETE API call
    const newData = data.filter((item) => item.id !== id);
    setData(newData); // Update state after deleting
  };

  // Update Modal Component
  const UpdateModal = () => {
    if (!currentRecord) return null;

    return (
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Update Library Hours Record</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            label="ID Number"
            value={currentRecord.idNumber}
            fullWidth
            disabled
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Date"
            type="date"
            value={currentRecord.latestLibraryHourDate}
            onChange={(e) => setCurrentRecord(prev => ({
              ...prev, 
              latestLibraryHourDate: e.target.value
            }))}
            fullWidth
            sx={{ marginBottom: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Time In"
            value={currentRecord.latestTimeIn}
            onChange={(e) => setCurrentRecord(prev => ({
              ...prev, 
              latestTimeIn: e.target.value
            }))}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Time Out"
            value={currentRecord.latestTimeOut}
            onChange={(e) => setCurrentRecord(prev => ({
              ...prev, 
              latestTimeOut: e.target.value
            }))}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Total Minutes"
            type="number"
            value={currentRecord.totalMinutes}
            onChange={(e) => setCurrentRecord(prev => ({
              ...prev, 
              totalMinutes: parseInt(e.target.value, 10)
            }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
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
            padding: '32px 32px 120px 32px', // Increased bottom padding
            flexGrow: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
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
          <Typography
            variant="h4"
            sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left' }}
          >
            Manage Records
          </Typography>

          {/* Search and Filters Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
              gap: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            <IconButton>
              <MenuIcon />
            </IconButton>

            <TextField
              variant="outlined"
              placeholder="Type here..."
              size="small"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '400px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <IconButton>
            </IconButton>
          </Box>

          {/* Additional Filters Section: Date, Academic Year, Grade */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginRight: '100px',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              marginBottom: 3,
            }}
          >
            <TextField
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{ backgroundColor: '#fff', borderRadius: '15px', flexGrow: 1, maxWidth: '200px' }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{ backgroundColor: '#fff', borderRadius: '15px', flexGrow: 1, maxWidth: '200px' }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl sx={{ backgroundColor: '#fff', borderRadius: '15px', minWidth: '250px' }}>
              <InputLabel>Select Academic Year</InputLabel>
              <Select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                label="Academic Year"
                size="small"
              >
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
                <MenuItem value="2026-2027">2026-2027</MenuItem>
              </Select>
            </FormControl>

            {/* Filter Button next to Academic Year */}
            <IconButton>
              <FilterListIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>

          {/* Table Section */}
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'visible', // Changed from 'auto' to 'visible'
              marginBottom: 5, // Added bottom margin for pagination
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    ID Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                     Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Time-In
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Time-Out
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Completed Minutes
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                        '&:hover': { backgroundColor: '#FCEAEA' },
                      }}
                    >
                      <TableCell>{student.idNumber}</TableCell>
                      <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                      <TableCell>{student.latestLibraryHourDate}</TableCell>
                      <TableCell>{student.latestTimeIn}</TableCell>
                      <TableCell>{student.latestTimeOut}</TableCell>
                      <TableCell>{student.totalMinutes}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpdate(student)}
                          sx={{
                            marginRight: 1,
                            backgroundColor: '#FFB300',
                            '&:hover': { backgroundColor: '#FF8F00' },
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(student.id)}
                          sx={{
                            backgroundColor: '#F44336',
                            '&:hover': { backgroundColor: '#D32F2F' },
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            
            {/* Integrated pagination inside the TableContainer */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                paddingTop: 2,
                paddingBottom: 2,
                backgroundColor: 'transparent',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                position: 'relative', // Ensure visibility
              }}
            />
          </TableContainer>
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 60, width: '100%' }} />

          {/* Update Modal */}
          <UpdateModal />
        </Box>
      </Box>
    </>
  );
};

export default LibrarianManageRecords;