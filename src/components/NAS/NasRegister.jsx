import React from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const NasRegister = () => {
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
            {/* Student Registration Section */}
            <Paper
              sx={{
                background: 'linear-gradient(to bottom, #D76565 0%, #743838 100%)',
                padding: 3,
                borderRadius: '15px',
                width: 350,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2 }}>Student Registration</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Student Name:</Typography>
                <TextField fullWidth variant="outlined" sx={{ backgroundColor: '#fff', borderRadius: '10px' }} />

                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Student ID:</Typography>
                <TextField fullWidth variant="outlined" sx={{ backgroundColor: '#fff', borderRadius: '10px' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ width: '48%' }}>
                    <Typography variant="body1" sx={{ textAlign: 'left', color: '#000', marginBottom: 2 }}>Grade:</Typography>
                    <TextField fullWidth variant="outlined" sx={{ backgroundColor: '#fff', borderRadius: '10px' }} />
                  </Box>
                  <Box sx={{ width: '48%' }}>
                    <Typography variant="body1" sx={{ textAlign: 'left', color: '#000', marginBottom: 2 }}>Section:</Typography>
                    <TextField fullWidth variant="outlined" sx={{ backgroundColor: '#fff', borderRadius: '10px' }} />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000',
                    borderRadius: '10px',
                    width: '180px',
                    alignSelf: 'center',
                  }}
                >
                  Register Student
                </Button>
              </Box>
            </Paper>

            {/* Book Registration Section */}
            <Paper
              sx={{
                background: 'linear-gradient(to bottom, #D76565 0%, #743838 100%)',
                padding: 3,
                borderRadius: '15px',
                width: 350,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2 }}>Book Registration</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Book Title:</Typography>
                <TextField fullWidth variant="outlined" sx={{ backgroundColor: '#fff', borderRadius: '10px' }} />

                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Accession Number:</Typography>
                <TextField fullWidth variant="outlined" sx={{ backgroundColor: '#fff', borderRadius: '10px' }} />

                <Typography variant="body1" sx={{ textAlign: 'left', color: '#000' }}>Author:</Typography>
                <TextField fullWidth variant="outlined" sx={{ backgroundColor: '#fff', borderRadius: '10px' }} />

                <Button
                  variant="contained"
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
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default NasRegister;
