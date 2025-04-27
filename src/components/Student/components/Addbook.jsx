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
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import api from "../../../utils/api"; // Import the API utility instead of axios

const AddBook = ({ open, handleClose, handleSubmit, registeredBooks }) => {
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null); // Added state for selected book
  const [rating, setRating] = useState(0); // Added state for rating
  
  // Get today's date in local timezone (Manila)
  const date = new Date();
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const [dateRead, setDateRead] = useState(today); // Initialize with today's date
  
  // New fields
  const [summary, setSummary] = useState(""); // Summary/What I learned
  const [comment, setComment] = useState(""); // Comment for Journal system
  
  // Character count tracking
  const [summaryChars, setSummaryChars] = useState(0);

  // Get books to display based on the search query
  const getFilteredBooks = () => {
    if (!searchQuery.trim()) {
      // If search query is empty, return all registered books
      return registeredBooks;
    }
    // Filter books based on the search query for title, author, and accession number
    return registeredBooks.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.accessionNumber.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleSummaryChange = (e) => {
    const text = e.target.value;
    if (text.length <= 1000) {
      setSummary(text);
      setSummaryChars(text.length);
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
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

    if (!summary.trim()) {
      setError("Please provide a summary of what you learned.");
      return;
    }

    try {
      // Pass the selected book and additional information to the parent component
      handleSubmit({
        ...selectedBook,
        rating,
        dateRead, // This will be today's date
        summary, // New summary field
        comment // New comment field
      });
      
      setSuccess(`Book "${selectedBook.title}" added successfully!`);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedBook(null);
        setRating(0);
        setDateRead(today);
        setSummary("");
        setComment("");
        setSummaryChars(0);
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
        {/* Horizontal Alignment for Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
          <Typography sx={{ textAlign: "left", color: "#000", marginRight: 2, fontWeight: 'bold' }}>
            Search:
          </Typography>
          <TextField
            name="search"
            placeholder="Search by title, author, or accession number..."
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
                    width: "35%",
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
                    width: "30%",
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
                    width: "30%",
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
                    <TableCell sx={{ textAlign: "center", width: "35%" }}>
                      {book.title}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "30%" }}>
                      {book.author}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "30%" }}>
                      {book.accessionNumber}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", width: "20%" }}>
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
                    <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                      No books found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </TableContainer>

        {/* Additional fields for Book Log - Only show if a book is selected */}
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
            
            {/* Hidden date field - we keep the logic but hide the UI element */}
            <Box sx={{ display: "none" }}>
              <TextField
                label="Date Read"
                type="date"
                value={dateRead}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            {/* New Summary field */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography sx={{ color: "#000", marginBottom: 1, textAlign: "left" }}>
                Summary / What I Learned: ({summaryChars}/1000)
              </Typography>
              <TextField
                multiline
                rows={4}
                value={summary}
                onChange={handleSummaryChange}
                fullWidth
                placeholder="Share what you learned from this book..."
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                }}
                inputProps={{ maxLength: 1000 }}
              />
            </Box>
            
            {/* New Comment field */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography sx={{ color: "#000", marginBottom: 1, textAlign: "left" }}>
                Comment:
              </Typography>
              <TextField
                multiline
                rows={2}
                value={comment}
                onChange={handleCommentChange}
                fullWidth
                placeholder="Add your comments about this book..."
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                }}
              />
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