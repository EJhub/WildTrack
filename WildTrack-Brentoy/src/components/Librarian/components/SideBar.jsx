import React from 'react';
import { List, ListItem, ListItemText, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const SideBar = () => {
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
        <ListItem button component={Link} to="/nasDashboard/Home" sx={getListItemStyles('/nasDashboard/Home')}>
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/nasDashboard/Home' ? 'bold' : 'normal' }}
          />
        </ListItem>

        <ListItem button component={Link} to="/student-attendee" sx={getListItemStyles('/student-attendee')}>
          <ListItemText
            primary="Student Attendee"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/student-attendee' ? 'bold' : 'normal' }}
          />
        </ListItem>

        <ListItem button component={Link} to="/studentLibraryHours" sx={getListItemStyles('/studentLibraryHours')}>
          <ListItemText
            primary="Student Library Hours"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/studentLibraryHours' ? 'bold' : 'normal' }}
          />
        </ListItem>

        <ListItem button component={Link} to="/librarianTeacherReports" sx={getListItemStyles('/librarianTeacherReport')}>
          <ListItemText
            primary="Teacher Reports"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/librarianTeacherReport' ? 'bold' : 'normal' }}
          />
        </ListItem>

        {/* Students List item with custom background color for highlight */}
        <ListItem button component={Link} to="/librarianStudentsList" sx={getListItemStyles('/librarianStudentsList')}>
          <ListItemText
            primary="Students List"
            primaryTypographyProps={{ align: 'center', fontWeight: location.pathname === '/librarianStudentsList' ? 'bold' : 'normal' }}
          />
        </ListItem>
      </List>

      {/* Removed Log Out Button */}
    </Box>
  );
};

export default SideBar;
