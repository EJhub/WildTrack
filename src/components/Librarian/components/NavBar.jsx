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
        height: '135px',
        zIndex: 1200, // Added higher z-index to ensure it stays on top
      }}
    >
      <Toolbar disableGutters sx={{ padding: 0, minHeight: '135px' }}>
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          margin: 0 
        }}>
          <img 
            src="/Logo.png"
            alt="Logo"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              margin: 0, 
              border: 0, 
              paddingTop: 25 
            }} 
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;