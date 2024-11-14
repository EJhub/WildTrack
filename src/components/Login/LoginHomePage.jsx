import React from 'react';
import {
  Box,
  Typography,
  Grid
} from '@mui/material';
import LoginNavBar from './component/AppBar';

function LogInHomepage() {
  return (
    <>
      <LoginNavBar />

      <Box
        sx={{
          position: 'relative',
          backgroundImage: `url('CITU-GLE Building.png')`,
          backgroundSize: '100% 100%', // Stretches to fit both X and Y
          backgroundPosition: 'center',
          width: '100vw', // Full viewport width
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          filter: 'brightness(0.8) contrast(1.5) saturate(1.1)',
          '::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
            zIndex: 1
          }
        }}
      >

        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2, padding: 2, marginTop: 50, }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: '80px', fontWeight: 'bold' }}>
            CIT-U Elementary Library Time Tracker
            </Typography>

            <Typography variant="body1" paragraph sx={{ fontSize: '35px', marginTop: -5}}>
            Simplifying library access and time tracking for students and educators.
            </Typography>

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Box sx={{ backgroundColor: '#f44336', padding: 1, borderRadius: '8px' }}>
                <Typography variant="button" color="white">Librarian</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ backgroundColor: '#2196f3', padding: 1, borderRadius: '8px' }}>
                <Typography variant="button" color="white">Students</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ backgroundColor: '#4caf50', padding: 1, borderRadius: '8px' }}>
                <Typography variant="button" color="white">Teacher</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default LogInHomepage;
