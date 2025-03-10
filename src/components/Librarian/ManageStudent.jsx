import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import AcademicYearTable from './components/AcademicYearTable';
import AddAcademicYear from './components/AddAcademicYear';
import AddGradeSection from './components/AddGradeSection';
import GradeSectionTable from './components/GradeSectionTable';
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
  Button,
  TablePagination,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import CreateStudentForm from './components/CreateStudentForm';
import UpdateStudentForm from './components/UpdateStudentForm';
import DeleteConfirmation from './components/DeleteConfirmation';

const ManageStudent = () => {
  // States
  const [currentView, setCurrentView] = useState('students');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState({
    students: '',
    academicYear: '',
    gradeSection: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [studentToUpdate, setStudentToUpdate] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isAddAcademicYearModalOpen, setIsAddAcademicYearModalOpen] = useState(false);
  const [isAddGradeSectionModalOpen, setIsAddGradeSectionModalOpen] = useState(false);

  // Fetch students data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/students/all');
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError('An error occurred while fetching students.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Event Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleDeleteConfirmation = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      setData((prevData) => prevData.filter((student) => student.id !== studentToDelete.id));
      setIsDeleteConfirmationOpen(false);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  // Filter data based on search term
  const filteredData = data.filter((student) => {
    return (
      (student.firstName && student.firstName.toLowerCase().includes(searchTerm.students.toLowerCase())) ||
      (student.lastName && student.lastName.toLowerCase().includes(searchTerm.students.toLowerCase())) ||
      (student.idNumber && student.idNumber.includes(searchTerm.students))
    );
  });

  // Loading and Error states
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />

        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left' }}
          >
            {currentView === 'academic'
              ? 'Academic Year Management'
              : currentView === 'gradeSection'
              ? 'Grade and Section Management'
              : 'Manage Students'}
          </Typography>

          {/* Search and View Toggle Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
              gap: 2,
              justifyContent: 'space-between',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                variant="outlined"
                placeholder={
                  currentView === 'academic'
                    ? 'Search academic year...'
                    : currentView === 'gradeSection'
                    ? 'Search grade level...'
                    : 'Search by name or ID...'
                }
                size="small"
                value={
                  currentView === 'academic'
                    ? searchTerm.academicYear
                    : currentView === 'gradeSection'
                    ? searchTerm.gradeSection
                    : searchTerm.students
                }
                onChange={(event) =>
                  setSearchTerm({
                    ...searchTerm,
                    [currentView === 'academic'
                      ? 'academicYear'
                      : currentView === 'gradeSection'
                      ? 'gradeSection'
                      : 'students']: event.target.value,
                  })
                }
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  width: '400px',
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment/>
                  ),
                }}
              />

              <Button
                variant="outlined"
                onClick={() => setCurrentView(currentView === 'academic' ? 'students' : 'academic')}
                sx={{
                  color: currentView === 'academic' ? '#800000' : '#800000',
                  backgroundColor: currentView === 'academic' ? '#FFEB3B' : 'white',
                  border: '1px solid #800000',
                  fontWeight: 'bold',
                  height: '40px',
                  '&:hover': {
                    backgroundColor: '#FFEB3B',
                    color: '#800000',
                  },
                }}
              >
                Academic Year
              </Button>

              <Button
                variant="outlined"
                onClick={() => setCurrentView(currentView === 'gradeSection' ? 'students' : 'gradeSection')}
                sx={{
                  color: currentView === 'gradeSection' ? '#800000' : '#800000',
                  backgroundColor: currentView === 'gradeSection' ? '#FFEB3B' : 'white',
                  border: '1px solid #800000',
                  fontWeight: 'bold',
                  height: '40px',
                  '&:hover': {
                    backgroundColor: '#FFEB3B',
                    color: '#800000',
                  },
                }}
              >
                Grade and Section
              </Button>
            </Box>

            {currentView === 'students' && (
              <Button
                variant="outlined"
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
                  '&:hover': {
                    backgroundColor: '#940000',
                    color: '#FFEB3B',
                  },
                }}
              >
                <AddIcon sx={{ marginRight: 1 }} />
                Add Student
              </Button>
            )}

            {currentView === 'academic' && (
              <Button
                variant="outlined"
                onClick={() => setIsAddAcademicYearModalOpen(true)}
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
                  '&:hover': {
                    backgroundColor: '#940000',
                    color: '#FFEB3B',
                  },
                }}
              >
                <AddIcon sx={{ marginRight: 1 }} />
                Add Academic Year
              </Button>
            )}

            {currentView === 'gradeSection' && (
              <Button
                variant="outlined"
                onClick={() => setIsAddGradeSectionModalOpen(true)}
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
                  '&:hover': {
                    backgroundColor: '#940000',
                    color: '#FFEB3B',
                  },
                }}
              >
                <AddIcon sx={{ marginRight: 1 }} />
                Add Grade and Section
              </Button>
            )}
          </Box>

          {/* Content based on current view */}
          {currentView === 'students' && (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: '15px',
                  boxShadow: 3,
                  overflow: 'auto',
                  maxHeight: 'calc(100vh - 340px)',
                  marginTop: 3,
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                        ID Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                        GRADE & SECTION
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                        LIBRARY HOUR ASSOCIATED SUBJECT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                        ACTION
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((student, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{
                            backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFF',
                            '&:hover': { backgroundColor: '#FCEAEA' },
                          }}
                        >
                          <TableCell>{student.idNumber}</TableCell>
                          <TableCell>{`${student.firstName} ${student.middleName ? student.middleName.charAt(0) + '.' : ''} ${student.lastName}`}</TableCell>
                          <TableCell>{`${student.grade} - ${student.section}`}</TableCell>
                          <TableCell>{student.subject}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
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
                              onClick={() => {
                                setStudentToUpdate(student);
                                setIsUpdateFormOpen(true);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              sx={{
                                color: '#800000',
                                backgroundColor: '#F5B400',
                                border: '1px solid #FFEB3B',
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: '#FFEB3B',
                                  color: '#800000',
                                },
                              }}
                              onClick={() => {
                                setStudentToDelete(student);
                                setIsDeleteConfirmationOpen(true);
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

              <Box sx={{ position: 'relative', width: '100%' }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: 2,
                    width: '100%'
                  }}
                />
              </Box>
            </>
          )}

          {currentView === 'academic' && <AcademicYearTable />}

          {currentView === 'gradeSection' && <GradeSectionTable />}
        </Box>
      </Box>

      {/* Modals */}
      <CreateStudentForm open={isFormOpen} onClose={handleCloseForm} />
      <UpdateStudentForm
        open={isUpdateFormOpen}
        onClose={() => setIsUpdateFormOpen(false)}
        user={studentToUpdate}
        onUpdate={(updatedStudent) => {
          const updatedData = data.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student
          );
          setData(updatedData);
          setIsUpdateFormOpen(false);
        }}
      />
      <DeleteConfirmation
        open={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={handleDeleteConfirmation}
      />
      {/* New Modals */}
<AddAcademicYear 
  open={isAddAcademicYearModalOpen}
  onClose={() => setIsAddAcademicYearModalOpen(false)}
/>

<AddGradeSection 
  open={isAddGradeSectionModalOpen}
  onClose={() => setIsAddGradeSectionModalOpen(false)}
/>
    </>
  );
};

export default ManageStudent;