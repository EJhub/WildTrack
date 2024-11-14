import React from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

const CompletedLibraryHours = () => {
  const completedRecords = [
    {
      idNumber: '2009-40034',
      name: 'Tricia O. Araneta',
      dateCompleted: 'October 10, 2024',
      validationDate: 'October 13, 2024',
      validatedBy: 'Imelda D. Lopez',
      status: 'Approved',
    },
    {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
      {
        idNumber: '2009-40034',
        name: 'Tricia O. Araneta',
        dateCompleted: 'October 10, 2024',
        validationDate: 'October 13, 2024',
        validatedBy: 'Imelda D. Lopez',
        status: 'Approved',
      },
    // Add more records as needed
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left' }}>
            Completed Library Hours
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, marginBottom: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                placeholder="Type here..."
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: '#f1f1f1',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  width: '360px',
                  '& .MuiOutlinedInput-root': { padding: '5px 10px' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MenuIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton color="primary">
                <FilterListIcon />
              </IconButton>
              <IconButton color="primary">
                <SortByAlphaIcon />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#000', fontWeight: 'bold', textAlign: 'right' }}>
              Total no. of completed library hours: 01<br />
              Total no. of students: 05
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'auto', maxHeight: '400px' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#A85858' }}>ID Number</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#A85858' }}>Name</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#A85858' }}>Date Completed</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#A85858' }}>Validation Date</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#A85858' }}>Validated By</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#A85858' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.idNumber}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.dateCompleted}</TableCell>
                    <TableCell>{record.validationDate}</TableCell>
                    <TableCell>{record.validatedBy}</TableCell>
                    <TableCell>{record.status}</TableCell>
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

export default CompletedLibraryHours;
