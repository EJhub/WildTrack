import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
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

const LibrarianManageBooks = () => {
  const [data, setData] = useState([]); // Book data with additional UI states
  const [genres, setGenres] = useState([]); // Store genres for dropdown
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

  const [formFields, setFormFields] = useState({
    title: '',
    author: '',
    accessionNumber: '',
    isbn: '',
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
      const booksResponse = await fetch('http://localhost:8080/api/books/all');
      if (!booksResponse.ok) {
        const errorMessage = await booksResponse.text();
        console.error(`Error fetching books: ${errorMessage}`);
        return;
      }
      const books = await booksResponse.json();
      setData(books);
      setFilteredBooks(books);
      
      // Fetch genres for dropdown
      const genresResponse = await fetch('http://localhost:8080/api/genres');
      if (!genresResponse.ok) {
        const errorMessage = await genresResponse.text();
        console.error(`Error fetching genres: ${errorMessage}`);
        return;
      }
      const genresData = await genresResponse.json();
      setGenres(genresData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter main table based on search term
  useEffect(() => {
    if (mainSearchTerm) {
      const lowercasedTerm = mainSearchTerm.toLowerCase();
      const filtered = data.filter(book => 
        book.title?.toLowerCase().includes(lowercasedTerm) ||
        book.author?.toLowerCase().includes(lowercasedTerm) ||
        book.accessionNumber?.toLowerCase().includes(lowercasedTerm) ||
        book.isbn?.toLowerCase().includes(lowercasedTerm) ||
        book.genre?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(data);
    }
  }, [mainSearchTerm, data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (book = null) => {
    if (book) {
      setFormFields({
        title: book.title || '',
        author: book.author || '',
        accessionNumber: book.accessionNumber || '',
        isbn: book.isbn || '',
        genre: book.genre || '',
        dateRegistered: book.dateRegistered || new Date().toISOString()
      });
      setSelectedBook(book);
      setIsEditing(true);
    } else {
      setFormFields({
        title: '',
        author: '',
        accessionNumber: '',
        isbn: '',
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
      isbn: '',
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
  
  // Function to open search dialog for viewing books
  const handleOpenSearchDialog = () => {
    setSearchTerm('');
    setFilteredBooks(data);
    setOpenSearchDialog(true);
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
      const response = await fetch(`http://localhost:8080/api/books/${bookToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Error deleting book');
        return;
      }

      // Remove the deleted book from the data state
      setData((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
      handleCloseDeleteDialog();
      
      // Show success message
      alert('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('An unexpected error occurred while deleting the book.');
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
        const response = await fetch(`http://localhost:8080/api/books/${selectedBook.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          alert(`Error: ${errorMessage}`);
          return;
        }

        const updatedBook = await response.json();
        setData((prevData) => prevData.map(book => 
          book.id === selectedBook.id ? updatedBook : book
        ));
        alert('Book updated successfully');
      } else {
        // Add new book
        const response = await fetch('http://localhost:8080/api/books/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          alert(`Error: ${errorMessage}`);
          return;
        }

        const newBook = await response.json();
        setData((prevData) => [...prevData, newBook]);
        alert('Book added successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error with book operation:', error);
      alert('An unexpected error occurred.');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />

        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
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
                backgroundColor: '#fff',
                borderRadius: '15px',
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
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#388e3c' },
              }}
              onClick={() => handleOpenSearchDialog()}
            >
              View Book
            </Button>
            <Button
              variant="contained"
              sx={{
                fontWeight: 'bold',
                padding: '10px 20px',
                backgroundColor: '#FFB300',
                '&:hover': { backgroundColor: '#F57C00' },
              }}
              onClick={() => handleOpenDialog(null)}
            >
              Add Book
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              borderRadius: '15px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#FFB300' }}>
                    BOOK TITLE
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#FFB300' }}>
                    AUTHOR
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#FFB300' }}>
                    ACCESSION NUMBER
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#FFB300' }}>
                    ISBN
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#FFB300' }}>
                    GENRE
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#FFB300' }}>
                    DATE REGISTERED
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#FFB300' }}>
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
                      <TableCell align="center">{book.isbn}</TableCell>
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
                {filteredBooks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No books found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredBooks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 2,
              width: '100%',
            }}
          />
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
          <TextField
            margin="dense"
            label="ISBN"
            name="isbn"
            value={formFields.isbn}
            onChange={handleInputChange}
            fullWidth
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Genre</InputLabel>
            <Select
              name="genre"
              value={formFields.genre}
              onChange={handleInputChange}
            >
              {genres.map(genre => (
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Book Title</Typography>
              <TextField
                fullWidth
                value={selectedBook.title || ''}
                sx={{ mb: 2 }}
                InputProps={{ readOnly: true }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Accession Number</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.accessionNumber || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>ISBN</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.isbn || ''}
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
                  <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>ISBN</TableCell>
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
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No books found</TableCell>
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
    </>
  );
};

export default LibrarianManageBooks;
