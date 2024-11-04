import React from 'react';
import { List, ListItem, ListItemText, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const SideBar = () => {
  return (
    <Box
      sx={{
        width: '250px',
        height: '100vh',
        backgroundColor: '#f4f4f4',
        padding: '0px',
        boxSizing: 'border-box',
        borderRight: '2px solid #000',
        borderBottom: '2px solid #000', 
        borderTop: '2px solid #000',
      }}
    >
      <List component="nav">
        <ListItem button component={Link} to="/studentDashboard/TimeRemaining" sx={{
            padding: '3rem',
            width: "100%",
            boxSizing: 'border-box',
            borderBottom: '2px solid #000', 
            textAlign: 'center',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
        }}> 
          <ListItemText primary="Time Remaining" />
        </ListItem>
        <ListItem button component={Link} to="/studentDashboard/booklog" sx={{
            padding: '3rem',
            width: "100%",
            boxSizing: 'border-box',
            borderBottom: '2px solid #000', 
            textAlign: 'center',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
        }} >
          <ListItemText primary="Book Log" />
        </ListItem>
      </List>
    </Box>
  );
};

export default SideBar;
