import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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

const AddBookLog = ({ open, handleClose, handleSubmit, registeredBooks }) => {
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [selectedBook, setSelectedBook] = useState(null); // To store the selected book
  const [rating, setRating] = useState(0); // To store the user's rating
  const [academicYear, setAcademicYear] = useState(""); // Academic year
  const [dateRead, setDateRead] = useState(""); // Date the book was read
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get books to display based on the search query
  const getFilteredBooks = () => {
    if (!searchQuery.trim()) {
      return registeredBooks; // If search query is empty, return all registered books
    }
    return registeredBooks.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleBookSubmit = () => {
    if (!selectedBook) {
      setError("Please select a book.");
      return;
    }

    if (!dateRead) {
      setError("Please select the date you read the book.");
      return;
    }

    if (rating === 0) {
      setError("Please provide a rating for the book.");
      return;
    }

    if (!academicYear.trim()) {
      setError("Please enter the academic year.");
      return;
    }

    setError(null);

    const bookLog = {
      id: selectedBook.id,
      title: selectedBook.title,
      author: selectedBook.author,
      accessionNumber: selectedBook.accessionNumber,
      isbn: selectedBook.isbn, // Include ISBN field
      dateRead,
      rating,
      academicYear,
    };

    console.log("Submitting book log: ", bookLog); // Debug log
    handleSubmit(bookLog); // Pass to parent function

    // Reset fields after successful submission
    setSelectedBook(null);
    setSearchQuery("");
    setRating(0);
    setDateRead("");
    setAcademicYear("");

    // Close the modal
    setSuccess("Book log added successfully!");
    setTimeout(() => {
      setSuccess(null);
      handleClose();
    }, 1500); // Optional: Add a small delay before closing the modal
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
        Add Book Log
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#FFDF16",
          padding: "30px",
        }}
      >
        {/* Horizontal Alignment for Title and Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
          <Typography
            sx={{
              textAlign: "left",
              color: "#000",
              marginRight: 2,
              fontWeight: "bold",
            }}
          >
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
            marginBottom: 2,
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
            textAlign: "center", // Align header text in the center
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
            textAlign: "center", // Align header text in the center
            width: "20%",
          }}
        >
          AUTHOR
        </TableCell>
        <TableCell
          sx={{
            fontWeight: "bold",
            backgroundColor: "#8B3D3D",
            color: "#FFD700",
            textAlign: "center", // Align header text in the center
            width: "20%",
          }}
        >
          ACCESSION NUMBER
        </TableCell>
        <TableCell
          sx={{
            fontWeight: "bold",
            backgroundColor: "#8B3D3D",
            color: "#FFD700",
            textAlign: "center", // Align header text in the center
            width: "20%",
          }}
        >
          ISBN
        </TableCell>
        <TableCell
          sx={{
            fontWeight: "bold",
            backgroundColor: "#8B3D3D",
            color: "#FFD700",
            textAlign: "center", // Align header text in the center
            width: "10%",
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
      maxHeight: "300px", // Define the height of the scrollable area
      overflowY: "auto", // Enable vertical scrolling
    }}
  >
    <Table>
      <TableBody>
        {filteredBooks.map((book) => (
          <TableRow
            key={book.accessionNumber}
            onClick={() => setSelectedBook(book)}
            sx={{
              cursor: "pointer",
              backgroundColor:
                selectedBook?.accessionNumber === book.accessionNumber
                  ? "#FFD700"
                  : "inherit", // Highlight the selected book
            }}
          >
            <TableCell
              sx={{
                textAlign: "center", // Align data in the center
                width: "30%",
              }}
            >
              {book.title}
            </TableCell>
            <TableCell
              sx={{
                textAlign: "center", // Align data in the center
                width: "20%",
              }}
            >
              {book.author}
            </TableCell>
            <TableCell
              sx={{
                textAlign: "center", // Align data in the center
                width: "20%",
              }}
            >
              {book.accessionNumber}
            </TableCell>
            <TableCell
              sx={{
                textAlign: "center", // Align data in the center
                width: "20%",
              }}
            >
              {book.isbn}
            </TableCell>
            <TableCell
              sx={{
                textAlign: "center", // Align action in the center
                width: "10%",
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FFD700",
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




        {/* Rating and Additional Info Section */}
        {selectedBook && (
          <Box sx={{ marginTop: 3, textAlign: "center" }}>
            <Typography sx={{ fontWeight: "bold", color: "#000" }}>
              Rate "{selectedBook.title}" by {selectedBook.author}
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={1}
              sx={{ marginTop: 2 }}
            />
            <TextField
              label="Date Read"
              type="date"
              value={dateRead}
              onChange={(e) => setDateRead(e.target.value)}
              fullWidth
              sx={{
                marginTop: 2,
                backgroundColor: "#fff",
                borderRadius: "10px",
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              fullWidth
              sx={{
                marginTop: 2,
                backgroundColor: "#fff",
                borderRadius: "10px",
              }}
            />
          </Box>
        )}

        {error && (
          <Typography sx={{ color: "red", marginTop: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography
            sx={{ color: "green", marginTop: 2, textAlign: "center" }}
          >
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
</DialogActions>

    </Dialog>
  );
};

export default AddBookLog;
