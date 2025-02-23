import React, { useState, useEffect } from "react";
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

const BookLog = () => {
  const [bookLogs, setBookLogs] = useState([]); // Stores book logs for the user
  const [filteredLogs, setFilteredLogs] = useState([]); // Stores filtered logs
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    academicYear: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [addBookLogOpen, setAddBookLogOpen] = useState(false);
  const [registeredBooks, setRegisteredBooks] = useState([]); // List of books

  // Get idNumber directly
  const idNumber = new URLSearchParams(window.location.search).get("id");
  const token = localStorage.getItem("token");

  // Fetch Book Logs Function
  const fetchBookLogs = async () => {
    try {
      if (!token || !idNumber) {
        alert("Unauthorized access. Please log in.");
        return;
      }

      console.log("Token:", token);
      console.log("ID Number:", idNumber);

      const response = await axios.get(
        `http://localhost:8080/api/booklog/user/${idNumber}`,
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

  useEffect(() => {
    fetchBookLogs();
    const fetchRegisteredBooks = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/books/all");
        setRegisteredBooks(response.data);
      } catch (error) {
        console.error("Error fetching registered books:", error);
      }
    };

    fetchRegisteredBooks();
  }, [idNumber, token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    const { search, dateFrom, dateTo, academicYear } = filters;

    let filtered = bookLogs;

    if (search) {
      filtered = filtered.filter(
        (log) =>
          log.title.toLowerCase().includes(search.toLowerCase()) ||
          log.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter((log) => new Date(log.dateRead) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter((log) => new Date(log.dateRead) <= new Date(dateTo));
    }

    if (academicYear) {
      filtered = filtered.filter((log) => log.academicYear === academicYear);
    }

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
      const encodedIdNumber = encodeURIComponent(idNumber); // Encode special characters
  
      const response = await axios.put(
        `http://localhost:8080/api/booklog/${bookLog.id}/add-to-booklog/${encodedIdNumber}`,
        {
          dateRead: bookLog.dateRead,
          rating: bookLog.rating,
          academicYear: bookLog.academicYear,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  return (
    <>
      <NavBar />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "auto",
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
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              variant="outlined"
              placeholder="Type here..."
              size="small"
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
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
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
            <Button
              variant="contained"
              onClick={handleAddBookLogOpen}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                "&:hover": { backgroundColor: "#FFC107" },
              }}
            >
              Add Book
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
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Book Title</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Accession Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Date Read</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8C383E", color: "#fff" }}>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.dateRead).toLocaleDateString()}</TableCell>
                    <TableCell>{log.author}</TableCell>
                    <TableCell>{log.title}</TableCell>
                    <TableCell>{renderStars(log.rating)}</TableCell>
                    <TableCell>{log.academicYear}</TableCell>
                  </TableRow>
                ))}
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
                backgroundColor: "transparent", // Make background transparent
                fontWeight: "bold",
                display: "flex", // Use flexbox to align items
                justifyContent: "center", // Center the pagination
                width: "100%",
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
