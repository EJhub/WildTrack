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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
 
const LibrarianManageBooks = () => {
  const [data, setData] = useState([]); // Placeholder for book data
  const [openDialog, setOpenDialog] = useState(false);
 
  // State for form fields
  const [formFields, setFormFields] = useState({
    title: '',
    author: '',
    accessionNumber: '',
    isbn: '',
    genre: '',
  });
 
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
 
  // Fetch all books from the backend
  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/books/all');
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error(`Error fetching books: ${errorMessage}`);
        return;
      }
      const books = await response.json();
      setData(books); // Update the table data
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };
 
  // Use `fetchBooks` in useEffect to load books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);
 
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
 
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
 
  // Handle dialog open
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
 
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormFields({ title: '', author: '', accessionNumber: '', isbn: '', genre: '' });
  };
 
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };
 
  // Handle Add Book form submission
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
      setData((prevData) => [...prevData, newBook]); // Add the new book to the table
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
 
{/* Search and Filters Section */}
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
 
 
          {/* Action Buttons Section */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              marginBottom: 2,
              flexWrap: 'wrap',
              justifyContent: 'flex-end', // Align buttons to the right
            }}
          >
            <Button
              variant="contained"
              sx={{
                fontWeight: 'bold',
                padding: '10px 20px',
                backgroundColor: '#FFB300',
                '&:hover': { backgroundColor: '#F57C00' },
              }}
              onClick={handleOpenDialog} // Open dialog on button click
            >
              Add Book
            </Button>
          </Box>
 
          {/* Table Section */}
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
 
          {/* Pagination Section */}
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
          <TextField autoFocus margin="dense" label="Book Title" name="title" value={formFields.title} onChange={handleInputChange} fullWidth />
          <TextField margin="dense" label="Author" name="author" value={formFields.author} onChange={handleInputChange} fullWidth />
          <TextField margin="dense" label="Accession Number" name="accessionNumber" value={formFields.accessionNumber} onChange={handleInputChange} fullWidth />
          <TextField margin="dense" label="ISBN" name="isbn" value={formFields.isbn} onChange={handleInputChange} fullWidth />
          <TextField margin="dense" label="Genre" name="genre" value={formFields.genre} onChange={handleInputChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
 
export default LibrarianManageBooks;
