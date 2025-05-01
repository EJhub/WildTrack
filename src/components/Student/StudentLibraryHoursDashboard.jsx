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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddBook from "./components/Addbook";
import { AuthContext } from '../AuthContext';
import api from "../../utils/api"; 

const StudentLibraryHours = () => {
  const [libraryHours, setLibraryHours] = useState([]);
  const [registeredBooks, setRegisteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filteredHours, setFilteredHours] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
const [selectedTask, setSelectedTask] = useState({ task: "", subject: "" });
  

const handleTaskClick = (requirement) => {
  setSelectedTask({
    task: requirement.task || "No task description provided.",
    subject: requirement.subject
  });
  setTaskDialogOpen(true);
};
  // Summary dialog state
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState({ bookTitle: "", summary: "" });
  
  // Sort state
  const [orderBy, setOrderBy] = useState("date"); // Default sort by date
  const [order, setOrder] = useState("asc"); // Default sort direction (ascending)
  
  // Progress summary state with added task and creator
  const [progressSummary, setProgressSummary] = useState({
    totalMinutesRequired: 0,
    totalMinutesRendered: 0,
    currentSubject: "--",
    currentRequiredMinutes: 0,
    currentMinutesRendered: 0,
    currentMinutesRemaining: 0,
    currentTask: "--", // New field for task
    currentCreator: "--" // New field for creator
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

  // Handler for book title click to show summary
  const handleBookTitleClick = (entry) => {
    if (entry.bookTitle && entry.summary) {
      setSelectedSummary({
        bookTitle: entry.bookTitle,
        summary: entry.summary
      });
      setSummaryDialogOpen(true);
    } else {
      toast.info("No summary available for this book.");
    }
  };
  
  // Handler to close summary dialog
  const handleCloseSummaryDialog = () => {
    setSummaryDialogOpen(false);
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

  // Fetch progress data function - Updated to include task and creator
 // Fetch progress data function - Updated to accurately report requirement status
const fetchProgressData = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token || !user || !user.idNumber) {
      return;
    }
    
    // First check for any new requirements
    await api.get(
      `/library-progress/check-new-requirements/${user.idNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Get the summary data
    const summaryResponse = await api.get(
      `/library-progress/summary-with-init/${user.idNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Get detailed progress data with the fixed "In Progress" status
    const progressResponse = await api.get(
      `/library-progress/active-progress/${user.idNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // FIX: Find the requirement that is marked as "In Progress" first
    // (the backend now correctly identifies this)
    let currentRequirement = progressResponse.data.find(
      req => req.status === "In Progress"
    );
    
    // If no "In Progress" requirement is found, fall back to the first incomplete requirement
    if (!currentRequirement) {
      currentRequirement = progressResponse.data.find(
        req => !req.isCompleted
      );
    }
    
    // Update the progress summary with the current requirement details
    if (currentRequirement) {
      setProgressSummary({
        totalMinutesRequired: summaryResponse.data.totalMinutesRequired || 0,
        totalMinutesRendered: summaryResponse.data.totalMinutesRendered || 0,
        currentSubject: currentRequirement.subject,
        currentRequiredMinutes: currentRequirement.requiredMinutes || 0,
        currentMinutesRendered: currentRequirement.minutesRendered || 0,
        currentMinutesRemaining: currentRequirement.remainingMinutes || 0,
        currentTask: currentRequirement.task || "--",
        currentCreator: currentRequirement.creatorName || "--"
      });
    } else {
      // No incomplete requirements found
      setProgressSummary({
        totalMinutesRequired: summaryResponse.data.totalMinutesRequired || 0,
        totalMinutesRendered: summaryResponse.data.totalMinutesRendered || 0,
        currentSubject: "--",
        currentRequiredMinutes: 0,
        currentMinutesRendered: 0,
        currentMinutesRemaining: 0,
        currentTask: "--",
        currentCreator: "--"
      });
    }
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
      
      // Fetch library hours using user ID from AuthContext
      const fetchLibraryHours = async () => {
        try {
          const idNumber = user.idNumber;
          const token = localStorage.getItem("token");

          if (!token || !idNumber) {
            toast.error("User information not available.");
            setLoading(false);
            return;
          }

          const response = await api.get(
            `/library-hours/user/${idNumber}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setLibraryHours(response.data);
        } catch (error) {
          console.error("Error fetching library hours:", error);
          toast.error("Failed to fetch library hours.");
        }
      };

      const fetchBooks = async () => {
        try {
          const response = await api.get("/books/all");
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

  // Updated handleSubmit function to handle requiresBookAssignment flag
  const handleSubmit = async (bookDetails) => {
    if (!bookDetails || !bookDetails.id) {
      toast.error("Failed to assign book. Invalid data.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      // First, look for any session that requires book assignment
      const sessionNeedingBook = libraryHours.find(
        (entry) => entry.requiresBookAssignment === true
      );
      
      // If none found, then look for any entry without a book title
      const emptyEntry = sessionNeedingBook || 
        libraryHours.find((entry) => !entry.bookTitle);
  
      if (!emptyEntry) {
        toast.error("No available entry to assign the book.");
        return;
      }
  
      // Step 1: Assign book to library hours
      await api.put(
        `/books/${bookDetails.id}/assign-library-hours/${emptyEntry.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Update the book title and clear requiresBookAssignment flag in the local state
      const updatedLibraryHours = libraryHours.map((entry) =>
        entry.id === emptyEntry.id
          ? { 
              ...entry, 
              bookTitle: bookDetails.title,
              requiresBookAssignment: false // Clear the flag
            }
          : entry
      );
      setLibraryHours(updatedLibraryHours);
      
      // Step 2: If summary is provided, update the library hours record with the summary
      if (bookDetails.summary) {
        try {
          await api.put(
            `/library-hours/${emptyEntry.id}/add-summary`,
            {
              summary: bookDetails.summary,
              requiresBookAssignment: false // Explicitly set flag to false
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          // Update the entry with the summary
          const finalUpdatedLibraryHours = updatedLibraryHours.map((entry) =>
            entry.id === emptyEntry.id
              ? { ...entry, summary: bookDetails.summary }
              : entry
          );
          setLibraryHours(finalUpdatedLibraryHours);
          
        } catch (summaryError) {
          console.error("Error adding summary to library hours:", summaryError);
          toast.warning(`Book assigned but couldn't add summary: ${summaryError.message}`);
        }
      } else {
        // If no summary, make a separate call to update the requiresBookAssignment flag
        try {
          await api.put(
            `/library-hours/${emptyEntry.id}/update-flags`,
            {
              requiresBookAssignment: false
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (updateError) {
          console.error("Error updating flags:", updateError);
        }
      }
      
      // Step 3: Also add to journal if we have the required data
      if (bookDetails.rating && bookDetails.dateRead) {
        try {
          const encodedIdNumber = encodeURIComponent(user.idNumber);
          
          const journalPayload = {
            dateRead: bookDetails.dateRead,
            rating: bookDetails.rating
          };
          
          // Add comment if provided
          if (bookDetails.comment) {
            journalPayload.comment = bookDetails.comment;
          }
          
          await api.put(
            `/journals/${bookDetails.id}/add-to-journal/${encodedIdNumber}`,
            journalPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          let successMessage = `Book "${bookDetails.title}" assigned successfully and added to journal!`;
          toast.success(successMessage);
        } catch (journalError) {
          console.error("Error adding to journal:", journalError);
          toast.warning(`Book assigned but couldn't add to journal: ${journalError.message}`);
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
    
    if (name === 'dateFrom' && value) {
      // If changing dateFrom
      // And ensure dateTo is not earlier than dateFrom
      const dateTo = filters.dateTo;
      if (dateTo && new Date(value) > new Date(dateTo)) {
        // If dateFrom is later than dateTo, reset dateTo
        newFilters = { ...filters, dateFrom: value, dateTo: "" };
      } else {
        newFilters = { ...filters, dateFrom: value };
      }
    } else {
      // If clearing a filter, just update that specific field
      newFilters = { ...filters, [name]: value };
    }
    
    setFilters(newFilters);
  };

  // Combined function to apply filters and sorting
  const applyFiltersAndSort = () => {
    // Step 1: Apply filters
    const { dateFrom, dateTo } = filters;
    
    let filtered = libraryHours;

    if (dateFrom || dateTo) {
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
          
          return matchesDate;
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
          new Date(entry.timeIn).toLocaleTimeString().includes(searchQuery) ||
          entry.summary?.toLowerCase().includes(searchQuery.toLowerCase()) 
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
      dateTo: ""
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
        new Date(entry.timeIn).toLocaleTimeString().includes(query) ||
        entry.summary?.toLowerCase().includes(query)
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

  // UPDATED LOADING STATE
  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: "flex", height: "100vh" }}>
          <SideBar />
          <Box
            sx={{
              padding: 4,
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading library hours...</Typography>
          </Box>
        </Box>
      </>
    );
  }

  // Get displayed data with pagination
  const displayedHours = filteredHours.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
              
              {/* New Paper component for TASK */}
              <Paper
  elevation={2}
  sx={{
    padding: "8px 16px",
    backgroundColor: "#FFD700",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "50px", // Limit width for longer task descriptions
    cursor: progressSummary.currentTask !== "--" ? "pointer" : "default",
    transition: "background-color 0.3s",
    "&:hover": progressSummary.currentTask !== "--" ? {
      backgroundColor: "rgba(255, 215, 0, 0.8)",
    } : {},
  }}
  onClick={() => 
    progressSummary.currentTask !== "--" && 
    handleTaskClick({
      task: progressSummary.currentTask, 
      subject: progressSummary.currentSubject
    })
  }
>
  <Typography variant="subtitle2" fontWeight="bold" color="#000">
    TASK
  </Typography>
  <Tooltip title={progressSummary.currentTask} placement="top">
    <Typography 
      variant="body1" 
      color="#000" 
      fontWeight="medium"
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        width: "100%",
        textAlign: "center"
      }}
    >
      {progressSummary.currentTask}
    </Typography>
  </Tooltip>
</Paper>
              
              {/* New Paper component for CREATED BY */}
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
                  CREATED BY
                </Typography>
                <Typography variant="body1" color="#000" fontWeight="medium">
                  {progressSummary.currentCreator}
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
                  {progressSummary.currentMinutesRemaining}
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
                  {progressSummary.currentMinutesRendered}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Filters and Book Read Button */}
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
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
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
                disabled={!filters.dateFrom} // Disable if dateFrom is empty
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              />
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

            {/* Book Read Button */}
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
              overflow: 'visible',
              marginTop: 3,
              marginBottom: 7,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <Table sx={{ minWidth: 650 }}>
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
                  <>
                    {/* Display actual data rows */}
                    {displayedHours.map((entry) => (
                      <TableRow key={entry.id} sx={{ 
                        verticalAlign: "top",
                        // Highlight sessions that need book assignment
                        backgroundColor: entry.requiresBookAssignment ? "rgba(255, 0, 0, 0.05)" : "inherit"
                      }}>
                        <TableCell sx={{ verticalAlign: "top" }}>{new Date(entry.timeIn).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ verticalAlign: "top" }}>{new Date(entry.timeIn).toLocaleTimeString()}</TableCell>
                        <TableCell sx={{ verticalAlign: "top" }}>
                          {entry.bookTitle ? (
                            <Button
                              onClick={() => handleBookTitleClick(entry)}
                              color="primary"
                              sx={{
                                textTransform: "none",
                                fontWeight: entry.summary ? "bold" : "normal",
                                "&:hover": {
                                  textDecoration: "underline",
                                  backgroundColor: "transparent",
                                },
                                padding: "0",
                                justifyContent: "flex-start",
                              }}
                            >
                              {entry.bookTitle}
                            </Button>
                          ) : (
                            entry.requiresBookAssignment ? (
                              <Typography color="error">
                                -- (Book Required) --
                              </Typography>
                            ) : (
                              "--"
                            )
                          )}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "top" }}>{entry.timeOut ? new Date(entry.timeOut).toLocaleTimeString() : "--"}</TableCell>
                        <TableCell sx={{ verticalAlign: "top" }}>{calculateMinutes(entry.timeIn, entry.timeOut)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Only add empty rows when rowsPerPage is 5 (default) and we have fewer rows */}
                    {rowsPerPage === 5 && displayedHours.length > 0 && displayedHours.length < 5 && 
                      Array.from({ length: 5 - displayedHours.length }).map((_, index) => (
                        <TableRow key={`empty-${index}`} sx={{ height: '53px' }}>
                          <TableCell colSpan={5} sx={{ border: 'none' }}></TableCell>
                        </TableRow>
                      ))
                    }
                  </>
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
                paddingBottom: 2,
                backgroundColor: "transparent",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                width: "100%",
                position: "relative",
              }}
            />
          </TableContainer>
        </Box>
      </Box>

      {/* Summary Dialog */}
      <Dialog
        open={summaryDialogOpen}
        onClose={handleCloseSummaryDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "15px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "25px",
            backgroundColor: "#FFDF16",
            color: "#000",
          }}
        >
          What I Learned: {selectedSummary.bookTitle}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "#FFDF16",
            padding: "30px",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              minHeight: "200px",
            }}
          >
            <Typography
              sx={{
                whiteSpace: "pre-wrap", // Preserve line breaks
                color: "#000",
              }}
            >
              {selectedSummary.summary}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            backgroundColor: "#FFDF16",
            padding: 2,
          }}
        >
          <Button
            onClick={handleCloseSummaryDialog}
            variant="contained"
            sx={{
              borderRadius: "10px",
              width: "120px",
              backgroundColor: "#A44444",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#BB5252",
              },
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>


      {/* Task Description Dialog */}
  <Dialog
    open={taskDialogOpen}
    onClose={() => setTaskDialogOpen(false)}
    maxWidth="md"
    fullWidth
    sx={{
      "& .MuiPaper-root": {
        borderRadius: "15px",
        overflow: "hidden",
      },
    }}
  >
    <DialogTitle
      sx={{
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "25px",
        backgroundColor: "#FFDF16",
        color: "#000",
      }}
    >
      Task Description: {selectedTask.subject}
    </DialogTitle>
    <DialogContent
      sx={{
        backgroundColor: "#FFDF16",
        padding: "30px",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: "16px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          minHeight: "200px",
        }}
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap", // Preserve line breaks
            color: "#000",
          }}
        >
          {selectedTask.task}
        </Typography>
      </Paper>
    </DialogContent>
    <DialogActions
      sx={{
        justifyContent: "center",
        backgroundColor: "#FFDF16",
        padding: 2,
      }}
    >
      <Button
        onClick={() => setTaskDialogOpen(false)}
        variant="contained"
        sx={{
          borderRadius: "10px",
          width: "120px",
          backgroundColor: "#A44444",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#BB5252",
          },
        }}
      >
        CLOSE
      </Button>
    </DialogActions>
  </Dialog>


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