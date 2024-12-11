import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import CreateTeacherForm from './components/CreateTeacherForm';
import UpdateTeacherForm from './components/UpdateTeacherForm';
import DeleteConfirmation from './components/DeleteConfirmation';

const LibrarianManageTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false); // Modal for adding teacher
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false); // Modal for updating teacher
  const [currentTeacher, setCurrentTeacher] = useState(null); // Store teacher data for updating
  const [teacherToDelete, setTeacherToDelete] = useState(null); // Store teacher data to delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal state for delete confirmation
  const [currentView, setCurrentView] = useState('Teachers'); // Add currentView state
  // States for search/filtering
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('2023-2024');
  
  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const getTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/teachers/all', {
        params: {
          dateFrom,
          dateTo,
          academicYear,
        },
      });
      setTeachers(response.data);
    } catch (error) {
      console.error('There was an error fetching teachers:', error);
    }
  };

  useEffect(() => {
    getTeachers();
  }, [dateFrom, dateTo, academicYear]);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

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
              placeholder="Search..."
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

          {/* Additional Filters Section */}
          {currentView === "Activity Log" && (
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

            <IconButton onClick={getTeachers}>
              <FilterListIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>
        )}

          {/* Action Buttons Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column', // Stack buttons vertically
              alignItems: 'flex-end',
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={currentView === "Activity Log" ? "contained" : "outlined"}
                
                onClick={() => setCurrentView("Activity Log")} // Toggle to Activity Log
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  backgroundColor: currentView === "Activity Log" ? "#F8C400" : "inherit",
                  '&:hover': { backgroundColor: '#DCC532' },
                }}
              >
                Activity Log
              </Button>

              <Button
                variant={currentView === "Teachers" ? "contained" : "outlined"}
                onClick={() => setCurrentView("Teachers")} // Toggle to Teachers
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  backgroundColor: currentView === "Teachers" ? "#F8C400" : "inherit",
                  '&:hover': { backgroundColor: '#DCC532' },
                }}
              >
                Teachers
              </Button>
            </Box>

            {currentView === "Teachers" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenForm} // Open add teacher form
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  backgroundColor: '#8C383E',
                  '&:hover': { backgroundColor: '#610A0C' },
                }}
              >
                Add Teacher
              </Button>
            )}
          </Box>

          {/* Table Section */}
          <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        {currentView === "Teachers" ? (
          <>
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
          </>
        ) : (
          <>
            <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
              Log ID
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
              Date
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
              Activity
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFD700' }}>
              Description
            </TableCell>
          </>
        )}
      </TableRow>
    </TableHead>
    <TableBody>
      {currentView === "Teachers" ? (
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
            <TableCell>{`${teacher.firstName} ${teacher.lastName}`}</TableCell>
            <TableCell>{teacher.grade}</TableCell>
            <TableCell>{teacher.section}</TableCell>
            <TableCell>{teacher.subject}</TableCell>
            <TableCell>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenUpdateForm(teacher)}
                sx={{ marginRight: 1, backgroundColor: '#FFB300', '&:hover': { backgroundColor: '#F57C00' } }}
              >
                Update
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleOpenDeleteModal(teacher)}
                sx={{ backgroundColor: '#F44336', '&:hover': { backgroundColor: '#D32F2F' } }}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} align="center">
            No activity logs yet.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>


          {currentView === "Teachers" && (
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
          )}
        </Box>
      </Box>

      {/* Create Teacher Form Modal */}
      <CreateTeacherForm open={isFormOpen} onClose={handleCloseForm} />

      {/* Update Teacher Form Modal */}
      {isUpdateFormOpen && (
        <UpdateTeacherForm
          teacherData={currentTeacher}
          open={isUpdateFormOpen}
          onClose={handleCloseUpdateForm}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteTeacher}
      />
    </>
  );
};

export default LibrarianManageTeacher;
