import React, { useState } from 'react';
import axios from 'axios';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const NasBookRegistration = () => {
  const [bookData, setBookData] = useState({
    title: '',
    accessionNumber: '',
    author: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setBookData({
      ...bookData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/books/add', bookData);
      setMessage('Book registered successfully!');
      setError('');
      setBookData({ title: '', accessionNumber: '', author: '' }); // Reset form
    } catch (err) {
      setError(err.response?.data || 'An error occurred');
      setMessage('');
    }
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <SideBar />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 4, overflowY: 'auto', backgroundColor: '#fff' }}>
          <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left', marginLeft: 25 }}>
            Registration
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Paper
              sx={{
                background: 'linear-gradient(to bottom, #D76565 0%, #743838 100%)',
                padding: 3,
                borderRadius: '15px',
                width: 350,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2 }}>
                Book Registration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Book Title:</Typography>
                <TextField
                  name="title"
                  value={bookData.title}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: '#fff', borderRadius: '10px' }}
                />

                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Accession Number:</Typography>
                <TextField
                  name="accessionNumber"
                  value={bookData.accessionNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: '#fff', borderRadius: '10px' }}
                />

                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Author:</Typography>
                <TextField
                  name="author"
                  value={bookData.author}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: '#fff', borderRadius: '10px' }}
                />

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000',
                    borderRadius: '10px',
                    width: '180px',
                    alignSelf: 'center',
                  }}
                >
                  Register Book
                </Button>
              </Box>
              {message && <Typography sx={{ color: 'green', marginTop: 2 }}>{message}</Typography>}
              {error && <Typography sx={{ color: 'red', marginTop: 2 }}>{error}</Typography>}
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default NasBookRegistration;
