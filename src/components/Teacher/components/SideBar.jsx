import React from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const SideBar = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:600px)'); // Adjust for smaller screens

  const getListItemStyles = (path) => ({
    paddingY: isSmallScreen ? '0.5rem' : '1.5rem',
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
        <ListItem
          button
          component={Link}
          to="/TeacherDashboard/Home"
          sx={getListItemStyles('/TeacherDashboard/Home')}
        >
          <ListItemText
            primary={isSmallScreen ? 'H' : 'Home'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/TeacherDashboard/Home' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/TeacherDashboard/StudentRecords"
          sx={getListItemStyles('/TeacherDashboard/StudentRecords')}
        >
          <ListItemText
            primary={isSmallScreen ? 'SR' : 'Student Records'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/TeacherDashboard/StudentRecords' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/TeacherDashboard/CompletedLibraryHours"
          sx={getListItemStyles('/TeacherDashboard/CompletedLibraryHours')}
        >
          <ListItemText
            primary={isSmallScreen ? 'CLH' : 'Completed Library Hours'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/TeacherDashboard/CompletedLibraryHours' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/TeacherDashboard/Analytics"
          sx={getListItemStyles('/TeacherDashboard/Analytics')}
        >
          <ListItemText
            primary={isSmallScreen ? 'A' : 'Analytics'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/TeacherDashboard/Analytics' ? 'bold' : 'normal',
            }}
          />
        </ListItem>
      </List>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSmallScreen ? 'center' : 'space-around',
          padding: '1rem',
          flexDirection: isSmallScreen ? 'column' : 'row',
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
            minWidth: isSmallScreen ? '50px' : 'auto',
            '&:hover': {
              backgroundColor: '#FFC107',
            },
          }}
        >
          {isSmallScreen ? 'LO' : 'Log Out'}
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
