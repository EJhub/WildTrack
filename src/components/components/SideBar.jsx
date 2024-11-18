import React from 'react';
import { List, ListItem, ListItemText, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Dashboard = () => {
  const location = useLocation();

  const getListItemStyles = (path) => ({
    paddingY: '1.5rem',
    color: '#000000', // Set the text color to black
    textAlign: 'center',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    position: 'relative',
    backgroundColor: location.pathname === path ? '#CD6161' : 'transparent', // Highlight active item with color
    '&:hover': {
      color: '#FFD700', // Change color on hover to gold
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
        borderLeft: '30px solid #CD6161', // Left indicator for active link
      },
    }),
  });

  return (
    <Box
      sx={{
        width: '250px',
        height: '100vh',
        background: 'linear-gradient(to bottom, #CD6161, #8B3D3D)', // Sidebar gradient background
        padding: 0,
        boxSizing: 'border-box',
        borderRight: '2px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <List component="nav" sx={{ flexGrow: 1, paddingTop: '20px' }}>
        <ListItem button component={Link} to="/home" sx={getListItemStyles('/home')}>
          <ListItemText
            primary="Home"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/home' ? 'bold' : 'normal' }}
          />
        </ListItem>

        <ListItem button component={Link} to="/library-attendance" sx={getListItemStyles('/library-attendance')}>
          <ListItemText
            primary="Library Attendance"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/library-attendance' ? 'bold' : 'normal' }}
          />
        </ListItem>

        <ListItem button component={Link} to="/studentLibraryHours" sx={getListItemStyles('/student-library-hours')}>
          <ListItemText
            primary="Student Library Hours"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/student-library-hours' ? 'bold' : 'normal' }}
          />
        </ListItem>

        <ListItem button component={Link} to="/nasDashboard/ActivityLog" sx={getListItemStyles('/nasDashboard/ActivityLog')}>
          <ListItemText
            primary="NAS Activity Log"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/nas-activity-log' ? 'bold' : 'normal' }}
          />
        </ListItem>

        <ListItem button component={Link} to="/analytics" sx={getListItemStyles('/analytics')}>
          <ListItemText
            primary="Analytics"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/analytics' ? 'bold' : 'normal' }}
          />
        </ListItem>
      </List>

      {/* Icons at the bottom */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', paddingY: '10px' }}>
        <IconButton component={Link} to="/settings" sx={{ color: '#000' }}>
          <SettingsIcon fontSize="large" />
        </IconButton>
        <IconButton component={Link} to="/notifications" sx={{ color: '#000' }}>
          <NotificationsIcon fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Dashboard;
