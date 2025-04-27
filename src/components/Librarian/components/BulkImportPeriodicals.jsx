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
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as XLSX from 'xlsx';
import api from '../../../utils/api';

const BulkImportPeriodicals = forwardRef(({ open, onClose, onSuccess, initialStep, onStepChange }, ref) => {
  const [activeStep, setActiveStep] = useState(initialStep || 0);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [importResults, setImportResults] = useState({ successful: 0, failed: 0, errors: [], successfulImports: [] });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);

  const steps = ['Upload Template', 'Validate Data', 'Import Periodicals'];
  
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
    // Create sample data for periodicals
    const data = [
      {
        'Title*': 'Scientific American',
        'Accession Number*': 'PER001',
        'Place of Publication': 'New York',
        'Publisher': 'Springer Nature',
        'Copyright': '2023'
      },
      {
        'Title*': 'National Geographic',
        'Accession Number*': 'PER002',
        'Place of Publication': 'Washington D.C.',
        'Publisher': 'National Geographic Partners',
        'Copyright': '2023'
      }
    ];

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add a note about required fields
    XLSX.utils.sheet_add_aoa(ws, [
      ['Fields marked with * are required']
    ], { origin: { r: data.length + 2, c: 0 } });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Periodical Import Template');
    
    // Generate and download the file
    XLSX.writeFile(wb, 'periodical_import_template.xlsx');
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
    const requiredFields = ['Title*', 'Accession Number*'];
    
    // Track duplicate accession numbers
    const accessionNumbers = new Set();
    
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
      
      // Check for duplicate accession numbers
      if (row['Accession Number*']) {
        if (accessionNumbers.has(row['Accession Number*'])) {
          rowErrors.push('Duplicate accession number in the file');
        } else {
          accessionNumbers.add(row['Accession Number*']);
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
        // Map spreadsheet columns to API fields for periodicals
        const periodical = {
          title: row['Title*'],
          accessionNumber: row['Accession Number*'],
          placeOfPublication: row['Place of Publication'] || null,
          publisher: row['Publisher'] || null,
          copyright: row['Copyright'] || null,
          dateRegistered: new Date().toISOString()
        };
        
        // Call API to create periodical
        const response = await api.post('/periodicals/add', periodical);
        
        // Store successful import
        successfulImports.push({
          accessionNumber: periodical.accessionNumber,
          title: periodical.title,
          publisher: periodical.publisher || 'N/A',
          placeOfPublication: periodical.placeOfPublication || 'N/A',
          copyright: periodical.copyright || 'N/A'
        });
        
        successful++;
      } catch (error) {
        console.error(`Import error for row ${validRows[i].row}:`, error);
        
        // Extract the error message based on backend structure
        let errorMsg = 'Unknown error occurred';
        
        if (error.response) {
          if (typeof error.response.data === 'string') {
            // The backend returns error messages as plain strings
            errorMsg = error.response.data;
          } else if (error.response.data && error.response.data.error) {
            // Some endpoints might return JSON with 'error' property
            errorMsg = error.response.data.error;
          } else if (error.response.status === 400) {
            // Specific handling for 400 Bad Request
            errorMsg = 'Validation error: Accession number already exists';
          } else if (error.response.status === 500) {
            errorMsg = 'Server error: The system encountered a problem';
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMsg = 'Network error: No response from server';
        } else {
          // Error in setting up the request
          errorMsg = `Request error: ${error.message}`;
        }
        
        importErrors.push({
          row: validRows[i].row,
          accessionNumber: row['Accession Number*'],
          title: row['Title*'],
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
    if (onStepChange) {
      onStepChange(0);
    }
  };

  const downloadErrorReport = () => {
    // Create workbook with error data
    const wb = XLSX.utils.book_new();
    const errorData = importResults.errors.map(error => ({
      'Row': error.row,
      'Accession Number': error.accessionNumber,
      'Title': error.title,
      'Error Message': error.message
    }));
    
    const ws = XLSX.utils.json_to_sheet(errorData);
    XLSX.utils.book_append_sheet(wb, ws, 'Import Errors');
    
    // Generate and download the file
    XLSX.writeFile(wb, 'periodical_import_errors.xlsx');
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
        <Typography variant="h6">Bulk Import Periodicals</Typography>
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
                Importing periodicals... ({importProgress}%)
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
              Upload Periodical Data File
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
              Please download our template file first, fill it with periodical data, then upload it.
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
                  borderColor: '#F8C400'
                }
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <UploadFileIcon sx={{ fontSize: 48, color: '#F8C400', mb: 2 }} />
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
                Successfully parsed {parsedData.length} periodical records.
              </Alert>
            )}
          </Box>
        )}

        {/* Step 2: Validate Data */}
        {activeStep === 1 && !isImporting && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Validate Periodical Data
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
                    Valid: {validationResults.filter(r => r.valid).length} periodicals
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography>
                    Invalid: {validationResults.filter(r => !r.valid).length} periodicals
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Accession Number</TableCell>
                    <TableCell>Publisher</TableCell>
                    <TableCell>Place of Publication</TableCell>
                    <TableCell>Copyright</TableCell>
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
                      <TableCell>{result.data['Title*']}</TableCell>
                      <TableCell>{result.data['Accession Number*']}</TableCell>
                      <TableCell>{result.data['Publisher'] || '-'}</TableCell>
                      <TableCell>{result.data['Place of Publication'] || '-'}</TableCell>
                      <TableCell>{result.data['Copyright'] || '-'}</TableCell>
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
            
            {/* Success message if imports were successful */}
            {importResults.successful > 0 && (
              <Box sx={{ mb: 4 }}>
                <Alert 
                  severity="success"
                  icon={<CheckCircleOutlineIcon />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {importResults.successful} periodicals successfully imported
                  </Typography>
                </Alert>
                
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Accession Number</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Publisher</TableCell>
                        <TableCell>Place of Publication</TableCell>
                        <TableCell>Copyright</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResults.successfulImports.map((periodical, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{periodical.accessionNumber}</TableCell>
                          <TableCell>{periodical.title}</TableCell>
                          <TableCell>{periodical.publisher}</TableCell>
                          <TableCell>{periodical.placeOfPublication}</TableCell>
                          <TableCell>{periodical.copyright}</TableCell>
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
                <Typography>Successfully imported: {importResults.successful} periodicals</Typography>
                <Typography>Failed to import: {importResults.failed} periodicals</Typography>
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
                        <TableCell>Accession Number</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResults.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.accessionNumber}</TableCell>
                          <TableCell>{error.title}</TableCell>
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
                  backgroundColor: '#F8C400',
                  color: '#000',
                  '&:hover': { backgroundColor: '#FFDF16' },
                  mr: 2
                }}
              >
                Import More Periodicals
              </Button>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  color: '#000',
                  borderColor: '#F8C400',
                  '&:hover': { borderColor: '#FFDF16', backgroundColor: '#f8f8f8' }
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
              backgroundColor: '#F8C400',
              '&:hover': { backgroundColor: '#FFDF16' },
              color: '#000'
            }}
          >
            {activeStep === 1 ? 'Import Periodicals' : 'Next'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});

BulkImportPeriodicals.displayName = 'BulkImportPeriodicals';

export default BulkImportPeriodicals;