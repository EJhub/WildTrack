import React from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const SideBar = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:600px)'); // Adjust for screens smaller than 600px

  const getListItemStyles = (path) => ({
    paddingY: '1.5rem',
    color: '#000',
    textAlign: 'center',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    position: 'relative',
    '&:hover': {
      color: '#FFD700',
    },
    ...(location.pathname === path && {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '100%',
        transform: 'translateY(-50%)',
        width: '0',
        height: '0',
        borderTop: '20px solid transparent',
        borderBottom: '20px solid transparent',
        borderLeft: '30px solid #CD6161',
      },
    }),
  });

  return (
    <Box
      sx={{
        width: isSmallScreen ? '80px' : '250px',
        height: 'auto',
        background: 'linear-gradient(to bottom, #CD6161, #8B3D3D)',
        padding: '0px',
        boxSizing: 'border-box',
        borderRight: '2px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <List component="nav" sx={{ flexGrow: 1, paddingTop: '20px' }}>
        <ListItem button component={Link} to="/studentDashboard/TimeRemaining" sx={getListItemStyles('/studentDashboard/TimeRemaining')}>
          <ListItemText
            primary={isSmallScreen ? 'H' : 'Home'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/studentDashboard/TimeRemaining' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem button component={Link} to="/studentDashboard/booklog" sx={getListItemStyles('/studentDashboard/booklog')}>
          <ListItemText
            primary={isSmallScreen ? 'B' : 'Book Log'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/studentDashboard/booklog' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem button component={Link} to="/studentDashboard/personalInfo" sx={getListItemStyles('/studentDashboard/personalInfo')}>
          <ListItemText
            primary={isSmallScreen ? 'P' : 'Personal Info'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/studentDashboard/personalInfo' ? 'bold' : 'normal',
            }}
          />
        </ListItem>
      </List>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '1rem',
        }}
      >
        <Button
          component={Link}
          to="/logout"
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
            border: 'solid 2px',
            borderRadius: '12px',
            padding: '4px 12px',
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: '#FFC107',
            },
          }}
        >
          Log Out
        </Button>

        <Button component={Link} to="/settings" sx={{ minWidth: 0 }}>
          <SettingsIcon sx={{ color: '#FFD700' }} />
        </Button>

        <Button component={Link} to="/notifications" sx={{ minWidth: 0 }}>
          <NotificationsIcon sx={{ color: '#FFD700' }} />
        </Button>
      </Box>
    </Box>
  );
};

export default SideBar;
