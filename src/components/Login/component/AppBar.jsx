import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

const LoginNavBar = () => {
  return (

      <AppBar 
        position="static" 
        color="inherit" 
        elevation={0}   
        sx={{ 
          boxSizing: "border-box", 
          padding: 0,
          margin: 0,  
          height: '100px', 
          backgroundImage: 'url(/Logo.png)', 
          backgroundSize: '100% 100%',       
          backgroundPosition: 'center',     
          backgroundRepeat: 'no-repeat',    
        }}
      >
        <Toolbar sx={{ minHeight: 'auto', padding: 0, margin: 0, flexGrow: 1 }}>
        </Toolbar>
      </AppBar>


    
  );
};

export default LoginNavBar;
