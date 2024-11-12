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
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box
          sx={{
            padding: 2,
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundcolor: "#fff",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box
            component={Paper}
            sx={{
              background: 'linear-gradient(to bottom, #D76565 0%, #743838 100%)',
              padding: 4,
              marginTop:0.5,
              borderRadius: 3,
              maxWidth: 800,
              width: '100%',
              height: "500px",
              textAlign: 'left',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0 }}>
              <Typography variant="h6" sx={{ color: '#000', }}>
                NAS Student In-Charge:
              </Typography>
              <Box sx={{ textAlign: 'left', }}>
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
                marginBottom: 10,
                borderRadius: '10px',
                height: "40px",
                width: "300px",
                overflow: 'hidden',
                '& .MuiInputBase-input': {
                  textAlign: 'left',
                  padding: '10px 20px', // Adjusts vertical padding to center text
                },
              }}
              InputProps={{
                sx: {
                  height: '100%', // Ensures the input area takes up the full height of the TextField
                  display: 'flex',
                  alignItems: 'center', // Vertically centers the placeholder text
                },
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 10}}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  width: '120px',
                  alignSelf: 'center',
                  borderRadius: '10px',
                }}
              >
                Time In
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  width: '120px',
                  alignSelf: 'center',
                  borderRadius: '10px',
                }}
              >
                Time Out
              </Button>
            </Box>
            <Typography variant="h6" sx={{ color: '#000',marginBottom: 1 }}>
              Recent Activity:
            </Typography>
            <Box sx={{ marginBottom: 1 }}>
              <Box
                component="div"
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: 1,
                  textAlign: 'left',
                  marginBottom: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>Time In:</Typography>
                <Typography>12:30 PM</Typography>
              </Box>
              <Box
                component="div"
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: 1,
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>Time Out:</Typography>
                <Typography>12:37 PM</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default NASDashboard;
