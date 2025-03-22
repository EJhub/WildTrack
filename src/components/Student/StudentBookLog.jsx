import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddBookLog from "./components/AddbookLog"; // Import AddBookLog modal
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../AuthContext"; // Import AuthContext

const BookLog = () => {
  const [bookLogs, setBookLogs] = useState([]); // Stores book logs for the user
  const [filteredLogs, setFilteredLogs] = useState([]); // Stores filtered logs
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    academicYear: "",
  });
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Separate state for search query
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [addBookLogOpen, setAddBookLogOpen] = useState(false);
  const [registeredBooks, setRegisteredBooks] = useState([]); // List of books
  const [loading, setLoading] = useState(true);

  // Use AuthContext to access user information
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Only fetch data once authentication is complete
    if (!authLoading) {
      fetchInitialData();
    }
  }, [authLoading, user]);

  // Fetch initial data - academic years, book logs, and registered books
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!isAuthenticated || !user || !user.idNumber) {
        alert("Unauthorized access. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch academic years
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
      
      // Fetch book logs
      await fetchBookLogs();

      // Fetch registered books
      await fetchRegisteredBooks();
    } finally {
      setLoading(false);
    }
  };

  // Fetch Book Logs Function
  const fetchBookLogs = async () => {
    try {
      if (!user || !user.idNumber) {
        console.error("User ID not available");
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/api/booklog/user/${user.idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      console.error(
        "Error fetching book logs:",
        error.response?.data || error.message
      );
      alert(error.response?.data || "Failed to fetch book logs.");
    }
  };

  const fetchRegisteredBooks = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/books/all");
      setRegisteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching registered books:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Updated applyFilters function with improved academic year handling
  const applyFilters = () => {
    const { dateFrom, dateTo, academicYear } = filters;
    
    let filtered = bookLogs;

    // Apply date filters with improved handling
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0); // Start of day
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateRead);
        return logDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateRead);
        return logDate <= toDate;
      });
    }

    // Updated academic year filtering logic to handle year ranges
    if (academicYear && academicYear !== "") {
      // Parse the academic year range (e.g., "2025-2026")
      const years = academicYear.split("-");
      if (years.length === 2) {
        const startYear = parseInt(years[0]);
        const endYear = parseInt(years[1]);
        
        filtered = filtered.filter(log => {
          const logDate = new Date(log.dateRead);
          const logYear = logDate.getFullYear();
          
          // Include if log's year matches either start or end year of the academic year
          return (logYear === startYear || logYear === endYear);
        });
      } else {
        // Fallback to exact string matching if format is not as expected
        filtered = filtered.filter(log => log.academicYear === academicYear);
      }
    }

    // Apply search filter if there's an active search query
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.title?.toLowerCase().includes(searchQuery) ||
          log.author?.toLowerCase().includes(searchQuery) ||
          new Date(log.dateRead).toLocaleDateString().includes(searchQuery)
      );
    }

    setFilteredLogs(filtered);
    setPage(0);
  };

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      academicYear: "",
    });
    
    // Reset to original data without filters
    // but maintain search if present
    if (searchQuery) {
      handleSearchChange({ target: { value: searchQuery } });
    } else {
      setFilteredLogs(bookLogs);
    }
    setPage(0);
  };

  // Search function that immediately filters results
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter the book logs based on the search query
    const filtered = bookLogs.filter(
      (log) =>
        log.title?.toLowerCase().includes(query) ||
        log.author?.toLowerCase().includes(query) ||
        new Date(log.dateRead).toLocaleDateString().includes(query)
    );
    
    setFilteredLogs(filtered);
    setPage(0); // Reset to first page
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  const handleAddBookLogOpen = () => {
    setAddBookLogOpen(true);
  };

  const handleAddBookLogClose = () => {
    setAddBookLogOpen(false);
  };

  const handleAddBookLogSubmit = async (bookLog) => {
    try {
      if (!user || !user.idNumber) {
        alert("User information not available.");
        return;
      }

      const encodedIdNumber = encodeURIComponent(user.idNumber); // Encode special characters
  
      const response = await axios.put(
        `http://localhost:8080/api/booklog/${bookLog.id}/add-to-booklog/${encodedIdNumber}`,
        {
          dateRead: bookLog.dateRead,
          rating: bookLog.rating,
          academicYear: bookLog.academicYear,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Response:", response); // Log the entire response
      if (response.status === 200) {
        alert(response.data.message); // Success message
        fetchBookLogs(); // Refresh the book logs
      } else {
        console.error("Unexpected status:", response.status, response.data);
        alert("Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Caught error:", error.response || error.message || error);
      alert(error.response?.data?.error || "Failed to add book to book log.");
    }
  };

  // Show loading indicator while auth or data is loading
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
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading book logs...</Typography>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Box 
        sx={{ 
          display: "flex", 
          height: "100vh",
          overflow: "hidden" // Prevent outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: "32px 32px 64px 32px", // Increased bottom padding
            flexGrow: 1,
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "auto", // Enable scrolling for main content
            height: "100%", // Fill available height
            display: "flex",
            flexDirection: "column",
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#FFD700",
                fontWeight: "bold",
                textAlign: "left",
                fontSize: "40px",
                marginTop: "15px",
              }}
            >
              Book Log
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 3,
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

          {/* Filters and Add Book Button */}
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
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                }}
              />
              <Select
                name="academicYear"
                value={filters.academicYear}
                onChange={handleFilterChange}
                displayEmpty
                size="small"
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  minWidth: "150px",
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
            <Button
              variant="contained"
              onClick={handleAddBookLogOpen}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                "&:hover": { backgroundColor: "#FFC107" },
              }}
            >
              Add Book Log
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '15px',
              boxShadow: 3,
              overflow: 'visible', // Changed from 'auto' to 'visible'
              marginTop: 3,
              marginBottom: 5, // Added bottom margin
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Table sx={{ flexGrow: 1 }}> {/* Removed stickyHeader */}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Book Title</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Accession Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Date Read</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No book logs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.title}</TableCell>
                      <TableCell>{log.author}</TableCell>
                      <TableCell>{log.accessionNumber}</TableCell>
                      <TableCell>{new Date(log.dateRead).toLocaleDateString()}</TableCell>
                      <TableCell>{renderStars(log.rating)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                paddingTop: 2,
                paddingBottom: 2, // Added bottom padding
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

      {/* AddBookLog Modal */}
      <AddBookLog
        open={addBookLogOpen}
        handleClose={handleAddBookLogClose}
        handleSubmit={(bookLog) => handleAddBookLogSubmit(bookLog)}
        registeredBooks={registeredBooks}
      />
    </>
  );
};

export default BookLog;