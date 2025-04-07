import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as XLSX from 'xlsx';

const SuccessImportModal = ({ open, onClose, importResults, onReturnToImportScreen }) => {
  const [copiedPasswordId, setCopiedPasswordId] = useState(null);

  const copyPassword = (password, idNumber) => {
    navigator.clipboard.writeText(password);
    setCopiedPasswordId(idNumber);
    setTimeout(() => setCopiedPasswordId(null), 2000); // Reset after 2 seconds
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

  // Handle Done button click
  const handleDone = () => {
    if (importResults && importResults.failed > 0) {
      // If there were failed imports, return to the import screen
      onReturnToImportScreen();
    } else {
      // Otherwise just close the modal
      onClose();
    }
  };

  if (!importResults) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleOutlineIcon sx={{ color: 'success.main', mr: 1, fontSize: 28 }} />
          <Typography variant="h6">Students Successfully Imported</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {importResults.successful} students have been successfully imported. Below are their temporary passwords.
            Please save this information as it will only be shown once.
          </Typography>
        
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
          
          {importResults.failed > 0 && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Note: {importResults.failed} student records could not be imported because the ID numbers already exist in the system.
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{ mx: 'auto' }}
          variant="contained"
          color="primary"
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessImportModal;