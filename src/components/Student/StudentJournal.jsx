import React, { useState, useEffect, useContext } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddEntry from "./components/AddEntry";
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
import Button from "@mui/material/Button";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../AuthContext";
// Import icons for sort indicators
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import api from "../../utils/api";
// Import for activity filter dropdown
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

const Journal = () => {
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    activity: "" // Add activity filter
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [addJournalOpen, setAddJournalOpen] = useState(false);
  const [registeredBooks, setRegisteredBooks] = useState([]);
  const [nextEntryNumber, setNextEntryNumber] = useState("1");
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
    if (journals.length > 0) {
      applyFiltersAndSort();
      calculateNextEntryNumber();
    }
  }, [journals, sortConfig]);

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
      
      await fetchJournals();
      await fetchRegisteredBooks();
    } finally {
      setLoading(false);
    }
  };

  const fetchJournals = async () => {
    try {
      if (!user || !user.idNumber) {
        console.error("User ID not available");
        return;
      }

      // Set token in API utility headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await api.get(`/journals/user/${user.idNumber}`);

      setJournals(response.data);
      // Don't set filtered logs here, will be done by applyFiltersAndSort
    } catch (error) {
      console.error(
        "Error fetching journals:",
        error.response?.data || error.message
      );
      alert(error.response?.data || "Failed to fetch journals.");
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
    
    if (name === 'dateFrom' && value) {
      const dateTo = filters.dateTo;
      if (dateTo && new Date(value) > new Date(dateTo)) {
        newFilters = { ...filters, dateFrom: value, dateTo: "" };
      } else {
        newFilters = { ...filters, dateFrom: value };
      }
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
      } else if (sortConfig.key === 'entryNo') {
        // Number comparison for entry numbers
        const numA = parseInt(a[sortConfig.key] || '0');
        const numB = parseInt(b[sortConfig.key] || '0');
        return sortConfig.direction === 'asc' 
          ? numA - numB 
          : numB - numA;
      } else {
        // String comparison (title, author, details, comment, etc.)
        const valueA = (a[sortConfig.key] || '').toLowerCase();
        const valueB = (b[sortConfig.key] || '').toLowerCase();
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  };

  // Modified to include activity filtering
  const applyFiltersAndSort = () => {
    const { dateFrom, dateTo, activity } = filters;
    
    let filtered = journals;

    // Date From filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateRead);
        return logDate >= fromDate;
      });
    }

    // Date To filter
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateRead);
        return logDate <= toDate;
      });
    }

    // Activity filter
    if (activity) {
      filtered = filtered.filter(log => log.activity === activity);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.activity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          new Date(log.dateRead).toLocaleDateString().includes(searchQuery)
      );
    }

    // Apply sorting after filtering
    const sortedData = getSortedData(filtered);
    
    setFilteredJournals(sortedData);
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
      activity: "" // Reset activity filter too
    });
    
    if (searchQuery) {
      handleSearchChange({ target: { value: searchQuery } });
    } else {
      // Apply just the sorting to the unfiltered data
      const sortedData = getSortedData(journals);
      setFilteredJournals(sortedData);
    }
    setPage(0);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Apply search and maintain current sorting
    let filtered = journals.filter(
      (log) =>
        log.title?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.comment?.toLowerCase().includes(query) ||
        log.activity?.toLowerCase().includes(query) ||
        new Date(log.dateRead).toLocaleDateString().includes(query)
    );
    
    // Apply sorting to search results
    filtered = getSortedData(filtered);
    
    setFilteredJournals(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedJournals = filteredJournals.slice(
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

  const handleAddJournalOpen = () => {
    // Calculate next entry number before opening the form
    calculateNextEntryNumber();
    setAddJournalOpen(true);
  };
  
  // Function to calculate the next entry number based on existing journal entries
  const calculateNextEntryNumber = () => {
    if (journals.length === 0) {
      setNextEntryNumber("1");
      return;
    }
    
    // Find the highest entry number in the existing journals
    const highestEntryNo = journals.reduce((highest, journal) => {
      const currentEntryNo = parseInt(journal.entryNo || "0");
      return currentEntryNo > highest ? currentEntryNo : highest;
    }, 0);
    
    // Set the next entry number as the highest + 1
    setNextEntryNumber(String(highestEntryNo + 1));
  };
  
  // Function to get the next entry number for the form
  const getNextEntryNumber = () => {
    return nextEntryNumber;
  };

  const handleAddJournalClose = () => {
    setAddJournalOpen(false);
  };

  const handleAddJournalSubmit = async (journal) => {
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

      let response;
      
      // Handle different types of journal entries
      if (journal.activity === "Read Book" && journal.id) {
        // For book reading
        response = await api.put(
          `/journals/${journal.id}/add-to-journal/${encodedIdNumber}`,
          {
            dateRead: journal.dateRead,
            rating: journal.rating,
            comment: journal.comment
          }
        );
      } else if (journal.activity === "Used Computer") {
        // For computer usage - removed bookTitle field
        response = await api.post(
          `/journals/computer-usage/${encodedIdNumber}`,
          {
            purpose: journal.details,
            rating: journal.rating,
            comment: journal.comment
          }
        );
      } else if (journal.activity === "Read Periodical") {
        // For periodical reading - removed bookTitle field
        response = await api.post(
          `/journals/periodical/${encodedIdNumber}`,
          {
            periodicalTitle: journal.details,
            rating: journal.rating,
            comment: journal.comment
          }
        );
      } else {
        alert("Invalid journal entry type");
        return;
      }
  
      if (response.status === 200) {
        alert("Journal entry added successfully!");
        await fetchJournals(); // Will trigger sort via useEffect
      } else {
        console.error("Unexpected status:", response.status, response.data);
        alert("Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Caught error:", error.response || error.message || error);
      alert(error.response?.data?.error || "Failed to add journal entry.");
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
            <Typography sx={{ ml: 2 }}>Loading journals...</Typography>
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
              Journal
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {/* Date From filter */}
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
              
              {/* Date To filter */}
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
                disabled={!filters.dateFrom}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              />
              
              {/* New Activity filter */}
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 180,
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                }}
              >
                <InputLabel id="activity-filter-label">Activity</InputLabel>
                <Select
                  labelId="activity-filter-label"
                  id="activity-filter"
                  name="activity"
                  value={filters.activity}
                  label="Activity"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">
                    <em>All Activities</em>
                  </MenuItem>
                  <MenuItem value="Read Book">Read Book</MenuItem>
                  <MenuItem value="Used Computer">Used Computer</MenuItem>
                  <MenuItem value="Read Periodical">Read Periodical</MenuItem>
                </Select>
              </FormControl>
              
              {/* Filter and Reset buttons */}
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
            
            {/* Add Journal button */}
            <Button
              variant="contained"
              onClick={handleAddJournalOpen}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                "&:hover": { backgroundColor: "#FFC107" },
              }}
            >
              Add Journal
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
                    onClick={() => handleSort('entryNo')}
                    sx={{ 
                      fontWeight: "bold", 
                      backgroundColor: "#8C383E", 
                      color: "#fff",
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: "#9C484E"
                      },
                      width: "80px"
                    }}
                  >
                    ENTRY NO. <SortIndicator column="entryNo" />
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
                      },
                      width: "120px"
                    }}
                  >
                    DATE <SortIndicator column="dateRead" />
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('activity')}
                    sx={{ 
                      fontWeight: "bold", 
                      backgroundColor: "#8C383E", 
                      color: "#fff",
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: "#9C484E"
                      },
                      width: "150px"
                    }}
                  >
                    ACTIVITY <SortIndicator column="activity" />
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('details')}
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
                    DETAILS <SortIndicator column="details" />
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('comment')}
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
                    COMMENTS <SortIndicator column="comment" />
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
                      },
                      width: "120px"
                    }}
                  >
                    RATING <SortIndicator column="rating" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedJournals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No journals found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedJournals.map((journal) => ( 
                    <TableRow key={journal.id}> 
                      <TableCell>{journal.entryNo || "-"}</TableCell>
                      <TableCell>{new Date(journal.dateRead).toLocaleDateString()}</TableCell>
                      <TableCell>{journal.activity || "Read Book"}</TableCell>
                      <TableCell>{journal.details || journal.title}</TableCell>
                      <TableCell>{journal.comment || "—"}</TableCell>
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

      <AddEntry
        open={addJournalOpen}
        handleClose={handleAddJournalClose}
        handleSubmit={(journal) => handleAddJournalSubmit(journal)}
        registeredBooks={registeredBooks}
        getNextEntryNumber={getNextEntryNumber}
      />
    </>
  );
};

export default Journal;