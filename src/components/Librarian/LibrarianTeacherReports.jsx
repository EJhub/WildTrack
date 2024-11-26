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
    { id: '09213', teacher: 'Crissanta', file: 'Report.pdf', issuedBy: 'Angelie', status: 'Pending' },
    { id: '09213', teacher: 'Crissanta', file: 'Report.pdf', issuedBy: 'Angelie', status: 'Pending' },
    { id: '09213', teacher: 'Crissanta', file: 'Report.pdf', issuedBy: 'Angelie', status: 'Pending' },
    { id: '09213', teacher: 'Crissanta', file: 'Report.pdf', issuedBy: 'Angelie', status: 'Pending' },
    { id: '09213', teacher: 'Crissanta', file: 'Report.pdf', issuedBy: 'Angelie', status: 'Pending' },
    { id: '09213', teacher: 'Crissanta', file: 'Report.pdf', issuedBy: 'Angelie', status: 'Pending' },
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
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Teacher Reports Title */}
          <Typography
            variant="h4"
            sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left' }}
          >
            Teacher Reports
          </Typography>

          {/* Search bar placed above the table */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 3 }}>
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: { xs: '100%', sm: '300px' },
                '& .MuiOutlinedInput-root': { padding: '5px 10px' },
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
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)', // Adjusts to remaining space
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    ID Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Teacher Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    File Report
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Issued By
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((report, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                      '&:hover': { backgroundColor: '#FCEAEA' },
                    }}
                  >
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.teacher}</TableCell>
                    <TableCell>
                      <InsertDriveFileIcon
                        sx={{ fontSize: 18, marginRight: 1, color: '#000' }}
                      />
                      {report.file}
                    </TableCell>
                    <TableCell>{report.issuedBy}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={handleClick}>
                        <MoreVertIcon sx={{ color: '#000' }} />
                      </IconButton>
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem
                          onClick={() => handleActionSelect('Approved')}
                          sx={{ backgroundColor: '#FFFF00' }}
                        >
                          Approved
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleActionSelect('Denied')}
                          sx={{ backgroundColor: '#CD6161', color: '#fff' }}
                        >
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
