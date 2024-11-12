import React from 'react';
import { List, ListItem, ListItemText, Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const SideBars = () => {
  const location = useLocation();

  // Helper function to get styles for active and inactive list items
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
        borderLeft: '30px solid #CD6161', // Arrow color matching the sidebar
      },
    }),
  });

  return (
    <Box
      sx={{
        width: '250px',
        height: '100vh',
        background: 'linear-gradient(to bottom, #CD6161, #8B3D3D)', // Sidebar gradient background
        padding: '0px',
        boxSizing: 'border-box',
        borderRight: '2px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <List component="nav" sx={{ flexGrow: 1, paddingTop: '20px' }}>
        {/* Home Route */}
        <ListItem button component={Link} to="/nasDashboard/Home" sx={getListItemStyles('/nasDashboard/Home')}>
          <ListItemText
            primary="Home"
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/nasDashboard/Home' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        {/* Student Library Hours Route */}
        <ListItem button component={Link} to="/studentLibraryHours" sx={getListItemStyles('/studentLibraryHours')}>
          <ListItemText
            primary="Student Library Hours"
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/studentLibraryHours' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        {/* NAS Activity Log Route */}
        <ListItem button component={Link} to="/nasDashboard/NASActivityLog" sx={getListItemStyles('/nasDashboard/NASActivityLog')}>
          <ListItemText
            primary="NAS Activity Log"
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/nasDashboard/NASActivityLog' ? 'bold' : 'normal',
            }}
          />
        </ListItem>

        {/* Analytics Route */}
        <ListItem button component={Link} to="/nasDashboard/Analytics" sx={getListItemStyles('/nasDashboard/Analytics')}>
          <ListItemText
            primary="Analytics"
            primaryTypographyProps={{
              align: 'center',
              fontWeight: location.pathname === '/nasDashboard/Analytics' ? 'bold' : 'normal',
            }}
          />
        </ListItem>
      </List>

      {/* Footer section for icons */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1rem' }}>
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

export default SideBars;
