import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import axios from 'axios';

const NASDashboard = () => {
  const [idNumber, setIdNumber] = useState('');
  const [name, setName] = useState(''); // State for the NAS student's name
  const [logData, setLogData] = useState(null);
  const [status, setStatus] = useState('Clocked Out');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the latest log when the ID number changes
  useEffect(() => {
    if (idNumber) {
      fetchLatestLog();
    }
  }, [idNumber]);

  // Handle input changes for the ID number field
  const handleInputChange = (e) => {
    setIdNumber(e.target.value);
  };

  // Fetch the latest log from the backend
  const fetchLatestLog = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:8080/api/nas-logs/latest/${idNumber}`);
      setLogData(response.data);
      setName(response.data.name); // Update the name state
      setStatus(response.data.status);
    } catch (err) {
      setLogData(null);
      setName(''); // Clear name on error
      setStatus('Clocked Out');
      setError('No records found for this ID.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Time In
  const handleTimeIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:8080/api/nas-logs/time-in', { idNumber });
      setLogData(response.data);
      setName(response.data.name); // Update the name state
      setStatus('Clocked In');
    } catch (err) {
      setError('Failed to clock in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Time Out
  const handleTimeOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:8080/api/nas-logs/time-out', { idNumber });
      setLogData(response.data);
      setStatus('Clocked Out');
    } catch (err) {
      setError('Failed to clock out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 3,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Paper
            sx={{
              background: 'linear-gradient(to bottom, #D76565 0%, #743838 100%)',
              padding: 4,
              borderRadius: 3,
              maxWidth: 800,
              width: '100%',
              textAlign: 'left',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <Typography variant="h6" sx={{ color: '#000' }}>
                NAS Student In-Charge:
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Status: {status}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Last Time Out: {logData?.timeOut ? new Date(logData.timeOut).toLocaleTimeString() : 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ color: '#000', marginBottom: 3 }}>
              Name: {name || 'N/A'}
            </Typography>

            <TextField
              placeholder="Input ID number here..."
              variant="outlined"
              fullWidth
              value={idNumber}
              onChange={handleInputChange}
              sx={{
                backgroundColor: '#fff',
                marginBottom: 3,
                height: '40px',
                width: '300px',
                overflow: 'hidden',
                borderRadius: '10px',
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  padding: '0 16px',
                },
                '& .MuiInputBase-input': {
                  textAlign: 'left',
                },
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginBottom: 4 }}>
              <Button
                variant="contained"
                onClick={handleTimeIn}
                disabled={status === 'Clocked In' || loading}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  width: '150px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#FFC107',
                  },
                }}
              >
                Time In
              </Button>
              <Button
                variant="contained"
                onClick={handleTimeOut}
                disabled={status === 'Clocked Out' || loading}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  width: '150px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#FFC107',
                  },
                }}
              >
                Time Out
              </Button>
            </Box>

            {error && (
              <Typography variant="body2" sx={{ color: 'red', marginBottom: 2 }}>
                {error}
              </Typography>
            )}

            <Typography variant="h6" sx={{ color: '#000', marginBottom: 2 }}>
              Recent Activity:
            </Typography>
            <Box>
              <Box
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  padding: 2,
                  marginBottom: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>Time In:</Typography>
                <Typography>
                  {logData?.timeIn ? new Date(logData.timeIn).toLocaleTimeString() : 'N/A'}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  padding: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>Time Out:</Typography>
                <Typography>
                  {logData?.timeOut ? new Date(logData.timeOut).toLocaleTimeString() : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default NASDashboard;
