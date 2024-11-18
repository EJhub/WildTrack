import React from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

const NASDashboard = () => {
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
                  Status: Clocked Out
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Last Time Out: 12:37 PM
                </Typography>
              </Box>
            </Box>

            <TextField
              placeholder="Input name here..."
              variant="outlined"
              fullWidth
              sx={{
                backgroundColor: '#fff',
                marginBottom: 3,
                height: "40px",
                width: "300px",
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
                <Typography>12:30 PM</Typography>
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
                <Typography>12:37 PM</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default NASDashboard;
