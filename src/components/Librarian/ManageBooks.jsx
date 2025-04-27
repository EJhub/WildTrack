import React, { useState, useEffect, useRef } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import BulkImportBooks from './components/BulkImportBooks';
import BulkUpdateBooks from './components/BulkUpdateBooks';
import BulkImportPeriodicals from './components/BulkImportPeriodicals';
import BulkUpdatePeriodicals from './components/BulkUpdatePeriodicals';
import AddBookModal from './components/AddBookModal';
import AddPeriodicalModal from './components/AddPeriodicalModal';
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
  Tooltip,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from '../../utils/api'; // Import the API utility

const LibrarianManageBooks = () => {
  const [data, setData] = useState([]); // Book data with additional UI states
  const [periodicals, setPeriodicals] = useState([]); // Periodicals data
  const [genres, setGenres] = useState([]); // Store all genres
  const [activeGenres, setActiveGenres] = useState([]); // Store only unarchived genres
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [periodicalToDelete, setPeriodicalToDelete] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedPeriodical, setSelectedPeriodical] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filteredPeriodicals, setFilteredPeriodicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books'); // Track which tab is active
  
  // Modal states
  const [openAddBookDialog, setOpenAddBookDialog] = useState(false);
  const [openAddPeriodicalDialog, setOpenAddPeriodicalDialog] = useState(false);

  // Bulk import/update states
  const [isBulkImportBooksOpen, setIsBulkImportBooksOpen] = useState(false);
  const [isBulkUpdateBooksOpen, setIsBulkUpdateBooksOpen] = useState(false);
  const [isBulkImportPeriodicalsOpen, setIsBulkImportPeriodicalsOpen] = useState(false);
  const [isBulkUpdatePeriodicalsOpen, setIsBulkUpdatePeriodicalsOpen] = useState(false);
  const [bulkImportStep, setBulkImportStep] = useState(0);
  const [tableRefreshing, setTableRefreshing] = useState(false);
  
  // Refs for bulk operations
  const bulkImportBooksRef = useRef(null);
  const bulkUpdateBooksRef = useRef(null);
  const bulkImportPeriodicalsRef = useRef(null);
  const bulkUpdatePeriodicalsRef = useRef(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [mainSearchTerm, setMainSearchTerm] = useState('');

  // Fetch books, periodicals and genres data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch books
      const booksResponse = await api.get('/books/all');
      const books = booksResponse.data;
      setData(books);
      setFilteredBooks(books);
      
      // Fetch periodicals
      const periodicalsResponse = await api.get('/periodicals/all');
      const periodicalsData = periodicalsResponse.data;
      setPeriodicals(periodicalsData);
      setFilteredPeriodicals(periodicalsData);
      
      // Fetch genres for dropdown
      const genresResponse = await api.get('/genres');
      const genresData = genresResponse.data;
      setGenres(genresData);
      
      // Filter out archived genres for the dropdown
      const unarchived = genresData.filter(genre => !genre.archived);
      setActiveGenres(unarchived);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data. Please try again later.');
      
      // Set empty arrays if data fetching fails
      setData([]);
      setFilteredBooks([]);
      setPeriodicals([]);
      setFilteredPeriodicals([]);
      setGenres([]);
      setActiveGenres([]);
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
        book.callNumber?.toLowerCase().includes(lowercasedTerm) ||
        book.publisher?.toLowerCase().includes(lowercasedTerm) ||
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
      
      // Filter books
      const filteredBooksData = data.filter(book => 
        book.title?.toLowerCase().includes(lowercasedTerm) ||
        book.author?.toLowerCase().includes(lowercasedTerm) ||
        book.accessionNumber?.toLowerCase().includes(lowercasedTerm) ||
        book.callNumber?.toLowerCase().includes(lowercasedTerm) ||
        book.publisher?.toLowerCase().includes(lowercasedTerm) ||
        book.genre?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredBooks(filteredBooksData);
      
      // Filter periodicals
      const filteredPeriodicalsData = periodicals.filter(periodical => 
        periodical.title?.toLowerCase().includes(lowercasedTerm) ||
        periodical.accessionNumber?.toLowerCase().includes(lowercasedTerm) ||
        periodical.publisher?.toLowerCase().includes(lowercasedTerm) ||
        periodical.placeOfPublication?.toLowerCase().includes(lowercasedTerm) ||
        periodical.copyright?.toString().toLowerCase().includes(lowercasedTerm)
      );
      setFilteredPeriodicals(filteredPeriodicalsData);
    } else {
      setFilteredBooks(data);
      setFilteredPeriodicals(periodicals);
    }
  }, [mainSearchTerm, data, periodicals]);

  // Table-only refresh function
  const refreshTableData = () => {
    setTableRefreshing(true);
    fetchData();
  };

  // Handle opening the add/edit book dialog
  const handleOpenBookDialog = (book = null) => {
    setSelectedBook(book);
    setOpenAddBookDialog(true);
  };

  // Handle opening the add/edit periodical dialog
  const handleOpenPeriodicalDialog = (periodical = null) => {
    setSelectedPeriodical(periodical);
    setOpenAddPeriodicalDialog(true);
  };

  // Handle book operation success
  const handleBookSuccess = (book, operation) => {
    if (operation === 'add') {
      setData(prevData => [...prevData, book]);
      setFilteredBooks(prevData => [...prevData, book]);
      toast.success(`Book "${book.title}" added successfully!`);
    } else if (operation === 'update') {
      setData(prevData => prevData.map(item => item.id === book.id ? book : item));
      setFilteredBooks(prevData => prevData.map(item => item.id === book.id ? book : item));
      toast.success(`Book "${book.title}" updated successfully!`);
    }
  };

  // Handle periodical operation success
  const handlePeriodicalSuccess = (periodical, operation) => {
    if (operation === 'add') {
      setPeriodicals(prevData => [...prevData, periodical]);
      setFilteredPeriodicals(prevData => [...prevData, periodical]);
      toast.success(`Periodical "${periodical.title}" added successfully!`);
    } else if (operation === 'update') {
      setPeriodicals(prevData => prevData.map(item => item.id === periodical.id ? periodical : item));
      setFilteredPeriodicals(prevData => prevData.map(item => item.id === periodical.id ? periodical : item));
      toast.success(`Periodical "${periodical.title}" updated successfully!`);
    }
  };

  // Function to save bulk import step
  const handleBulkImportStepChange = (step) => {
    setBulkImportStep(step);
  };

  // Handle bulk import modal opening based on active tab
  const handleOpenBulkImport = () => {
    setBulkImportStep(0); // Reset to first step when newly opened
    if (activeTab === 'books') {
      setIsBulkImportBooksOpen(true);
    } else {
      setIsBulkImportPeriodicalsOpen(true);
    }
  };

  // Handle bulk update modal opening based on active tab
  const handleOpenBulkUpdate = () => {
    if (activeTab === 'books') {
      setIsBulkUpdateBooksOpen(true);
    } else {
      setIsBulkUpdatePeriodicalsOpen(true);
    }
  };

  // Handle bulk operations success
  const handleOperationSuccess = () => {
    toast.success(`Bulk operation completed successfully!`);
    refreshTableData();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      book.accessionNumber?.toLowerCase().includes(term) ||
      book.callNumber?.toLowerCase().includes(term)
    );
    
    setFilteredBooks(filtered);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedBook(null);
  };

  // Delete functions for books and periodicals
  const handleDeleteClick = (event, item, type) => {
    event.stopPropagation(); // Prevent row click
    if (type === 'book') {
      setBookToDelete(item);
      setPeriodicalToDelete(null);
    } else {
      setBookToDelete(null);
      setPeriodicalToDelete(item);
    }
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setBookToDelete(null);
    setPeriodicalToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      if (bookToDelete) {
        // Delete book
        await api.delete(`/books/${bookToDelete.id}`);
        
        // Remove the deleted book from the data state
        setData((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
        setFilteredBooks((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
        
        // Show success message
        toast.success(`Book "${bookToDelete.title}" deleted successfully!`);
      } else if (periodicalToDelete) {
        // Delete periodical
        await api.delete(`/periodicals/${periodicalToDelete.id}`);
        
        // Remove the deleted periodical from the data state
        setPeriodicals((prevData) => prevData.filter((item) => item.id !== periodicalToDelete.id));
        setFilteredPeriodicals((prevData) => prevData.filter((item) => item.id !== periodicalToDelete.id));
        
        // Show success message
        toast.success(`Periodical "${periodicalToDelete.title}" deleted successfully!`);
      }
      
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting item:', error);
      
      // For demo mode, still remove the item from the UI
      if (bookToDelete) {
        setData((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
        setFilteredBooks((prevData) => prevData.filter((book) => book.id !== bookToDelete.id));
        toast.success(`Book "${bookToDelete.title}" deleted (demo mode)`);
      } else if (periodicalToDelete) {
        setPeriodicals((prevData) => prevData.filter((item) => item.id !== periodicalToDelete.id));
        setFilteredPeriodicals((prevData) => prevData.filter((item) => item.id !== periodicalToDelete.id));
        toast.success(`Periodical "${periodicalToDelete.title}" deleted (demo mode)`);
      }
      
      handleCloseDeleteDialog();
    }
  };

  // Handle edit for both books and periodicals
  const handleEditClick = (event, item, type) => {
    event.stopPropagation(); // Prevent row click
    if (type === 'book') {
      handleOpenBookDialog(item);
    } else {
      handleOpenPeriodicalDialog(item);
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
      <ToastContainer />
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
            padding: '32px 32px 32px 32px',
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
            Manage {activeTab === 'books' ? 'Books' : 'Periodicals'}
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
            

            <TextField
              variant="outlined"
              placeholder={`Search ${activeTab === 'books' ? 'books' : 'periodicals'}...`}
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
              justifyContent: 'space-between',
            }}
          >
            {/* Tab Buttons (Left Side) */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 15px',
                  fontSize: '11px', 
                  borderRadius: '10px 10px 0 0',
                  color: activeTab === 'books' ? '#800000' : 'rgba(0, 0, 0, 0.6)',
                  boxShadow: activeTab === 'books' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                  backgroundColor: activeTab === 'books' ? '#FFEB3B' : '#e0e0e0',
                  '&:hover': { backgroundColor: activeTab === 'books' ? '#FFEB3B' : '#d5d5d5' },
                  borderBottom: activeTab === 'books' ? 'none' : '1px solid #ccc',
                }}
                onClick={() => setActiveTab('books')}
              >
                Books
              </Button>
              <Button
                variant="contained"
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 15px',
                  fontSize: '11px', 
                  borderRadius: '10px 10px 0 0',
                  color: activeTab === 'periodicals' ? '#800000' : 'rgba(0, 0, 0, 0.6)',
                  boxShadow: activeTab === 'periodicals' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                  backgroundColor: activeTab === 'periodicals' ? '#FFEB3B' : '#e0e0e0',
                  '&:hover': { backgroundColor: activeTab === 'periodicals' ? '#FFEB3B' : '#d5d5d5' },
                  borderBottom: activeTab === 'periodicals' ? 'none' : '1px solid #ccc',
                }}
                onClick={() => setActiveTab('periodicals')}
              >
                Periodicals
              </Button>
            </Box>

            {/* Action Buttons (Right Side) */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 15px',
                  fontSize: '11px', 
                  borderRadius: '50px',
                  color: '#FFEB3B',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                  backgroundColor: '#800000',
                  border: '1px solid #800000',
                  '&:hover': { backgroundColor: '#940000' },
                }}
                onClick={() => activeTab === 'books' ? handleOpenBookDialog(null) : handleOpenPeriodicalDialog(null)}
              >
                {activeTab === 'books' ? 'Add Book' : 'Add Periodical'}
              </Button>

              {/* Bulk Import Button */}
              <Button
                variant="contained"
                onClick={handleOpenBulkImport}
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 15px',
                  fontSize: '11px', 
                  borderRadius: '50px',
                  color: '#FFEB3B',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                  backgroundColor: '#800000',
                  border: '1px solid #800000',
                  '&:hover': { backgroundColor: '#940000' },
                }}
              >
                <UploadFileIcon sx={{ marginRight: 1, fontSize: '16px' }} />
                Bulk Import
              </Button>

              {/* Bulk Update Button */}
              <Button
                variant="contained"
                onClick={handleOpenBulkUpdate}
                sx={{
                  fontWeight: 'bold',
                  padding: '10px 15px',
                  fontSize: '11px', 
                  borderRadius: '50px',
                  color: '#FFEB3B',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(42, 42, 42, 0.6)',
                  backgroundColor: '#800000',
                  border: '1px solid #800000',
                  '&:hover': { backgroundColor: '#940000' },
                }}
              >
                <SystemUpdateAltIcon sx={{ marginRight: 1, fontSize: '16px' }} />
                Bulk Update
              </Button>
            </Box>
          </Box>

          {/* Paper container with margins to make space at bottom for pagination */}
          <Paper
            sx={{
              borderRadius: '15px',
              boxShadow: 3,
              mb: 4,
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
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
                <CircularProgress size={60} thickness={4} sx={{ color: '#800000' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#800000', fontWeight: 'bold' }}>
                  {loading ? `Loading ${activeTab}...` : 'Refreshing data...'}
                </Typography>
              </Box>
            )}
          
            {/* Table container with horizontal scroll */}
            <TableContainer
              sx={{
                maxHeight: 'calc(100vh - 300px)',
                overflowX: 'auto',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                }
              }}
            >

            {activeTab === 'books' ? (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 180 }}>
                      BOOK TITLE
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 160 }}>
                      AUTHOR
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 140 }}>
                      CALL NUMBER
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 160 }}>
                      ACCESSION NUMBER
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 140 }}>
                      PLACE OF PUBLICATION
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 140 }}>
                      PUBLISHER
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 120 }}>
                      COPYRIGHT
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 120 }}>
                      GENRE
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 160 }}>
                      DATE REGISTERED
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', position: 'sticky', right: 0, zIndex: 3 }}>
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
                        <TableCell align="center">{book.callNumber || 'N/A'}</TableCell>
                        <TableCell align="center">{book.accessionNumber}</TableCell>
                        <TableCell align="center">{book.placeOfPublication || 'N/A'}</TableCell>
                        <TableCell align="center">{book.publisher || 'N/A'}</TableCell>
                        <TableCell align="center">{book.copyright || 'N/A'}</TableCell>
                        <TableCell align="center">{book.genre}</TableCell>
                        <TableCell align="center">{formatDate(book.dateRegistered)}</TableCell>
                        <TableCell align="center" sx={{ position: 'sticky', right: 0, backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF', zIndex: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Edit">
                              <Button
                                size="small" 
                                onClick={(e) => handleEditClick(e, book, 'book')}
                                sx={{ 
                                  color: '#800000',
                                  backgroundColor: '#F5B400',
                                  border: '1px solid #FFEB3B',
                                  minWidth: '32px',
                                  padding: '4px',
                                  '&:hover': { 
                                    backgroundColor: '#FFEB3B',
                                    color: '#800000',
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <Button
                                size="small" 
                                onClick={(e) => handleDeleteClick(e, book, 'book')}
                                sx={{ 
                                  color: '#FFEB3B',
                                  backgroundColor: '#EE4242',
                                  border: '1px solid #d32f2f',
                                  minWidth: '32px',
                                  padding: '4px',
                                  '&:hover': { 
                                    backgroundColor: '#b71c1c',
                                    color: '#FFEB3B',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </Button>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredBooks.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={10} align="center">No books found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 160 }}>
                      ACCESSION NUMBER
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 180 }}>
                      TITLE
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 140 }}>
                      PUBLISHER
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 140 }}>
                      PLACE OF PUBLICATION
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', minWidth: 120 }}>
                      COPYRIGHT YEAR
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'black', backgroundColor: '#FFEB3B', position: 'sticky', right: 0, zIndex: 3 }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPeriodicals
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((periodical, index) => (
                      <TableRow
                        key={periodical.id || index}
                        hover
                        onClick={() => handleViewBook(periodical)}
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF',
                          '&:hover': { backgroundColor: '#FCEAEA' },
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell align="center">{periodical.accessionNumber}</TableCell>
                        <TableCell align="center">{periodical.title}</TableCell>
                        <TableCell align="center">{periodical.publisher || 'N/A'}</TableCell>
                        <TableCell align="center">{periodical.placeOfPublication || 'N/A'}</TableCell>
                        <TableCell align="center">{periodical.copyright || 'N/A'}</TableCell>
                        <TableCell align="center" sx={{ position: 'sticky', right: 0, backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFFFFF', zIndex: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Edit">
                              <Button 
                                size="small" 
                                onClick={(e) => handleEditClick(e, periodical, 'periodical')}
                                sx={{ 
                                  color: '#800000',
                                  backgroundColor: '#F5B400',
                                  border: '1px solid #FFEB3B',
                                  minWidth: '32px',
                                  padding: '4px',
                                  '&:hover': { 
                                    backgroundColor: '#FFEB3B',
                                    color: '#800000',
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </Button>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <Button
                                size="small" 
                                onClick={(e) => handleDeleteClick(e, periodical, 'periodical')}
                                sx={{ 
                                  color: '#FFEB3B',
                                  backgroundColor: '#EE4242',
                                  border: '1px solid #d32f2f',
                                  minWidth: '32px',
                                  padding: '4px',
                                  '&:hover': { 
                                    backgroundColor: '#b71c1c',
                                    color: '#FFEB3B',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </Button>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredPeriodicals.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No periodicals found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            
            </TableContainer>
            
            {/* Pagination at bottom of Paper container */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={activeTab === 'books' ? filteredBooks.length : filteredPeriodicals.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                '& .MuiTablePagination-toolbar': {
                  justifyContent: 'center',
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  margin: '0 10px',
                },
              }}
            />
          </Paper>
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 60, width: '100%' }} />
        </Box>
      </Box>

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
          View {activeTab === 'books' ? 'Book' : 'Periodical'} Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedBook && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Title</Typography>
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
                {activeTab === 'books' && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Call Number</Typography>
                    <TextField
                      fullWidth
                      value={selectedBook.callNumber || 'N/A'}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                )}
              </Box>
              
              {activeTab === 'books' && (
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
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Place of Publication</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.placeOfPublication || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Publisher</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.publisher || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Copyright</Typography>
                  <TextField
                    fullWidth
                    value={selectedBook.copyright || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Date Registered</Typography>
                  <TextField
                    fullWidth
                    value={formatDate(selectedBook.dateRegistered)}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
          <Button
            onClick={handleCloseViewDialog}
            variant="contained"
            sx={{
              backgroundColor: '#EE4242',
              '&:hover': { backgroundColor: '#b71c1c' },
              color: '#FFEB3B',
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
                <TableRow>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#FFEB3B' }}>TITLE</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#FFEB3B' }}>AUTHOR</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#FFEB3B' }}>CALL NUMBER</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', backgroundColor: '#FFEB3B' }}>ACCESSION NUMBER</TableCell>
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
                      <TableCell>{book.callNumber || 'N/A'}</TableCell>
                      <TableCell>{book.accessionNumber}</TableCell>
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
              backgroundColor: '#800000',
              color: '#FFEB3B',
              '&:hover': { backgroundColor: '#940000' },
              width: '120px'
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#EE4242' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {bookToDelete ? 'book' : 'periodical'}?
            {bookToDelete && (
              <Box component="span" sx={{ display: 'block', fontWeight: 'bold', mt: 2 }}>
                "{bookToDelete.title}" by {bookToDelete.author}
              </Box>
            )}
            {periodicalToDelete && (
              <Box component="span" sx={{ display: 'block', fontWeight: 'bold', mt: 2 }}>
                "{periodicalToDelete.title}"
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              backgroundColor: '#EE4242',
              color: '#FFEB3B',
              '&:hover': { backgroundColor: '#b71c1c' },
              width: '120px'
            }}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            onClick={handleCloseDeleteDialog}
            sx={{
              color: '#800000',
              border: '1px solid #800000',
              '&:hover': { backgroundColor: '#f5f5f5' },
              width: '120px'
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Book Modal */}
      <AddBookModal 
        open={openAddBookDialog}
        onClose={() => setOpenAddBookDialog(false)}
        onSuccess={handleBookSuccess}
        book={selectedBook}
        activeGenres={activeGenres}
      />

      {/* Periodical Modal */}
      <AddPeriodicalModal
        open={openAddPeriodicalDialog}
        onClose={() => setOpenAddPeriodicalDialog(false)}
        onSuccess={handlePeriodicalSuccess}
        periodical={selectedPeriodical}
      />

      {/* Bulk Import Books Dialog */}
      <BulkImportBooks
        open={isBulkImportBooksOpen}
        onClose={() => setIsBulkImportBooksOpen(false)}
        onSuccess={handleOperationSuccess}
        initialStep={bulkImportStep}
        onStepChange={handleBulkImportStepChange}
        activeGenres={activeGenres}
        ref={bulkImportBooksRef}
      />

      {/* Bulk Update Books Dialog */}
      <BulkUpdateBooks
        open={isBulkUpdateBooksOpen}
        onClose={() => setIsBulkUpdateBooksOpen(false)}
        onSuccess={handleOperationSuccess}
        activeGenres={activeGenres}
        ref={bulkUpdateBooksRef}
      />

      {/* Bulk Import Periodicals Dialog */}
      <BulkImportPeriodicals
        open={isBulkImportPeriodicalsOpen}
        onClose={() => setIsBulkImportPeriodicalsOpen(false)}
        onSuccess={handleOperationSuccess}
        initialStep={bulkImportStep}
        onStepChange={handleBulkImportStepChange}
        ref={bulkImportPeriodicalsRef}
      />

      {/* Bulk Update Periodicals Dialog */}
      <BulkUpdatePeriodicals
        open={isBulkUpdatePeriodicalsOpen}
        onClose={() => setIsBulkUpdatePeriodicalsOpen(false)}
        onSuccess={handleOperationSuccess}
        ref={bulkUpdatePeriodicalsRef}
      />
    </>
  );
};

export default LibrarianManageBooks;