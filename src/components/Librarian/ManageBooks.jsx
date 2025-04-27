import React, { useState, useEffect, useRef } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import BulkImportBooks from './components/BulkImportBooks';
import BulkUpdateBooks from './components/BulkUpdateBooks';
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
  IconButton,
  Button,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import api from '../../utils/api'; // Import the API utility

const LibrarianManageBooks = () => {
  const [data, setData] = useState([]); // Book data with additional UI states
  const [genres, setGenres] = useState([]); // Store all genres
  const [activeGenres, setActiveGenres] = useState([]); // Store only unarchived genres
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Bulk import/update states
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkImportStep, setBulkImportStep] = useState(0);
  const [tableRefreshing, setTableRefreshing] = useState(false);
  
  // Refs for bulk operations
  const bulkImportRef = useRef(null);
  const bulkUpdateRef = useRef(null);

  const [formFields, setFormFields] = useState({
    title: '',
    author: '',
    accessionNumber: '',
    genre: '',
    dateRegistered: new Date().toISOString()
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [mainSearchTerm, setMainSearchTerm] = useState('');

  // Fetch books and genres data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch books
      const booksResponse = await api.get('/books/all');
      const books = booksResponse.data;
      setData(books);
      setFilteredBooks(books);
      
      // Fetch genres for dropdown
      const genresResponse = await api.get('/genres');
      const genresData = genresResponse.data;
      setGenres(genresData);
      
      // Filter out archived genres for the dropdown
      const unarchived = genresData.filter(genre => !genre.archived);
      setActiveGenres(unarchived);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Sample data for testing
      const sampleBooks = [
        { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', accessionNumber: 'ACC001', genre: 'Fiction', dateRegistered: '2025-03-22' },
        { id: 2, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', accessionNumber: 'ACC002', genre: 'Fiction', dateRegistered: '2025-03-23' },
        { id: 3, title: 'Pride and Prejudice', author: 'Jane Austen', accessionNumber: 'ACC003', genre: 'Classic', dateRegistered: '2025-03-24' },
        { id: 4, title: '1984', author: 'George Orwell', accessionNumber: 'ACC004', genre: 'Dystopian', dateRegistered: '2025-03-24' },
        { id: 5, title: 'The Hobbit', author: 'J.R.R. Tolkien', accessionNumber: 'ACC005', genre: 'Fantasy', dateRegistered: '2025-03-25' },
      ];
      
      const sampleGenres = [
        { id: 1, genre: 'History', title: 'Historical books', books: [], archived: true },
        { id: 2, genre: 'Fiction', title: 'Fiction books', books: [{ title: 'Fiction Book 1' }], archived: false },
        { id: 3, genre: 'Fantasy', title: 'Fantasy books', books: [], archived: false },
        { id: 4, genre: 'Classic', title: 'Classic literature', books: [], archived: false },
        { id: 5, genre: 'Poetry', title: 'Poetry collections', books: [{ title: 'Poetry Book 1' }, { title: 'Poetry Book 2' }], archived: false },
        { id: 6, genre: 'Dystopian', title: 'Dystopian fiction', books: [{ title: 'Dystopian Book 1' }], archived: false },
        { id: 7, genre: 'Biography', title: 'Biography books', books: [], archived: false },
        { id: 8, genre: 'Romance', title: 'Romance novels', books: [], archived: false },
        { id: 9, genre: 'SciFi', title: 'Science Fiction', books: [], archived: false },
        { id: 10, genre: 'Mystery', title: 'Mystery novels', books: [{ title: 'Mystery Book 1' }], archived: false },
      ];
      
      setData(sampleBooks);
      setFilteredBooks(sampleBooks);
      setGenres(sampleGenres);
      
      // Filter out archived genres for the dropdown
      const unarchived = sampleGenres.filter(genre => !genre.archived);
      setActiveGenres(unarchived);
    } finally {
      setLoading(false);
      setTableRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle genre change in books
  useEffect(() => {
    // Get array of active genre names
    const activeGenreNames = activeGenres.map(genre => genre.genre);
    
    // Mark genres as N/A if they're now archived
    const updatedBooks = data.map(book => {
      // If the book's genre is not in the active genres list, mark it as N/A
      if (book.genre && !activeGenreNames.includes(book.genre)) {
        return { ...book, genre: 'N/A' };
      }
      return book;
    });
    
    setData(updatedBooks);
    
    // Also update filtered books with the same logic
    if (mainSearchTerm) {
      const lowercasedTerm = mainSearchTerm.toLowerCase();
      const filtered = updatedBooks.filter(book => 
        book.title?.toLowerCase().includes(lowercasedTerm) ||
        book.author?.toLowerCase().includes(lowercasedTerm) ||
        book.accessionNumber?.toLowerCase().includes(lowercasedTerm) ||
        book.genre?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(updatedBooks);
    }
  }, [activeGenres]);

  // Filter main table based on search term
  useEffect(() => {
    if (mainSearchTerm) {
      const lowercasedTerm = mainSearchTerm.toLowerCase();
      const filtered = data.filter(book => 
        book.title?.toLowerCase().includes(lowercasedTerm) ||
        book.author?.toLowerCase().includes(lowercasedTerm) ||
        book.accessionNumber?.toLowerCase().includes(lowercasedTerm) ||
        book.genre?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(data);
    }
  }, [mainSearchTerm, data]);

  // Table-only refresh function
  const refreshTableData = () => {
    setTableRefreshing(true);
    fetchData();
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

  // Handle bulk operations success
  const handleOperationSuccess = () => {
    refreshTableData();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (book = null) => {
    if (book) {
      // When editing a book with an archived genre,
      // we need to handle it specially
      let initialGenre = book.genre;
      
      // If the genre is "N/A" (archived genre), clear it so user must select a new one
      if (initialGenre === 'N/A') {
        initialGenre = '';
      }
      
      setFormFields({
        title: book.title || '',
        author: book.author || '',
        accessionNumber: book.accessionNumber || '',
        genre: initialGenre,
        dateRegistered: book.dateRegistered || new Date().toISOString()
      });
      setSelectedBook(book);
      setIsEditing(true);
    } else {
      setFormFields({
        title: '',
        author: '',
        accessionNumber: '',
        genre: '',
        dateRegistered: new Date().toISOString()
      });
      setSelectedBook(null);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormFields({
      title: '',
      author: '',
      accessionNumber: '',
      genre: '',
      dateRegistered: new Date().toISOString()
    });
    setIsEditing(false);
    setSelectedBook(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  // View book details
  const handleViewBook = (book) => {
    setSelectedBook(book);
    setOpenViewDialog(true);
    setOpenSearchDialog(false);
  };
  
  // Function to handle row click and select a book
  const handleRowClick = (book) => {
    handleViewBook(book);
  };
  
  // Function to close search dialog
  const handleCloseSearchDialog = () => {
    setOpenSearchDialog(false);
    setSearchTerm('');
  };
  
  // Function to handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    // Filter books based on search term
    const filtered = data.filter(book => 
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.accessionNumber?.toLowerCase().includes(term)
    );
    
    setFilteredBooks(filtered);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedBook(null);
  };

  // Delete related functions
  const handleDeleteClick = (event, book) => {
    event.stopPropagation(); // Prevent row click
    setBookToDelete(book);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setBookToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/books/${bookToDelete.id}`);

      // Remove the deleted book from the data state
      setData((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
      setFilteredBooks((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
      handleCloseDeleteDialog();
      
      // Show success message
      alert('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      
      // For demo mode, still remove the book from the UI
      setData((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
      setFilteredBooks((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
      handleCloseDeleteDialog();
      
      alert('Book deleted (demo mode)');
    }
  };

  const handleEditClick = (event, book) => {
    event.stopPropagation(); // Prevent row click
    handleOpenDialog(book);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formFields.title.trim()) {
        alert('Please enter the book title');
        return;
      }
      
      if (!formFields.accessionNumber.trim()) {
        alert('Please enter the accession number');
        return;
      }
      
      if (!formFields.genre) {
        alert('Please select a genre');
        return;
      }
      
      const submissionData = {
        ...formFields,
        dateRegistered: formFields.dateRegistered || new Date().toISOString()
      };
      
      if (isEditing && selectedBook) {
        // Update existing book
        const response = await api.put(`/books/${selectedBook.id}`, submissionData);
        const updatedBook = response.data;
        
        setData((prevData) => prevData.map(book => 
          book.id === selectedBook.id ? updatedBook : book
        ));
        setFilteredBooks((prevData) => prevData.map(book => 
          book.id === selectedBook.id ? updatedBook : book
        ));
        alert('Book updated successfully');
      } else {
        // Add new book
        const response = await api.post('/books/add', submissionData);
        const newBook = response.data;
        
        setData((prevData) => [...prevData, newBook]);
        setFilteredBooks((prevData) => [...prevData, newBook]);
        alert('Book added successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error with book operation:', error);
      
      // For demo mode, simulate success
      if (isEditing && selectedBook) {
        // Update book in demo mode
        const updatedBook = {
          ...selectedBook,
          ...formFields
        };
        
        setData((prevData) => prevData.map(book => 
          book.id === selectedBook.id ? updatedBook : book
        ));
        setFilteredBooks((prevData) => prevData.map(book => 
          book.id === selectedBook.id ? updatedBook : book
        ));
        alert('Book updated (demo mode)');
      } else {
        // Add new book in demo mode
        const newBook = {
          id: Math.max(0, ...data.map(b => b.id)) + 1,
          ...formFields,
          dateRegistered: formFields.dateRegistered || new Date().toISOString()
        };
        
        setData((prevData) => [...prevData, newBook]);
        setFilteredBooks((prevData) => [...prevData, newBook]);
        alert('Book added (demo mode)');
      }
      
      handleCloseDialog();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid Date";
    }
  };

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
            Manage Books
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
              gap: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            <IconButton>
              <MenuIcon />
            </IconButton>

            <TextField
              variant="outlined"
              placeholder="Search books..."
              size="small"
              value={mainSearchTerm}
              onChange={(e) => setMainSearchTerm(e.target.value)}
              sx={{
                borderRadius: '100px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '100px',
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 8px -2px rgba(128, 128, 128, 0.2)',
                },
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '400px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              marginBottom: 2,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="contained"
              sx={{
                fontWeight: 'bold',
                padding: '10px 15px',
                fontSize: '11px', 
                borderRadius: '10px',
                color: 'black',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                backgroundColor: '#F8C400',
                '&:hover': { backgroundColor: '#FFDF16' },
              }}
              onClick={() => handleOpenDialog(null)}
            >
              Add Book
            </Button>

            {/* Bulk Import Button */}
            <Button
              variant="contained"
              onClick={handleOpenBulkImport}
              sx={{
                fontWeight: 'bold',
                padding: '10px 15px',
                fontSize: '11px', 
                borderRadius: '10px',
                color: 'black',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                backgroundColor: '#F8C400',
                '&:hover': { backgroundColor: '#FFDF16' },
              }}
            >
              <UploadFileIcon sx={{ marginRight: 1, fontSize: '16px' }} />
              Bulk Import
            </Button>

            {/* Bulk Update Button */}
            <Button
              variant="contained"
              onClick={() => setIsBulkUpdateOpen(true)}
              sx={{
                fontWeight: 'bold',
                padding: '10px 15px',
                fontSize: '11px', 
                borderRadius: '10px',
                color: 'black',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                backgroundColor: '#F8C400',
                '&:hover': { backgroundColor: '#FFDF16' },
              }}
            >
              <SystemUpdateAltIcon sx={{ marginRight: 1, fontSize: '16px' }} />
              Bulk Update
            </Button>
          </Box>

          {/* Table container with positioned loading overlay */}
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
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {loading ? 'Loading books...' : 'Refreshing data...'}
                </Typography>
              </Box>
            )}

            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    BOOK TITLE
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    AUTHOR
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    ACCESSION NUMBER
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    GENRE
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    DATE REGISTERED
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#F8C400' }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBooks
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((book, index) => (
                    <TableRow
                      key={book.id || index}
                      hover
                      onClick={() => handleViewBook(book)}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                        '&:hover': { backgroundColor: '#FCEAEA' },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell align="center">{book.title}</TableCell>
                      <TableCell align="center">{book.author}</TableCell>
                      <TableCell align="center">{book.accessionNumber}</TableCell>
                      <TableCell align="center">{book.genre}</TableCell>
                      <TableCell align="center">{formatDate(book.dateRegistered)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleEditClick(e, book)}
                              sx={{ 
                                color: '#2196F3',
                                '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleDeleteClick(e, book)}
                              sx={{ 
                                color: '#F44336',
                                '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredBooks.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No books found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Integrated pagination inside the TableContainer */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBooks.length}
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
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 60, width: '100%' }} />
        </Box>
      </Box>

      {/* Add/Edit Book Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Book Title"
            name="title"
            value={formFields.title}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Author"
            name="author"
            value={formFields.author}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Accession Number"
            name="accessionNumber"
            value={formFields.accessionNumber}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Genre</InputLabel>
            <Select
              name="genre"
              value={formFields.genre}
              onChange={handleInputChange}
            >
              {/* Only show unarchived genres in the dropdown */}
              {activeGenres.map(genre => (
                <MenuItem key={genre.id} value={genre.genre}>
                  {genre.genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary"
            disabled={!formFields.title.trim() || !formFields.accessionNumber.trim() || !formFields.genre}
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Book Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold',
            bgcolor: '#f5f5f5',
            borderBottom: '1px solid #ddd'
          }}
        >
          View Book Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedBook && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Book Title</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.title || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Accession Number</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.accessionNumber || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Author</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.author || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Genre</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.genre || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Date Registered</Typography>
                <TextField
                  fullWidth
                  value={formatDate(selectedBook.dateRegistered)}
                  InputProps={{ readOnly: true }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
          <Button
            onClick={handleCloseViewDialog}
            variant="contained"
            sx={{
              backgroundColor: '#CD6161',
              '&:hover': { backgroundColor: '#B33A3A' },
              width: '100px'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Book Dialog */}
      <Dialog 
        open={openSearchDialog} 
        onClose={handleCloseSearchDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold',
            fontSize: '24px',
            pb: 1
          }}
        >
          View Book
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }}>Search:</Typography>
            <TextField
              fullWidth
              placeholder="Type book title, author, or accession number..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Typography 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: '20px',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Books
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#FFB300' }}>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>BOOK TITLE</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>AUTHOR</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>ACCESSION NUMBER</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>GENRE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book, index) => (
                    <TableRow 
                      key={book.id || index}
                      onClick={() => handleViewBook(book)}
                      selected={selectedBook?.id === book.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.accessionNumber}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No books found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleCloseSearchDialog}
            sx={{
              backgroundColor: '#666666',
              '&:hover': { backgroundColor: '#444444' },
              width: '120px'
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Book Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#f44336' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this book?
            {bookToDelete && (
              <Box component="span" sx={{ display: 'block', fontWeight: 'bold', mt: 2 }}>
                "{bookToDelete.title}" by {bookToDelete.author}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              backgroundColor: '#f44336',
              '&:hover': { backgroundColor: '#d32f2f' },
              width: '120px'
            }}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            onClick={handleCloseDeleteDialog}
            sx={{
              width: '120px'
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Dialog */}
      <BulkImportBooks
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={handleOperationSuccess}
        initialStep={bulkImportStep}
        onStepChange={handleBulkImportStepChange}
        activeGenres={activeGenres}
        ref={bulkImportRef}
      />

      {/* Bulk Update Dialog */}
      <BulkUpdateBooks
        open={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        onSuccess={handleOperationSuccess}
        activeGenres={activeGenres}
        ref={bulkUpdateRef}
      />
    </>
  );
};

export default LibrarianManageBooks;