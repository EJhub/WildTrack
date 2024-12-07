import React, { useState } from 'react';
import NavBar from './components/NavBar'; // Importing NavBar component
import SideBar from './components/SideBar'; // Importing SideBar component
import { Box, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, TablePagination } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'; // Replaced icon (example)
import CloseIcon from '@mui/icons-material/Close'; // Close Icon
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const LibrarianDashboard = () => {
  const approvals = [
    { id: '2009-40034', name: 'Tricia O. Araneta', date: 'October 10, 2024', minutes: '150 minutes', approvalStatus: true, status: 'Pending' },
    // Add more data here for pagination to show multiple pages
    { id: '2009-40035', name: 'John Doe', date: 'October 11, 2024', minutes: '120 minutes', approvalStatus: true, status: 'Pending' },
    { id: '2009-40036', name: 'Jane Smith', date: 'October 12, 2024', minutes: '180 minutes', approvalStatus: true, status: 'Pending' },
    // Add additional mock data...
  ];

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  return (
    <>
      <NavBar />

      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#ffffff', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
          {/* Data Summary Boxes Section */}
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            {/* Box 2 - Student Library Hours */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  height: '92px',
                  width: '238px',
                  backgroundColor: '#CD6161',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  paddingX: 2,
                  paddingRight: 2,
                }}
              >
                <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '1rem', marginBottom: 1, textAlign: 'right' }}>1032</Typography> {/* Smaller number above */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ color: '#FFD700', fontSize: 30, marginRight: 2 }} />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#FFD700',
                      color: '#000',
                      width: '181px',
                      height: '36px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      gap: '5px',
                      borderRadius: '8px',
                    }}
                  >
                    <AccessAlarmIcon sx={{ color: '#800000' }} /> {/* New icon */}
                    <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>Student Library Hours</Typography>
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Box 3 - Teacher Report */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  height: '92px',
                  width: '238px',
                  backgroundColor: '#CD6161',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginLeft: '-200px',
                  paddingX: 2,
                  paddingRight: 2,
                  alignItems: 'flex-end', // Align to the right
                }}
              >
                <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '1rem', marginBottom: 1, textAlign: 'right' }}>7</Typography> {/* Smaller number above */}
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000',
                    width: '181px',
                    height: '36px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    gap: '5px',
                    borderRadius: '8px',
                  }}
                >
                  <AccessAlarmIcon sx={{ color: '#800000' }} /> {/* New icon */}
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>Teacher Report</Typography>
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            {/* First Chart Placeholder with no text */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '300px',
                  backgroundColor: '#CD6161',
                  border: '2px solid #0000FF',
                  borderRadius: '8px',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#000',
                    position: 'absolute',
                    top: '8px',
                    left: '16px',
                  }}
                >
                  Student Attendee
                </Typography>
              </Box>
            </Grid>

            {/* Second Chart with title inside, positioned top-left */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '300px',
                  backgroundColor: '#CD6161',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  position: 'relative', // Relative positioning for absolute child
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#000',
                    position: 'absolute',
                    top: '8px',
                    left: '16px',
                  }}
                >
                  Student Library Hours
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Pending Approval Section */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <span>Pending Approval</span>
                <Box sx={{ display: 'flex', gap: '10px', marginLeft: 2 }}>
                  <Button variant="outlined" sx={{ color: '#000', borderColor: '#000', fontSize: '0.75rem', padding: '0 8px' }}>Grade</Button>
                  <Button variant="outlined" sx={{ color: '#000', borderColor: '#000', fontSize: '0.75rem', padding: '0 8px' }}>Minutes</Button>
                  <Button variant="outlined" sx={{ color: '#000', borderColor: '#000', fontSize: '0.75rem', padding: '0 8px' }}>Date</Button>
                </Box>
              </Box>
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#FFD700' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>ID Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Date Completed</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Minutes Completed</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Approval Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((approval, index) => (
                    <TableRow key={index} sx={{ backgroundColor: '#CD6161', color: '#000' }}>
                      <TableCell>{approval.id}</TableCell>
                      <TableCell>{approval.name}</TableCell>
                      <TableCell>{approval.date}</TableCell>
                      <TableCell>{approval.minutes}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessAlarmIcon sx={{ color: '#000', marginRight: 1 }} />
                          <Divider sx={{ borderColor: '#000', height: 20, margin: '0 5px' }} />
                          <CloseIcon sx={{ color: '#000' }} />
                        </Box>
                      </TableCell>
                      <TableCell>{approval.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <TablePagination
                component="div"
                count={approvals.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LibrarianDashboard;
