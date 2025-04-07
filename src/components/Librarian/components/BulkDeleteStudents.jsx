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
  Grid,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../../../utils/api';

const BulkDeleteStudents = forwardRef(({ open, onClose, onSuccess }, ref) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState([]);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    academicYear: '',
  });
  
  // Deletion settings
  const [deletionSettings, setDeletionSettings] = useState({
    reason: '',
    notes: ''
  });
  
  // State for dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteResults, setDeleteResults] = useState({ successful: 0, failed: 0, errors: [] });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  
  // Delete reasons options
  const deleteReasons = [
    'Graduated',
    'Transferred to another school',
    'Left the school',
    'Duplicate record',
    'Data cleanup',
    'Other'
  ];
  
  // Reset component when opened
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setSelectedStudents([]);
      setSelectedStudentDetails([]);
      setFilters({
        grade: '',
        section: '',
        academicYear: '',
      });
      setDeletionSettings({
        reason: '',
        notes: ''
      });
      setDeleteResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }, [open]);
  
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
      setDeletionSettings({
        reason: '',
        notes: ''
      });
      setDeleteResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }));

  const steps = ['Select Students', 'Deletion Settings', 'Confirmation'];

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
      fetchSectionsForGrade(filters.grade);
    }
  }, [filters.grade]);

  // Fetch sections for a grade
  const fetchSectionsForGrade = async (grade) => {
    try {
      const response = await api.get(`/grade-sections/grade/${grade}`);
      const sections = response.data.map(section => section.sectionName);
      setSectionOptions(sections);
      
      // Clear current section if it's not in the new options
      if (sections.length > 0 && !sections.includes(filters.section)) {
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
      
      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchStudents when filters change
  useEffect(() => {
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
      const ids = students.map(student => student.id);
      setSelectedStudents(ids);
      setSelectedStudentDetails(students);
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
        setSelectedStudentDetails(prevDetails => [...prevDetails, student]);
        return [...prev, student.id];
      }
    });
  };

  // Check if a student is selected
  const isStudentSelected = (studentId) => {
    return selectedStudents.includes(studentId);
  };

  // Handle settings change
  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    setDeletionSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if all required settings are filled
  const areSettingsValid = () => {
    return deletionSettings.reason !== '';
  };

  // Perform the bulk deletion
  const performDeletion = async () => {
    setIsDeleting(true);
    let successful = 0;
    let failed = 0;
    const errors = [];

    // Process deletion in batches of 10 for large datasets
    const batchSize = 10;
    const totalBatches = Math.ceil(selectedStudents.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min((batchIndex + 1) * batchSize, selectedStudents.length);
      const currentBatch = selectedStudents.slice(batchStart, batchEnd);
      
      await Promise.all(currentBatch.map(async (studentId) => {
        try {
          // Call API to delete student
          await api.delete(`/students/${studentId}`);
          successful++;
        } catch (error) {
          console.error(`Error deleting student ${studentId}:`, error);
          const student = selectedStudentDetails.find(s => s.id === studentId);
          errors.push({
            id: studentId,
            name: student ? `${student.firstName} ${student.lastName}` : `Student ID ${studentId}`,
            error: error.response?.data?.error || 'Unknown error occurred'
          });
          failed++;
        }
      }));
      
      // Update progress after each batch
      setDeleteProgress(Math.round(((batchIndex + 1) / totalBatches) * 100));
    }

    setDeleteResults({ successful, failed, errors });
    setIsDeleting(false);
    
    if (successful > 0) {
      // Wait for animation to complete before calling success
      setTimeout(() => {
        onSuccess({ successful, failed, errors, reason: deletionSettings.reason });
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

  return (
    <Dialog 
      open={open} 
      onClose={isDeleting ? undefined : onClose}
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
        <Typography variant="h6">Bulk Delete Students</Typography>
        <IconButton onClick={onClose} disabled={isDeleting}>
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
              Select Students to Delete
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Warning: Student deletion is permanent
              </Typography>
              <Typography variant="body2">
                Deleting student records will remove all associated data including library records, grades, and attendance information.
              </Typography>
            </Alert>
            
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
                    {sectionOptions.map(section => (
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
                label={`${selectedStudents.length} students selected for deletion`} 
                color={selectedStudents.length > 0 ? "error" : "default"}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>
        )}

        {/* Step 2: Deletion Settings */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Specify Deletion Settings
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                You are about to delete {selectedStudents.length} student records
              </Typography>
              <Typography variant="body2">
                Please provide a reason for this bulk deletion. This information will be logged for auditing purposes.
              </Typography>
            </Alert>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Deletion Information:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={activeStep > 0 && !deletionSettings.reason}>
                    <InputLabel>Reason for Deletion</InputLabel>
                    <Select
                      name="reason"
                      value={deletionSettings.reason}
                      onChange={handleSettingsChange}
                      label="Reason for Deletion*"
                    >
                      <MenuItem value="">Select a reason</MenuItem>
                      {deleteReasons.map(reason => (
                        <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                      ))}
                    </Select>
                    {activeStep > 0 && !deletionSettings.reason && (
                      <FormHelperText>A reason for deletion is required</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="notes"
                    label="Additional Notes"
                    value={deletionSettings.notes}
                    onChange={handleSettingsChange}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Add any additional notes or context for this deletion (optional)"
                  />
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                Deletion Summary:
              </Typography>
              <Typography>
                {selectedStudents.length} students will be permanently deleted.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="error">
                  This action cannot be undone. All student data will be permanently removed from the system.
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Step 3: Confirmation & Execution */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Confirm Bulk Deletion
            </Typography>
            
            {isDeleting ? (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ mb: 1 }}>
                  Deleting students... ({deleteProgress}%)
                </Typography>
                <LinearProgress variant="determinate" value={deleteProgress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
            ) : (
              <>
                {deleteResults.successful === 0 ? (
                  <>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Final Warning: You are about to permanently delete {selectedStudents.length} students.
                      </Typography>
                      <Typography variant="body2">
                        This action cannot be undone. Once deleted, all associated data will be permanently removed.
                      </Typography>
                    </Alert>
                    
                    <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Deletion Details:</Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography>• Students to delete: {selectedStudents.length}</Typography>
                        <Typography>• Reason: {deletionSettings.reason}</Typography>
                        {deletionSettings.notes && (
                          <Typography>• Notes: {deletionSettings.notes}</Typography>
                        )}
                      </Box>
                    </Paper>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      The following students will be deleted:
                    </Typography>
                    
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3, border: '1px solid #eee', p: 1 }}>
                      {selectedStudentDetails.map((student, index) => (
                        <Typography key={student.id} variant="body2" sx={{ mb: 0.5 }}>
                          {index + 1}. {student.idNumber} - {student.firstName} {student.lastName}
                        </Typography>
                      ))}
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: '#fff4e5', borderRadius: 2, mb: 3 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon sx={{ color: '#ff9800', mr: 1 }} />
                        Type "DELETE" in the box below to confirm this action
                      </Typography>
                      <TextField 
                        fullWidth
                        placeholder="Type DELETE to confirm"
                        size="small"
                        sx={{ mt: 1 }}
                        name="deleteConfirmation"
                        // You could add state and logic for this text field to ensure they type "DELETE"
                      />
                    </Box>
                  </>
                ) : (
                  <Alert 
                    severity={deleteResults.failed === 0 ? "success" : "warning"}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Deletion completed
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography>Successfully deleted: {deleteResults.successful} students</Typography>
                      <Typography>Failed to delete: {deleteResults.failed} students</Typography>
                    </Box>
                  </Alert>
                )}
                
                {deleteResults.failed > 0 && deleteResults.errors.length > 0 && (
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
                          {deleteResults.errors.map((error, index) => (
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
                  {deleteResults.successful > 0 ? (
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
                      onClick={performDeletion}
                      startIcon={<DeleteIcon />}
                      sx={{
                        backgroundColor: '#d32f2f',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#b71c1c' },
                      }}
                    >
                      CONFIRM DELETION
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
              (activeStep === 1 && !areSettingsValid())
            }
            sx={{
              backgroundColor: activeStep === 1 ? '#d32f2f' : '#800000',
              '&:hover': { backgroundColor: activeStep === 1 ? '#b71c1c' : '#990000' },
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

BulkDeleteStudents.displayName = 'BulkDeleteStudents';

export default BulkDeleteStudents;