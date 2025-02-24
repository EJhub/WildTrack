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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';


const LibrarianManageBooks = () => {
  const [data, setData] = useState([]); // Book data with additional UI states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const [formFields, setFormFields] = useState({
    title: '',
    author: '',
    accessionNumber: '',
    isbn: '',
    genre: '',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/books/all');
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error(`Error fetching books: ${errorMessage}`);
        return;
      }
      const books = await response.json();
      setData(books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormFields({ title: '', author: '', accessionNumber: '', isbn: '', genre: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  // Delete related functions
  const handleDeleteClick = (book) => {
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

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/books/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formFields),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        alert(`Error: ${errorMessage}`);
        return;
      }

      const newBook = await response.json();
      setData((prevData) => [...prevData, newBook]);
      setOpenDialog(false);
      setFormFields({ title: '', author: '', accessionNumber: '', isbn: '', genre: '' });
    } catch (error) {
      console.error('Error adding book:', error);
      alert('An unexpected error occurred.');
    }
  };

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
              placeholder="Type here..."
              size="small"
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
                backgroundColor: '#CD6161',
                '&:hover': { backgroundColor: '#ff0000' },
              }}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Book
            </Button>
            <Button
              variant="contained"
              sx={{
                fontWeight: 'bold',
                padding: '10px 20px',
                backgroundColor: '#FFB300',
                '&:hover': { backgroundColor: '#F57C00' },
              }}
              onClick={handleOpenDialog}
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
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    BOOK TITLE
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    AUTHOR
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    ACCESSION NUMBER
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    ISBN
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#CD6161' }}>
                    GENRE
                  </TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((book, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                        '&:hover': { backgroundColor: '#FCEAEA' },
                      }}
                    >
                      <TableCell align="center">{book.title}</TableCell>
                      <TableCell align="center">{book.author}</TableCell>
                      <TableCell align="center">{book.accessionNumber}</TableCell>
                      <TableCell align="center">{book.isbn}</TableCell>
                      <TableCell align="center">{book.genre}</TableCell>

                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
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

      {/* Add Book Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Book</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Book Title"
            name="title"
            value={formFields.title}
            onChange={handleInputChange}
            fullWidth
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
          />
          <TextField
            margin="dense"
            label="ISBN"
            name="isbn"
            value={formFields.isbn}
            onChange={handleInputChange}
            fullWidth
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Genre</InputLabel>
            <Select
              name="genre"
              value={formFields.genre}
              onChange={handleInputChange}
            >
              <MenuItem value="History">History</MenuItem>
              <MenuItem value="Literature">Literature</MenuItem>
              <MenuItem value="Action">Action</MenuItem>
              <MenuItem value="Fiction">Fiction</MenuItem>
              <MenuItem value="Poetry">Poetry</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Book Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
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
          Delete Book
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }}>Title:</Typography>
            <TextField
              fullWidth
              placeholder="Type title here..."
              size="small"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                setData(prevData => prevData.map(book => ({
                  ...book,
                  hidden: !book.title.toLowerCase().includes(searchTerm)
                })));
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
            Book Details
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#8B0000' }}>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>BOOK TITLE</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>AUTHOR</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>ACCESSION NUMBER</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>ISBN</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>GENRE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .filter(book => !book.hidden)
                  .map((book, index) => (
                    <TableRow 
                      key={book.id}
                      onClick={() => setBookToDelete(book)}
                      selected={bookToDelete?.id === book.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.accessionNumber}</TableCell>
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              backgroundColor: '#8B0000',
              '&:hover': { backgroundColor: '#660000' },
              width: '120px'
            }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            onClick={handleCloseDeleteDialog}
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
    </>
  );
};

export default LibrarianManageBooks;
