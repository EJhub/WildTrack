import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

const NavBar = () => {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'transparent',
        boxShadow: 'none', 
        padding: 0,
        margin: 0,
        height: '135px', // Adjust height as needed
      }}
    >
      <Toolbar disableGutters sx={{ padding: 0, minHeight: '180px' }}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', margin: 0 }}>
          <img 
            src="/Logo.png" // Replace with the correct path to your logo
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', margin: 0, border: 0, paddingTop: 25 }} 
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
