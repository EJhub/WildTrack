import React, { useState, useEffect, useContext } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddBookLog from "./components/AddbookLog";
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
import { AuthContext } from "../AuthContext";
// Import icons for sort indicators
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import api from "../../utils/api"; // Import the API utility instead of axios

const BookLog = () => {
  const [bookLogs, setBookLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    academicYear: "",
  });
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [addBookLogOpen, setAddBookLogOpen] = useState(false);
  const [registeredBooks, setRegisteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add sort state
  const [sortConfig, setSortConfig] = useState({
    key: 'dateRead', // Default to sort by date
    direction: 'asc'  // Default to ascending order
  });

  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!authLoading) {
      fetchInitialData();
    }
  }, [authLoading, user]);

  // New useEffect to apply default sorting when data is loaded
  useEffect(() => {
    if (bookLogs.length > 0) {
      applyFiltersAndSort();
    }
  }, [bookLogs, sortConfig]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated || !user || !user.idNumber) {
        alert("Unauthorized access. Please log in.");
        setLoading(false);
        return;
      }

      // Set token in API utility headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      try {
        const academicYearsResponse = await api.get('/academic-years/all');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
      
      await fetchBookLogs();
      await fetchRegisteredBooks();
    } finally {
      setLoading(false);
    }
  };

  const fetchBookLogs = async () => {
    try {
      if (!user || !user.idNumber) {
        console.error("User ID not available");
        return;
      }

      // Set token in API utility headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await api.get(`/booklog/user/${user.idNumber}`);

      setBookLogs(response.data);
      // Don't set filtered logs here, will be done by applyFiltersAndSort
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
      const response = await api.get("/books/all");
      setRegisteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching registered books:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    let newFilters;
    
    if (name === 'academicYear' && value) {
      newFilters = { dateFrom: "", dateTo: "", academicYear: value };
    } else if (name === 'dateFrom' && value) {
      const dateTo = filters.dateTo;
      if (dateTo && new Date(value) > new Date(dateTo)) {
        newFilters = { ...filters, academicYear: "", dateFrom: value, dateTo: "" };
      } else {
        newFilters = { ...filters, academicYear: "", dateFrom: value };
      }
    } else if (name === 'dateTo' && value) {
      newFilters = { ...filters, academicYear: "", dateTo: value };
    } else {
      newFilters = { ...filters, [name]: value };
    }
    
    setFilters(newFilters);
  };

  // New sort handler function
  const handleSort = (key) => {
    // Toggle sort direction if same column is clicked again
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper function to sort data based on sortConfig
  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      // Handle different data types
      if (sortConfig.key === 'dateRead') {
        // Date comparison
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.direction === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      } else if (sortConfig.key === 'rating') {
        // Number comparison for ratings
        return sortConfig.direction === 'asc' 
          ? a[sortConfig.key] - b[sortConfig.key] 
          : b[sortConfig.key] - a[sortConfig.key];
      } else {
        // String comparison (title, author, accessionNumber)
        const valueA = (a[sortConfig.key] || '').toLowerCase();
        const valueB = (b[sortConfig.key] || '').toLowerCase();
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  };

  // Modified to include sorting
  const applyFiltersAndSort = () => {
    const { dateFrom, dateTo, academicYear } = filters;
    
    let filtered = bookLogs;

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateRead);
        return logDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateRead);
        return logDate <= toDate;
      });
    }

    if (academicYear && academicYear !== "") {
      const years = academicYear.split("-");
      if (years.length === 2) {
        const startYear = parseInt(years[0]);
        const endYear = parseInt(years[1]);
        
        filtered = filtered.filter(log => {
          const logDate = new Date(log.dateRead);
          const logYear = logDate.getFullYear();
          
          return (logYear === startYear || logYear === endYear);
        });
      } else {
        filtered = filtered.filter(log => log.academicYear === academicYear);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          new Date(log.dateRead).toLocaleDateString().includes(searchQuery)
      );
    }

    // Apply sorting after filtering
    const sortedData = getSortedData(filtered);
    
    setFilteredLogs(sortedData);
    setPage(0);
  };

  // Update apply filters to use the combined function
  const applyFilters = () => {
    applyFiltersAndSort();
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      academicYear: "",
    });
    
    if (searchQuery) {
      handleSearchChange({ target: { value: searchQuery } });
    } else {
      // Apply just the sorting to the unfiltered data
      const sortedData = getSortedData(bookLogs);
      setFilteredLogs(sortedData);
    }
    setPage(0);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Apply search and maintain current sorting
    let filtered = bookLogs.filter(
      (log) =>
        log.title?.toLowerCase().includes(query) ||
        log.author?.toLowerCase().includes(query) ||
        new Date(log.dateRead).toLocaleDateString().includes(query)
    );
    
    // Apply sorting to search results
    filtered = getSortedData(filtered);
    
    setFilteredLogs(filtered);
    setPage(0);
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

  // Component to render sort indicator
  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) {
      return <UnfoldMoreIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5, opacity: 0.5 }} />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
      : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />;
  };

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

      const encodedIdNumber = encodeURIComponent(user.idNumber);
      
      // Set token in API utility headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
  
      const response = await api.put(
        `/booklog/${bookLog.id}/add-to-booklog/${encodedIdNumber}`,
        {
          dateRead: bookLog.dateRead,
          rating: bookLog.rating,
          academicYear: bookLog.academicYear,
        }
      );
  
      if (response.status === 200) {
        alert(response.data.message);
        await fetchBookLogs(); // Will trigger sort via useEffect
      } else {
        console.error("Unexpected status:", response.status, response.data);
        alert("Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Caught error:", error.response || error.message || error);
      alert(error.response?.data?.error || "Failed to add book to book log.");
    }
  };

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
          overflow: "hidden"
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: "32px 32px 64px 32px",
            flexGrow: 1,
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            '&::-webkit-scrollbar': {
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
                disabled={!!filters.academicYear}
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
                  min: filters.dateFrom || undefined
                }}
                disabled={!!filters.academicYear || !filters.dateFrom}
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
                disabled={!!filters.dateFrom || !!filters.dateTo}
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
              overflow: 'visible',
              marginTop: 3,
              marginBottom: 5,
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
                    onClick={() => handleSort('title')}
                    sx={{ 
                      fontWeight: "bold", 
                      backgroundColor: "#8C383E", 
                      color: "#fff",
                      cursor: "pointer", // Show cursor pointer on hover
                      '&:hover': {
                        backgroundColor: "#9C484E" // Lighter shade on hover
                      }
                    }}
                  >
                    Book Title <SortIndicator column="title" />
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('author')}
                    sx={{ 
                      fontWeight: "bold", 
                      backgroundColor: "#8C383E", 
                      color: "#fff",
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: "#9C484E"
                      }
                    }}
                  >
                    Author <SortIndicator column="author" />
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('accessionNumber')}
                    sx={{ 
                      fontWeight: "bold", 
                      backgroundColor: "#8C383E", 
                      color: "#fff",
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: "#9C484E"
                      }
                    }}
                  >
                    Accession Number <SortIndicator column="accessionNumber" />
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('dateRead')}
                    sx={{ 
                      fontWeight: "bold", 
                      backgroundColor: "#8C383E", 
                      color: "#fff",
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: "#9C484E"
                      }
                    }}
                  >
                    Date Read <SortIndicator column="dateRead" />
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('rating')}
                    sx={{ 
                      fontWeight: "bold", 
                      backgroundColor: "#8C383E", 
                      color: "#fff",
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: "#9C484E"
                      }
                    }}
                  >
                    Rating <SortIndicator column="rating" />
                  </TableCell>
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