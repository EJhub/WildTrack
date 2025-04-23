import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Step,
  Stepper,
  StepLabel,
  IconButton,
  Alert,
  Paper,
  Checkbox,
  FormControl,
  TextField,
  MenuItem,
  InputLabel,
  Select,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../../utils/api';

const BulkUpdateStudents = forwardRef(({ open, onClose, onSuccess }, ref) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState([]);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    academicYear: '',
  });
  
  // Fields to update
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    grade: '',
    section: '',
    academicYear: ''
  });
  
  // State for dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [filterSectionOptions, setFilterSectionOptions] = useState([]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateResults, setUpdateResults] = useState({ successful: 0, failed: 0, errors: [] });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  
  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      setActiveStep(0);
      setSelectedStudents([]);
      setSelectedStudentDetails([]);
      setFilters({
        grade: '',
        section: '',
        academicYear: '',
      });
      setFieldsToUpdate({
        grade: '',
        section: '',
        academicYear: ''
      });
      setUpdateResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }));

  const steps = ['Select Students', 'Update Parameters', 'Confirmation'];


  useEffect(() => {
    // Reset to first step when dialog opens
    if (open) {
      setActiveStep(0);
      setSelectedStudents([]);
      setSelectedStudentDetails([]);
      setFieldsToUpdate({
        grade: '',
        section: '',
        academicYear: ''
      });
      setUpdateResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }, [open]);

  // Fetch dropdown options when component mounts
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch Grade Levels
        const gradesResponse = await api.get('/grade-sections/all');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        setGradeOptions(uniqueGrades);

        // Fetch Academic Years
        const academicYearsResponse = await api.get('/academic-years/all');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);

      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Update section options when grade changes in filters
  useEffect(() => {
    if (filters.grade) {
      fetchSectionsForGrade(filters.grade, setFilterSectionOptions);
    }
  }, [filters.grade]);

  // Update section options when grade changes in fields to update
  useEffect(() => {
    if (fieldsToUpdate.grade) {
      fetchSectionsForGrade(fieldsToUpdate.grade, setSectionOptions);
    }
  }, [fieldsToUpdate.grade]);

  // Fetch sections for a grade
  const fetchSectionsForGrade = async (grade, setSections) => {
    try {
      const response = await api.get(`/grade-sections/grade/${grade}`);
      const sections = response.data.map(section => section.sectionName);
      setSections(sections);
      
      // Clear current section if it's not in the new options
      if (setSections === setSectionOptions && sections.length > 0 && !sections.includes(fieldsToUpdate.section)) {
        setFieldsToUpdate(prev => ({
          ...prev,
          section: ''
        }));
      } else if (setSections === setFilterSectionOptions && sections.length > 0 && !sections.includes(filters.section)) {
        setFilters(prev => ({
          ...prev,
          section: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };


 // Fetch students based on filters
const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = '/students/all';
      const queryParams = [];
      
      if (filters.grade) queryParams.push(`grade=${encodeURIComponent(filters.grade)}`);
      if (filters.section) queryParams.push(`section=${encodeURIComponent(filters.section)}`);
      if (filters.academicYear) queryParams.push(`academicYear=${encodeURIComponent(filters.academicYear)}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await api.get(url);
      
      // Apply client-side filtering as a backup in case the server doesn't support filtering
      let filteredStudents = response.data;
      
      if (filters.grade || filters.section || filters.academicYear) {
        filteredStudents = response.data.filter(student => {
          const gradeMatch = !filters.grade || student.grade === filters.grade;
          const sectionMatch = !filters.section || student.section === filters.section;
          const yearMatch = !filters.academicYear || student.academicYear === filters.academicYear;
          
          return gradeMatch && sectionMatch && yearMatch;
        });
      }
      
      // Remove duplicates based on student ID
      const uniqueStudents = Array.from(
        new Map(filteredStudents.map(student => [student.id, student])).values()
      );
      
      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchStudents when filters change
  React.useEffect(() => {
    if (open && activeStep === 0) {
      fetchStudents();
    }
  }, [filters, open, activeStep]);

  // Logic for selecting all filtered students
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
      setSelectedStudentDetails([]);
    } else {
      // Get unique student IDs
      const uniqueIds = [...new Set(students.map(student => student.id))];
      setSelectedStudents(uniqueIds);
      
      // Create unique student details array using Map to prevent duplicates
      const uniqueStudents = Array.from(
        new Map(students.map(student => [student.id, student])).values()
      );
      setSelectedStudentDetails(uniqueStudents);
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual student selection
  const handleToggleStudent = (student) => {
    setSelectedStudents(prev => {
      if (prev.includes(student.id)) {
        setSelectedStudentDetails(prevDetails => 
          prevDetails.filter(s => s.id !== student.id)
        );
        return prev.filter(id => id !== student.id);
      } else {
        // Check if student is already in the details array to prevent duplicates
        if (!selectedStudentDetails.some(s => s.id === student.id)) {
          setSelectedStudentDetails(prevDetails => [...prevDetails, student]);
        }
        return [...prev, student.id];
      }
    });
  };

  // Check if a student is selected
  const isStudentSelected = (studentId) => {
    return selectedStudents.includes(studentId);
  };

  // Handle changing grade in the update parameters
  const handleGradeChange = (event) => {
    setFieldsToUpdate(prev => ({
      ...prev,
      grade: event.target.value,
      section: '' // Reset section when grade changes
    }));
  };

  // Handle changing section in the update parameters
  const handleSectionChange = (event) => {
    setFieldsToUpdate(prev => ({
      ...prev,
      section: event.target.value
    }));
  };

  // Handle changing academic year in the update parameters
  const handleAcademicYearChange = (event) => {
    setFieldsToUpdate(prev => ({
      ...prev,
      academicYear: event.target.value
    }));
  };

  // Check if all fields have values
  const allFieldsHaveValues = () => {
    // At least grade + section or academicYear must be filled
    return (
      (fieldsToUpdate.grade !== '' && fieldsToUpdate.section !== '') || 
      fieldsToUpdate.academicYear !== ''
    );
  };

  // Perform the bulk update
  const performUpdate = async () => {
    setIsUpdating(true);
    let successful = 0;
    let failed = 0;
    const errors = [];

    // Get unique students to update
    const uniqueStudentIds = [...new Set(selectedStudents)];
    const uniqueStudentDetails = Array.from(
      new Map(selectedStudentDetails.map(student => [student.id, student])).values()
    );

    for (let i = 0; i < uniqueStudentIds.length; i++) {
      try {
        const studentId = uniqueStudentIds[i];
        
        // Get the current student data from the selectedStudentDetails array
        const currentStudent = uniqueStudentDetails.find(s => s.id === studentId);
        
        // Create update data object with only selected fields while preserving existing data
        const updateData = {
          // Include all required fields from the existing student record
          role: 'Student',
          firstName: currentStudent.firstName,
          lastName: currentStudent.lastName,
          middleName: currentStudent.middleName || '',
          idNumber: currentStudent.idNumber,
          // Include other existing fields that might be required
          grade: currentStudent.grade,
          section: currentStudent.section,
          academicYear: currentStudent.academicYear
        };
        
        // Override with the fields to update
        if (fieldsToUpdate.grade && fieldsToUpdate.section) {
          updateData.grade = fieldsToUpdate.grade;
          updateData.section = fieldsToUpdate.section;
        }
        
        if (fieldsToUpdate.academicYear) {
          updateData.academicYear = fieldsToUpdate.academicYear;
        }
        
        // Update progress
        setUpdateProgress(Math.round(((i + 1) / uniqueStudentIds.length) * 100));
        
        // Call API to update student
        await api.put(`/students/${studentId}`, updateData);
        successful++;
      } catch (error) {
        console.error(`Error updating student ${uniqueStudentIds[i]}:`, error);
        const student = uniqueStudentDetails.find(s => s.id === uniqueStudentIds[i]);
        errors.push({
          id: uniqueStudentIds[i],
          name: student ? `${student.firstName} ${student.lastName}` : `Student ID ${uniqueStudentIds[i]}`,
          error: error.response?.data?.error || 'Unknown error occurred'
        });
        failed++;
      }
    }

    setUpdateResults({ successful, failed, errors });
    setIsUpdating(false);
    
    if (successful > 0) {
      // Wait for animation to complete before calling success
      setTimeout(() => {
        onSuccess({ successful, failed, errors });
      }, 1000);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filters change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'grade') {
      setFilters({
        ...filters,
        grade: value,
        section: '' // Reset section when grade changes
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  // Get unique count of students
  const getUniqueStudentCount = () => {
    return new Set(selectedStudents).size;
  };

  return (
    <Dialog 
      open={open} 
      onClose={isUpdating ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        backgroundColor: '#f5f5f5',
      }}>
        <Typography variant="h6">Bulk Update Students</Typography>
        <IconButton onClick={onClose} disabled={isUpdating}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Select Students */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Students to Update
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter Students:</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 120, flexGrow: 1 }}>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    name="grade"
                    value={filters.grade}
                    onChange={handleFilterChange}
                    label="Grade"
                  >
                    <MenuItem value="">All Grades</MenuItem>
                    {gradeOptions.map(grade => (
                      <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 120, flexGrow: 1 }}>
                  <InputLabel>Section</InputLabel>
                  <Select
                    name="section"
                    value={filters.section}
                    onChange={handleFilterChange}
                    label="Section"
                    disabled={!filters.grade}
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {filterSectionOptions.map(section => (
                      <MenuItem key={section} value={section}>{section}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 150, flexGrow: 1 }}>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    name="academicYear"
                    value={filters.academicYear}
                    onChange={handleFilterChange}
                    label="Academic Year"
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {academicYearOptions.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography>
                {students.length} students match your filters
              </Typography>
              <Box>
                <Button 
                  onClick={handleSelectAll} 
                  variant="outlined" 
                  size="small" 
                  sx={{ 
                    mr: 1,
                    color: '#800000',
                    borderColor: '#800000',
                    '&:hover': { borderColor: '#990000', backgroundColor: '#f8f8f8' }
                  }}
                >
                  {selectAll ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
                            checked={students.length > 0 && selectedStudents.length === students.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>ID Number</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Grade & Section</TableCell>
                        <TableCell>Academic Year</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((student) => (
                          <TableRow 
                            key={student.id}
                            hover
                            onClick={() => handleToggleStudent(student)}
                            role="checkbox"
                            selected={isStudentSelected(student.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isStudentSelected(student.id)}
                                onChange={(event) => {
                                  event.stopPropagation();
                                  handleToggleStudent(student);
                                }}
                              />
                            </TableCell>
                            <TableCell>{student.idNumber}</TableCell>
                            <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                            <TableCell>{`${student.grade} - ${student.section}`}</TableCell>
                            <TableCell>{student.academicYear}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={students.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${getUniqueStudentCount()} students selected`} 
                color={selectedStudents.length > 0 ? "primary" : "default"}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>
        )}

        {/* Step 2: Update Parameters */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Specify Update Parameters
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Specify new values for the fields you want to update. All {getUniqueStudentCount()} selected students will be updated.
            </Alert>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Fields to Update:
              </Typography>
              
              <Grid container spacing={2}>
                {/* GRADE & SECTION (COMBINED) */}
                <Grid item xs={6}>
                  <TextField
                    label="Grade"
                    select
                    fullWidth
                    value={fieldsToUpdate.grade}
                    onChange={handleGradeChange}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="">Select grade</MenuItem>
                    {gradeOptions.map(grade => (
                      <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    label="Section"
                    select
                    fullWidth
                    value={fieldsToUpdate.section}
                    onChange={handleSectionChange}
                    disabled={!fieldsToUpdate.grade}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="">Select section</MenuItem>
                    {sectionOptions.map(section => (
                      <MenuItem key={section} value={section}>{section}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                {/* ACADEMIC YEAR */}
                <Grid item xs={12}>
                  <TextField
                    label="Academic Year"
                    select
                    fullWidth
                    value={fieldsToUpdate.academicYear}
                    onChange={handleAcademicYearChange}
                  >
                    <MenuItem value="">Select academic year</MenuItem>
                    {academicYearOptions.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
            
            {allFieldsHaveValues() && (
              <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                  Update Summary:
                </Typography>
                <Typography>
                  {getUniqueStudentCount()} students will have the following fields updated:
                </Typography>
                <Box sx={{ ml: 2, mt: 1 }}>
                  {fieldsToUpdate.grade && fieldsToUpdate.section && (
                    <Typography sx={{ mb: 0.5 }}>
                      • <strong>Grade & Section</strong>: {fieldsToUpdate.grade} - {fieldsToUpdate.section}
                    </Typography>
                  )}
                  {fieldsToUpdate.academicYear && (
                    <Typography sx={{ mb: 0.5 }}>
                      • <strong>Academic Year</strong>: {fieldsToUpdate.academicYear}
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* Step 3: Confirmation & Execution */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Confirm Bulk Update
            </Typography>
            
            {isUpdating ? (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1 }}>
                  Updating students... ({updateProgress}%)
                </Typography>
                <LinearProgress variant="determinate" value={updateProgress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
            ) : (
              <>
                {updateResults.successful === 0 ? (
                  <>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        You are about to update {getUniqueStudentCount()} students. 
                      </Typography>
                      <Typography variant="body2">
                        This action cannot be undone. Please review the details below and confirm.
                      </Typography>
                    </Alert>
                    
                    <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Update Details:</Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography>• Students to update: {getUniqueStudentCount()}</Typography>
                        {fieldsToUpdate.grade && fieldsToUpdate.section && (
                          <>
                            <Typography>• Grade: {fieldsToUpdate.grade}</Typography>
                            <Typography>• Section: {fieldsToUpdate.section}</Typography>
                          </>
                        )}
                        {fieldsToUpdate.academicYear && (
                          <Typography>• Academic Year: {fieldsToUpdate.academicYear}</Typography>
                        )}
                      </Box>
                    </Paper>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      The following students will be updated:
                    </Typography>
                    
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3, border: '1px solid #eee', p: 1 }}>
                      {/* Remove duplicates based on student ID and display unique entries */}
                      {Array.from(new Map(selectedStudentDetails.map(student => [student.id, student])).values())
                        .map((student, index) => (
                        <Typography key={student.id} variant="body2" sx={{ mb: 0.5 }}>
                          {index + 1}. {student.idNumber} - {student.firstName} {student.lastName}
                        </Typography>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Alert 
                    severity={updateResults.failed === 0 ? "success" : "warning"}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Update completed
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography>Successfully updated: {updateResults.successful} students</Typography>
                      <Typography>Failed to update: {updateResults.failed} students</Typography>
                    </Box>
                  </Alert>
                )}
                
                {updateResults.failed > 0 && updateResults.errors.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Error Details:
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Error</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {updateResults.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.name}</TableCell>
                              <TableCell>{error.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
                
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  {updateResults.successful > 0 ? (
                    <Button
                      variant="contained"
                      onClick={onClose}
                      sx={{
                        backgroundColor: '#800000',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#990000' },
                      }}
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={performUpdate}
                      sx={{
                        backgroundColor: '#800000',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#990000' },
                      }}
                    >
                      CONFIRM UPDATE
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      {activeStep < 2 && (
        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid #eee', pt: 2 }}>
          <Button 
            onClick={handleBack} 
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && selectedStudents.length === 0) ||
              (activeStep === 1 && !allFieldsHaveValues())
            }
            sx={{
              backgroundColor: '#800000',
              '&:hover': { backgroundColor: '#990000' },
              color: '#fff'
            }}
          >
            Next
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});

BulkUpdateStudents.displayName = 'BulkUpdateStudents';

export default BulkUpdateStudents;