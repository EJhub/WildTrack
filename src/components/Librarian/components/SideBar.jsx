import React, { useState, useContext } from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery, Typography, Divider } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LogoutIcon from '@mui/icons-material/Logout';
import Settings from './Settings'; // Import the Settings component
import { AuthContext } from '../../AuthContext'; // Import AuthContext
import LibrarianNotificationBadge from './LibrarianNotificationBadge';
 
const LibrarianSideBar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Add useNavigate hook
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [openSettings, setOpenSettings] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const { user, logout } = useContext(AuthContext); // Get user and logout function
 
  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
 
  const toggleManage = () => setManageOpen((prev) => !prev);
  
  // Handle logout function
  const handleLogout = () => {
    logout(); // Call logout function from AuthContext
    navigate('/librarian/Login'); // Redirect to login page
  };
 
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
          minWidth: isSmallScreen ? '80px' : '250px', // Added minWidth to prevent squishing
          flexShrink: 0, // Prevent the sidebar from shrinking
          height: 'calc(100vh - 135px)', // Adjusted to account for navbar height
          background: 'linear-gradient(to bottom, #CD6161, #8B3D3D)',
          padding: '0px',
          boxSizing: 'border-box',
          borderRight: '2px solid #000',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative', // Make this a positioning context
          overflow: 'hidden', // Hide overflow
          marginTop: '0px', // Changed from 10px to 0px to avoid overlap
          zIndex: 1100, // Lower than navbar z-index
        }}
      >
        {/* Icons moved to the top of sidebar and centered */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            paddingTop: '1.5rem',
            zIndex: 2 // Ensure these stay on top
          }}
        >
          <Button onClick={handleOpenSettings} sx={{ minWidth: 0, mr: 2 }}>
            <SettingsIcon sx={{ color: '#FFD700' }} />
          </Button>
    
          <LibrarianNotificationBadge />
        </Box>

        {/* Scrollable Navigation Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto', // Vertical scroll only
            overflowX: 'hidden', // Hide horizontal scrollbar
            scrollbarWidth: 'none', // Hide scrollbar in Firefox
            msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
            '&::-webkit-scrollbar': {
              display: 'none', // Hide scrollbar completely in WebKit browsers
            },
            // Adding custom scrollbar for hover effect only
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '2px',
              height: '100%',
              opacity: 0,
              background: 'rgba(255,215,0,0.15)',
              borderRadius: '2px',
              transition: 'opacity 0.3s ease',
            },
            '&:hover::after': {
              opacity: 1,
            }
          }}
        >
          <List component="nav" sx={{ paddingTop: '10px' }}>
            <ListItem
              button
              component={Link}
              to="/librarian/Home"
              sx={getListItemStyles('/librarian/Home')}
            >
              <ListItemText
                primary={isSmallScreen ? 'H' : 'Dashboard'}
                primaryTypographyProps={{
                  align: 'center',
                  fontWeight:
                    location.pathname === '/librarian/Home' ? 'bold' : 'normal',
                }}
              />
            </ListItem>
  
            <ListItem
              button
              component={Link}
              to="/librarian/LibrarianCompletedHours"
              sx={getListItemStyles('/librarian/LibrarianCompletedHours')}
            >
              <ListItemText
                primary={isSmallScreen ? 'CLH' : 'Completed Library Hours'}
                primaryTypographyProps={{
                  align: 'center',
                  fontWeight:
                    location.pathname ===
                    '/librarian/LibrarianCompletedHours'
                      ? 'bold'
                      : 'normal',
                }}
              />
            </ListItem>
  
            <ListItem
              button
              component={Link}
              to="/librarian/LibrarianAnalytics"
              sx={getListItemStyles('/librarian/LibrarianAnalytics')}
            >
              <ListItemText
                primary={isSmallScreen ? 'A' : 'Analytics and Reports'}
                primaryTypographyProps={{
                  align: 'center',
                  fontWeight:
                    location.pathname === '/librarian/LibrarianAnalytics'
                      ? 'bold'
                      : 'normal',
                }}
              />
            </ListItem>
            <br></br><br></br>
  
            {/* Manage Section */}
            <ListItem button onClick={toggleManage} sx={{paddingY: '1rem', marginLeft: isSmallScreen ? 0 : '-60px'}}>
              <ListItemText
                primary={isSmallScreen ? 'M' : 'Manage'}
                primaryTypographyProps={{
                  align: 'center',
                  fontWeight: 'bold',
                  color: '#FFD700',
                  textTransform: 'uppercase',
                }}
              />
              {!isSmallScreen && (manageOpen ? <ExpandLessIcon sx={{ color: '#FFD700'}} /> : <ExpandMoreIcon sx={{ color: '#FFD700' }} />)}
            </ListItem>
  
            {manageOpen && (
              <>
                <ListItem 
                  button
                  component={Link}
                  to="/librarian/LibrarianManageStudent"
                  sx={getListItemStyles('/librarian/LibrarianManageStudent')}
                >
                  <ListItemText 
                    primary={isSmallScreen ? 'S' : 'Student'} 
                    primaryTypographyProps={{align: 'center'}}
                  />
                </ListItem>
  
                <ListItem
                  button
                  component={Link}
                  to="/librarian/LibrarianManageTeacher"
                  sx={getListItemStyles('/librarian/LibrarianManageTeacher')}
                >
                  <ListItemText 
                    primary={isSmallScreen ? 'T' : 'Teacher'} 
                    primaryTypographyProps={{align: 'center'}}
                  />
                </ListItem>
  
                <ListItem
                  button
                  component={Link}
                  to="/librarian/LibrarianManageRecords"
                  sx={getListItemStyles('/librarian/LibrarianManageRecords')}
                >
                  <ListItemText 
                    primary={isSmallScreen ? 'R' : 'Records'} 
                    primaryTypographyProps={{align: 'center'}}
                  />
                </ListItem>
  
                <ListItem
                  button
                  component={Link}
                  to="/librarian/LibrarianManageBooks"
                  sx={getListItemStyles('/librarian/LibrarianManageBooks')}
                >
                  <ListItemText 
                    primary={isSmallScreen ? 'B' : 'Books'} 
                    primaryTypographyProps={{align: 'center'}}
                  />
                </ListItem>
  
                <ListItem
                  button
                  component={Link}
                  to="/librarian/Genre"
                  sx={getListItemStyles('/librarian/Genre')}
                >
                  <ListItemText 
                    primary={isSmallScreen ? 'G' : 'Genre'} 
                    primaryTypographyProps={{align: 'center'}}
                  />
                </ListItem>
              </>
            )}
          </List>
        </Box>
  
        {/* Fixed Footer Section */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            pt: 2,
            mt: 'auto', // Push to bottom
            background: 'linear-gradient(to bottom, #8B3D3D, #8B3D3D)', // Match the background gradient
            position: 'sticky',
            bottom: 0,
            width: '100%',
            zIndex: 1,
          }}
        >
          {/* Welcome message above logout button */}
          {user && (
            <Box sx={{ px: 2, pb: 2, textAlign: 'center' }}>
              <Typography 
                sx={{ 
                  color: '#FFD700', 
                  fontWeight: 'bold',
                  fontSize: isSmallScreen ? '0.7rem' : '0.95rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: isSmallScreen ? 'nowrap' : 'normal'
                }}
              >
                {isSmallScreen ? `Librarian ${user?.lastName || ''}` : `Welcome, Librarian ${user?.lastName || ''}!`}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              flexDirection: 'row',
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
                width: '80%',
                minWidth: isSmallScreen ? '50px' : 'auto',
                '&:hover': {
                  backgroundColor: '#FFC107',
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {isSmallScreen ? (
                <LogoutIcon fontSize="small" />
              ) : (
                <>
                  <LogoutIcon fontSize="small" />
                  <span>Log Out</span>
                </>
              )}
            </Button>
          </Box>
        </Box>
      </Box>
 
      {/* Use the separate Settings component */}
      <Settings open={openSettings} onClose={handleCloseSettings} />
    </>
  );
};
 
export default LibrarianSideBar;