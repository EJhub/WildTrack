import React, { useContext } from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AuthContext } from '../../AuthContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const TeacherSideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  
  // Get the teacher's last name from the user context
  const teacherLastName = user?.lastName || 'Teacher';
  
  // For debugging - remove in production
  console.log("User context data:", user);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items with paths
  const navigationItems = [
    { path: '/TeacherDashboard/Home', label: isSmallScreen ? 'H' : 'Dashboard' },
    { path: '/TeacherDashboard/StudentRecords', label: isSmallScreen ? 'SR' : 'Student Records' },
    { path: '/TeacherDashboard/CompletedLibraryHours', label: isSmallScreen ? 'CLH' : 'Completed Library Hours' },
    { path: '/TeacherDashboard/Analytics', label: isSmallScreen ? 'A' : 'Analytics and Reports' },
  ];
  
  const getListItemStyles = (path) => ({
    paddingY: isSmallScreen ? '0.5rem' : '1.5rem',
    color: 'white',
    textAlign: 'center',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    position: 'relative',
    '&:hover': {
      color: '#FFD700',
    },
  });
 
  return (
    <Box
      sx={{
        width: isSmallScreen ? '80px' : '250px',
        height: 'auto',
        background: '#781B1B',
        padding: '0px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <List component="nav" sx={{ flexGrow: 1, paddingTop: '20px' }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            button
            component={Link}
            to={item.path}
            sx={getListItemStyles(item.path)}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                align: 'center',
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
              }}
            />
          </ListItem>
        ))}
      </List>
      
      {/* Welcome message */}
      <Typography 
        variant="subtitle1" 
        align="center" 
        sx={{ 
          color: '#FFD700', 
          padding: '0.5rem',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
        }}
      >
        Welcome, Teacher {teacherLastName}!
      </Typography>
 
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0.5rem 1rem 1rem',
          flexDirection: isSmallScreen ? 'column' : 'row',
          gap: 1
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
            minWidth: isSmallScreen ? '50px' : 'auto',
            '&:hover': {
              backgroundColor: '#FFC107',
            },
          }}
        >
          {isSmallScreen ? 'LO' : 'Log Out'}
        </Button>
 
        <Button component={Link} to="/notifications" sx={{ minWidth: 0 }}>
          <NotificationsIcon sx={{ color: '#FFD700' }} />
        </Button>
      </Box>
    </Box>
  );
};
 
export default TeacherSideBar;