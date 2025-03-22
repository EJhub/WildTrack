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
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddBook from "./components/AddBook";
import { AuthContext } from '../AuthContext'; // Import AuthContext

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
  
  // Use AuthContext to access user information
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    // Only fetch data once authentication is complete
    if (!authLoading) {
      fetchInitialData();
    }
  }, [authLoading]);

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
          setFilteredHours(response.data); // Initialize filtered hours
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
      setFilteredHours(updatedLibraryHours); // Update filtered data as well
      toast.success(`Book "${bookDetails.title}" assigned successfully!`);
      handleClose();
    } catch (error) {
      console.error("Error assigning book to library hours:", error);
      toast.error("Failed to assign book to library hours.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Improved applyFilters function with academic year range support
  const applyFilters = () => {
    const { dateFrom, dateTo, academicYear } = filters;
    
    const filtered = libraryHours.filter((entry) => {
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
    
    setFilteredHours(filtered);
    setPage(0); // Reset to first page after filtering
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      academicYear: ""
    });
    setFilteredHours(libraryHours);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = libraryHours.filter(
      (entry) =>
        entry.bookTitle?.toLowerCase().includes(query) ||
        new Date(entry.timeIn).toLocaleDateString().includes(query) ||
        new Date(entry.timeIn).toLocaleTimeString().includes(query)
    );
    setFilteredHours(filtered);
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

  const displayedHours = filteredHours.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

          {/* Search Bar Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <TextField
              name="search"
              label="Search"
              placeholder="Search by date, time, or book title"
              variant="outlined"
              fullWidth
              onChange={handleSearchChange}
              sx={{
                backgroundColor: "#fff",
                borderRadius: "4px",
                maxWidth: 400,
                marginRight: 2,
              }}
            />
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
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Time In</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Book Title</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Time Out</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Minutes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedHours.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.timeIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(entry.timeIn).toLocaleTimeString()}</TableCell>
                    <TableCell>{entry.bookTitle ? entry.bookTitle : "--"}</TableCell>
                    <TableCell>{entry.timeOut ? new Date(entry.timeOut).toLocaleTimeString() : "--"}</TableCell>
                    <TableCell>{calculateMinutes(entry.timeIn, entry.timeOut)}</TableCell>
                  </TableRow>
                ))}
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