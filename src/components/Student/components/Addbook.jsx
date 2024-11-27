import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Addbook = ({ open, handleClose, handleSubmit, registeredBooks }) => {
  const [bookDetails, setBookDetails] = useState({
    author: '',
    title: '',
    accessionNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const onSubmit = () => {
    setLoading(true);
    setError(null);

    // Validate the entered book against the registered books
    const bookExists = registeredBooks.some(
      (book) =>
        book.author === bookDetails.author &&
        book.title === bookDetails.title &&
        book.accessionNumber === bookDetails.accessionNumber
    );

    if (!bookExists) {
      setError('The entered book details do not match any registered book.');
      toast.error('Book not found in the registered list.');
      setLoading(false);
      return;
    }

    try {
      handleSubmit(bookDetails); // Pass the validated book back to the parent component
      toast.success('Book added successfully! 🎉');
      handleClose();
    } catch (err) {
      console.error('Error adding book:', err);
      toast.error('Failed to submit book details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '15px',
            overflow: 'hidden',
            border: '2px solid #8B3D3D',
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#8B3D3D',
            color: '#000',
          }}
        >
          <h2>Add Book</h2>
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: '#8B3D3D',
            padding: '30px',
          }}
        >
          <Typography sx={{ textAlign: 'left', color: '#000', marginLeft: 4 }}>
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
              backgroundColor: '#fff',
              borderRadius: '10px',
              height: '50px',
              width: '330px',
              overflow: 'hidden',
            }}
          />
          <Typography sx={{ textAlign: 'left', color: '#000', marginLeft: 4 }}>
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
              backgroundColor: '#fff',
              borderRadius: '10px',
              height: '50px',
              width: '330px',
              overflow: 'hidden',
            }}
          />
          <Typography sx={{ textAlign: 'left', color: '#000', marginLeft: 4 }}>
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
              backgroundColor: '#fff',
              borderRadius: '10px',
              height: '50px',
              width: '330px',
              overflow: 'hidden',
            }}
          />
          {error && (
            <Typography sx={{ color: 'red', marginTop: 2 }}>{error}</Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            backgroundColor: '#8B3D3D',
            padding: 2,
          }}
        >
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: '10px',
              width: '120px',
              backgroundColor: '#BB5252',
              color: '#000',
              '&:hover': {
                backgroundColor: '#A44444',
              },
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            sx={{
              borderRadius: '10px',
              width: '120px',
              backgroundColor: '#FFD700',
              color: '#000',
              '&:hover': {
                backgroundColor: '#FFC107',
              },
            }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'SUBMIT'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Addbook;
