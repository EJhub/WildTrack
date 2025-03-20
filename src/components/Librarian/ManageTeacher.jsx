import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import ActivityLogView from './components/ActivityLogView';
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
  IconButton,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon } from '@mui/icons-material';
import CreateTeacherForm from './components/CreateTeacherForm';
import UpdateTeacherForm from './components/UpdateTeacherForm';
import AddIcon from '@mui/icons-material/Add';
import DeleteConfirmation from './components/DeleteConfirmation';

const LibrarianManageTeacher = () => {
  // Get query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const resetPasswordUserId = queryParams.get('resetPasswordUserId');
  
  const [teachers, setTeachers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false); // Modal for adding teacher
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false); // Modal for updating teacher
  const [currentTeacher, setCurrentTeacher] = useState(null); // Store teacher data for updating
  const [teacherToDelete, setTeacherToDelete] = useState(null); // Store teacher data to delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal state for delete confirmation
  const [currentView, setCurrentView] = useState('Teachers'); // Add currentView state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const getTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/teachers/all', {
        params: {
          query: searchQuery
        },
      });
      setTeachers(response.data);
      
      // If there's a resetPasswordUserId param, find and open that teacher's form
      if (resetPasswordUserId) {
        const teacherId = parseInt(resetPasswordUserId, 10);
        const teacher = response.data.find(t => t.id === teacherId);
        if (teacher) {
          setCurrentTeacher(teacher);
          setIsUpdateFormOpen(true);
        }
      }
    } catch (error) {
      console.error('There was an error fetching teachers:', error);
    }
  };

  useEffect(() => {
    if (currentView === 'Teachers') {
      getTeachers();
    }
  }, [currentView, resetPasswordUserId]);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => {
    setIsFormOpen(false);
    // Refresh teacher list when form closes
    getTeachers();
  };

  const handleOpenUpdateForm = (teacher) => {
    setCurrentTeacher(teacher); // Set the teacher data for updating
    setIsUpdateFormOpen(true); // Open update form when clicking on "Update" button
  };

  const handleCloseUpdateForm = () => {
    setIsUpdateFormOpen(false);
    setCurrentTeacher(null); // Clear current teacher data
  };

  const handleUpdate = () => {
    getTeachers(); // Refresh teacher list after update
  };

  const handleOpenDeleteModal = (teacher) => {
    setTeacherToDelete(teacher); // Set teacher to delete
    setIsDeleteModalOpen(true); // Open delete confirmation modal
  };

  const handleCloseDeleteModal = () => {
    setTeacherToDelete(null);
    setIsDeleteModalOpen(false); // Close delete confirmation modal
  };

  const handleDeleteTeacher = async () => {
    try {
      if (teacherToDelete) {
        await axios.delete(`http://localhost:8080/api/teachers/${teacherToDelete.id}`);
        setTeachers(teachers.filter((teacher) => teacher.id !== teacherToDelete.id)); // Remove teacher from state
        setTeacherToDelete(null); // Clear selected teacher
        setIsDeleteModalOpen(false); // Close delete modal
      }
    } catch (error) {
      console.error('There was an error deleting the teacher:', error);
    }
  };

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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      getTeachers();
    }
  };

  // Function to format teacher's full name with middle name
  const formatTeacherName = (teacher) => {
    if (!teacher) return '';
    
    // Include middle initial if available
    if (teacher.middleName && teacher.middleName.trim() !== '') {
      return `${teacher.firstName} ${teacher.middleName.charAt(0)}. ${teacher.lastName}`;
    }
    
    // Otherwise just return first and last name
    return `${teacher.firstName} ${teacher.lastName}`;
  };

  // Get the teachers for the current page
  const paginatedTeachers = teachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#f5f5f5' }}>
          <Typography
            variant="h4"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              marginBottom: 3,
              textAlign: 'left',
            }}
          >
            {currentView === "Teachers" ? "Manage Teacher Activity" : "Activity Log"}
          </Typography>

          {currentView === "Activity Log" ? (
            // Render the ActivityLogView component when in Activity Log view
            <ActivityLogView 
              currentView={currentView} 
              setCurrentView={setCurrentView} 
            />
          ) : (
            // Render the Teachers view
            <>
              {/* Top Bar - Search and View Toggle Section */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 3,
                  gap: 2,
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                }}
              >
                {/* Left side with search */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                  <TextField
                    variant="outlined"
                    placeholder="Search teachers..."
                    size="small"
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyPress={handleKeyPress}
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
                    }}
                  />
                </Box>

                {/* Right side with toggle buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant={currentView === "Activity Log" ? "contained" : "outlined"}
                    onClick={() => setCurrentView("Activity Log")}
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
                    onClick={() => setCurrentView("Teachers")}
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

              {/* Add Teacher Button Row */}
              {currentView === "Teachers" && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenForm}
                    sx={{
                      color: '#FFEB3B',
                      backgroundColor: '#800000',
                      border: '1px solid #800000',
                      borderRadius: '50px',
                      height: '40px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                      padding: '0 20px',
                      '&:hover': {
                        backgroundColor: '#940000',
                        color: '#FFEB3B',
                      },
                    }}
                  >
                    <AddIcon sx={{ marginRight: 1 }} />
                    ADD TEACHER
                  </Button>
                </Box>
              )}

              {/* Teachers Table */}
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
                        GRADE LEVEL HANDLED
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                        SECTION HANDLED
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                        SUBJECT HANDLED
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
                        ACTION
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No teachers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTeachers.map((teacher, index) => (
                        <TableRow
                          key={teacher.id}
                          hover
                          sx={{
                            backgroundColor: index % 2 === 0 ? '#FFF8E1' : '#ffffff',
                            '&:hover': { backgroundColor: '#FFB300' },
                          }}
                        >
                          <TableCell>{teacher.idNumber}</TableCell>
                          <TableCell>{formatTeacherName(teacher)}</TableCell>
                          <TableCell>{teacher.grade}</TableCell>
                          <TableCell>{teacher.section}</TableCell>
                          <TableCell>{teacher.subject}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() => handleOpenUpdateForm(teacher)}
                              sx={{ 
                                color: '#800000',
                                backgroundColor: '#F5B400',
                                border: '1px solid #FFEB3B',
                                marginRight: 1,
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: '#FFEB3B',
                                  color: '#800000',
                                },
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => handleOpenDeleteModal(teacher)}
                              sx={{ 
                                color: '#800000',
                                backgroundColor: '#F5B400',
                                border: '1px solid #FFEB3B',
                                marginRight: 1,
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: '#FFEB3B',
                                  color: '#800000',
                                },
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Teacher Table Pagination */}
              <Box sx={{ position: 'relative', width: '100%' }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={teachers.length}
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
          )}
        </Box>
      </Box>

      {/* Modals */}
      <CreateTeacherForm open={isFormOpen} onClose={handleCloseForm} />

      {isUpdateFormOpen && (
        <UpdateTeacherForm
          teacherData={currentTeacher}
          open={isUpdateFormOpen}
          onClose={handleCloseUpdateForm}
          onUpdate={handleUpdate}
        />
      )}

      <DeleteConfirmation
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteTeacher}
      />
    </>
  );
};

export default LibrarianManageTeacher;