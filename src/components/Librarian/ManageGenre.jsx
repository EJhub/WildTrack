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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

const LibrarianManageGenre = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [genreName, setGenreName] = useState('');
  const [title, setTitle] = useState('');

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

  // Open and close dialog handlers
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setGenreName('');
    setTitle('');
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
    </>
  );
};

export default LibrarianManageGenre;
