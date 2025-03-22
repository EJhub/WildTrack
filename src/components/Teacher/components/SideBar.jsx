import React, { useContext, useState } from 'react';
import { List, ListItem, ListItemText, Box, Button, useMediaQuery, Typography, IconButton } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { AuthContext } from '../../AuthContext';
import TeacherNotificationBadge from './TeacherNotificationBadge';
import ReportForm from './TeacherReportForm';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const TeacherSideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  
  // State to control the Report form dialog
  const [reportFormOpen, setReportFormOpen] = useState(false);
  
  // Get the teacher's last name from the user context
  const teacherLastName = user?.lastName || 'Teacher';
  
  // For debugging - remove in production
  console.log("User context data:", user);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleReportClick = () => {
    setReportFormOpen(true);
  };
  
  const handleCloseReportForm = () => {
    setReportFormOpen(false);
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
    <>
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
          <IconButton 
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
          </IconButton>

          <TeacherNotificationBadge />
        </Box>
        
        <List component="nav" sx={{ flexGrow: 1, paddingTop: '10px' }}>
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
            justifyContent: 'center',
            padding: '0.5rem 1rem 1rem',
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
            }}
          >
            {isSmallScreen ? 'LO' : 'Log Out'}
          </Button>
        </Box>
      </Box>
      
      {/* Report Form Dialog */}
      <ReportForm open={reportFormOpen} onClose={handleCloseReportForm} />
    </>
  );
};
 
export default TeacherSideBar;