import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

const LibrarianManageGenre = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [genreName, setGenreName] = useState('');
  const [title, setTitle] = useState('');
  const [genreToDelete, setGenreToDelete] = useState(null);
  const [deleteSearchTerm, setDeleteSearchTerm] = useState('');

  // Fetch genres and books data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const genreResponse = await fetch('http://localhost:8080/api/genres');
        const bookResponse = await fetch('http://localhost:8080/api/books/all');

        if (!genreResponse.ok || !bookResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const genres = await genreResponse.json();
        const books = await bookResponse.json();

        // Map books to their respective genres
        const genresWithBooks = genres.map((genre) => {
          const booksForGenre = books.filter((book) => book.genre === genre.genre);
          return { ...genre, books: booksForGenre };
        });

        setData(genresWithBooks);
        setFilteredData(genresWithBooks);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = data.filter((genre) =>
        genre.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchQuery, data]);

  // Dialog handlers
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setGenreName('');
    setTitle('');
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    setDeleteSearchTerm('');
    setGenreToDelete(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteSearchTerm('');
    setGenreToDelete(null);
  };

  // Add new genre
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genre: genreName, title }),
      });

      if (!response.ok) {
        throw new Error('Failed to add genre');
      }

      const newGenre = await response.json();
      setData((prevData) => [newGenre, ...prevData]);
      setFilteredData((prevData) => [newGenre, ...prevData]);
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding genre:', error);
    }
  };

  // Delete genre
  const handleConfirmDelete = async () => {
    if (!genreToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/genres/${genreToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete genre');
      }

      setData((prevData) => prevData.filter((genre) => genre.id !== genreToDelete.id));
      setFilteredData((prevData) => prevData.filter((genre) => genre.id !== genreToDelete.id));
      handleCloseDeleteDialog();
      alert('Genre deleted successfully');
    } catch (error) {
      console.error('Error deleting genre:', error);
      alert('Failed to delete genre');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
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
          }}
        >
          <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3 }}>
            Manage Genre
          </Typography>

          {/* Search Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 2 }}>
            <IconButton>
              <MenuIcon />
            </IconButton>
            <TextField
              variant="outlined"
              placeholder="Search genres..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <Button
              variant="contained"
              sx={{
                fontWeight: 'bold',
                backgroundColor: '#CD6161',
                '&:hover': { backgroundColor: '#ff0000' },
              }}
              onClick={handleOpenDeleteDialog}
            >
              Delete Genre
            </Button>
            <Button
              variant="contained"
              sx={{
                fontWeight: 'bold',
                backgroundColor: '#FFB300',
                '&:hover': { backgroundColor: '#F57C00' },
              }}
              onClick={handleOpenDialog}
            >
              Add Genre
            </Button>
          </Box>

          {/* Table Section */}
          <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {filteredData.map((genre) => (
                    <TableCell
                      key={genre.id}
                      sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#FFEB3B' }}
                    >
                      {genre.genre}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const maxRows = Math.max(...filteredData.map((genre) => genre.books.length || 0));
                  return Array.from({ length: maxRows }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {filteredData.map((genre) => (
                        <TableCell
                          key={genre.id}
                          sx={{
                            textAlign: 'center',
                            backgroundColor: '#FFF8E1',
                          }}
                        >
                          {genre.books && genre.books[rowIndex]
                            ? genre.books[rowIndex].title
                            : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Add Genre Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Genre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Genre Name"
            value={genreName}
            onChange={(e) => setGenreName(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add Genre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Genre Dialog */}
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
          Delete Genre
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }}>Title:</Typography>
            <TextField
              fullWidth
              placeholder="Type genre name here..."
              size="small"
              value={deleteSearchTerm}
              onChange={(e) => setDeleteSearchTerm(e.target.value)}
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
            Genre Details
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#8B0000' }}>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>GENRE NAME</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 'bold' }}>NUMBER OF BOOKS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .filter(genre => 
                    !deleteSearchTerm || 
                    genre.genre.toLowerCase().includes(deleteSearchTerm.toLowerCase())
                  )
                  .map((genre) => (
                    <TableRow 
                      key={genre.id}
                      onClick={() => setGenreToDelete(genre)}
                      selected={genreToDelete?.id === genre.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{genre.genre}</TableCell>
                      <TableCell>{genre.books ? genre.books.length : 0}</TableCell>
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

export default LibrarianManageGenre;
