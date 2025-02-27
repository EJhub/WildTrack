import React, { useContext } from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { AuthContext } from '../../AuthContext';
import NotificationBadge from './NotificationBadge';

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:400px)');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateWithId = (path) => {
    const idNumber = user?.idNumber || localStorage.getItem('idNumber');
    if (idNumber) {
      navigate(`${path}?id=${idNumber}`);
    } else {
      console.error('No ID Number found for navigation');
      handleLogout();
    }
  };

  const getListItemStyles = (path) => ({
    paddingY: '1.5rem',
    color: '#fff',
    textAlign: 'center',
    fontWeight: location.pathname.startsWith(path) ? 'bold' : 'normal',
    position: 'relative',
    '&:hover': {
      color: '#FFD700',
    },
    fontSize: isExtraSmallScreen ? '0.8rem' : isSmallScreen ? '1rem' : '1.2rem',
  });

  return (
    <Box
      sx={{
        width: isSmallScreen ? '250px' : '250px',
        height: 'auto',
        background: "#781B1B",
        padding: '0px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <List component="nav" sx={{ flexGrow: 1, paddingTop: '50px' }}>
        <ListItem
          button
          onClick={() => navigateWithId('/studentDashboard/TimeRemaining')}
          sx={getListItemStyles('/studentDashboard/TimeRemaining')}
        >
          <ListItemText
            primary={isSmallScreen ? 'D' : 'Dashboard'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname.startsWith('/studentDashboard/TimeRemaining') ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={() => navigateWithId('/studentDashboard/booklog')}
          sx={getListItemStyles('/studentDashboard/booklog')}
        >
          <ListItemText
            primary={isSmallScreen ? 'B' : 'Book Log'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname.startsWith('/studentDashboard/booklog') ? 'bold' : 'normal',
            }}
          />
        </ListItem>
        
        {/* New menu item for Library Requirements */}
        <ListItem
          button
          onClick={() => navigateWithId('/student/requirements')}
          sx={getListItemStyles('/student/requirements')}
        >
          <ListItemText
            primary={isSmallScreen ? 'R' : 'Requirements'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname.startsWith('/student/requirements') ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={() => navigateWithId('/studentDashboard/personalInfo')}
          sx={getListItemStyles('/studentDashboard/personalInfo')}
        >
          <ListItemText
            primary={isSmallScreen ? 'P' : 'Personal Info'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname.startsWith('/studentDashboard/personalInfo') ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={() => navigateWithId('/studentDashboard/StudentAnalyticsAndReports')}
          sx={getListItemStyles('/studentDashboard/StudentAnalyticsAndReports')}
        >
          <ListItemText
            primary={isSmallScreen ? 'A' : 'Analytics and Reports'}
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname.startsWith('/studentDashboard/StudentAnalyticsAndReports') ? 'bold' : 'normal',
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
          onClick={handleLogout}
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

        <Button onClick={() => navigateWithId('/settings')} sx={{ minWidth: 0 }}>
          <SettingsIcon sx={{ color: '#FFD700' }} />
        </Button>

        <NotificationBadge />
      </Box>
    </Box>
  );
};

export default SideBar;