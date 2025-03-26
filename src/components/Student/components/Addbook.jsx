import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";

const AddBook = ({ open, handleClose, handleSubmit, registeredBooks }) => {
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null); // Added state for selected book
  const [rating, setRating] = useState(0); // Added state for rating
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const [dateRead, setDateRead] = useState(today); // Initialize with today's date
  
  const [academicYear, setAcademicYear] = useState(""); // Added state for academic year
  const [academicYearOptions, setAcademicYearOptions] = useState([]); // Added for academic year options

  // Fetch academic years when component mounts
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/academic-years/all');
        const formattedYears = response.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedYears);
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };

    fetchAcademicYears();
  }, []);

  // Get books to display based on the search query
  const getFilteredBooks = () => {
    if (!searchQuery.trim()) {
      // If search query is empty, return all registered books
      return registeredBooks;
    }
    // Filter books based on the search query
    return registeredBooks.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleBookSelection = (book) => {
    setSelectedBook(book);
    setError(null);
  };

  const handleBookSubmit = () => {
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!selectedBook) {
      setError("Please select a book.");
      return;
    }

    if (rating === 0) {
      setError("Please provide a rating for the book.");
      return;
    }

    if (!academicYear) {
      setError("Please select an academic year.");
      return;
    }

    try {
      // Pass the selected book and additional information to the parent component
      handleSubmit({
        ...selectedBook,
        rating,
        dateRead, // This will be today's date
        academicYear
      });
      
      setSuccess(`Book "${selectedBook.title}" added successfully!`);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedBook(null);
        setRating(0);
        setDateRead(today);
        setAcademicYear("");
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Error adding book:", err);
      setError("Failed to submit book details. Please try again.");
    }
  };

  const filteredBooks = getFilteredBooks();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        Add Book Read
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#FFDF16",
          padding: "30px",
        }}
      >
        {/* Horizontal Alignment for Title and Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
          <Typography sx={{ textAlign: "left", color: "#000", marginRight: 2, fontWeight: 'bold' }}>
            Title:
          </Typography>
          <TextField
            name="search"
            placeholder="Type book title here..."
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "10px",
            }}
          />
        </Box>

        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "black",
            marginBottom: 1,
          }}
        >
          Book Details
        </Typography>

        {/* Table with Scrollable Body */}
        <TableContainer component={Paper} sx={{ borderRadius: "10px" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#8B3D3D",
                    color: "#FFD700",
                    textAlign: "center",
                    width: "30%",
                  }}
                >
                  BOOK TITLE
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#8B3D3D",
                    color: "#FFD700",
                    textAlign: "center",
                    width: "25%",
                  }}
                >
                  AUTHOR
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#8B3D3D",
                    color: "#FFD700",
                    textAlign: "center",
                    width: "25%",
                  }}
                >
                  ACCESSION NUMBER
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#8B3D3D",
                    color: "#FFD700",
                    textAlign: "center",
                    width: "25%",
                  }}
                >
                  ISBN
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#8B3D3D",
                    color: "#FFD700",
                    textAlign: "center",
                    width: "20%",
                  }}
                >
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
          </Table>

          {/* Scrollable Table Body */}
          <Box
            sx={{
              maxHeight: "190px", // Reduced height to make room for additional fields
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            <Table>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow 
                    key={book.accessionNumber}
                    onClick={() => handleBookSelection(book)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: selectedBook?.id === book.id ? "rgba(255, 215, 0, 0.3)" : "inherit",
                    }}
                  >
                    <TableCell sx={{ textAlign: "center", width: "30%" }}>
                      {book.title}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "20%" }}>
                      {book.author}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "20%" }}>
                      {book.accessionNumber}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "20%" }}>
                      {book.isbn}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "10%" }}>
                      <Button
                        variant="contained"
                        onClick={() => handleBookSelection(book)}
                        sx={{
                          backgroundColor: selectedBook?.id === book.id ? "#FFC107" : "#FFDF16",
                          color: "#000",
                          "&:hover": {
                            backgroundColor: "#FFC107",
                          },
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBooks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                      No books found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </TableContainer>

        {/* Additional fields for BookLog - Only show if a book is selected */}
        {selectedBook && (
          <Box sx={{ marginTop: 3, textAlign: "center" }}>
            <Typography sx={{ fontWeight: "bold", color: "#000", marginBottom: 2 }}>
              Book Log Details for "{selectedBook.title}"
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
              <Typography sx={{ color: "#000", marginRight: 2 }}>
                Rating:
              </Typography>
              <Rating
                name="book-rating"
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
                precision={1}
                size="large"
              />
            </Box>
            
            <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
              <Box sx={{ position: "relative", width: "100%" }}>
                <TextField
                  label="Date Read"
                  type="date"
                  value={dateRead}
                  disabled // Make the field disabled/read-only
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    backgroundColor: "#f5f5f5", // Lighter background to indicate disabled
                    borderRadius: "10px",
                  }}
                />
                <Tooltip title="Date is automatically set to today" placement="top">
                  <InfoIcon 
                    sx={{ 
                      position: "absolute", 
                      right: "10px", 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      color: "#666" 
                    }} 
                  />
                </Tooltip>
              </Box>
              
              <FormControl fullWidth sx={{ backgroundColor: "#fff", borderRadius: "10px" }}>
                <InputLabel id="academic-year-label">Academic Year</InputLabel>
                <Select
                  labelId="academic-year-label"
                  id="academic-year-select"
                  value={academicYear}
                  label="Academic Year"
                  onChange={(e) => setAcademicYear(e.target.value)}
                >
                  <MenuItem value="">Select Academic Year</MenuItem>
                  {academicYearOptions.map((year, index) => (
                    <MenuItem key={index} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {error && (
          <Typography sx={{ color: "red", marginTop: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography sx={{ color: "green", marginTop: 2, textAlign: "center" }}>
            {success}
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          backgroundColor: "#FFDF16",
          padding: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            borderRadius: "10px",
            width: "120px",
            backgroundColor: "#E49B0F",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#AA8F0B",
            },
          }}
        >
          CANCEL
        </Button>
        
        {selectedBook && (
          <Button
            onClick={handleBookSubmit}
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
            SUBMIT
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddBook;