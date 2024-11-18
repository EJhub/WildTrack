import React from 'react';
import NavBar from './components/NavBar';  // Importing NavBar component
import Dashboard from './components/Dashboard';  // Importing Dashboard component
import { Box, Typography, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const LibrarianNASActivityLog = () => {
  return (
    <>
      <NavBar /> {/* Adding the NavBar component */}
      <Box sx={{ display: 'flex' }}>
        <Dashboard /> {/* Adding the Dashboard (sidebar) component */}
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#ffffff' }}>
          {/* NAS Activity Log Text */}
          <Typography
            variant="h3" // Increased font size for NAS Activity Log
            sx={{
              color: '#000',
              fontWeight: 'bold',
              marginBottom: 6, // Increased margin for spacing
              textAlign: 'left',
              marginLeft: 15, // Added margin from left
            }}
          >
            NAS Activity Log
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {/* Students Supervised Button */}
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#CD6161', // Maroon background
                color: '#000', // Black text color
                width: '90%', // Larger width for maximized buttons
                height: '150px', // Increased button height
                fontSize: '3rem', // Maximized font size for button text
                display: 'flex',
                justifyContent: 'flex-start', // Align text to the left
                alignItems: 'center',
                gap: '30px', // Increased gap between text and icon
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#8B3D3D', // Darker maroon on hover
                },
                textTransform: 'none', // Disable uppercase for button text
              }}
            >
              <PersonIcon sx={{ fontSize: '4rem', color: '#FFD700' }} /> {/* Maximized icon size */}
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#000' }}>Students Supervised</Typography>
            </Button>

            {/* Books Logged Button */}
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#CD6161',
                color: '#000',
                width: '90%', // Same width as the first button
                height: '150px', // Increased button height
                fontSize: '3rem', // Maximized font size for button text
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '30px', // Increased gap between text and icon
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                },
                textTransform: 'none',
              }}
            >
              <MenuBookIcon sx={{ fontSize: '4rem', color: '#FFD700' }} /> {/* Maximized icon size */}
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#000' }}>Books Logged</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LibrarianNASActivityLog;
