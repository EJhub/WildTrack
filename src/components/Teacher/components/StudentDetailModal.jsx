import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  TablePagination,
  CircularProgress,
  Divider,
  InputAdornment,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../../utils/api';

const StudentDetailModal = ({ open, handleClose, student }) => {
  // State for toggling between library hours and journal view
  const [view, setView] = useState('library'); // 'library' or 'journal'
  
  // Original data states (unfiltered)
  const [libraryHours, setLibraryHours] = useState([]);
  const [journals, setJournals] = useState([]);
  
  // Filtered data states
  const [filteredLibraryHours, setFilteredLibraryHours] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  
  // Loading and error states
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState(null);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [journalError, setJournalError] = useState(null);
  
  // Filter states - only applied when button is clicked
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  const [journalSearch, setJournalSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState(''); // New state for activity filter
  
  // Pagination states
  const [libraryPage, setLibraryPage] = useState(0);
  const [libraryRowsPerPage, setLibraryRowsPerPage] = useState(5);
  const [journalPage, setJournalPage] = useState(0);
  const [journalRowsPerPage, setJournalRowsPerPage] = useState(5);
  
  // Stats for library hours
  const [stats, setStats] = useState({
    remainingMinutes: 0,
    totalMinutes: 0
  });
  
  // Book summary dialog states
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState({ title: '', summary: '' });
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Fetch data when modal opens or student changes
  useEffect(() => {
    if (open && student && student.idNumber) {
      fetchLibraryHours();
      fetchJournals();
    }
  }, [open, student]);

  // Calculate stats when library hours change
  useEffect(() => {
    if (student) {
      // Calculate remaining minutes needed
      const required = student.requiredMinutes || 60; // Default to 60 if not specified
      const rendered = student.minutesRendered || 0;
      const remaining = Math.max(0, required - rendered);
      
      setStats({
        remainingMinutes: remaining,
        totalMinutes: rendered
      });
    }
  }, [student, libraryHours]);
  
  // Function to check if a date is within the selected range
  const isWithinDateRange = (dateString) => {
    if (!dateFrom && !dateTo) return true; // No date filter applied
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
    
    let fromDate = null;
    let toDate = null;
    
    if (dateFrom) {
      fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
    }
    
    if (dateTo) {
      toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
    }
    
    const isAfterFrom = !fromDate || date >= fromDate;
    const isBeforeTo = !toDate || date <= toDate;
    
    return isAfterFrom && isBeforeTo;
  };
  
  // Function to apply all filters to library hours
  const applyLibraryFilters = () => {
    if (!libraryHours.length) {
      setFilteredLibraryHours([]);
      return;
    }
    
    let filtered = libraryHours;
    
    // Apply date filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter(entry => 
        entry.timeIn && isWithinDateRange(entry.timeIn)
      );
    }
    
    // Then apply search filter
    if (librarySearch) {
      const search = librarySearch.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.bookTitle && entry.bookTitle.toLowerCase().includes(search)) ||
        formatDate(entry.timeIn).toLowerCase().includes(search) ||
        formatTime(entry.timeIn).toLowerCase().includes(search) ||
        formatTime(entry.timeOut)?.toLowerCase().includes(search) ||
        (entry.summary && entry.summary.toLowerCase().includes(search))
      );
    }
    
    setFilteredLibraryHours(filtered);
    setLibraryPage(0); // Reset to first page when filtering
  };
  
  // Function to apply all filters to journals
  const applyJournalFilters = () => {
    if (!journals.length) {
      setFilteredJournals([]);
      return;
    }
    
    let filtered = journals;
    
    // Apply date filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter(journal => 
        journal.dateRead && isWithinDateRange(journal.dateRead)
      );
    }
    
    // Apply activity filter if selected
    if (activityFilter) {
      filtered = filtered.filter(journal => 
        journal.activity === activityFilter
      );
    }
    
    // Then apply search filter
    if (journalSearch) {
      const search = journalSearch.toLowerCase();
      filtered = filtered.filter(journal => 
        (journal.details && journal.details.toLowerCase().includes(search)) ||
        (journal.activity && journal.activity.toLowerCase().includes(search)) ||
        (journal.comment && journal.comment.toLowerCase().includes(search)) ||
        formatDate(journal.dateRead).toLowerCase().includes(search) ||
        (journal.entryNo && journal.entryNo.toLowerCase().includes(search))
      );
    }
    
    setFilteredJournals(filtered);
    setJournalPage(0); // Reset to first page when filtering
  };

  // Function to fetch library hours
  const fetchLibraryHours = async () => {
    if (!student || !student.idNumber) return;
    
    setLoadingLibrary(true);
    setLibraryError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get(`/library-hours/user/${student.idNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const hoursList = response.data || [];
      setLibraryHours(hoursList);
      setFilteredLibraryHours(hoursList); // Initially show all
    } catch (error) {
      console.error('Error fetching library hours:', error);
      setLibraryError('Failed to load library hours data');
      setLibraryHours([]);
      setFilteredLibraryHours([]);
    } finally {
      setLoadingLibrary(false);
    }
  };
  
  // Function to fetch journal entries
  const fetchJournals = async () => {
    if (!student || !student.idNumber) return;
    
    setLoadingJournal(true);
    setJournalError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get(`/journals/user/${student.idNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const journalList = response.data || [];
      setJournals(journalList);
      setFilteredJournals(journalList); // Initially show all
    } catch (error) {
      console.error('Error fetching journals:', error);
      setJournalError('Failed to load journal data');
      setJournals([]);
      setFilteredJournals([]);
    } finally {
      setLoadingJournal(false);
    }
  };
  
  // Function to handle book title click and fetch summary
  const handleBookTitleClick = async (entry) => {
    if (!entry.bookTitle) return;
    
    setSelectedBook({ 
      title: entry.bookTitle,
      summary: entry.summary || ''
    });
    
    // If there's already a summary, show it right away
    if (entry.summary) {
      setSummaryDialogOpen(true);
      return;
    }
    
    // Otherwise, we need to fetch the summary
    setLoadingSummary(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Try to fetch the library hour details to get the summary
      const response = await api.get(`/library-hours/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.summary) {
        // Update the library hours entry with the summary
        const updatedLibraryHours = libraryHours.map(item => 
          item.id === entry.id ? { ...item, summary: response.data.summary } : item
        );
        
        setLibraryHours(updatedLibraryHours);
        
        // Also update filtered hours if this entry is displayed
        const updatedFilteredHours = filteredLibraryHours.map(item => 
          item.id === entry.id ? { ...item, summary: response.data.summary } : item
        );
        setFilteredLibraryHours(updatedFilteredHours);
        
        // Update the selected book with the summary
        setSelectedBook({
          title: entry.bookTitle,
          summary: response.data.summary
        });
        
        setSummaryDialogOpen(true);
      } else {
        // No summary found, still open the dialog but with empty summary
        setSummaryDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching book summary:', error);
      // Still open the dialog even if there's an error
      setSummaryDialogOpen(true);
    } finally {
      setLoadingSummary(false);
    }
  };
  
  // Handle close summary dialog
  const handleCloseSummaryDialog = () => {
    setSummaryDialogOpen(false);
  };

  // Apply date filters - Only happens when Apply button is clicked
  const handleApplyFilters = () => {
    if (view === 'library') {
      applyLibraryFilters();
    } else {
      applyJournalFilters();
    }
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setLibrarySearch('');
    setJournalSearch('');
    setActivityFilter('');
    
    // Reset to show all data
    setFilteredLibraryHours(libraryHours);
    setFilteredJournals(journals);
    setLibraryPage(0);
    setJournalPage(0);
  };
  
  // Calculate minutes between timeIn and timeOut
  const calculateMinutes = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "--";
    const inTime = new Date(timeIn);
    const outTime = new Date(timeOut);
    const diffMs = outTime - inTime;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes > 0 ? `${diffMinutes} mins` : "--";
  };
  
  // Render stars for rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <>
        {"★".repeat(fullStars)}
        {"☆".repeat(emptyStars)}
      </>
    );
  };
  
  // Check if date is valid
  const isValidDate = (dateString) => {
    return dateString && !isNaN(new Date(dateString).getTime());
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!isValidDate(dateString)) return "-";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format time for display
  const formatTime = (dateTimeString) => {
    if (!isValidDate(dateTimeString)) return "-";
    return new Date(dateTimeString).toLocaleTimeString();
  };
  
  // Toggle between library hours and journal view
  const toggleView = (newView) => {
    setView(newView);
  };
  
  // Get unique activity values from journal entries
  const getActivityOptions = () => {
    if (!journals.length) return [];
    
    // Get unique activity values using a Set
    const uniqueActivities = new Set(journals.map(journal => journal.activity).filter(Boolean));
    return Array.from(uniqueActivities);
  };
  
  // Handle pagination for library hours
  const handleLibraryChangePage = (event, newPage) => {
    setLibraryPage(newPage);
  };
  
  const handleLibraryChangeRowsPerPage = (event) => {
    setLibraryRowsPerPage(parseInt(event.target.value, 10));
    setLibraryPage(0);
  };
  
  // Handle pagination for journal entries
  const handleJournalChangePage = (event, newPage) => {
    setJournalPage(newPage);
  };
  
  const handleJournalChangeRowsPerPage = (event) => {
    setJournalRowsPerPage(parseInt(event.target.value, 10));
    setJournalPage(0);
  };
  
  // Get displayed library hours based on pagination
  const displayedLibraryHours = filteredLibraryHours.slice(
    libraryPage * libraryRowsPerPage,
    libraryPage * libraryRowsPerPage + libraryRowsPerPage
  );
  
  // Get displayed journal entries based on pagination
  const displayedJournals = filteredJournals.slice(
    journalPage * journalRowsPerPage,
    journalPage * journalRowsPerPage + journalRowsPerPage
  );
  
  // Activity options for dropdown
  const activityOptions = getActivityOptions();

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '15px',
            padding: 0,
            backgroundColor: '#8C383E', // Maroon background for the entire modal
            color: '#fff'
          }
        }}
      >
        {student && (
          <>
            {/* Student Header Area */}
            <Box sx={{ backgroundColor: '#8C383E', color: '#fff', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {student.idNumber} - {student.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="h6" component="div">
                    {student.grade} {student.section}
                  </Typography>
                  <Typography variant="h6" component="div">
                    {student.progress}
                  </Typography>
                </Box>
              </Box>
              
              {/* Stats Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  REMAINING MINUTES: {stats.remainingMinutes} mins
                </Typography>
                <Typography variant="body1">
                  TOTAL MINUTES: {stats.totalMinutes} mins
                </Typography>
              </Box>
            </Box>
            
            {/* Filter Area - New Layout */}
            <Box sx={{ 
              backgroundColor: '#fff', 
              color: '#000',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {/* Search Bar - Now Above Everything */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                {view === 'library' ? (
                  <TextField 
                    label="Search library hours"
                    size="small"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    sx={{ 
                      width: '25%',
                      backgroundColor: '#fff'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <TextField 
                    label="Search journal entries"
                    size="small"
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                    sx={{ 
                      width: '25%',
                      backgroundColor: '#fff'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box>
              
              {/* Filters and Toggle Buttons Row */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Filters on the Left */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Date Filters */}
                  <TextField 
                    label="Date From" 
                    type="date"
                    size="small"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <TextField 
                    label="Date To" 
                    type="date"
                    size="small"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    disabled={!dateFrom}
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  {/* Activity Filter - Only for Journal view */}
                  {view === 'journal' && (
                    <FormControl 
                      size="small" 
                      sx={{ 
                        minWidth: 150,
                        backgroundColor: '#fff'
                      }}
                    >
                      <InputLabel id="activity-filter-label">Activity</InputLabel>
                      <Select
                        labelId="activity-filter-label"
                        id="activity-filter"
                        value={activityFilter}
                        label="Activity"
                        onChange={(e) => setActivityFilter(e.target.value)}
                      >
                        <MenuItem value="">All Activities</MenuItem>
                        <MenuItem value="Read Book">Read Book</MenuItem>
                        <MenuItem value="Used Computer">Used Computer</MenuItem>
                        <MenuItem value="Read Periodical">Read Periodical</MenuItem>
                        {activityOptions.map((activity) => (
                          !['Read Book', 'Used Computer', 'Read Periodical'].includes(activity) && (
                            <MenuItem key={activity} value={activity}>
                              {activity}
                            </MenuItem>
                          )
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  
                  <Button 
                    variant="contained" 
                    onClick={handleApplyFilters}
                    sx={{ 
                      backgroundColor: '#FFD700',
                      color: '#000',
                      '&:hover': { backgroundColor: '#FFC107' }
                    }}
                  >
                    Filter
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={handleResetFilters}
                    sx={{ 
                      borderColor: '#FFD700',
                      color: '#000',
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        borderColor: '#FFD700'
                      }
                    }}
                  >
                    Reset
                  </Button>
                </Box>
                
                {/* Toggle Buttons on the Right */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant={view === 'library' ? "contained" : "outlined"}
                    onClick={() => toggleView('library')}
                    sx={view === 'library' ? {
                      backgroundColor: '#8C383E',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#9C484E' }
                    } : {
                      borderColor: '#8C383E',
                      color: '#8C383E',
                      '&:hover': { backgroundColor: 'rgba(140, 56, 62, 0.1)' }
                    }}
                  >
                    Library Hours
                  </Button>
                  
                  <Button 
                    variant={view === 'journal' ? "contained" : "outlined"}
                    onClick={() => toggleView('journal')}
                    sx={view === 'journal' ? {
                      backgroundColor: '#8C383E',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#9C484E' }
                    } : {
                      borderColor: '#8C383E',
                      color: '#8C383E',
                      '&:hover': { backgroundColor: 'rgba(140, 56, 62, 0.1)' }
                    }}
                  >
                    Journal
                  </Button>
                </Box>
              </Box>
            </Box>
            
            {/* Content Area */}
            <DialogContent sx={{ backgroundColor: '#f5f5f5', p: 0 }}>
              {/* Library Hours View */}
              {view === 'library' && (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>DATE</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>TIME IN</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>BOOK TITLE</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>TIME OUT</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>MINUTES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingLibrary ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <CircularProgress size={24} />
                            <Typography sx={{ ml: 2 }}>Loading library hours...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : libraryError ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="error">{libraryError}</Typography>
                          </TableCell>
                        </TableRow>
                      ) : displayedLibraryHours.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No library hours found
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedLibraryHours.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(entry.timeIn)}</TableCell>
                            <TableCell>{formatTime(entry.timeIn)}</TableCell>
                            <TableCell>
                              {entry.bookTitle ? (
                                <Button
                                  onClick={() => handleBookTitleClick(entry)}
                                  disabled={loadingSummary}
                                  sx={{
                                    textTransform: 'none',
                                    color: entry.summary ? '#0000FF' : 'rgba(0, 0, 0, 0.87)', // Blue for books with summaries
                                    fontWeight: entry.summary ? 'bold' : 'normal',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                      backgroundColor: 'transparent',
                                    },
                                    padding: '0',
                                    justifyContent: 'flex-start',
                                  }}
                                >
                                  {entry.bookTitle}
                                </Button>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{entry.timeOut ? formatTime(entry.timeOut) : '-'}</TableCell>
                            <TableCell>{calculateMinutes(entry.timeIn, entry.timeOut)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredLibraryHours.length}
                    rowsPerPage={libraryRowsPerPage}
                    page={libraryPage}
                    onPageChange={handleLibraryChangePage}
                    onRowsPerPageChange={handleLibraryChangeRowsPerPage}
                  />
                </TableContainer>
              )}
              
              {/* Journal View */}
              {view === 'journal' && (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>ENTRY NO.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>DATE</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>ACTIVITY</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>DETAILS</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>COMMENTS</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#8C383E', color: '#fff' }}>RATING</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingJournal ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <CircularProgress size={24} />
                            <Typography sx={{ ml: 2 }}>Loading journal entries...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : journalError ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="error">{journalError}</Typography>
                          </TableCell>
                        </TableRow>
                      ) : displayedJournals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No journal entries found
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedJournals.map((journal) => (
                          <TableRow key={journal.id}>
                            <TableCell>{journal.entryNo || '-'}</TableCell>
                            <TableCell>{formatDate(journal.dateRead)}</TableCell>
                            <TableCell>{journal.activity || 'Read Book'}</TableCell>
                            <TableCell>{journal.details || journal.title}</TableCell>
                            <TableCell>{journal.comment || '—'}</TableCell>
                            <TableCell>{renderStars(journal.rating)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredJournals.length}
                    rowsPerPage={journalRowsPerPage}
                    page={journalPage}
                    onPageChange={handleJournalChangePage}
                    onRowsPerPageChange={handleJournalChangeRowsPerPage}
                  />
                </TableContainer>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
      
      {/* Book Summary Dialog */}
      <Dialog
        open={summaryDialogOpen}
        onClose={handleCloseSummaryDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '15px',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '25px',
            backgroundColor: '#FFDF16',
            color: '#000',
          }}
        >
          What I Learned: {selectedBook.title}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: '#FFDF16',
            padding: '30px',
          }}
        >
          {loadingSummary ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                padding: '16px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                minHeight: '200px',
              }}
            >
              <Typography
                sx={{
                  whiteSpace: 'pre-wrap', // Preserve line breaks
                  color: '#000',
                }}
              >
                {selectedBook.summary || 'No summary available for this book.'}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            backgroundColor: '#FFDF16',
            padding: 2,
          }}
        >
          <Button
            onClick={handleCloseSummaryDialog}
            variant="contained"
            sx={{
              borderRadius: '10px',
              width: '120px',
              backgroundColor: '#A44444',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#BB5252',
              },
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentDetailModal;