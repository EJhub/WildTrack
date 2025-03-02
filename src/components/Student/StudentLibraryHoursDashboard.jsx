import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchLibraryHours = async () => {
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams(window.location.search);
        const idNumber = params.get("id");

        if (!token || !idNumber) {
          toast.error("Unauthorized access. Please log in.");
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
      } finally {
        setLoading(false);
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

    fetchLibraryHours();
    fetchBooks();
  }, []);

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

 // Here's the improved applyFilters function to fix the date range filtering
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
      
      // Check if academic year matches if specified
      const matchesYear = !academicYear || entry.academicYear === academicYear;
      
      return matchesDate && matchesYear;
    } catch (error) {
      console.error("Error comparing dates:", error);
      return true; // Include entry if date comparison fails
    }
  });
  
  setFilteredHours(filtered);
  setPage(0); // Reset to first page after filtering
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

  if (loading) {
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
      <Box sx={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url('/studentbackground.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "hidden",
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
                          <MenuItem value="2024">2024</MenuItem>
                          <MenuItem value="2023">2023</MenuItem>
                          <MenuItem value="2025">2025</MenuItem>
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
                  overflow: 'auto',
                  maxHeight: 'calc(100vh - 340px)',
                  marginTop: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
  <Table stickyHeader sx={{ flexGrow: 1 }}>
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
    backgroundColor: "transparent",  // Make background transparent
    fontWeight: "bold",
    display: "flex",  // Use flexbox to align items
    justifyContent: "center",  // Center the pagination
    width: "100%",
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
