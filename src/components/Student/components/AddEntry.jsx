import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

// Styled components for consistent styling
const StyledLabel = styled(Typography)(({ theme }) => ({
  color: "#000",
  fontWeight: "bold",
  textAlign: "right",
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
  }
}));

const StyledSelect = styled(FormControl)(({ theme }) => ({
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
  }
}));

const AddEntry = (props) => {
  const { open, handleClose, handleSubmit, registeredBooks, getNextEntryNumber } = props;
  // State for form fields
  const [entryNo, setEntryNo] = useState("");
  const [activity, setActivity] = useState("");
  const [computerPurpose, setComputerPurpose] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedPeriodical, setSelectedPeriodical] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // New state for book search
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  
  // Get today's date in local timezone (Manila)
  const date = new Date();
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  // Mock periodicals data (replace with actual data fetch if available)
  const periodicals = [
    { id: 1, title: "Forbes 2024" },
    { id: 2, title: "Time Magazine" },
    { id: 3, title: "National Geographic" },
    { id: 4, title: "The Economist" },
    { id: 5, title: "Scientific American" }
  ];
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Get the next entry number if provided via props
      if (typeof props.getNextEntryNumber === 'function') {
        const nextNumber = props.getNextEntryNumber();
        setEntryNo(nextNumber);
      } else {
        setEntryNo("Pending...");
      }
      
      // Reset form fields
      setActivity("");
      setComputerPurpose("");
      setSelectedBook("");
      setSelectedPeriodical("");
      setBookSearchQuery("");
      setComment("");
      setRating(0);
      setError(null);
      setSuccess(null);
    }
  }, [open]);
  
  const handleActivityChange = (e) => {
    const newActivity = e.target.value;
    setActivity(newActivity);
    
    // Reset fields when activity changes
    if (newActivity === "Used Computer") {
      setSelectedBook("");
      setSelectedPeriodical("");
      setBookSearchQuery("");
    } else if (newActivity === "Read Book") {
      setComputerPurpose("");
      setSelectedPeriodical("");
    } else if (newActivity === "Read Periodical") {
      setComputerPurpose("");
      setSelectedBook("");
      setBookSearchQuery("");
    }
  };
  
  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };
  
  // Filter books based on search query (title, author, and accession number)
  const filteredBooks = bookSearchQuery 
    ? registeredBooks.filter(book => 
        book.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(bookSearchQuery.toLowerCase())) ||
        (book.accessionNumber && book.accessionNumber.toLowerCase().includes(bookSearchQuery.toLowerCase())))
    : registeredBooks;
  
  const handleBookSearchChange = (e) => {
    setBookSearchQuery(e.target.value);
    setSelectedBook(""); // Reset selected book when search changes
  };
  
  const handleFormSubmit = () => {
    setError(null);
    
    // Validate required fields
    if (!activity) {
      setError("Please select an activity");
      return;
    }
    
    if (activity === "Used Computer" && !computerPurpose) {
      setError("Please enter the purpose of using the computer");
      return;
    }
    
    if (activity === "Read Book" && !selectedBook) {
      setError("Please select a book");
      return;
    }
    
    if (activity === "Read Periodical" && !selectedPeriodical) {
      setError("Please select a periodical");
      return;
    }
    
    if (rating === 0) {
      setError("Please provide a rating");
      return;
    }
    
    // Prepare submission data
    let details = "";
    let bookId = null;
    
    if (activity === "Used Computer") {
      details = computerPurpose;
    } else if (activity === "Read Book") {
      const book = registeredBooks.find(book => book.id.toString() === selectedBook);
      details = book ? book.title : "";
      bookId = book ? book.id : null;
    } else if (activity === "Read Periodical") {
      const periodical = periodicals.find(p => p.id.toString() === selectedPeriodical);
      details = periodical ? periodical.title : "";
    }
    
    const journalEntry = {
      id: bookId,  // If a book was selected, include its ID
      // No entryNo field - will be auto-generated by the backend
      dateRead: today,
      activity,
      details,
      comment,
      rating
    };
    
    try {
      // Call parent submit handler
      handleSubmit(journalEntry);
      setSuccess("Journal entry added successfully!");
      
      // Reset form after submission (handled in parent component via handleClose)
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      console.error("Error submitting journal entry:", err);
      setError("Failed to submit journal entry");
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: "15px",
          overflow: "hidden",
          backgroundColor: "#FFDF16"
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "32px",
          color: "#8B3D3D",
          paddingTop: 3,
          paddingBottom: 2
        }}
      >
        Journal Entry
      </DialogTitle>
      
      <DialogContent sx={{ padding: "20px 40px" }}>
        <Grid container spacing={3}>
          {/* Journal Entry No. */}
          <Grid item xs={4}>
            <StyledLabel>Journal Entry No.:</StyledLabel>
          </Grid>
          <Grid item xs={8}>
            <StyledInput
              value={entryNo}
              disabled
              size="small"
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          
          {/* Date */}
          <Grid item xs={4}>
            <StyledLabel>Date:</StyledLabel>
          </Grid>
          <Grid item xs={8}>
            <StyledInput
              type="date"
              value={today}
              disabled
              size="small"
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          
          {/* Activity */}
          <Grid item xs={4}>
            <StyledLabel>Activity:</StyledLabel>
          </Grid>
          <Grid item xs={8}>
            <StyledSelect size="small">
              <Select
                value={activity}
                onChange={handleActivityChange}
                displayEmpty
                fullWidth
              >
                <MenuItem value="" disabled>
                  Select Activity
                </MenuItem>
                <MenuItem value="Used Computer">Used Computer</MenuItem>
                <MenuItem value="Read Book">Read Book</MenuItem>
                <MenuItem value="Read Periodical">Read Periodical</MenuItem>
              </Select>
            </StyledSelect>
          </Grid>
          
          {/* Rating */}
          <Grid item xs={4}>
            <StyledLabel>Rating:</StyledLabel>
          </Grid>
          <Grid item xs={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <Rating
                name="journal-rating"
                value={rating}
                onChange={handleRatingChange}
                precision={1}
                size="large"
              />
            </Box>
          </Grid>
          
          {/* Details Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: "#8B3D3D", mt: 1, mb: 1 }}>
              Details
            </Typography>
          </Grid>
          
          {/* Computer Purpose (conditional) */}
          {activity === "Used Computer" && (
            <>
              <Grid item xs={4}>
                <StyledLabel>Purpose of using computer:</StyledLabel>
              </Grid>
              <Grid item xs={8}>
                <StyledInput
                  value={computerPurpose}
                  onChange={(e) => setComputerPurpose(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            </>
          )}
          
          {/* Book Selection with Search (conditional) */}
          {activity === "Read Book" && (
            <>
              {/* Book Search Bar */}
              <Grid item xs={4}>
                <StyledLabel>Search for a book:</StyledLabel>
              </Grid>
              <Grid item xs={8}>
                <StyledInput
                  placeholder="Search by title, author, or accession number..."
                  value={bookSearchQuery}
                  onChange={handleBookSearchChange}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Book Dropdown */}
              <Grid item xs={4}>
                <StyledLabel>Select a book:</StyledLabel>
              </Grid>
              <Grid item xs={8}>
                <StyledSelect size="small">
                  <Select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    displayEmpty
                    fullWidth
                  >
                    <MenuItem value="" disabled>
                      {filteredBooks.length > 0 
                        ? "Select a Book" 
                        : "No books match your search"}
                    </MenuItem>
                    {filteredBooks.map((book) => (
                      <MenuItem key={book.id} value={book.id.toString()}>
                        {book.title}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledSelect>
                <Typography variant="caption" sx={{ display: 'block', ml: 1, mt: 0.5 }}>
                  {filteredBooks.length} book(s) found
                </Typography>
              </Grid>
            </>
          )}
          
          {/* Periodical Selection (conditional) */}
          {activity === "Read Periodical" && (
            <>
              <Grid item xs={4}>
                <StyledLabel>Select a periodical:</StyledLabel>
              </Grid>
              <Grid item xs={8}>
                <StyledSelect size="small">
                  <Select
                    value={selectedPeriodical}
                    onChange={(e) => setSelectedPeriodical(e.target.value)}
                    displayEmpty
                    fullWidth
                  >
                    <MenuItem value="" disabled>
                      Select a Periodical
                    </MenuItem>
                    {periodicals.map((periodical) => (
                      <MenuItem key={periodical.id} value={periodical.id.toString()}>
                        {periodical.title}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledSelect>
              </Grid>
            </>
          )}
          
          {/* Comments */}
          <Grid item xs={4}>
            <StyledLabel>Comments:</StyledLabel>
          </Grid>
          <Grid item xs={8}>
            <StyledInput
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
            />
          </Grid>
          
          {/* Error/Success Messages */}
          {error && (
            <Grid item xs={12}>
              <Typography sx={{ color: "red", textAlign: "center", mt: 1 }}>
                {error}
              </Typography>
            </Grid>
          )}
          
          {success && (
            <Grid item xs={12}>
              <Typography sx={{ color: "green", textAlign: "center", mt: 1 }}>
                {success}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: "center", padding: "20px" }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            borderRadius: "8px",
            width: "120px",
            backgroundColor: "#fff",
            color: "#000",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleFormSubmit}
          variant="contained"
          sx={{
            borderRadius: "8px",
            width: "120px",
            backgroundColor: "#8B3D3D",
            color: "#FFDF16",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#6B2D2D",
            },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEntry;