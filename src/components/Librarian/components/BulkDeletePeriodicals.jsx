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
  Grid,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../../utils/api';

const BulkDeletePeriodicals = forwardRef(({ open, onClose, onSuccess }, ref) => {
  // Active step in the deletion process
  const [activeStep, setActiveStep] = useState(0);
  
  // Selection states
  const [selectedPeriodicals, setSelectedPeriodicals] = useState([]);
  const [selectedPeriodicalDetails, setSelectedPeriodicalDetails] = useState([]);
  
  // Filters for periodicals
  const [filters, setFilters] = useState({
    publisher: '',
    yearOfPublication: '',
    placeOfPublication: ''
  });
  
  // Deletion settings
  const [deletionSettings, setDeletionSettings] = useState({
    reason: '',
    notes: ''
  });
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteConfirmationError, setDeleteConfirmationError] = useState(false);
  
  // State for dropdown options
  const [publisherOptions, setPublisherOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [placeOptions, setPlaceOptions] = useState([]);
  
  // Processing states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteResults, setDeleteResults] = useState({ successful: 0, failed: 0, errors: [] });
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [periodicals, setPeriodicals] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  
  // Delete reasons options
  const deleteReasons = [
    'Damaged beyond repair',
    'Lost',
    'Outdated content',
    'Duplicate copy',
    'Data cleanup',
    'Other'
  ];
  
  // Reset component when opened
  useEffect(() => {
    if (open) {
      resetComponent();
    }
  }, [open]);
  
  // Reset all component state
  const resetComponent = () => {
    setActiveStep(0);
    setSelectedPeriodicals([]);
    setSelectedPeriodicalDetails([]);
    setFilters({
      publisher: '',
      yearOfPublication: '',
      placeOfPublication: ''
    });
    setDeletionSettings({
      reason: '',
      notes: ''
    });
    setDeleteResults({ successful: 0, failed: 0, errors: [] });
    setSelectAll(false);
    setDeleteConfirmation('');
    setDeleteConfirmationError(false);
    setPage(0);
  };
  
  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: resetComponent
  }));

  const steps = ['Select Periodicals', 'Deletion Settings', 'Confirmation'];

  // Fetch periodicals and dropdown options when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch periodicals
        const periodicalsResponse = await api.get('/periodicals/all');
        setPeriodicals(periodicalsResponse.data);
        
        // Extract options from periodicals
        const uniquePublishers = [...new Set(periodicalsResponse.data
          .map(periodical => periodical.publisher)
          .filter(Boolean))];
        
        const uniqueYears = [...new Set(periodicalsResponse.data
          .map(periodical => periodical.copyright)
          .filter(Boolean))];
        
        const uniquePlaces = [...new Set(periodicalsResponse.data
          .map(periodical => periodical.placeOfPublication)
          .filter(Boolean))];
        
        setPublisherOptions(uniquePublishers.sort());
        setYearOptions(uniqueYears.sort((a, b) => b - a)); // Sort years descending
        setPlaceOptions(uniquePlaces.sort());

      } catch (error) {
        console.error('Error fetching periodicals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Apply filters to periodicals
  const getFilteredPeriodicals = () => {
    if (!filters.publisher && !filters.yearOfPublication && !filters.placeOfPublication) {
      return periodicals;
    }
    
    return periodicals.filter(periodical => {
      const publisherMatch = !filters.publisher || periodical.publisher === filters.publisher;
      const yearMatch = !filters.yearOfPublication || 
                       (periodical.copyright && periodical.copyright.toString() === filters.yearOfPublication);
      const placeMatch = !filters.placeOfPublication || 
                       (periodical.placeOfPublication && periodical.placeOfPublication.toLowerCase().includes(filters.placeOfPublication.toLowerCase()));
      
      return publisherMatch && yearMatch && placeMatch;
    });
  };

  // Logic for selecting all filtered periodicals
  const handleSelectAll = () => {
    const filteredPeriodicals = getFilteredPeriodicals();
    
    if (selectAll) {
      setSelectedPeriodicals([]);
      setSelectedPeriodicalDetails([]);
    } else {
      // Get unique periodical IDs
      const uniqueIds = [...new Set(filteredPeriodicals.map(periodical => periodical.id))];
      setSelectedPeriodicals(uniqueIds);
      
      // Create unique periodical details array
      const uniquePeriodicals = Array.from(
        new Map(filteredPeriodicals.map(periodical => [periodical.id, periodical])).values()
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

  // Handle settings change
  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    setDeletionSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle delete confirmation text change
  const handleDeleteConfirmationChange = (event) => {
    setDeleteConfirmation(event.target.value);
    // Reset error state when user types
    setDeleteConfirmationError(false);
  };

  // Check if all required settings are filled
  const areSettingsValid = () => {
    return deletionSettings.reason !== '';
  };

  // Check if the delete confirmation is valid
  const isDeleteConfirmationValid = () => {
    return deleteConfirmation === 'DELETE';
  };

  // Handle filters change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      publisher: '',
      yearOfPublication: '',
      placeOfPublication: ''
    });
  };

  // Perform the bulk deletion
  const performDeletion = async () => {
    // Check if DELETE confirmation is correct
    if (!isDeleteConfirmationValid()) {
      setDeleteConfirmationError(true);
      return;
    }

    setIsDeleting(true);
    let successful = 0;
    let failed = 0;
    const errors = [];

    // Process deletion in batches of 10 for large datasets
    const batchSize = 10;
    const totalBatches = Math.ceil(selectedPeriodicals.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min((batchIndex + 1) * batchSize, selectedPeriodicals.length);
      const currentBatch = selectedPeriodicals.slice(batchStart, batchEnd);
      
      await Promise.all(currentBatch.map(async (periodicalId) => {
        try {
          // Call API to delete periodical
          await api.delete(`/periodicals/${periodicalId}`);
          successful++;
        } catch (error) {
          console.error(`Error deleting periodical ${periodicalId}:`, error);
          const periodical = selectedPeriodicalDetails.find(p => p.id === periodicalId);
          errors.push({
            id: periodicalId,
            title: periodical ? periodical.title : `Periodical ID ${periodicalId}`,
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
      // Update the local data state to reflect deletions
      setPeriodicals(prev => prev.filter(periodical => !selectedPeriodicals.includes(periodical.id)));
      
      // Wait for animation to complete before calling success
      setTimeout(() => {
        onSuccess({
          type: 'periodicals',
          successful,
          failed,
          errors,
          reason: deletionSettings.reason
        });
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

  const filteredPeriodicals = getFilteredPeriodicals();
  const displayedPeriodicals = filteredPeriodicals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        <Typography variant="h6">Bulk Delete Periodicals</Typography>
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

        {/* Step 1: Select Periodicals */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Periodicals to Delete
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Warning: Deletion is permanent
              </Typography>
              <Typography variant="body2">
                Deleting periodicals will remove all associated data including borrowing history and availability status.
              </Typography>
            </Alert>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter Periodicals:</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Publisher</InputLabel>
                    <Select
                      name="publisher"
                      value={filters.publisher}
                      onChange={handleFilterChange}
                      label="Publisher"
                    >
                      <MenuItem value="">All Publishers</MenuItem>
                      {publisherOptions.map(publisher => (
                        <MenuItem key={publisher} value={publisher}>{publisher}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Publication Year</InputLabel>
                    <Select
                      name="yearOfPublication"
                      value={filters.yearOfPublication}
                      onChange={handleFilterChange}
                      label="Publication Year"
                    >
                      <MenuItem value="">All Years</MenuItem>
                      {yearOptions.map(year => (
                        <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Place of Publication"
                    name="placeOfPublication"
                    value={filters.placeOfPublication}
                    onChange={handleFilterChange}
                    size="small"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  size="small"
                  onClick={handleResetFilters}
                  sx={{ color: '#800000' }}
                >
                  Reset Filters
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography>
                {filteredPeriodicals.length} periodicals match your filters
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
                <CircularProgress sx={{ color: '#800000' }} />
              </Box>
            ) : (
              <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedPeriodicals.length > 0 && selectedPeriodicals.length < filteredPeriodicals.length}
                            checked={filteredPeriodicals.length > 0 && selectedPeriodicals.length === filteredPeriodicals.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Accession Number</TableCell>
                        <TableCell>Publisher</TableCell>
                        <TableCell>Place of Publication</TableCell>
                        <TableCell>Copyright Year</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedPeriodicals.length > 0 ? (
                        displayedPeriodicals.map((periodical) => (
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No periodicals match your filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredPeriodicals.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${selectedPeriodicals.length} periodicals selected for deletion`} 
                color={selectedPeriodicals.length > 0 ? "error" : "default"}
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
                You are about to delete {selectedPeriodicals.length} periodicals
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
                {selectedPeriodicals.length} periodicals will be permanently deleted.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="error">
                  This action cannot be undone. All data associated with these periodicals will be permanently removed from the system.
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
                  Deleting periodicals... ({deleteProgress}%)
                </Typography>
                <LinearProgress variant="determinate" value={deleteProgress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
            ) : (
              <>
                {deleteResults.successful === 0 ? (
                  <>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Final Warning: You are about to permanently delete {selectedPeriodicals.length} periodicals.
                      </Typography>
                      <Typography variant="body2">
                        This action cannot be undone. Once deleted, all associated data will be permanently removed.
                      </Typography>
                    </Alert>
                    
                    <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Deletion Details:</Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography>• Periodicals to delete: {selectedPeriodicals.length}</Typography>
                        <Typography>• Reason: {deletionSettings.reason}</Typography>
                        {deletionSettings.notes && (
                          <Typography>• Notes: {deletionSettings.notes}</Typography>
                        )}
                      </Box>
                    </Paper>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      The following periodicals will be deleted:
                    </Typography>
                    
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3, border: '1px solid #eee', p: 1 }}>
                      {Array.from(new Map(selectedPeriodicalDetails.map(periodical => [periodical.id, periodical])).values())
                        .map((periodical, index) => (
                          <Typography key={periodical.id} variant="body2" sx={{ mb: 0.5 }}>
                            {index + 1}. {periodical.accessionNumber} - {periodical.title}
                          </Typography>
                        ))}
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: deleteConfirmationError ? '#fff1f1' : '#fff4e5', borderRadius: 2, mb: 3 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon sx={{ color: deleteConfirmationError ? '#f44336' : '#ff9800', mr: 1 }} />
                        Type "DELETE" in the box below to confirm this action
                      </Typography>
                      <TextField 
                        fullWidth
                        placeholder="Type DELETE to confirm"
                        size="small"
                        sx={{ mt: 1 }}
                        name="deleteConfirmation"
                        value={deleteConfirmation}
                        onChange={handleDeleteConfirmationChange}
                        error={deleteConfirmationError}
                        helperText={deleteConfirmationError ? 'You must type "DELETE" exactly to confirm' : ''}
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
                      <Typography>Successfully deleted: {deleteResults.successful} periodicals</Typography>
                      <Typography>Failed to delete: {deleteResults.failed} periodicals</Typography>
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
                            <TableCell>Periodical</TableCell>
                            <TableCell>Error</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {deleteResults.errors.map((error, index) => (
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
                  {deleteResults.successful > 0 ? (
                    <Button
                      variant="contained"
                      onClick={onClose}
                      sx={{
                        backgroundColor: '#800000',
                        color: '#FFEB3B',
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
                      disabled={!isDeleteConfirmationValid()}
                      sx={{
                        backgroundColor: isDeleteConfirmationValid() ? '#d32f2f' : '#d32f2f77',
                        color: '#FFEB3B',
                        '&:hover': { backgroundColor: isDeleteConfirmationValid() ? '#b71c1c' : '#d32f2f77' },
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
              (activeStep === 0 && selectedPeriodicals.length === 0) ||
              (activeStep === 1 && !areSettingsValid())
            }
            sx={{
              backgroundColor: activeStep === 1 ? '#d32f2f' : '#800000',
              '&:hover': { backgroundColor: activeStep === 1 ? '#b71c1c' : '#990000' },
              color: '#FFEB3B'
            }}
          >
            Next
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});

BulkDeletePeriodicals.displayName = 'BulkDeletePeriodicals';

export default BulkDeletePeriodicals;