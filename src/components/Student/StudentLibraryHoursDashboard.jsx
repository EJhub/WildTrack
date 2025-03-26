import React, { useState, useEffect, useContext } from "react";
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
  Button,
  TextField,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddBook from "./components/AddBook";
import { AuthContext } from '../AuthContext';

const StudentLibraryHours = () => {
  const [libraryHours, setLibraryHours] = useState([]);
  const [registeredBooks, setRegisteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filteredHours, setFilteredHours] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", academicYear: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  // Sort state
  const [orderBy, setOrderBy] = useState("date"); // Default sort by date
  const [order, setOrder] = useState("asc"); // Default sort direction (ascending)
  // Progress summary state
  const [progressSummary, setProgressSummary] = useState({
    totalMinutesRequired: 0,
    totalMinutesRendered: 0,
    currentSubject: "--"
  });
  
  // Use AuthContext to access user information
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    // Only fetch data once authentication is complete
    if (!authLoading) {
      fetchInitialData();
      fetchProgressData();
    }
  }, [authLoading]);

  // Apply sorting when data changes or sort parameters change
  useEffect(() => {
    if (libraryHours.length > 0) {
      applyFiltersAndSort();
    }
  }, [libraryHours, orderBy, order]);

  // SortIndicator component for consistent UI
  const SortIndicator = ({ column }) => {
    if (orderBy !== column) {
      return <UnfoldMoreIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5, opacity: 0.5 }} />;
    }
    return order === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
      : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />;
  };
  
  // Generic function to handle sort requests for any column
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sorting function with improved type handling
  const getSortedData = (data) => {
    return [...data].sort((a, b) => {
      // Special case for date field (just the date part without time)
      if (orderBy === "date") {
        const aValue = a["timeIn"] ? new Date(a["timeIn"]) : new Date(0);
        const bValue = b["timeIn"] ? new Date(b["timeIn"]) : new Date(0);
        
        // Set hours to 0 to compare only the date part
        aValue.setHours(0, 0, 0, 0);
        bValue.setHours(0, 0, 0, 0);
        
        return order === "asc" 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Special case for time fields, which need to be converted to Date objects
      if (orderBy === "timeIn" || orderBy === "timeOut") {
        // Handle null values gracefully
        if (!a[orderBy] && !b[orderBy]) return 0;
        if (!a[orderBy]) return order === "asc" ? -1 : 1;
        if (!b[orderBy]) return order === "asc" ? 1 : -1;
        
        const aValue = new Date(a[orderBy]);
        const bValue = new Date(b[orderBy]);
        return order === "asc" 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // For minutes, we need to calculate them
      if (orderBy === "minutes") {
        const aValue = a.timeIn && a.timeOut ? (new Date(a.timeOut) - new Date(a.timeIn)) / (1000 * 60) : 0;
        const bValue = b.timeIn && b.timeOut ? (new Date(b.timeOut) - new Date(b.timeIn)) / (1000 * 60) : 0;
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // For string values like bookTitle with null handling
      if (!a[orderBy] && !b[orderBy]) return 0;
      if (!a[orderBy]) return order === "asc" ? -1 : 1;
      if (!b[orderBy]) return order === "asc" ? 1 : -1;
      
      const aValue = a[orderBy].toString().toLowerCase();
      const bValue = b[orderBy].toString().toLowerCase();
      return order === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    });
  };

  // Fetch progress data function
  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token || !user || !user.idNumber) {
        return;
      }
      
      // Check for new requirements first, even if all existing ones are completed
      await axios.get(
        `http://localhost:8080/api/library-progress/check-new-requirements/${user.idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Get summary data using auto-init endpoint
      const summaryResponse = await axios.get(
        `http://localhost:8080/api/library-progress/summary-with-init/${user.idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Fetch detailed progress to get current subject
      const progressResponse = await axios.get(
        `http://localhost:8080/api/library-progress/${user.idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Find the first incomplete requirement
      const firstIncompleteRequirement = progressResponse.data.find(
        req => !req.isCompleted
      );
      
      setProgressSummary({
        totalMinutesRequired: summaryResponse.data.totalMinutesRequired || 0,
        totalMinutesRendered: summaryResponse.data.totalMinutesRendered || 0,
        currentSubject: firstIncompleteRequirement ? firstIncompleteRequirement.subject : "--"
      });
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        toast.error("Unauthorized access. Please log in.");
        setLoading(false);
        return;
      }
      
      // Fetch academic years
      const token = localStorage.getItem("token");
      
      try {
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);
      } catch (error) {
        console.error('Error fetching academic years:', error);
        // Don't show error toast for this - non-critical
      }

      // Fetch library hours using user ID from AuthContext
      const fetchLibraryHours = async () => {
        try {
          // Use user.idNumber from AuthContext instead of URL params
          const idNumber = user.idNumber;

          if (!token || !idNumber) {
            toast.error("User information not available.");
            setLoading(false);
            return;
          }

          const response = await axios.get(
            `http://localhost:8080/api/library-hours/user/${idNumber}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setLibraryHours(response.data);
          // Filtering and sorting will be applied by useEffect
        } catch (error) {
          console.error("Error fetching library hours:", error);
          toast.error("Failed to fetch library hours.");
        }
      };

      const fetchBooks = async () => {
        try {
          const response = await axios.get("http://localhost:8080/api/books/all");
          setRegisteredBooks(response.data);
        } catch (error) {
          console.error("Error fetching books:", error);
          toast.error("Failed to fetch books.");
        }
      };

      await Promise.all([fetchLibraryHours(), fetchBooks()]);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEntry(null);
  };

  const handleSubmit = async (bookDetails) => {
    if (!bookDetails || !bookDetails.id) {
      toast.error("Failed to assign book. Invalid data.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      // Find the first entry with an empty bookTitle
      const emptyEntry = libraryHours.find((entry) => !entry.bookTitle);
  
      if (!emptyEntry) {
        toast.error("No available entry to assign the book.");
        return;
      }
  
      // Step 1: Assign book to library hours
      await axios.put(
        `http://localhost:8080/api/books/${bookDetails.id}/assign-library-hours/${emptyEntry.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Update the book title in the corresponding entry
      const updatedLibraryHours = libraryHours.map((entry) =>
        entry.id === emptyEntry.id
          ? { ...entry, bookTitle: bookDetails.title }
          : entry
      );
      setLibraryHours(updatedLibraryHours);
      // Filtering and sorting will be applied by useEffect
      
      // Step 2: Also add to book log if we have the required data
      if (bookDetails.rating && bookDetails.dateRead && bookDetails.academicYear) {
        try {
          const encodedIdNumber = encodeURIComponent(user.idNumber);
          
          await axios.put(
            `http://localhost:8080/api/booklog/${bookDetails.id}/add-to-booklog/${encodedIdNumber}`,
            {
              dateRead: bookDetails.dateRead,
              rating: bookDetails.rating,
              academicYear: bookDetails.academicYear,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          toast.success(`Book "${bookDetails.title}" assigned and added to your book log!`);
        } catch (bookLogError) {
          console.error("Error adding to book log:", bookLogError);
          toast.warning(`Book assigned but couldn't add to book log: ${bookLogError.message}`);
        }
      } else {
        toast.success(`Book "${bookDetails.title}" assigned successfully!`);
      }
      
      handleClose();
      
      // Refresh progress data after adding a book
      fetchProgressData();
    } catch (error) {
      console.error("Error assigning book to library hours:", error);
      toast.error("Failed to assign book to library hours.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Create a new filter state based on which filter is being changed
    let newFilters;
    
    if (name === 'academicYear' && value) {
      // If selecting academic year, clear date filters
      newFilters = { dateFrom: "", dateTo: "", academicYear: value };
    } else if (name === 'dateFrom' && value) {
      // If changing dateFrom
      // Clear academic year
      // And ensure dateTo is not earlier than dateFrom
      const dateTo = filters.dateTo;
      if (dateTo && new Date(value) > new Date(dateTo)) {
        // If dateFrom is later than dateTo, reset dateTo
        newFilters = { ...filters, academicYear: "", dateFrom: value, dateTo: "" };
      } else {
        newFilters = { ...filters, academicYear: "", dateFrom: value };
      }
    } else if (name === 'dateTo' && value) {
      // If changing dateTo, just clear academic year
      newFilters = { ...filters, academicYear: "", dateTo: value };
    } else {
      // If clearing a filter, just update that specific field
      newFilters = { ...filters, [name]: value };
    }
    
    setFilters(newFilters);
  };

  // Combined function to apply filters and sorting
  const applyFiltersAndSort = () => {
    // Step 1: Apply filters
    const { dateFrom, dateTo, academicYear } = filters;
    
    let filtered = libraryHours;

    if (dateFrom || dateTo || (academicYear && academicYear !== "")) {
      filtered = libraryHours.filter((entry) => {
        try {
          // Extract only the date part from the entry's timeIn for proper comparison
          const entryDate = new Date(entry.timeIn);
          entryDate.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
          
          // Create dates from the filter values
          let fromDate = null;
          let toDate = null;
          
          if (dateFrom) {
            fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
          }
          
          if (dateTo) {
            toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // Set to end of day for proper comparison
          }
          
          // Check if entry date falls within the range
          const matchesDate = 
            (!fromDate || entryDate >= fromDate) && 
            (!toDate || entryDate <= toDate);
          
          // Check if academic year matches if specified - using new year-based logic
          let matchesYear = true;
          if (academicYear && academicYear !== "") {
            // Parse the academic year range (e.g., "2025-2026")
            const years = academicYear.split("-");
            if (years.length === 2) {
              const startYear = parseInt(years[0]);
              const endYear = parseInt(years[1]);
              const entryYear = entryDate.getFullYear();
              
              // Match if entry year is either the start or end year
              matchesYear = (entryYear === startYear || entryYear === endYear);
            }
          }
          
          return matchesDate && matchesYear;
        } catch (error) {
          console.error("Error comparing dates:", error);
          return true; // Include entry if date comparison fails
        }
      });
    }
    
    // Apply search filter if there's an active search query
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          new Date(entry.timeIn).toLocaleDateString().includes(searchQuery) ||
          new Date(entry.timeIn).toLocaleTimeString().includes(searchQuery)
      );
    }
    
    // Step 2: Apply sorting
    const sortedData = getSortedData(filtered);
    
    // Step 3: Update state
    setFilteredHours(sortedData);
    setPage(0); // Reset to first page after filtering/sorting
  };

  // Handler for filter button
  const applyFilters = () => {
    applyFiltersAndSort();
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      academicYear: ""
    });
    
    // Reset to original data but maintain sort order
    if (searchQuery) {
      // If there's a search query, apply it to the reset data
      handleSearchChange({ target: { value: searchQuery } });
    } else {
      // Otherwise just apply the current sort to the original data
      const sortedData = getSortedData(libraryHours);
      setFilteredHours(sortedData);
    }
    setPage(0);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Apply search filter and maintain current sort
    let filtered = libraryHours.filter(
      (entry) =>
        entry.bookTitle?.toLowerCase().includes(query) ||
        new Date(entry.timeIn).toLocaleDateString().includes(query) ||
        new Date(entry.timeIn).toLocaleTimeString().includes(query)
    );
    
    // Apply current sort to search results
    filtered = getSortedData(filtered);
    
    setFilteredHours(filtered);
    setPage(0);
  };

  const calculateMinutes = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "--";
    const inTime = new Date(timeIn);
    const outTime = new Date(timeOut);
    const diffMs = outTime - inTime;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes > 0 ? `${diffMinutes} mins` : "--";
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (authLoading || loading) {
    return <Typography>Loading...</Typography>;
  }

  // Get displayed data with pagination
  const displayedHours = filteredHours.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Calculate minutes remaining
  const minutesRemaining = Math.max(0, progressSummary.totalMinutesRequired - progressSummary.totalMinutesRendered);

  // Common style for sortable table headers
  const sortableHeaderStyle = {
    fontWeight: "bold", 
    backgroundColor: "#8C383E", 
    color: "#fff",
    cursor: "pointer",
    '&:hover': {
      backgroundColor: "#9C484E" // Lighter shade on hover
    }
  };

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box 
        sx={{ 
          display: "flex", 
          height: "100vh",
          overflow: "hidden" // Prevents outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundImage: "url('/studentbackground.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "auto", // Enable scrolling for the main content area
            height: "100%", // Ensure content area fills available height
            display: "flex", // Use flexbox for child elements
            flexDirection: "column" // Stack children vertically
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#FFD700",
              fontWeight: "bold",
              paddingBottom: 3,
              textAlign: "Left",
            }}
          >
            Library Hours
          </Typography>

          {/* Search Bar and Progress Summary Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 0,
              }}
            >
              <TextField
                label="Search"
                placeholder="Type here..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  width: { xs: "100%", sm: "360px" },
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
            
            {/* Summary Information */}
            <Box sx={{ 
              display: "flex", 
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              alignItems: "center",
            }}>
              <Paper
                elevation={2}
                sx={{
                  padding: "8px 16px",
                  backgroundColor: "#FFD700",
                  borderRadius: "15px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="#000">
                  CURRENT SUBJECT
                </Typography>
                <Typography variant="body1" color="#000" fontWeight="medium">
                  {progressSummary.currentSubject}
                </Typography>
              </Paper>
              
              <Paper
                elevation={2}
                sx={{
                  padding: "8px 16px",
                  backgroundColor: "#FFD700",
                  borderRadius: "15px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="#000">
                  MINUTES REMAINING
                </Typography>
                <Typography variant="body1" color="#000" fontWeight="medium">
                  {minutesRemaining}
                </Typography>
              </Paper>
              
              <Paper
                elevation={2}
                sx={{
                  padding: "8px 16px",
                  backgroundColor: "#FFD700",
                  borderRadius: "15px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="#000">
                  MINUTES RENDERED
                </Typography>
                <Typography variant="body1" color="#000" fontWeight="medium">
                  {progressSummary.totalMinutesRendered}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Filters and Insert Book Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                name="dateFrom"
                type="date"
                size="small"
                label="Date From"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                disabled={!!filters.academicYear} // Disable if academicYear has a value
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              />
              <TextField
                name="dateTo"
                type="date"
                size="small"
                label="Date To"
                value={filters.dateTo}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: filters.dateFrom || undefined // Set minimum date to dateFrom
                }}
                disabled={!!filters.academicYear || !filters.dateFrom} // Disable if academicYear has a value or dateFrom is empty
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              />
              <Select
                name="academicYear"
                value={filters.academicYear}
                onChange={handleFilterChange}
                displayEmpty
                size="small"
                disabled={!!filters.dateFrom || !!filters.dateTo} // Disable if either date has a value
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  minWidth: "150px",
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              >
                <MenuItem value="">Select Academic Year</MenuItem>
                {academicYearOptions.map((year, index) => (
                  <MenuItem key={index} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                onClick={applyFilters}
                sx={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                  "&:hover": { backgroundColor: "#FFC107" },
                }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
                sx={{
                  borderColor: "#FFD700",
                  color: "#000",
                  "&:hover": { 
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    borderColor: "#FFD700"
                  },
                }}
              >
                Reset
              </Button>
            </Box>

            {/* Insert Book Button */}
            <Button
              variant="contained"
              onClick={handleClickOpen}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                "&:hover": { backgroundColor: "#FFC107" },
              }}
            >
              BOOK READ
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '15px',
              boxShadow: 3,
              overflow: 'visible', // Allow content to flow outside container
              marginTop: 3,
              marginBottom: 7, // Increased bottom margin
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Table sx={{ flexGrow: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => handleRequestSort("date")}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by date">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Date <SortIndicator column="date" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort("timeIn")}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by time in">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Time In <SortIndicator column="timeIn" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort("bookTitle")}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by book title">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Book Title <SortIndicator column="bookTitle" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort("timeOut")}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by time out">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Time Out <SortIndicator column="timeOut" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort("minutes")}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by minutes">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Minutes <SortIndicator column="minutes" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedHours.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No library hours found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedHours.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.timeIn).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(entry.timeIn).toLocaleTimeString()}</TableCell>
                      <TableCell>{entry.bookTitle ? entry.bookTitle : "--"}</TableCell>
                      <TableCell>{entry.timeOut ? new Date(entry.timeOut).toLocaleTimeString() : "--"}</TableCell>
                      <TableCell>{calculateMinutes(entry.timeIn, entry.timeOut)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredHours.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                paddingTop: 2,
                paddingBottom: 2, // Add bottom padding
                backgroundColor: "transparent",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                width: "100%",
                position: "relative", // Ensure visibility
              }}
            />
          </TableContainer>
        </Box>
      </Box>

      <AddBook
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        registeredBooks={registeredBooks}
      />
    </>
  );
};

export default StudentLibraryHours;