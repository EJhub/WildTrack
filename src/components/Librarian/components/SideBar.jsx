import React, { useState } from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Settings from './Settings'; // Import the Settings component
 
const SideBar = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [openSettings, setOpenSettings] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
 
  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
 
  const toggleManage = () => setManageOpen((prev) => !prev);
 
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
    <>
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
            to="/librarianDashboard/Home"
            sx={getListItemStyles('/librarianDashboard/Home')}
          >
            <ListItemText
              primary={isSmallScreen ? 'H' : 'Dashboard'}
              primaryTypographyProps={{
                align: 'center',
                fontWeight:
                  location.pathname === '/librarianDashboard/Home' ? 'bold' : 'normal',
              }}
            />
          </ListItem>
 
          <ListItem
            button
            component={Link}
            to="/librarianDashboard/LibrarianStudentLibraryHours"
            sx={getListItemStyles('/librarianDashboard/LibrarianStudentLibraryHours')}
          >
            <ListItemText
              primary={isSmallScreen ? 'CLH' : 'Student Library Hours'}
              primaryTypographyProps={{
                align: 'center',
                fontWeight:
                  location.pathname ===
                  '/librarianDashboard/LibrarianStudentLibraryHours'
                    ? 'bold'
                    : 'normal',
              }}
            />
          </ListItem>
 

          <ListItem
            button
            component={Link}
            to="/librarianDashboard/LibrarianAnalytics"
            sx={getListItemStyles('/librarianDashboard/LibrarianAnalytics')}
          >
            <ListItemText
              primary={isSmallScreen ? 'A' : 'Analytics and Reports'}
              primaryTypographyProps={{
                align: 'center',
                fontWeight:
                  location.pathname === '/librarianDashboard/LibrarianAnalytics'
                    ? 'bold'
                    : 'normal',
              }}
            />
          </ListItem>
          <br></br><br></br>
 
          {/* Manage Section */}
          <ListItem button onClick={toggleManage} sx={{paddingY: '1rem', marginLeft: '-60px'}}>
            <ListItemText
              primary={isSmallScreen ? 'M' : 'Manage'}
              primaryTypographyProps={{
                align: 'center',
                fontWeight: 'bold',
                color: '#FFD700',
                textTransform: 'uppercase',
              }}
            />
            {manageOpen ? <ExpandLessIcon sx={{ color: '#FFD700'}} /> : <ExpandMoreIcon sx={{ color: '#FFD700' }} />}
          </ListItem>
 
          {manageOpen && (
            <>
              <ListItem 
                button
                component={Link}
                to="/librarianDashboard/LibrarianManageStudent"
                sx={getListItemStyles('/librarianDashboard/LibrarianManageStudent')}
              >
                <ListItemText primary={isSmallScreen ? 'S' : 'Student'} />
              </ListItem>
 
              <ListItem
                button
                component={Link}
                to="/librarianDashboard/NASStudent"
                sx={getListItemStyles('/librarianDashboard/NASStudent')}
              >
                <ListItemText primary={isSmallScreen ? 'NAS' : 'NAS Student'} />
              </ListItem>
 
              <ListItem
                button
                component={Link}
                to="/librarianDashboard/LibrarianManageTeacher"
                sx={getListItemStyles('/librarianDashboard/LibrarianManageTeacher')}
              >
                <ListItemText primary={isSmallScreen ? 'T' : 'Teacher'} />
              </ListItem>
 
              <ListItem
                button
                component={Link}
                to="/librarianDashboard/LibrarianManageRecords"
                sx={getListItemStyles('/librarianDashboard/LibrarianManageRecords')}
              >
                <ListItemText primary={isSmallScreen ? 'R' : 'Records'} />
              </ListItem>
 
              <ListItem
                button
                component={Link}
                to="/librarianDashboard/LibrarianManageBooks"
                sx={getListItemStyles('/librarianDashboard/LibrarianManageBooks')}
              >
                <ListItemText primary={isSmallScreen ? 'B' : 'Books'} />
              </ListItem>
 
              <ListItem
                button
                component={Link}
                to="/librarianDashboard/Genre"
                sx={getListItemStyles('/librarianDashboard/Genre')}
              >
                <ListItemText primary={isSmallScreen ? 'G' : 'Genre'} />
              </ListItem>
            </>
          )}
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
 
          <Button onClick={handleOpenSettings} sx={{ minWidth: 0 }}>
            <SettingsIcon sx={{ color: '#FFD700' }} />
          </Button>
 
          <Button component={Link} to="/notifications" sx={{ minWidth: 0 }}>
            <NotificationsIcon sx={{ color: '#FFD700' }} />
          </Button>
        </Box>
      </Box>
 
      {/* Use the separate Settings component */}
      <Settings open={openSettings} onClose={handleCloseSettings} />
    </>
  );
};
 
export default SideBar;