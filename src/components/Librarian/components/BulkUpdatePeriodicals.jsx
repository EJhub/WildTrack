import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
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
  InputLabel,
  Select,
  MenuItem,
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
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../../utils/api';

const BulkUpdatePeriodicals = forwardRef(({ open, onClose, onSuccess }, ref) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPeriodicals, setSelectedPeriodicals] = useState([]);
  const [selectedPeriodicalDetails, setSelectedPeriodicalDetails] = useState([]);
  
  // Fields to update - specific to periodicals
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    placeOfPublication: '',
    publisher: '',
    copyright: ''
  });
  
  // Track which fields should be updated
  const [fieldsToInclude, setFieldsToInclude] = useState({
    placeOfPublication: false,
    publisher: false,
    copyright: false
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateResults, setUpdateResults] = useState({ successful: 0, failed: 0, errors: [] });
  const [loading, setLoading] = useState(false);
  const [periodicals, setPeriodicals] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  
  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      setActiveStep(0);
      setSelectedPeriodicals([]);
      setSelectedPeriodicalDetails([]);
      setFieldsToUpdate({
        placeOfPublication: '',
        publisher: '',
        copyright: ''
      });
      setFieldsToInclude({
        placeOfPublication: false,
        publisher: false,
        copyright: false
      });
      setUpdateResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }));

  const steps = ['Select Periodicals', 'Update Parameters', 'Confirmation'];

  useEffect(() => {
    // Reset to first step when dialog opens
    if (open) {
      setActiveStep(0);
      setSelectedPeriodicals([]);
      setSelectedPeriodicalDetails([]);
      setFieldsToUpdate({
        placeOfPublication: '',
        publisher: '',
        copyright: ''
      });
      setFieldsToInclude({
        placeOfPublication: false,
        publisher: false,
        copyright: false
      });
      setUpdateResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }, [open]);

  // Fetch periodicals
  const fetchPeriodicals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/periodicals/all');
      setPeriodicals(response.data);
    } catch (error) {
      console.error('Error fetching periodicals:', error);
      setPeriodicals([]);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchPeriodicals when dialog opens
  React.useEffect(() => {
    if (open && activeStep === 0) {
      fetchPeriodicals();
    }
  }, [open, activeStep]);

  // Logic for selecting all periodicals
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPeriodicals([]);
      setSelectedPeriodicalDetails([]);
    } else {
      // Get unique periodical IDs
      const uniqueIds = [...new Set(periodicals.map(periodical => periodical.id))];
      setSelectedPeriodicals(uniqueIds);
      
      // Create unique periodical details array using Map to prevent duplicates
      const uniquePeriodicals = Array.from(
        new Map(periodicals.map(periodical => [periodical.id, periodical])).values()
      );
      setSelectedPeriodicalDetails(uniquePeriodicals);
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual periodical selection
  const handleTogglePeriodical = (periodical) => {
    setSelectedPeriodicals(prev => {
      if (prev.includes(periodical.id)) {
        setSelectedPeriodicalDetails(prevDetails => 
          prevDetails.filter(p => p.id !== periodical.id)
        );
        return prev.filter(id => id !== periodical.id);
      } else {
        // Check if periodical is already in the details array to prevent duplicates
        if (!selectedPeriodicalDetails.some(p => p.id === periodical.id)) {
          setSelectedPeriodicalDetails(prevDetails => [...prevDetails, periodical]);
        }
        return [...prev, periodical.id];
      }
    });
  };

  // Check if a periodical is selected
  const isPeriodicalSelected = (periodicalId) => {
    return selectedPeriodicals.includes(periodicalId);
  };

  // Handle field value changes
  const handleFieldChange = (event, field) => {
    setFieldsToUpdate(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Toggle field inclusion in update
  const toggleFieldInclusion = (field) => {
    setFieldsToInclude(prev => {
      const newState = { ...prev, [field]: !prev[field] };
      
      // If field is being excluded, clear its value
      if (!newState[field]) {
        setFieldsToUpdate(prev => ({
          ...prev,
          [field]: ''
        }));
      }
      
      return newState;
    });
  };

  // Check if at least one field is selected for update with a value
  const hasFieldsToUpdate = () => {
    return Object.keys(fieldsToInclude).some(key => 
      fieldsToInclude[key] && fieldsToUpdate[key] !== ''
    );
  };

  // Perform the bulk update
  const performUpdate = async () => {
    setIsUpdating(true);
    let successful = 0;
    let failed = 0;
    const errors = [];

    // Get unique periodicals to update
    const uniquePeriodicalIds = [...new Set(selectedPeriodicals)];
    const uniquePeriodicalDetails = Array.from(
      new Map(selectedPeriodicalDetails.map(periodical => [periodical.id, periodical])).values()
    );

    for (let i = 0; i < uniquePeriodicalIds.length; i++) {
      try {
        const periodicalId = uniquePeriodicalIds[i];
        
        // Get the current periodical data from the selectedPeriodicalDetails array
        const currentPeriodical = uniquePeriodicalDetails.find(p => p.id === periodicalId);
        
        // Create update data object that preserves all existing data
        // We'll only add the specific fields the user has chosen to update
        const updateData = {
          // Copy all existing data from the periodical first
          ...currentPeriodical,
          
          // Then only override fields that are selected for update
          ...(fieldsToInclude.placeOfPublication && { placeOfPublication: fieldsToUpdate.placeOfPublication }),
          ...(fieldsToInclude.publisher && { publisher: fieldsToUpdate.publisher }),
          ...(fieldsToInclude.copyright && { copyright: fieldsToUpdate.copyright })
        };
        
        // Update progress
        setUpdateProgress(Math.round(((i + 1) / uniquePeriodicalIds.length) * 100));
        
        // Call API to update periodical
        await api.put(`/periodicals/${periodicalId}`, updateData);
        successful++;
      } catch (error) {
        console.error(`Error updating periodical ${uniquePeriodicalIds[i]}:`, error);
        const periodical = uniquePeriodicalDetails.find(p => p.id === uniquePeriodicalIds[i]);
        errors.push({
          id: uniquePeriodicalIds[i],
          title: periodical ? periodical.title : `Periodical ID ${uniquePeriodicalIds[i]}`,
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

  // Get unique count of periodicals
  const getUniquePeriodicalCount = () => {
    return new Set(selectedPeriodicals).size;
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
        <Typography variant="h6">Bulk Update Periodicals</Typography>
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

        {/* Step 1: Select Periodicals */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Periodicals to Update
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography>
                {periodicals.length} periodicals available
              </Typography>
              <Box>
                <Button 
                  onClick={handleSelectAll} 
                  variant="outlined" 
                  size="small" 
                  sx={{ 
                    mr: 1,
                    color: '#000',
                    borderColor: '#F8C400',
                    '&:hover': { borderColor: '#FFDF16', backgroundColor: '#f8f8f8' }
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
                            indeterminate={selectedPeriodicals.length > 0 && selectedPeriodicals.length < periodicals.length}
                            checked={periodicals.length > 0 && selectedPeriodicals.length === periodicals.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Accession Number</TableCell>
                        <TableCell>Publisher</TableCell>
                        <TableCell>Place of Publication</TableCell>
                        <TableCell>Copyright</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {periodicals
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((periodical) => (
                          <TableRow 
                            key={periodical.id}
                            hover
                            onClick={() => handleTogglePeriodical(periodical)}
                            role="checkbox"
                            selected={isPeriodicalSelected(periodical.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isPeriodicalSelected(periodical.id)}
                                onChange={(event) => {
                                  event.stopPropagation();
                                  handleTogglePeriodical(periodical);
                                }}
                              />
                            </TableCell>
                            <TableCell>{periodical.title}</TableCell>
                            <TableCell>{periodical.accessionNumber}</TableCell>
                            <TableCell>{periodical.publisher || 'N/A'}</TableCell>
                            <TableCell>{periodical.placeOfPublication || 'N/A'}</TableCell>
                            <TableCell>{periodical.copyright || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={periodicals.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${getUniquePeriodicalCount()} periodicals selected`} 
                color={selectedPeriodicals.length > 0 ? "primary" : "default"}
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
              Select which fields to update and specify new values. All {getUniquePeriodicalCount()} selected periodicals will be updated with these values.
            </Alert>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Fields to Update:
              </Typography>
              
              <Grid container spacing={2}>
                {/* PLACE OF PUBLICATION */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                    <Checkbox 
                      checked={fieldsToInclude.placeOfPublication}
                      onChange={() => toggleFieldInclusion('placeOfPublication')}
                    />
                    <Typography>Place of Publication</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Place of Publication"
                    value={fieldsToUpdate.placeOfPublication}
                    onChange={(e) => handleFieldChange(e, 'placeOfPublication')}
                    disabled={!fieldsToInclude.placeOfPublication}
                  />
                </Grid>
                
                {/* PUBLISHER */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                    <Checkbox 
                      checked={fieldsToInclude.publisher}
                      onChange={() => toggleFieldInclusion('publisher')}
                    />
                    <Typography>Publisher</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Publisher"
                    value={fieldsToUpdate.publisher}
                    onChange={(e) => handleFieldChange(e, 'publisher')}
                    disabled={!fieldsToInclude.publisher}
                  />
                </Grid>
                
                {/* COPYRIGHT */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                    <Checkbox 
                      checked={fieldsToInclude.copyright}
                      onChange={() => toggleFieldInclusion('copyright')}
                    />
                    <Typography>Copyright</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Copyright"
                    value={fieldsToUpdate.copyright}
                    onChange={(e) => handleFieldChange(e, 'copyright')}
                    disabled={!fieldsToInclude.copyright}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            {hasFieldsToUpdate() && (
              <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                  Update Summary:
                </Typography>
                <Typography>
                  {getUniquePeriodicalCount()} periodicals will have the following fields updated:
                </Typography>
                <Box sx={{ ml: 2, mt: 1 }}>
                  {fieldsToInclude.placeOfPublication && fieldsToUpdate.placeOfPublication && (
                    <Typography sx={{ mb: 0.5 }}>
                      • <strong>Place of Publication</strong>: {fieldsToUpdate.placeOfPublication}
                    </Typography>
                  )}
                  {fieldsToInclude.publisher && fieldsToUpdate.publisher && (
                    <Typography sx={{ mb: 0.5 }}>
                      • <strong>Publisher</strong>: {fieldsToUpdate.publisher}
                    </Typography>
                  )}
                  {fieldsToInclude.copyright && fieldsToUpdate.copyright && (
                    <Typography sx={{ mb: 0.5 }}>
                      • <strong>Copyright</strong>: {fieldsToUpdate.copyright}
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
                  Updating periodicals... ({updateProgress}%)
                </Typography>
                <LinearProgress variant="determinate" value={updateProgress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
            ) : (
              <>
                {updateResults.successful === 0 ? (
                  <>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        You are about to update {getUniquePeriodicalCount()} periodicals. 
                      </Typography>
                      <Typography variant="body2">
                        This action cannot be undone. Please review the details below and confirm.
                      </Typography>
                    </Alert>
                    
                    <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Update Details:</Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography>• Periodicals to update: {getUniquePeriodicalCount()}</Typography>
                        
                        {fieldsToInclude.placeOfPublication && fieldsToUpdate.placeOfPublication && (
                          <Typography>• New Place of Publication: {fieldsToUpdate.placeOfPublication}</Typography>
                        )}
                        {fieldsToInclude.publisher && fieldsToUpdate.publisher && (
                          <Typography>• New Publisher: {fieldsToUpdate.publisher}</Typography>
                        )}
                        {fieldsToInclude.copyright && fieldsToUpdate.copyright && (
                          <Typography>• New Copyright: {fieldsToUpdate.copyright}</Typography>
                        )}
                      </Box>
                    </Paper>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      The following periodicals will be updated:
                    </Typography>
                    
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3, border: '1px solid #eee', p: 1 }}>
                      {/* Remove duplicates based on periodical ID and display unique entries */}
                      {Array.from(new Map(selectedPeriodicalDetails.map(periodical => [periodical.id, periodical])).values())
                        .map((periodical, index) => (
                        <Typography key={periodical.id} variant="body2" sx={{ mb: 0.5 }}>
                          {index + 1}. {periodical.title} (Accession: {periodical.accessionNumber})
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
                      <Typography>Successfully updated: {updateResults.successful} periodicals</Typography>
                      <Typography>Failed to update: {updateResults.failed} periodicals</Typography>
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
                            <TableCell>Periodical</TableCell>
                            <TableCell>Error</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {updateResults.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.title}</TableCell>
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
                        backgroundColor: '#F8C400',
                        color: '#000',
                        '&:hover': { backgroundColor: '#FFDF16' },
                      }}
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={performUpdate}
                      sx={{
                        backgroundColor: '#F8C400',
                        color: '#000',
                        '&:hover': { backgroundColor: '#FFDF16' },
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
              (activeStep === 0 && selectedPeriodicals.length === 0) ||
              (activeStep === 1 && !hasFieldsToUpdate())
            }
            sx={{
              backgroundColor: '#F8C400',
              '&:hover': { backgroundColor: '#FFDF16' },
              color: '#000'
            }}
          >
            Next
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});

BulkUpdatePeriodicals.displayName = 'BulkUpdatePeriodicals';

export default BulkUpdatePeriodicals;