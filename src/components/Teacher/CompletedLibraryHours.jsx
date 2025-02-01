import React, { useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';

const CompletedLibraryHours = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const completedRecords = [
    {
      idNumber: '2009-40034',
      name: 'Tricia O. Araneta',
      dateCompleted: 'October 10, 2024',
      validationDate: 'October 13, 2024',
      validatedBy: 'Imelda D. Lopez',
      status: 'Approved',
    },
    // Add more records as needed...
  ];

  // Handle search input change
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Filter logic based on search, date, and academic year
  const filteredStudents = completedRecords.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(search.toLowerCase()) ||
      record.idNumber.includes(search);

    const matchesDate =
      (!dateFrom || new Date(record.dateCompleted) >= new Date(dateFrom)) &&
      (!dateTo || new Date(record.dateCompleted) <= new Date(dateTo));

    const matchesAcademicYear =
      !academicYear || record.dateCompleted.includes(academicYear);

    return matchesSearch && matchesDate && matchesAcademicYear;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left', marginBottom: 3 }}
          >
            Completed Library Hours
          </Typography>
          <Typography sx={{ color: '#000', fontWeight: 'bold', textAlign: 'right', marginTop: '-40px'}}>
            Total no. of completed library hours: {filteredStudents.length}
            <br />
            Total no. of students: {filteredStudents.length}
          </Typography>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 2 }}>
            <TextField
              placeholder="Type here.."
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearch}
              sx={{
                backgroundColor: '#f1f1f1',
                borderRadius: '28px',
                width: { xs: '100%', sm: '360px' },
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
          </Box>

          {/* Filter Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Date From"
              type="date"
              variant="outlined"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Date To"
              type="date"
              variant="outlined"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Academic Year"
              select
              variant="outlined"
              size="small"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', minWidth: '200px' }}
            >
              <MenuItem value="">Select Academic Year</MenuItem>
              <MenuItem value="2023-2024">2023-2024</MenuItem>
              <MenuItem value="2022-2023">2022-2023</MenuItem>
              <MenuItem value="2021-2022">2021-2022</MenuItem>
            </TextField>
            <Button
              size="small"
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                height: '40px',
                '&:hover': { backgroundColor: '#FFC107' },
              }}
            >
              Filter
            </Button>
          </Box>

       

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 345px)',
              border: '1px solid #A85858',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    ID Number
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Date Completed
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Validation Date
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Validated By
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#A85858' }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((record, index) => (
                  <TableRow key={index} hover>
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

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ alignSelf: 'center', marginTop: 2 }}
          />
        </Box>
      </Box>
    </>
  );
};

export default CompletedLibraryHours;
