import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api'; // Import the API utility
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
  // Get query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const resetPasswordUserId = queryParams.get('resetPasswordUserId');
  
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

  // Fetch students data with library hour subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch all students using the API utility
        const response = await api.get('/students/all');
        const studentsResult = response.data;
        
        // For each student, fetch their actual library requirements rather than grade-level potential subjects
        const enhancedStudents = await Promise.all(studentsResult.map(async student => {
          try {
            // Check if this student has initialized requirements
            const progressResponse = await api.get(`/library-progress/${student.idNumber}`);
            
            const progressData = progressResponse.data;
            
            // Only display subjects if the student has requirements and they're not empty
            if (progressData && progressData.length > 0) {
              // Extract only the subjects that have actual requirements
              // Group by subject to remove duplicates
              const actualSubjects = [...new Set(progressData.map(req => req.subject))];
              
              if (actualSubjects.length > 0) {
                return {
                  ...student,
                  subject: actualSubjects.join(', ')
                };
              }
            }
            
            // No requirements found or API error
            return {
              ...student,
              subject: "No library hours assigned"
            };
            
          } catch (error) {
            console.error(`Error checking library requirements for student ${student.idNumber}:`, error);
            return {
              ...student,
              subject: "No library hours assigned"
            };
          }
        }));
        
        setData(enhancedStudents);
        
        // If there's a resetPasswordUserId param, find and open that student's form
        if (resetPasswordUserId) {
          const studentId = parseInt(resetPasswordUserId, 10);
          const student = enhancedStudents.find(s => s.id === studentId);
          if (student) {
            setStudentToUpdate(student);
            setIsUpdateFormOpen(true);
          }
        }
      } catch (error) {
        setError('An error occurred while fetching students.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resetPasswordUserId]);

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
      // Use the API utility for delete request
      await api.delete(`/students/${studentToDelete.id}`);
      
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
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh',
          overflow: 'hidden' // Prevent outer document scrolling
        }}
      >
        <SideBar />

        <Box
          sx={{
            padding: '32px 32px 120px 32px', // Increased bottom padding for better scrolling
            flexGrow: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
            '&::-webkit-scrollbar': { // Style scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
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
                  color: currentView === 'academic' ? 'black' : 'black',
                  backgroundColor: currentView === 'academic' ? '#FFEB3B' : '#F8C400',
                  border: '1px solid #F8C400',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                  fontSize: '11px', // Added font size here
                  height: '40px',
                  '&:hover': {
                    backgroundColor: '#FFDF16',

                  },
                }}
              >
                Academic Year
              </Button>

              <Button
                variant="outlined"
                onClick={() => setCurrentView(currentView === 'gradeSection' ? 'students' : 'gradeSection')}
                sx={{
                  color: currentView === 'academic' ? 'black' : 'black',
                  backgroundColor: currentView === 'academic' ? '#FFEB3B' : '#F8C400',
                  border: '1px solid #F8C400',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                  fontSize: '11px', // Added font size here
                  height: '40px',
                  '&:hover': {
                    backgroundColor: '#FFDF16',

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
                fontSize: '11px', // Added font size here
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
                  fontSize: '11px', // Added font size here
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
                  fontSize: '11px', // Added font size here
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
                  overflow: 'visible', // Changed from 'auto' to 'visible' to ensure pagination is visible
                  flexGrow: 1, // Allow table to grow with content
                  marginBottom: 5, // Added margin bottom for pagination visibility
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                        ID Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                        GRADE & SECTION
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                        LIBRARY HOUR ASSOCIATED SUBJECT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
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
                          <TableCell>
                            {student.subject && student.subject !== "No library hours assigned" ? (
                              <Typography 
                                sx={{ 
                                  fontWeight: 'medium',
                                  color: '#800000'  // Uses your theme's maroon color
                                }}
                              >
                                {student.subject}
                              </Typography>
                            ) : (
                              <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                                No library hours assigned
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              sx={{
                                color: 'black',
                                backgroundColor: '#FFDF16',
                                fontSize: '11px',
                                border: '1px solid #FFEB3B',
                                marginRight: 1,
                                fontWeight: 'bold',
                                '&:hover': {
                                  backgroundColor: '#FFEB3B',
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
                                color: 'white',
                                backgroundColor: '#8C383E',
                                border: '1px solid #8C383E',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                '&:hover': {
                                  backgroundColor: '#8B0000',

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
                
                {/* Integrated pagination inside the TableContainer */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    paddingTop: 2,
                    paddingBottom: 2,
                    backgroundColor: 'transparent',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    position: 'relative', // Ensure visibility
                  }}
                />
              </TableContainer>
            </>
          )}

          {currentView === 'academic' && <AcademicYearTable />}

          {currentView === 'gradeSection' && <GradeSectionTable />}
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 60, width: '100%' }} />
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