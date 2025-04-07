import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import AcademicYearTable from './components/AcademicYearTable';
import AddAcademicYear from './components/AddAcademicYear';
import AddGradeSection from './components/AddGradeSection';
import GradeSectionTable from './components/GradeSectionTable';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import BulkUpdateStudents from './components/BulkUpdateStudents';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../utils/api';
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
  CircularProgress,
  Tooltip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CreateStudentForm from './components/CreateStudentForm';
import UpdateStudentForm from './components/UpdateStudentForm';
import DeleteConfirmation from './components/DeleteConfirmation';
import BulkImportStudents from './components/BulkImportStudents';
import BulkDeleteStudents from './components/BulkDeleteStudents';
import { Search as SearchIcon, Info as InfoIcon } from '@mui/icons-material';

const ManageStudent = () => {
  // Get query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const resetPasswordUserId = queryParams.get('resetPasswordUserId');
  
  // States
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportStep, setBulkImportStep] = useState(0); // Track the current step
  const [currentView, setCurrentView] = useState('students');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableRefreshing, setTableRefreshing] = useState(false); // For table-only refreshes
  
  // Use a single search term for all views
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  // Academic year and grade-section data that the search will apply to
  const [academicYearData, setAcademicYearData] = useState([]);
  const [gradeSectionData, setGradeSectionData] = useState([]);

  // Create a reference for the bulk import handler
  const bulkImportRef = useRef(null);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const bulkUpdateRef = useRef(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const bulkDeleteRef = useRef(null);

  // Define fetchData outside useEffect so it can be called from other functions
  const fetchData = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set authorization header for all requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // First fetch all students
      const response = await api.get('/students/all');
      const studentsResult = response.data;
      
      // For each student, fetch their actual library requirements
      const enhancedStudents = await Promise.all(studentsResult.map(async student => {
        try {
          // Check if this student has initialized requirements
          const progressResponse = await api.get(`/library-progress/${student.idNumber}`);
          
          if (progressResponse.status === 200) {
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

      // Also fetch academic year data
      fetchAcademicYearData();
      
      // And grade section data
      fetchGradeSectionData();
      
    } catch (error) {
      setError('An error occurred while fetching students.');
      console.error(error);
    } finally {
      setLoading(false);
      setTableRefreshing(false); // Stop table-only refresh indicator
    }
  };

  // Fetch academic year data
  const fetchAcademicYearData = async () => {
    try {
      const response = await api.get('/academic-years/all');
      // Ensure every academic year has a status property
      const processedData = response.data.map(year => ({
        ...year,
        status: year.status || 'Active' // Default to 'Active' if status is not set
      }));
      setAcademicYearData(processedData);
    } catch (error) {
      console.error('Error fetching academic year data:', error);
    }
  };

  // Fetch grade section data
  const fetchGradeSectionData = async () => {
    try {
      const response = await api.get('/grade-sections/all');
      setGradeSectionData(response.data);
    } catch (error) {
      console.error('Error fetching grade section data:', error);
    }
  };

  // Table-only refresh function
  const refreshTableData = () => {
    setTableRefreshing(true);
    fetchData();
  };

  // Call fetchData when component mounts or resetPasswordUserId changes
  useEffect(() => {
    fetchData();
  }, [resetPasswordUserId]);

  // Get search placeholder text based on current view
  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'academic':
        return 'Search academic year...';
      case 'gradeSection':
        return 'Search grade level or section...';
      default:
        return 'Search by name, ID, grade, section, or subject...';
    }
  };

  // Get search tooltip text based on current view
  const getSearchTooltip = () => {
    switch (currentView) {
      case 'academic':
        return 'Search by academic year (YYYY-YYYY)';
      case 'gradeSection':
        return 'Search by grade level, section name, or advisor';
      default:
        return 'Search by name, ID number, grade, section, academic year, or subject';
    }
  };

  // Filter data based on view and search term
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      return data;
    }
    
    return data.filter((student) => {
      const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.toLowerCase();
      const gradeSection = `${student.grade} ${student.section}`.toLowerCase();
      
      return (
        fullName.includes(term) ||
        (student.idNumber && student.idNumber.toLowerCase().includes(term)) ||
        (student.grade && student.grade.toLowerCase().includes(term)) ||
        (student.section && student.section.toLowerCase().includes(term)) ||
        (student.academicYear && student.academicYear.toLowerCase().includes(term)) ||
        (student.subject && student.subject.toLowerCase().includes(term)) ||
        gradeSection.includes(term)
      );
    });
  };

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
      const token = localStorage.getItem("token");
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await api.delete(`/students/${studentToDelete.id}`);
      setData((prevData) => prevData.filter((student) => student.id !== studentToDelete.id));
      setIsDeleteConfirmationOpen(false);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  // Function to save bulk import step
  const handleBulkImportStepChange = (step) => {
    setBulkImportStep(step);
  };

  // Handle bulk import modal opening
  const handleOpenBulkImport = () => {
    setBulkImportStep(0); // Reset to first step when newly opened
    setIsBulkImportOpen(true);
  };

  const handleCloseBulkUpdate = () => {
    setIsBulkUpdateOpen(false);
  };
  
  // Handler for successful bulk import
  const handleBulkImportSuccess = (importResults) => {
    // Just refresh the table data
    refreshTableData();
    // We no longer need to set success data as it's displayed in the component
  };

  const handleBulkUpdateSuccess = (results) => {
    // Refresh the table with only a loading indicator
    refreshTableData();
  };

  const handleBulkDeleteSuccess = (results) => {
    // Refresh the table with only a loading indicator
    refreshTableData();
  };

  // Get filtered data
  const filteredData = getFilteredData();

  // Handle view change with search term persisting
  const handleViewChange = (newView) => {
    setCurrentView(newView);
    setPage(0); // Reset to first page when changing views
  };

  // Loading and Error states
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

          {/* Search and View Toggle Section - First Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
              justifyContent: 'space-between',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            {/* Search field on left */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, maxWidth: '500px' }}>
              <TextField
                variant="outlined"
                placeholder={getSearchPlaceholder()}
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  width: '100%',
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={getSearchTooltip()} arrow>
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
             
            </Box>

            {/* View toggle buttons on right */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleViewChange(currentView === 'academic' ? 'students' : 'academic')}
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
                onClick={() => handleViewChange(currentView === 'gradeSection' ? 'students' : 'gradeSection')}
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
          </Box>

          {/* Action Buttons - Second Row */}
          {currentView === 'students' && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 3,
                gap: 2,
                justifyContent: 'flex-end',
              }}
            >
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

              <Button
                variant="outlined"
                onClick={handleOpenBulkImport}
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
                <UploadFileIcon sx={{ marginRight: 1 }} />
                Bulk Import
              </Button>

              <Button
                variant="outlined"
                onClick={() => setIsBulkUpdateOpen(true)}
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
                <SystemUpdateAltIcon sx={{ marginRight: 1 }} />
                Bulk Update
              </Button>

              <Button
                variant="outlined"
                onClick={() => setIsBulkDeleteOpen(true)}
                sx={{
                  color: '#FFEB3B',
                  backgroundColor: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: '50px',
                  height: '40px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#b71c1c',
                    color: '#FFEB3B',
                  },
                }}
              >
                <DeleteIcon sx={{ marginRight: 1 }} />
                Bulk Delete
              </Button>
            </Box>
          )}

          {currentView === 'academic' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 3 }}>
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
            </Box>
          )}

          {currentView === 'gradeSection' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 3 }}>
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
            </Box>
          )}

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
                  position: 'relative', // For positioning the loading overlay
                }}
              >
                {/* Loading or refreshing overlay */}
                {(loading || tableRefreshing) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 10,
                    }}
                  >
                    <CircularProgress size={60} thickness={4} sx={{ color: '#800000' }} />
                    <Typography variant="h6" sx={{ mt: 2, color: '#800000', fontWeight: 'bold' }}>
                      {loading ? 'Loading students...' : 'Refreshing data...'}
                    </Typography>
                  </Box>
                )}
              
                <Table>
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
                      {/* New column for Academic Year */}
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                        ACADEMIC YEAR
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
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {searchTerm ? 'No students match your search criteria.' : 'No students found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData
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
                            {/* Display Academic Year */}
                            <TableCell>{student.academicYear || 'Not assigned'}</TableCell>
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
                        ))
                    )}
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

          {currentView === 'academic' && 
            <AcademicYearTable searchTerm={searchTerm} />
          }

          {currentView === 'gradeSection' && 
            <GradeSectionTable searchTerm={searchTerm} />
          }
          
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
      
      <BulkImportStudents
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={handleBulkImportSuccess}
        initialStep={bulkImportStep}
        onStepChange={handleBulkImportStepChange}
        ref={bulkImportRef}
      />
   
      <BulkUpdateStudents
        open={isBulkUpdateOpen}
        onClose={handleCloseBulkUpdate}
        onSuccess={handleBulkUpdateSuccess}
        ref={bulkUpdateRef}
      />

      <BulkDeleteStudents
        open={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onSuccess={handleBulkDeleteSuccess}
        ref={bulkDeleteRef}
      />
    </>
  );
};

export default ManageStudent;