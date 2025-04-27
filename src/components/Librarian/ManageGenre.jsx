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
  Select,
  MenuItem,
  FormControl,
  Grid,
  Alert,
  Snackbar,
  Tooltip,
  DialogContentText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import api from '../../utils/api'; // Import the API utility

const LibrarianManageGenre = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [genreName, setGenreName] = useState('');
  const [title, setTitle] = useState('');
  const [genreToUpdate, setGenreToUpdate] = useState(null);
  const [updatedGenreName, setUpdatedGenreName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Add success message handling
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Add confirmation dialog for archive/unarchive
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [genreToArchive, setGenreToArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(true); // true for archive, false for unarchive

  // Fetch genres and books data
  const fetchData = async () => {
    setLoading(true);
    try {
      const genreResponse = await api.get('/genres');
      const bookResponse = await api.get('/books/all');

      const genres = genreResponse.data;
      const books = bookResponse.data;

      // Map books to their respective genres
      const genresWithBooks = genres.map((genre) => {
        const booksForGenre = books.filter((book) => book.genre === genre.genre);
        return { ...genre, books: booksForGenre };
      });

      setData(genresWithBooks);
      // Filter out archived genres for initial display
      setFilteredData(genresWithBooks.filter(genre => !genre.archived));
    } catch (error) {
      console.error('Error fetching data:', error);
      // Sample data for testing - added titles matching the MySQL Workbench screenshot
      const sampleGenres = [
        { id: 1, genre: 'History', title: 'the past', books: [], archived: true },
        { id: 2, genre: 'Actions', title: 'fighting', books: [{ title: 'Action Book 1' }], archived: false },
        { id: 3, genre: 'Fantasy', title: 'Power', books: [], archived: false },
        { id: 4, genre: 'Literature', title: 'english', books: [], archived: false },
        { id: 5, genre: 'Poetry', title: 'words', books: [{ title: 'Poetry Book 1' }, { title: 'Poetry Book 2' }], archived: false },
        { id: 6, genre: 'Fiction', title: 'Not real', books: [{ title: 'Fiction Book 1' }], archived: false },
        { id: 7, genre: 'Sports', title: 'Hotdog Virginia', books: [], archived: false },
        { id: 8, genre: 'Romance', title: 'Kissing', books: [], archived: false },
        { id: 9, genre: 'SciFi', title: 'ASDA', books: [], archived: false },
        { id: 10, genre: 'LOL', title: 'Junrey Bayut', books: [{ title: 'LOL Book 1' }], archived: false },
        { id: 11, genre: 'ipoujp', title: 'new genre', books: [], archived: false },
        { id: 12, genre: 'xev', title: 'another new', books: [], archived: false },
      ];
      setData(sampleGenres);
      // Filter out archived genres for initial display
      setFilteredData(sampleGenres.filter(genre => !genre.archived));
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle search and filter out archived genres
  useEffect(() => {
    if (searchQuery) {
      // First apply the search query filter
      const searched = data.filter((genre) =>
        genre.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Then filter out archived genres completely
      const filtered = searched.filter(genre => !genre.archived);
      
      setFilteredData(filtered);
    } else {
      // If no search query, just filter out archived genres
      const filtered = data.filter(genre => !genre.archived);
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  // Dialog handlers for Add Genre
  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setGenreName('');
    setTitle('');
  };

  // Dialog handlers for Update Genre
  const handleOpenUpdateDialog = () => {
    setOpenUpdateDialog(true);
    setGenreToUpdate(null);
    setUpdatedGenreName('');
    setUpdatedDescription('');
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setGenreToUpdate(null);
    setUpdatedGenreName('');
    setUpdatedDescription('');
  };

  // When a genre is selected for update, populate the form fields
  const handleGenreSelect = (genre) => {
    setGenreToUpdate(genre);
    setUpdatedGenreName(genre.genre);
    setUpdatedDescription(genre.title || ''); // Use title if available or empty string
  };

  // Archive/Unarchive dialog handlers
  const handleOpenArchiveDialog = (genre, archiving, event) => {
    // Stop propagation to prevent row selection when clicking archive button
    if (event) {
      event.stopPropagation();
    }
    setGenreToArchive(genre);
    setIsArchiving(archiving); // true for archive, false to unarchive
    setOpenArchiveDialog(true);
  };

  const handleCloseArchiveDialog = () => {
    setOpenArchiveDialog(false);
    setGenreToArchive(null);
  };

  // Snackbar handlers
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSuccessMessage = (message) => {
    setSnackbarSeverity('success');
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const showErrorMessage = (message) => {
    setSnackbarSeverity('error');
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Add new genre
  const handleAddGenre = async () => {
    try {
      const response = await api.post('/genres', { genre: genreName, title });
      const newGenre = response.data;
      
      // Add empty books array to the new genre object
      const newGenreWithBooks = { ...newGenre, books: [] };
      
      setData((prevData) => [newGenreWithBooks, ...prevData]);
      // Only add to filtered data if it's not archived
      if (!newGenreWithBooks.archived) {
        setFilteredData((prevData) => [newGenreWithBooks, ...prevData]);
      }
      handleCloseAddDialog();
      
      // Show success message
      showSuccessMessage('Genre added successfully');
    } catch (error) {
      console.error('Error adding genre:', error);
      
      // For testing: Add the new genre even if the API fails
      const newGenreWithBooks = { 
        id: Math.max(...data.map(genre => genre.id)) + 1,
        genre: genreName, 
        title: title,
        books: [],
        archived: false 
      };
      
      setData((prevData) => [newGenreWithBooks, ...prevData]);
      setFilteredData((prevData) => [newGenreWithBooks, ...prevData]);
      handleCloseAddDialog();
      
      showSuccessMessage('Genre added (demo mode)');
    }
  };

  // Update genre
  const handleUpdateGenre = async () => {
    if (!genreToUpdate) return;
    
    try {
      const response = await api.put(`/genres/${genreToUpdate.id}`, { 
        genre: updatedGenreName, 
        title: updatedDescription 
      });

      const updatedResponse = response.data;
      let updatedGenre;
      
      // Check response format - it might be direct object or nested in response.genre
      if (updatedResponse.genre) {
        updatedGenre = updatedResponse.genre;
      } else {
        updatedGenre = updatedResponse;
      }
      
      // Close dialog first to prevent state issues
      handleCloseUpdateDialog();
      
      // Show success message with a slight delay
      showSuccessMessage('Genre updated successfully');
      
      // After a slight delay, refresh data to ensure everything is in sync
      setTimeout(() => {
        fetchData();
      }, 300);
      
    } catch (error) {
      console.error('Error updating genre:', error);
      
      // For testing: Update the genre even if the API fails
      const updatedGenreData = {
        ...genreToUpdate,
        genre: updatedGenreName,
        title: updatedDescription
      };
      
      // Close dialog first
      handleCloseUpdateDialog();
      
      // Update state after dialog is closed
      setData((prevData) => 
        prevData.map((genre) => 
          genre.id === genreToUpdate.id ? updatedGenreData : genre
        )
      );
      
      // Only update filteredData if the genre is not archived
      if (!updatedGenreData.archived) {
        setFilteredData((prevData) => 
          prevData.map((genre) => 
            genre.id === genreToUpdate.id ? updatedGenreData : genre
          )
        );
      }
      
      showSuccessMessage('Genre updated (demo mode)');
    }
  };

  // Archive/Unarchive genre
  const handleToggleArchiveGenre = async () => {
    if (!genreToArchive) return;
    
    try {
      const response = await api.put(`/genres/${genreToArchive.id}/archive`, { archived: isArchiving });

      // Close dialog first
      handleCloseArchiveDialog();
      
      // Show success message
      const action = isArchiving ? 'archived' : 'unarchived';
      showSuccessMessage(`Genre "${genreToArchive.genre}" ${action} successfully`);
      
      // Update data state with new archived status
      setData((prevData) => 
        prevData.map((genre) => 
          genre.id === genreToArchive.id ? { ...genre, archived: isArchiving } : genre
        )
      );
      
      // Update filtered data - remove if archiving, add if unarchiving
      if (isArchiving) {
        setFilteredData((prevData) => 
          prevData.filter((genre) => genre.id !== genreToArchive.id)
        );
      } else {
        // When unarchiving, add it back to filteredData if it matches the current search criteria
        const unarchived = { 
          ...genreToArchive, 
          archived: false,
          // Make sure we keep all the original properties
          books: genreToArchive.books || [] 
        };
        
        if (!searchQuery || unarchived.genre.toLowerCase().includes(searchQuery.toLowerCase())) {
          setFilteredData((prevData) => [...prevData, unarchived]);
        }
      }
      
    } catch (error) {
      console.error(`Error ${isArchiving ? 'archiving' : 'unarchiving'} genre:`, error);
      
      // For testing: Toggle archive status even if the API fails
      handleCloseArchiveDialog();
      
      // Update data state
      setData((prevData) => 
        prevData.map((genre) => 
          genre.id === genreToArchive.id ? { ...genre, archived: isArchiving } : genre
        )
      );
      
      // Update filtered data - remove if archiving, add if unarchiving
      if (isArchiving) {
        setFilteredData((prevData) => 
          prevData.filter((genre) => genre.id !== genreToArchive.id)
        );
      } else {
        const unarchived = { 
          ...genreToArchive, 
          archived: false,
          books: genreToArchive.books || [] 
        };
        
        if (!searchQuery || unarchived.genre.toLowerCase().includes(searchQuery.toLowerCase())) {
          setFilteredData((prevData) => [...prevData, unarchived]);
        }
      }
      
      const action = isArchiving ? 'archived' : 'unarchived';
      showSuccessMessage(`Genre "${genreToArchive.genre}" ${action} (demo mode)`);
    }
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Calculate pagination values
  const totalGenres = filteredData.length;
  const totalPages = Math.ceil(totalGenres / rowsPerPage);
  const startRow = (page - 1) * rowsPerPage + 1;
  const endRow = Math.min(page * rowsPerPage, totalGenres);

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
            sx={{ 
              color: '#000', 
              fontWeight: 'bold', 
              marginBottom: 3,
              textAlign: 'left'
            }}
          >
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
                fontSize: '11px',
                backgroundColor: '#800000', // Changed from #4CAF50
                '&:hover': { backgroundColor: '#5D0000' }, // Darker shade for hover (changed from #388E3C)
              }}
              onClick={handleOpenUpdateDialog}
            >
              View Genre
            </Button>
            <Button
              variant="contained"
              sx={{
                color: 'black',
                backgroundColor: '#FFDF16',
                fontSize: '11px',
                border: '1px solid #FFEB3B',
                marginRight: 1,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#FFEB3B',
                },
              }}
              onClick={handleOpenAddDialog}
            >
              Add Genre
            </Button>
          </Box>

          {/* Table Section */}
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
              position: 'relative', // For better positioning
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {filteredData.map((genre) => (
                    <TableCell
                      key={genre.id}
                      sx={{ 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        backgroundColor: '#F8C400',
                      }}
                    >
                      {genre.genre}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const maxRows = Math.max(...filteredData.map((genre) => (genre.books && genre.books.length) || 0), 0);
                  // Apply pagination to the rows
                  const startIndex = (page - 1) * rowsPerPage;
                  const endIndex = Math.min(startIndex + rowsPerPage, maxRows);
                  
                  return Array.from({ length: endIndex - startIndex }).map((_, idx) => {
                    const rowIndex = startIndex + idx;
                    return (
                      <TableRow key={rowIndex}>
                        {filteredData.map((genre) => (
                          <TableCell
                            key={genre.id}
                            sx={{
                              textAlign: 'center',
                              backgroundColor: rowIndex % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                            }}
                          >
                            {genre.books && genre.books[rowIndex]
                              ? genre.books[rowIndex].title
                              : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          
            {/* Pagination Controls - Centered inside TableContainer for better positioning */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
              backgroundColor: 'transparent',
              width: '100%',
              position: 'relative', // Ensure visibility
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Typography variant="body2" color="textSecondary" mr={1}>
                  Rows per page:
                </Typography>
                <FormControl variant="standard" size="small">
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    sx={{ 
                      fontSize: '0.875rem',
                      '& .MuiSelect-select': { 
                        py: 0.5,
                        pr: 2 
                      }
                    }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mx: 2 }}>
                {startRow}–{endRow} of {totalGenres}
              </Typography>
              
              <Box sx={{ display: 'flex' }}>
                <IconButton 
                  size="small"
                  disabled={page === 1}
                  onClick={() => handleChangePage(null, page - 1)}
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
                <IconButton 
                  size="small"
                  disabled={page >= totalPages}
                  onClick={() => handleChangePage(null, page + 1)}
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
              </Box>
            </Box>
          </TableContainer>

          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 60, width: '100%' }} />
        </Box>
      </Box>

      {/* Add Genre Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
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
            required
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddGenre} 
            color="primary"
            disabled={!genreName.trim()} // Disable button if genre name is empty
          >
            Add Genre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Genre Dialog with Archive Column */}
      <Dialog 
        open={openUpdateDialog} 
        onClose={handleCloseUpdateDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold',
            fontSize: '24px',
            py: 2
          }}
        >
          Select Genre to Update
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Genre Selection Table with Archive Column */}
          <TableContainer 
            component={Paper} 
            sx={{ 
              mb: 3,
              boxShadow: 'none',
              border: '1px solid #e0e0e0',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#800000' }}> {/* Changed from #4CAF50 */}
                  <TableCell 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      py: 1.5,
                      textAlign: 'left'
                    }}
                  >
                    GENRE NAME
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      py: 1.5,
                      textAlign: 'left'
                    }}
                  >
                    DESCRIPTION
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      py: 1.5,
                      textAlign: 'left'
                    }}
                  >
                    NUMBER OF BOOKS
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      py: 1.5,
                      textAlign: 'center'
                    }}
                  >
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((genre) => (
                  <TableRow 
                    key={genre.id}
                    onClick={() => handleGenreSelect(genre)}
                    selected={genreToUpdate?.id === genre.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      backgroundColor: genreToUpdate?.id === genre.id ? '#e8f5e9' : 
                        genre.id % 2 === 0 ? '#ffffff' : '#f5f5f5',
                      '&:hover': {
                        backgroundColor: '#e8f5e9',
                      },
                      // If genre is archived, display with reduced opacity
                      opacity: genre.archived ? 0.6 : 1,
                    }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      {genre.genre}
                      {genre.archived && (
                        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                          (Archived)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>{genre.title || 'No description'}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{genre.books ? genre.books.length : 0}</TableCell>
                    <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                      {!genre.archived ? (
                        <Tooltip title="Archive genre">
                          <IconButton
                            onClick={(e) => handleOpenArchiveDialog(genre, true, e)}
                            color="default"
                            size="small"
                            sx={{
                              '&:hover': {
                                color: '#f44336',
                              },
                            }}
                          >
                            <ArchiveIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Unarchive genre">
                          <IconButton
                            onClick={(e) => handleOpenArchiveDialog(genre, false, e)}
                            color="primary"
                            size="small"
                            sx={{
                              '&:hover': {
                                color: '#4CAF50',
                              },
                            }}
                          >
                            <UnarchiveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Update form section */}
          {genreToUpdate && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '18px',
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                Update Genre Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Genre Name"
                    value={updatedGenreName}
                    onChange={(e) => setUpdatedGenreName(e.target.value)}
                    variant="outlined"
                    required
                    disabled={genreToUpdate.archived}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={updatedDescription}
                    onChange={(e) => setUpdatedDescription(e.target.value)}
                    variant="outlined"
                    disabled={genreToUpdate.archived}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        {/* Buttons */}
        <DialogActions 
          sx={{ 
            justifyContent: 'center', 
            gap: 2,
            pb: 3 
          }}
        >
          <Button
            variant="contained"
            onClick={handleUpdateGenre}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#388E3C' },
              width: '120px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}
            disabled={!genreToUpdate || !updatedGenreName.trim() || genreToUpdate?.archived} // Disable button if no genre is selected, name is empty, or genre is archived
          >
            UPDATE
          </Button>
          <Button
            variant="contained"
            onClick={handleCloseUpdateDialog}
            sx={{
              backgroundColor: '#666666',
              '&:hover': { backgroundColor: '#444444' },
              width: '120px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive/Unarchive Confirmation Dialog */}
      <Dialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        aria-labelledby="archive-dialog-title"
        aria-describedby="archive-dialog-description"
      >
        <DialogTitle id="archive-dialog-title">
          {isArchiving ? 'Archive Genre' : 'Unarchive Genre'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="archive-dialog-description">
            {isArchiving ? (
              <>
                Are you sure you want to archive the genre "{genreToArchive?.genre}"? 
                This will remove the genre from the main table.
              </>
            ) : (
              <>
                Are you sure you want to unarchive the genre "{genreToArchive?.genre}"? 
                This will make the genre visible again in the main table.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArchiveDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleToggleArchiveGenre} 
            color={isArchiving ? "error" : "success"} 
            autoFocus
          >
            {isArchiving ? 'Archive' : 'Unarchive'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LibrarianManageGenre;