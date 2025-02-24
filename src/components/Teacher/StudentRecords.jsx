import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const StudentRecords = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal States
  const [openModal, setOpenModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch students with time-in and time-out
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/library-hours/with-user-details');
        const formattedStudents = response.data.map((student) => ({
          idNumber: student.idNumber,
          name: `${student.firstName} ${student.lastName}`,
          gradeSection: student.gradeSection || 'N/A',
          progress: student.timeOut ? 'Completed' : 'In-progress',
          status: student.timeOut ? 'Approved' : 'Pending',
        }));

        setStudents(formattedStudents);
        setFilteredStudents(formattedStudents);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch student records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Handle edit button click
  const handleEditClick = (student) => {
    setEditingStudent({ ...student });
    setOpenModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingStudent(null);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setError(null); // Clear any previous errors

      // Validate required fields before sending
      if (!editingStudent?.idNumber || !editingStudent?.name) {
        setError('ID Number and Name are required fields');
        return;
      }

      const payload = {
        idNumber: editingStudent.idNumber,
        name: editingStudent.name,
        gradeSection: editingStudent.gradeSection,
        progress: editingStudent.progress,
        status: editingStudent.status,
      };

      const response = await axios.put(
        `http://localhost:8080/api/library-hours/${editingStudent.idNumber}`,
        editingStudent,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local state
      const updatedStudents = students.map((student) =>
        student.idNumber === editingStudent.idNumber ? editingStudent : student
      );

      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      handleCloseModal();

      // Optional: Show success message
      setSuccessMessage('Student record updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Failed to update student record. Please try again.');
    }
  };

  // Rest of your existing functions
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    setFilteredStudents(
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(value) || 
          student.idNumber.toLowerCase().includes(value)
      )
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilter = () => {
    const filtered = students.filter((student) => {
      const matchesDateFrom = dateFrom ? new Date(student.date) >= new Date(dateFrom) : true;
      const matchesDateTo = dateTo ? new Date(student.date) <= new Date(dateTo) : true;
      const matchesAcademicYear = academicYear
        ? student.academicYear === academicYear
        : true;
      return matchesDateFrom && matchesDateTo && matchesAcademicYear;
    });
    setFilteredStudents(filtered);
  };

  const paginatedRows = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const tableHeaderStyle = {
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#781B1B',
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 4,
            backgroundColor: '#fff',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left', marginBottom: 3 }}
          >
            Student Records
          </Typography>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 2 }}>
            <TextField
              placeholder="Search by name or ID..."
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
              onClick={handleFilter}
              size="small" 
              sx={{ 
                backgroundColor: "#FFD700", 
                color: "#000", 
                height: '40px', 
                "&:hover": { 
                  backgroundColor: "#FFC107" 
                } 
              }}
            >
              Filter
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading student records...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  flexGrow: 1,
                  borderRadius: '10px',
                  overflow: 'auto',
                  maxHeight: 'calc(100vh - 250px)',
                  border: "0.1px solid rgb(96, 92, 92)",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeaderStyle}>ID Number</TableCell>
                      <TableCell sx={tableHeaderStyle}>Name</TableCell>
                      <TableCell sx={tableHeaderStyle}>Grade & Section</TableCell>
                      <TableCell sx={tableHeaderStyle}>Progress</TableCell>
                      <TableCell sx={tableHeaderStyle}>Status</TableCell>
                      <TableCell sx={tableHeaderStyle}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((student, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.idNumber}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.name}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.gradeSection}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.progress}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>{student.status}</TableCell>
                        <TableCell sx={{ borderBottom: '2px solid #f1f1f1' }}>
                          <IconButton 
                            color="primary"
                            onClick={() => handleEditClick(student)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Edit Modal */}
              <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Edit Student Record</DialogTitle>
                <DialogContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                      label="ID Number"
                      value={editingStudent?.idNumber || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, idNumber: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Name"
                      value={editingStudent?.name || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Grade & Section"
                      value={editingStudent?.gradeSection || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, gradeSection: e.target.value })}
                      fullWidth
                    />
                    <FormControl fullWidth>
                      <InputLabel>Progress</InputLabel>
                      <Select
                        value={editingStudent?.progress || ''}
                        label="Progress"
                        onChange={(e) => setEditingStudent({ ...editingStudent, progress: e.target.value })}
                      >
                        <MenuItem value="In-progress">In-progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editingStudent?.status || ''}
                        label="Status"
                        onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseModal}>Cancel</Button>
                  <Button onClick={handleSaveChanges} variant="contained">Save Changes</Button>
                </DialogActions>
              </Dialog>

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
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default StudentRecords;
