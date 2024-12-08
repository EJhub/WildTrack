import React, { useState } from 'react';
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
  Button,
  TextField,
  Modal,
  Fade,
  Backdrop,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
 
const LibrarianManageTeacher = () => {
  // Mock static data
  const mockData = [
    { id: 1, idNumber: '12345', firstName: 'John', lastName: 'Doe', quarter: 'First Grading - Second Grading', subjectEnrolled: 'English' },
    { id: 2, idNumber: '67890', firstName: 'Jane', lastName: 'Smith', quarter: 'First Grading - Second Grading', subjectEnrolled: 'Math' },
    { id: 3, idNumber: '11223', firstName: 'Alice', lastName: 'Johnson', quarter: 'First Grading - Second Grading', subjectEnrolled: 'History' },
  ];
 
  // State for holding teacher data
  const [data, setData] = useState(mockData);
  const [open, setOpen] = useState(false); // Modal for editing teacher
  const [confirmOpen, setConfirmOpen] = useState(false); // Modal for confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // Modal for delete confirmation
  const [currentTeacher, setCurrentTeacher] = useState(null); // Teacher being edited
  const [newTeacher, setNewTeacher] = useState({
    idNumber: '',
    firstName: '',
    lastName: '',
    quarter: '',
    subjectEnrolled: ''
  }); // New teacher data
 
  // States for search/filtering
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('2023-2024');
 
  // Handle Update action
  const handleUpdate = (teacher) => {
    setCurrentTeacher(teacher); // Set teacher data to pre-fill the form
    setOpen(true); // Open the form modal
  };
 
  // Handle Add Teacher action
  const handleAddTeacher = () => {
    setNewTeacher({
      idNumber: '',
      firstName: '',
      lastName: '',
      quarter: '',
      subjectEnrolled: ''
    }); // Clear the new teacher form
    setCurrentTeacher(null); // Reset currentTeacher to handle add logic
    setOpen(true); // Open the form modal for adding a new teacher
  };
 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Handle form input change (for both updating and adding teachers)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (currentTeacher) {
      setCurrentTeacher({
        ...currentTeacher,
        [name]: value,
      });
    } else {
      setNewTeacher({
        ...newTeacher,
        [name]: value,
      });
    }
  };
 
  // Handle Save action after form submission (trigger confirmation)
  const handleSave = () => {
    setConfirmOpen(true); // Open the confirmation modal
  };
 
  // Handle confirming save action (for both updating and adding teachers)
  const handleConfirmSave = () => {
    if (currentTeacher) {
      // Update the teacher in the data array
      const updatedData = data.map((teacher) =>
        teacher.id === currentTeacher.id ? currentTeacher : teacher
      );
      setData(updatedData); // Update the state with new data
    } else {
      // Add the new teacher to the data array
      const newTeacherData = { ...newTeacher, id: data.length + 1 }; // Add an ID for the new teacher
      setData([...data, newTeacherData]); // Add the new teacher to the data state
    }
 
    setConfirmOpen(false); // Close the confirmation modal
    setOpen(false); // Close the form modal
  };
 
  // Handle Canceling Save action
  const handleCancelSave = () => {
    setConfirmOpen(false); // Close the confirmation modal
  };
 
  // Handle Delete action
  const handleDelete = (teacher) => {
    setCurrentTeacher(teacher); // Set teacher to be deleted
    setDeleteConfirmOpen(true); // Open delete confirmation modal
  };
 
  // Handle confirming delete action
  const handleConfirmDelete = () => {
    const newData = data.filter((item) => item.id !== currentTeacher.id);
    setData(newData); // Remove the teacher from the list
    setDeleteConfirmOpen(false); // Close the delete confirmation modal
  };
 
  // Handle Canceling Delete action
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false); // Close the delete confirmation modal
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
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              marginBottom: 3,
              textAlign: 'left',
            }}
          >
            Manage Teacher Activity
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
              placeholder="Search teachers..."
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
 
            <IconButton>
              <FilterListIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>
 
          {/* Action Buttons Section */}
          <Box
  sx={{
    display: 'flex',
    gap: 2,
    marginBottom: 2,
    marginTop: '-20px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end', // Align buttons to the right
  }}
>
  <Button
    variant="contained"
    color="primary"
    onClick={handleAddTeacher} // Open add teacher form
    sx={{
      fontWeight: 'bold',
      padding: '10px 20px',
      backgroundColor: '#FFB300',
      '&:hover': { backgroundColor: '#F57C00' },
    }}
  >
    Add Teacher
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => console.log('Activity Log Clicked')} // Action for Activity Log button
    sx={{
      fontWeight: 'bold',
      padding: '10px 20px',
      backgroundColor: '#4CAF50',
      '&:hover': { backgroundColor: '#388E3C' },
    }}
  >
    Activity Log
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => console.log('Teacher Button Clicked')} // Action for Teacher button
    sx={{
      fontWeight: 'bold',
      padding: '10px 20px',
      backgroundColor: '#1976D2',
      '&:hover': { backgroundColor: '#1565C0' },
    }}
  >
    Teacher
  </Button>
</Box>

 
          {/* Table Section */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)',
              boxShadow: 3,
              backgroundColor: '#fafafa',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161',
                    }}
                  >
                    ID Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161',
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161',
                    }}
                  >
                    Quarter
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161',
                    }}
                  >
                    Subject Handled
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#CD6161',
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((teacher, index) => (
                  <TableRow
                    key={teacher.id}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#FFF8E1' : '#ffffff',
                      '&:hover': { backgroundColor: '#FFB300' },
                    }}
                  >
                    <TableCell sx={{ color: '#000' }}>{teacher.idNumber}</TableCell>
                    <TableCell sx={{ color: '#000' }}>
                      {`${teacher.firstName} ${teacher.lastName}`}
                    </TableCell>
                    <TableCell sx={{ color: '#000' }}>{teacher.quarter}</TableCell>
                    <TableCell sx={{ color: '#000' }}>{teacher.subjectEnrolled}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdate(teacher)}
                        sx={{
                          marginRight: 1,
                          backgroundColor: '#FFB300',
                          '&:hover': { backgroundColor: '#F57C00' },
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(teacher)}
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
          </TableContainer>
 
          {/* Modal for Editing/Adding Teacher */}
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {currentTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </Typography>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={currentTeacher?.firstName || newTeacher.firstName}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={currentTeacher?.lastName || newTeacher.lastName}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Subject Enrolled"
                  name="subjectEnrolled"
                  value={currentTeacher?.subjectEnrolled || newTeacher.subjectEnrolled}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="quarter"
                  name="quarter"
                  value={currentTeacher?.quarter || newTeacher.quarter}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setOpen(false)} sx={{ backgroundColor: '#F44336' }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} sx={{ backgroundColor: '#FFB300' }}>
                    Save
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>
 
          {/* Delete Confirmation Modal */}
          <Modal
            open={deleteConfirmOpen}
            onClose={handleCancelDelete}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={deleteConfirmOpen}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Are you sure you want to delete this teacher?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Button
                    onClick={handleCancelDelete}
                    sx={{
                      backgroundColor: '#F44336',
                      '&:hover': { backgroundColor: '#D32F2F' },
                    }}
                  >
                    No
                  </Button>
                  <Button
                    onClick={handleConfirmDelete}
                    sx={{
                      backgroundColor: '#FFB300',
                      '&:hover': { backgroundColor: '#F57C00' },
                    }}
                  >
                    Yes
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>
 
          {/* Confirmation Modal */}
          <Modal
            open={confirmOpen}
            onClose={handleCancelSave}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={confirmOpen}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Are you sure you want to {currentTeacher ? 'update' : 'add'} the teacher?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Button
                    onClick={handleCancelSave}
                    sx={{
                      backgroundColor: '#F44336',
                      '&:hover': { backgroundColor: '#D32F2F' },
                    }}
                  >
                    No
                  </Button>
                  <Button
                    onClick={handleConfirmSave}
                    sx={{
                      backgroundColor: '#FFB300',
                      '&:hover': { backgroundColor: '#F57C00' },
                    }}
                  >
                    Yes
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>
        </Box>
      </Box>
    </>
  );
};
 
export default LibrarianManageTeacher;