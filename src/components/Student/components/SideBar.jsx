import React, { useContext, useState } from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { AuthContext } from '../../AuthContext';
import NotificationBadge from './NotificationBadge';
import ReportForm from './ReportForm';

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:400px)');
  
  // State to control the Report form dialog
  const [reportFormOpen, setReportFormOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Updated navigation function without query parameters
  const navigateTo = (path) => {
    if (user) {
      navigate(path);
    } else {
      console.error('User not authenticated for navigation');
      handleLogout();
    }
  };
  
  const handleReportClick = () => {
    setReportFormOpen(true);
  };
  
  const handleCloseReportForm = () => {
    setReportFormOpen(false);
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
    <>
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
        {/* Icons moved to the top of sidebar and centered */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            paddingTop: '1.5rem',
          }}
        >
          <Button 
            onClick={handleReportClick} 
            sx={{ 
              minWidth: 0,
              '&:hover': {
                bgcolor: 'rgba(255, 215, 0, 0.1)'
              },
              borderRadius: '50%',
              p: 1,
              mr: 2
            }}
          >
            <AssessmentIcon sx={{ color: '#FFD700' }} />
          </Button>

          <NotificationBadge />
        </Box>

        <List component="nav" sx={{ flexGrow: 1, paddingTop: '10px' }}>
          <ListItem
            button
            onClick={() => navigateTo('/studentDashboard/TimeRemaining')}
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
            onClick={() => navigateTo('/studentDashboard/booklog')}
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
            onClick={() => navigateTo('/student/requirements')}
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
            onClick={() => navigateTo('/studentDashboard/personalInfo')}
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
            onClick={() => navigateTo('/studentDashboard/StudentAnalyticsAndReports')}
            sx={getListItemStyles('/studentDashboard/StudentAnalyticsAndReports')}
          >
            <ListItemText
              primary={isSmallScreen ? 'A' : 'Analytics'}
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
            justifyContent: 'center',
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
              width: '80%', // Made the logout button wider
              '&:hover': {
                backgroundColor: '#FFC107',
              },
            }}
          >
            Log Out
          </Button>
        </Box>
      </Box>
      
      {/* Report Form Dialog */}
      <ReportForm open={reportFormOpen} onClose={handleCloseReportForm} />
    </>
  );
};

export default SideBar;