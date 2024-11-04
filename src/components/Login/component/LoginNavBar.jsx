import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

const LoginNavBar = () => {
  return (
    <AppBar 
      position="static" 
      color="inherit" 
      sx={{ 
        boxSizing: "border-box", 
        borderBottom: '2px solid #000', 
        padding: 0,
        margin: 0,
      }}
    >
      <Toolbar sx={{ minHeight: 'auto', padding: 0, margin: 0 }}>
        {/* Full-width Logo Image */}
        <Box
          component="img"
          src="/Logo.png" // Path to the logo in the public folder
          alt="CIT Logo"
          sx={{ 
            width: '100%',   // Make the image fill the navbar width
            height: 'auto',  // Ensure it takes the full height of the navbar
            objectFit: 'cover', // Crop the image if necessary to fit the area exactly
          }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default LoginNavBar;
