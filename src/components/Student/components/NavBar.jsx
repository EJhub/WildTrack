import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const NavBar = () => {
  return (
    <AppBar position="static" color="#FFFFFF" sx={{ boxSizing:"border-box", borderBottom: '2px solid #000',  padding: '10px', }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1}}>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Logo
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            Name of the Student
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            sx={{
              width: '70px',  
              height: '70px',
              borderRadius: '50%', 
              padding: 0, 
              minWidth: '40px', 
            }}
          >
            Profile
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
