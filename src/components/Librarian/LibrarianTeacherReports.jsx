import React, { useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Menu, MenuItem, IconButton, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'; // File Icon for Report
import MoreVertIcon from '@mui/icons-material/MoreVert'; // More options icon for actions
import NavBar from './components/NavBar'; // Import NavBar
import SideBar from './components/SideBar'; // Import the Sidebar component

const TeacherReports = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState(''); // For selected action (Approved/Denied)

  const data = [
    { id: '16735', teacher: 'Jingky', file: 'Report.pdf', issuedBy: 'Michelle', status: 'Pending' },
    { id: '65827', teacher: 'Ralph', file: 'Report.pdf', issuedBy: 'Shiena', status: 'Approved' },
    { id: '23467', teacher: 'Rotela', file: 'Report.pdf', issuedBy: 'Maria Smith', status: 'Denied' },
    { id: '09213', teacher: 'Crissanta', file: 'Report.pdf', issuedBy: 'Angelie', status: 'Pending' },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    handleClose(); // Close menu after selection
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#ffffff' }}>
          {/* Teacher Reports Title */}
          <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2 }}>
            Teacher Reports
          </Typography>

          {/* Search bar placed above the table, outside the table */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: '250px',
                paddingRight: '30px', // Space for the search icon on the right
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Table displaying teacher reports */}
          <TableContainer component={Paper} sx={{ opacity: 0.9, borderRadius: '10px' }}>
            <Table aria-label="teacher reports table" sx={{ width: '100%' }}>
              <TableHead sx={{ backgroundColor: '#CD6161' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>ID Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>Teacher Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>File Report</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>Issued By</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ backgroundColor: '#CD6161', fontWeight: 'normal', color: '#000', fontSize: '0.9rem' }}>
                      {report.id}
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', fontSize: '0.9rem', color: '#000' }}>{report.teacher}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', fontSize: '0.9rem', color: '#000' }}>
                      <InsertDriveFileIcon sx={{ fontSize: 18, marginRight: 1, color: '#000' }} />
                      {report.file}
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', fontSize: '0.9rem', color: '#000' }}>{report.issuedBy}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', fontSize: '0.9rem', color: '#000' }}>{report.status}</TableCell>
                    <TableCell sx={{ backgroundColor: '#CD6161', fontSize: '0.9rem', color: '#000' }}>
                      <IconButton onClick={handleClick}>
                        <MoreVertIcon sx={{ color: '#000' }} />
                      </IconButton>
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={() => handleActionSelect('Approved')} sx={{ backgroundColor: '#FFFF00' }}>
                          Approved
                        </MenuItem>
                        <MenuItem onClick={() => handleActionSelect('Denied')} sx={{ backgroundColor: '#CD6161' }}>
                          Denied
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
};

export default TeacherReports;
