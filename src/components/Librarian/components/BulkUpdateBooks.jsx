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
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../../utils/api';

const BulkUpdateBooks = forwardRef(({ open, onClose, onSuccess, activeGenres = [] }, ref) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedBookDetails, setSelectedBookDetails] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
  });
  
  // Fields to update
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    genre: ''
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateResults, setUpdateResults] = useState({ successful: 0, failed: 0, errors: [] });
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  
  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      setActiveStep(0);
      setSelectedBooks([]);
      setSelectedBookDetails([]);
      setFilters({
        genre: '',
      });
      setFieldsToUpdate({
        genre: ''
      });
      setUpdateResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }));

  const steps = ['Select Books', 'Update Parameters', 'Confirmation'];

  useEffect(() => {
    // Reset to first step when dialog opens
    if (open) {
      setActiveStep(0);
      setSelectedBooks([]);
      setSelectedBookDetails([]);
      setFieldsToUpdate({
        genre: ''
      });
      setUpdateResults({ successful: 0, failed: 0, errors: [] });
      setSelectAll(false);
    }
  }, [open]);

  // Fetch books based on filters
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/books/all');
      let books = response.data;
      
      // Apply genre filter if provided
      if (filters.genre) {
        books = books.filter(book => book.genre === filters.genre);
      }
      
      setBooks(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      
      // Sample data for testing
      const sampleBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1', accessionNumber: 'ACC001', genre: 'Fiction' },
        { id: 2, title: 'Book 2', author: 'Author 2', accessionNumber: 'ACC002', genre: 'Poetry' },
        { id: 3, title: 'Book 3', author: 'Author 3', accessionNumber: 'ACC003', genre: 'Fiction' },
        { id: 4, title: 'Book 4', author: 'Author 4', accessionNumber: 'ACC004', genre: 'History' },
        { id: 5, title: 'Book 5', author: 'Author 5', accessionNumber: 'ACC005', genre: 'Fantasy' },
      ];
      
      // Apply genre filter if provided
      let filteredBooks = sampleBooks;
      if (filters.genre) {
        filteredBooks = sampleBooks.filter(book => book.genre === filters.genre);
      }
      
      setBooks(filteredBooks);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchBooks when filters change
  React.useEffect(() => {
    if (open && activeStep === 0) {
      fetchBooks();
    }
  }, [filters, open, activeStep]);

  // Logic for selecting all filtered books
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBooks([]);
      setSelectedBookDetails([]);
    } else {
      // Get unique book IDs
      const uniqueIds = [...new Set(books.map(book => book.id))];
      setSelectedBooks(uniqueIds);
      
      // Create unique book details array using Map to prevent duplicates
      const uniqueBooks = Array.from(
        new Map(books.map(book => [book.id, book])).values()
      );
      setSelectedBookDetails(uniqueBooks);
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual book selection
  const handleToggleBook = (book) => {
    setSelectedBooks(prev => {
      if (prev.includes(book.id)) {
        setSelectedBookDetails(prevDetails => 
          prevDetails.filter(b => b.id !== book.id)
        );
        return prev.filter(id => id !== book.id);
      } else {
        // Check if book is already in the details array to prevent duplicates
        if (!selectedBookDetails.some(b => b.id === book.id)) {
          setSelectedBookDetails(prevDetails => [...prevDetails, book]);
        }
        return [...prev, book.id];
      }
    });
  };

  // Check if a book is selected
  const isBookSelected = (bookId) => {
    return selectedBooks.includes(bookId);
  };

  // Handle changing genre in the update parameters
  const handleGenreChange = (event) => {
    setFieldsToUpdate(prev => ({
      ...prev,
      genre: event.target.value
    }));
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { value } = event.target;
    setFilters({
      genre: value
    });
  };

  // Check if all fields have values
  const allFieldsHaveValues = () => {
    return fieldsToUpdate.genre !== '';
  };

  // Perform the bulk update
  const performUpdate = async () => {
    setIsUpdating(true);
    let successful = 0;
    let failed = 0;
    const errors = [];

    // Get unique books to update
    const uniqueBookIds = [...new Set(selectedBooks)];
    const uniqueBookDetails = Array.from(
      new Map(selectedBookDetails.map(book => [book.id, book])).values()
    );

    for (let i = 0; i < uniqueBookIds.length; i++) {
      try {
        const bookId = uniqueBookIds[i];
        
        // Get the current book data from the selectedBookDetails array
        const currentBook = uniqueBookDetails.find(b => b.id === bookId);
        
        // Create update data object with only selected fields while preserving existing data
        const updateData = {
          // Include all required fields from the existing book record
          title: currentBook.title,
          author: currentBook.author,
          accessionNumber: currentBook.accessionNumber,
          // Override with the fields to update
          genre: fieldsToUpdate.genre,
          // Preserve other fields if they exist
          isbn: currentBook.isbn,
          dateRegistered: currentBook.dateRegistered
        };
        
        // Update progress
        setUpdateProgress(Math.round(((i + 1) / uniqueBookIds.length) * 100));
        
        // Call API to update book
        await api.put(`/books/${bookId}`, updateData);
        successful++;
      } catch (error) {
        console.error(`Error updating book ${uniqueBookIds[i]}:`, error);
        const book = uniqueBookDetails.find(b => b.id === uniqueBookIds[i]);
        errors.push({
          id: uniqueBookIds[i],
          title: book ? book.title : `Book ID ${uniqueBookIds[i]}`,
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

  // Get unique count of books
  const getUniqueBookCount = () => {
    return new Set(selectedBooks).size;
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
        <Typography variant="h6">Bulk Update Books</Typography>
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

        {/* Step 1: Select Books */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Books to Update
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter Books:</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
                  <InputLabel>Genre</InputLabel>
                  <Select
                    value={filters.genre}
                    onChange={handleFilterChange}
                    label="Genre"
                  >
                    <MenuItem value="">All Genres</MenuItem>
                    {activeGenres.map(genre => (
                      <MenuItem key={genre.id} value={genre.genre}>{genre.genre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography>
                {books.length} books match your filters
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
                            indeterminate={selectedBooks.length > 0 && selectedBooks.length < books.length}
                            checked={books.length > 0 && selectedBooks.length === books.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Author</TableCell>
                        <TableCell>Accession Number</TableCell>
                        <TableCell>Genre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {books
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((book) => (
                          <TableRow 
                            key={book.id}
                            hover
                            onClick={() => handleToggleBook(book)}
                            role="checkbox"
                            selected={isBookSelected(book.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isBookSelected(book.id)}
                                onChange={(event) => {
                                  event.stopPropagation();
                                  handleToggleBook(book);
                                }}
                              />
                            </TableCell>
                            <TableCell>{book.title}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.accessionNumber}</TableCell>
                            <TableCell>{book.genre}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={books.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${getUniqueBookCount()} books selected`} 
                color={selectedBooks.length > 0 ? "primary" : "default"}
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
              Specify new genre for the books you want to update. All {getUniqueBookCount()} selected books will be updated.
            </Alert>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Fields to Update:
              </Typography>
              
              <Grid container spacing={2}>
                {/* GENRE */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Genre</InputLabel>
                    <Select
                      value={fieldsToUpdate.genre}
                      onChange={handleGenreChange}
                      label="Genre"
                    >
                      <MenuItem value="">Select genre</MenuItem>
                      {activeGenres.map(genre => (
                        <MenuItem key={genre.id} value={genre.genre}>{genre.genre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            
            {allFieldsHaveValues() && (
              <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                  Update Summary:
                </Typography>
                <Typography>
                  {getUniqueBookCount()} books will have their genre updated to:
                </Typography>
                <Box sx={{ ml: 2, mt: 1 }}>
                  <Typography sx={{ mb: 0.5 }}>
                    • <strong>Genre</strong>: {fieldsToUpdate.genre}
                  </Typography>
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
                  Updating books... ({updateProgress}%)
                </Typography>
                <LinearProgress variant="determinate" value={updateProgress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
            ) : (
              <>
                {updateResults.successful === 0 ? (
                  <>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        You are about to update {getUniqueBookCount()} books. 
                      </Typography>
                      <Typography variant="body2">
                        This action cannot be undone. Please review the details below and confirm.
                      </Typography>
                    </Alert>
                    
                    <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>Update Details:</Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography>• Books to update: {getUniqueBookCount()}</Typography>
                        <Typography>• New Genre: {fieldsToUpdate.genre}</Typography>
                      </Box>
                    </Paper>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      The following books will be updated:
                    </Typography>
                    
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3, border: '1px solid #eee', p: 1 }}>
                      {/* Remove duplicates based on book ID and display unique entries */}
                      {Array.from(new Map(selectedBookDetails.map(book => [book.id, book])).values())
                        .map((book, index) => (
                        <Typography key={book.id} variant="body2" sx={{ mb: 0.5 }}>
                          {index + 1}. {book.title} by {book.author} (Accession: {book.accessionNumber})
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
                      <Typography>Successfully updated: {updateResults.successful} books</Typography>
                      <Typography>Failed to update: {updateResults.failed} books</Typography>
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
                            <TableCell>Book</TableCell>
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
              (activeStep === 0 && selectedBooks.length === 0) ||
              (activeStep === 1 && !allFieldsHaveValues())
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

BulkUpdateBooks.displayName = 'BulkUpdateBooks';

export default BulkUpdateBooks;