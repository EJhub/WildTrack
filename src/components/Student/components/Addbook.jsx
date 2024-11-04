import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Typography, Box } from '@mui/material';

const Addbook = ({ open, handleClose, handleSubmit }) => {
  const [bookDetails, setBookDetails] = useState({
    author: '',
    title: '',
    accessionNumber: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const onSubmit = () => {
    handleSubmit(bookDetails); 
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Add Book</DialogTitle>
      <DialogContent>
        <Typography sx={{ textAlign: 'left', marginTop: 2 }}>Author:</Typography>
        <TextField
          margin="dense"
          name="author"
          type="text"
          fullWidth
          variant="outlined"
          value={bookDetails.author}
          onChange={handleInputChange}
          sx={{ marginBottom: 2 }}
        />
        <Typography sx={{ textAlign: 'left', marginTop: 2 }}>Title:</Typography>
        <TextField
          margin="dense"
          name="title"
          type="text"
          fullWidth
          variant="outlined"
          value={bookDetails.title}
          onChange={handleInputChange}
          sx={{ marginBottom: 2 }}
        />
        <Typography sx={{ textAlign: 'left', marginTop: 2 }}>Accession Number:</Typography>
        <TextField
          margin="dense"
          name="accessionNumber"
          type="text"
          fullWidth
          variant="outlined"
          value={bookDetails.accessionNumber}
          onChange={handleInputChange}
          sx={{ marginBottom: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', marginBottom: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingX: 2 }}>
          <Button
            onClick={handleClose}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: '20px', width: '120px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            color="primary"
            variant="contained"
            sx={{ borderRadius: '20px', width: '120px' }}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default Addbook;
