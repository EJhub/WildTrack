import React, { useState } from "react";
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

const AddBook = ({ open, handleClose, handleSubmit, registeredBooks }) => {
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const handleBookSubmit = (book) => {
    setError(null);
    setSuccess(null);

    try {
      handleSubmit(book); // Pass the selected book to the parent component
      setSuccess(`Book "${book.title}" added successfully!`);
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
          border: "2px solid #8B3D3D",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "#FFD700",
          color: "#000",
        }}
      >
        Add Book
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#FFD700",
          padding: "30px",
          overflow: "hidden",
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
            color: "#8B3D3D",
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
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8B3D3D", color: "#FFD700" }}>
                  BOOK TITLE
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8B3D3D", color: "#FFD700" }}>
                  AUTHOR
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8B3D3D", color: "#FFD700" }}>
                  ACCESSION NUMBER
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8B3D3D", color: "#FFD700" }}>
                  ISBN
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#8B3D3D", color: "#FFD700" }}>
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
          </Table>

          {/* Scrollable Table Body */}
          <Box
            sx={{
              maxHeight: "300px", // Set max height for the table body
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            <Table>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.accessionNumber}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.accessionNumber}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleBookSubmit(book)}
                        sx={{
                          backgroundColor: "#FFD700",
                          color: "#000",
                          "&:hover": {
                            backgroundColor: "#FFC107",
                          },
                        }}
                      >
                        Submit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBooks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No books found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </TableContainer>

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
          backgroundColor: "#FFD700",
          padding: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            borderRadius: "10px",
            width: "120px",
            backgroundColor: "#BB5252",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#A44444",
            },
          }}
        >
          CANCEL
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBook;
