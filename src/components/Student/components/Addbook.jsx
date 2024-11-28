import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const Addbook = ({ open, handleClose, handleSubmit, registeredBooks }) => {
  const [bookDetails, setBookDetails] = useState({
    author: "",
    title: "",
    accessionNumber: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    setError(null); // Clear error when editing
  };

  const validateForm = () => {
    if (!bookDetails.author || !bookDetails.title || !bookDetails.accessionNumber) {
      setError("All fields are required. Please fill out the form completely.");
      return false;
    }
    return true;
  };

  const onSubmit = () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    // Validate the entered book against the registered books
    const bookExists = registeredBooks.some(
      (book) =>
        book.author === bookDetails.author &&
        book.title === bookDetails.title &&
        book.accessionNumber === bookDetails.accessionNumber
    );

    if (!bookExists) {
      setError("The entered book details do not match any registered book.");
      return;
    }

    try {
      handleSubmit(bookDetails); // Pass the validated book back to the parent component
      setSuccess("Book added successfully!");
      setBookDetails({ author: "", title: "", accessionNumber: "" }); // Clear form
    } catch (err) {
      console.error("Error adding book:", err);
      setError("Failed to submit book details. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
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
          backgroundColor: "#8B3D3D",
          color: "#000",
        }}
      >
        <h2>Add Book</h2>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#8B3D3D",
          padding: "30px",
        }}
      >
        <Typography sx={{ textAlign: "left", color: "#000", marginLeft: 4 }}>
          Author:
        </Typography>
        <TextField
          name="author"
          fullWidth
          variant="outlined"
          value={bookDetails.author}
          onChange={handleInputChange}
          sx={{
            marginBottom: 2,
            backgroundColor: "#fff",
            borderRadius: "10px",
            height: "50px",
            width: "330px",
            overflow: "hidden",
          }}
        />
        <Typography sx={{ textAlign: "left", color: "#000", marginLeft: 4 }}>
          Title:
        </Typography>
        <TextField
          name="title"
          fullWidth
          variant="outlined"
          value={bookDetails.title}
          onChange={handleInputChange}
          sx={{
            marginBottom: 2,
            backgroundColor: "#fff",
            borderRadius: "10px",
            height: "50px",
            width: "330px",
            overflow: "hidden",
          }}
        />
        <Typography sx={{ textAlign: "left", color: "#000", marginLeft: 4 }}>
          Accession Number:
        </Typography>
        <TextField
          name="accessionNumber"
          fullWidth
          variant="outlined"
          value={bookDetails.accessionNumber}
          onChange={handleInputChange}
          sx={{
            marginBottom: 2,
            backgroundColor: "#fff",
            borderRadius: "10px",
            height: "50px",
            width: "330px",
            overflow: "hidden",
          }}
        />
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
          backgroundColor: "#8B3D3D",
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
            color: "#000",
            "&:hover": {
              backgroundColor: "#A44444",
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          sx={{
            borderRadius: "10px",
            width: "120px",
            backgroundColor: "#FFD700",
            color: "#000",
            "&:hover": {
              backgroundColor: "#FFC107",
            },
          }}
        >
          SUBMIT
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Addbook;
