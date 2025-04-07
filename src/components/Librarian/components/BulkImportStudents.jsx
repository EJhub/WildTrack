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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Link,
  Tooltip,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as XLSX from 'xlsx';
import api from '../../../utils/api';

const BulkImportStudents = forwardRef(({ open, onClose, onSuccess, initialStep, onStepChange }, ref) => {
  const [activeStep, setActiveStep] = useState(initialStep || 0);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [importResults, setImportResults] = useState({ successful: 0, failed: 0, errors: [], successfulImports: [] });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [copiedPasswordId, setCopiedPasswordId] = useState(null);
  const fileInputRef = useRef(null);

  const steps = ['Upload Template', 'Validate Data', 'Import Students'];
  
  // Reset when dialog opens
  useEffect(() => {
    if (open && initialStep === 0) {
      handleReset();
    }
  }, [open, initialStep]);
  
  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: handleReset
  }));
  
  const generateTemplate = () => {
    // Create sample data
    const data = [
      {
        'First Name*': 'John',
        'Middle Name': 'David',
        'Last Name*': 'Smith',
        'ID Number*': '2023-1001',
        'Grade*': 'Grade 5',
        'Section*': 'Faith',
        'Academic Year*': '2023-2024'
      },
      {
        'First Name*': 'Jane',
        'Middle Name': '',
        'Last Name*': 'Doe',
        'ID Number*': '2023-1002',
        'Grade*': 'Grade 6',
        'Section*': 'Love',
        'Academic Year*': '2023-2024'
      }
    ];

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add a note about required fields
    XLSX.utils.sheet_add_aoa(ws, [
      ['Fields marked with * are required'],
      ['Supported grades: Nursery, Kinder, Preparatory, Grade 1-6'],
      ['Section must exist in the system'],
      ['Academic Year format: YYYY-YYYY (e.g., 2023-2024)']
    ], { origin: { r: data.length + 2, c: 0 } });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Student Import Template');
    
    // Generate and download the file
    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setParsedData(jsonData);
        validateData(jsonData);
      } catch (error) {
        console.error('Error parsing file:', error);
        setErrors([{ message: 'Could not parse file. Please ensure it is a valid Excel or CSV file.' }]);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const validateData = (data) => {
    const validationResults = [];
    const requiredFields = ['First Name*', 'Last Name*', 'ID Number*', 'Grade*', 'Section*', 'Academic Year*'];
    
    // Track duplicate IDs
    const idNumbers = new Set();
    
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have a header row
      const rowErrors = [];
      
      // Check required fields
      requiredFields.forEach(field => {
        const fieldName = field.replace('*', '').trim();
        const value = row[field];
        if (!value) {
          rowErrors.push(`Missing required field: ${fieldName}`);
        }
      });
      
      // Validate name fields (letters only)
      if (row['First Name*'] && !/^[A-Za-z\s]+$/.test(row['First Name*'])) {
        rowErrors.push('First name should contain letters only');
      }
      
      if (row['Last Name*'] && !/^[A-Za-z\s]+$/.test(row['Last Name*'])) {
        rowErrors.push('Last name should contain letters only');
      }
      
      if (row['Middle Name'] && !/^[A-Za-z\s]*$/.test(row['Middle Name'])) {
        rowErrors.push('Middle name should contain letters only');
      }
      
      // Validate ID format
      if (row['ID Number*'] && !/^[0-9-]+$/.test(row['ID Number*'])) {
        rowErrors.push('ID Number should contain only numbers and dashes');
      }
      
      // Check for duplicate IDs
      if (row['ID Number*']) {
        if (idNumbers.has(row['ID Number*'])) {
          rowErrors.push('Duplicate ID Number in the file');
        } else {
          idNumbers.add(row['ID Number*']);
        }
      }
      
      validationResults.push({
        row: rowNumber,
        data: row,
        errors: rowErrors,
        valid: rowErrors.length === 0
      });
    });
    
    setValidationResults(validationResults);
    return validationResults;
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    
    const validRows = validationResults.filter(row => row.valid);
    const totalRows = validRows.length;
    let successful = 0;
    let failed = 0;
    const importErrors = [];
    const successfulImports = [];
    
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i].data;
      
      // Update progress
      setImportProgress(Math.round(((i + 1) / totalRows) * 100));
      
      try {
        // Map spreadsheet columns to API fields
        const student = {
          firstName: row['First Name*'],
          lastName: row['Last Name*'],
          middleName: row['Middle Name'] || '',
          idNumber: row['ID Number*'],
          grade: row['Grade*'],
          section: row['Section*'],
          academicYear: row['Academic Year*'],
          role: 'Student'
        };
        
        // Call API to create student
        const response = await api.post('/students/register', student);
        
        // Store successful import with generated password
        if (response.data.temporaryPassword) {
          successfulImports.push({
            idNumber: student.idNumber,
            name: `${student.firstName} ${student.lastName}`,
            password: response.data.temporaryPassword
          });
        } else {
          successfulImports.push({
            idNumber: student.idNumber,
            name: `${student.firstName} ${student.lastName}`,
            password: 'Password not returned by API'
          });
        }
        
        successful++;
      } catch (error) {
        // Extract error message from API response
        const errorMsg = error.response?.data?.error || 'Unknown error occurred';
        importErrors.push({
          row: validRows[i].row,
          idNumber: row['ID Number*'],
          name: `${row['First Name*']} ${row['Last Name*']}`,
          message: errorMsg
        });
        failed++;
      }
    }
    
    const results = {
      successful,
      failed,
      errors: importErrors,
      successfulImports
    };
    
    setImportResults(results);
    setIsImporting(false);
    setImportProgress(100);
    
    // Move to the results step
    setActiveStep(2);
    
    // Notify parent component of success but stay on results screen
    if (successful > 0) {
      onSuccess(results);
    }

    // Update step if parent needs to know
    if (onStepChange) {
      onStepChange(2);
    }
  };

  const handleNext = () => {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    if (onStepChange) {
      onStepChange(nextStep);
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    if (onStepChange) {
      onStepChange(prevStep);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setValidationResults([]);
    setImportResults({ successful: 0, failed: 0, errors: [], successfulImports: [] });
    setIsImporting(false);
    setImportProgress(0);
    setCopiedPasswordId(null);
    if (onStepChange) {
      onStepChange(0);
    }
  };

  const downloadErrorReport = () => {
    // Create workbook with error data
    const wb = XLSX.utils.book_new();
    const errorData = importResults.errors.map(error => ({
      'Row': error.row,
      'ID Number': error.idNumber,
      'Name': error.name,
      'Error Message': error.message
    }));
    
    const ws = XLSX.utils.json_to_sheet(errorData);
    XLSX.utils.book_append_sheet(wb, ws, 'Import Errors');
    
    // Generate and download the file
    XLSX.writeFile(wb, 'student_import_errors.xlsx');
  };
  
  const downloadPasswordsReport = () => {
    if (!importResults || !importResults.successfulImports || !importResults.successfulImports.length) {
      return;
    }
    
    // Create workbook with password data
    const wb = XLSX.utils.book_new();
    const passwordData = importResults.successfulImports.map(student => ({
      'ID Number': student.idNumber,
      'Name': student.name,
      'Temporary Password': student.password
    }));
    
    const ws = XLSX.utils.json_to_sheet(passwordData);
    XLSX.utils.book_append_sheet(wb, ws, 'Student Passwords');
    
    // Generate and download the file
    XLSX.writeFile(wb, 'student_passwords.xlsx');
  };
  
  const copyPassword = (password, idNumber) => {
    navigator.clipboard.writeText(password);
    setCopiedPasswordId(idNumber);
    setTimeout(() => setCopiedPasswordId(null), 2000); // Reset after 2 seconds
  };

  return (
    <Dialog 
      open={open} 
      onClose={isImporting ? undefined : onClose}
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
        <Typography variant="h6">Bulk Import Students</Typography>
        <IconButton onClick={onClose} disabled={isImporting}>
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

        {/* Import Progress - Shown during import regardless of step */}
        {isImporting && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Confirm Import
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ mb: 1 }}>
                Importing students... ({importProgress}%)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={importProgress} 
                sx={{ height: 10, borderRadius: 5 }} 
              />
            </Box>
          </Box>
        )}

        {/* Step 1: Upload Template */}
        {activeStep === 0 && !isImporting && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upload Student Data File
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
              Please download our template file first, fill it with student data, then upload it.
              Required fields are marked with an asterisk (*).
            </Alert>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={generateTemplate}
              sx={{ mb: 3 }}
            >
              Download Template
            </Button>
            
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: '10px',
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                mb: 3,
                width: '100%',
                '&:hover': {
                  borderColor: '#800000'
                }
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <UploadFileIcon sx={{ fontSize: 48, color: '#800000', mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                {file ? file.name : 'Click to upload CSV or Excel file'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Supports .xlsx, .xls, and .csv files
              </Typography>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".xlsx,.xls,.csv"
              />
            </Box>
            
            {errors.length > 0 && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {errors.map((error, index) => (
                  <Typography key={index}>{error.message}</Typography>
                ))}
              </Alert>
            )}
            
            {parsedData.length > 0 && (
              <Alert severity="success" sx={{ width: '100%' }}>
                Successfully parsed {parsedData.length} student records.
              </Alert>
            )}
          </Box>
        )}

        {/* Step 2: Validate Data */}
        {activeStep === 1 && !isImporting && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Validate Student Data
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review the data below. Invalid rows are highlighted in red and will be skipped during import.
            </Alert>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Validation Summary:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, mt: 1, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography>
                    Valid: {validationResults.filter(r => r.valid).length} students
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography>
                    Invalid: {validationResults.filter(r => !r.valid).length} students
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Middle Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validationResults.map((result) => (
                    <TableRow
                      key={result.row}
                      sx={{
                        backgroundColor: result.valid ? 'inherit' : '#ffebee'
                      }}
                    >
                      <TableCell>{result.row}</TableCell>
                      <TableCell>{result.data['First Name*']}</TableCell>
                      <TableCell>{result.data['Middle Name'] || '-'}</TableCell>
                      <TableCell>{result.data['Last Name*']}</TableCell>
                      <TableCell>{result.data['ID Number*']}</TableCell>
                      <TableCell>{result.data['Grade*']}</TableCell>
                      <TableCell>{result.data['Section*']}</TableCell>
                      <TableCell>{result.data['Academic Year*']}</TableCell>
                      <TableCell>
                        {result.valid ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Valid</Typography>
                          </Box>
                        ) : (
                          <Tooltip title={result.errors.join('\n')} arrow>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ErrorIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">Invalid</Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Step 3: Import Results */}
        {activeStep === 2 && !isImporting && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Import Results
            </Typography>
            
            {/* Success message with temporary passwords if imports were successful */}
            {importResults.successful > 0 && (
              <Box sx={{ mb: 4 }}>
                <Alert 
                  severity="success"
                  icon={<CheckCircleOutlineIcon />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {importResults.successful} students successfully imported
                  </Typography>
                  <Typography variant="body2">
                    Below are the temporary passwords generated for each student. Please save this information as it will only be shown once.
                  </Typography>
                </Alert>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={downloadPasswordsReport}
                    sx={{
                      color: '#800000',
                      borderColor: '#800000',
                      '&:hover': { borderColor: '#990000', backgroundColor: '#f8f8f8' }
                    }}
                  >
                    Download All Passwords
                  </Button>
                </Box>
                
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>ID Number</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Temporary Password</TableCell>
                        <TableCell align="center">Copy</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResults.successfulImports.map((student) => (
                        <TableRow key={student.idNumber} hover>
                          <TableCell>{student.idNumber}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell 
                            sx={{ 
                              fontFamily: 'monospace', 
                              backgroundColor: '#f9f9f9',
                              fontWeight: 'medium'
                            }}
                          >
                            {student.password}
                          </TableCell>
                          <TableCell align="center">
                            {copiedPasswordId === student.idNumber ? (
                              <Chip
                                label="Copied!"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Tooltip title="Copy password">
                                <IconButton 
                                  onClick={() => copyPassword(student.password, student.idNumber)}
                                  color="primary"
                                  size="small"
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Overall import summary */}
            <Alert 
              severity={importResults.failed === 0 ? "success" : "warning"} 
              sx={{ mb: 3 }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Import completed
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography>Successfully imported: {importResults.successful} students</Typography>
                <Typography>Failed to import: {importResults.failed} students</Typography>
              </Box>
            </Alert>
            
            {/* Error details section */}
            {importResults.errors.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Error Details:
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={downloadErrorReport}
                  >
                    Download Error Report
                  </Button>
                </Box>
                
                <TableContainer component={Paper} sx={{ maxHeight: 250, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>ID Number</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResults.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.idNumber}</TableCell>
                          <TableCell>{error.name}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  backgroundColor: '#800000',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#990000' },
                  mr: 2
                }}
              >
                Import More Students
              </Button>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  color: '#800000',
                  borderColor: '#800000',
                  '&:hover': { borderColor: '#990000', backgroundColor: '#f8f8f8' }
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      {(activeStep < 2 || isImporting) && (
        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid #eee', pt: 2 }}>
          <Button 
            onClick={handleBack} 
            disabled={activeStep === 0 || isImporting}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            onClick={onClose}
            sx={{ mr: 1 }}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === 1 ? handleImport : handleNext}
            disabled={
              (activeStep === 0 && (!parsedData.length || errors.length > 0)) ||
              (activeStep === 1 && validationResults.filter(r => r.valid).length === 0) ||
              isImporting
            }
            sx={{
              backgroundColor: '#800000',
              '&:hover': { backgroundColor: '#990000' },
              color: '#fff'
            }}
          >
            {activeStep === 1 ? 'Import Students' : 'Next'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});

BulkImportStudents.displayName = 'BulkImportStudents';

export default BulkImportStudents;