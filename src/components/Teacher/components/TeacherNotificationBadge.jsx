import React, { useState, useEffect, useContext } from 'react';
import { Badge, IconButton, Tooltip, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import api from '../../../utils/api'; // Import the API utility

const TeacherNotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up interval to check for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchUnreadCount = async () => {
    try {
      if (!user || !user.idNumber) return;
      
      // Use the API utility instead of axios directly with hardcoded URL
      const response = await api.get(`/notifications/unread-count/${user.idNumber}`);
      
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  const navigateToNotifications = () => {
    navigate(`/Teachernotifications`);
  };
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip title={`${unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications'}`}>
        <IconButton 
          onClick={navigateToNotifications}
          aria-label="Notifications"
          sx={{ 
            minWidth: 0,
            position: 'relative',
            transition: 'transform 0.2s',
            p: 1.2,
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              transform: 'scale(1.1)',
            },
            ...(unreadCount > 0 && {
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
                boxShadow: '0 0 0 rgba(255, 215, 0, 0.4)',
                opacity: 0.7,
              },
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.4)',
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)',
                },
              },
            })
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#FF5252',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                fontSize: '0.75rem',
                padding: '0 4px',
                minWidth: '18px',
                height: '18px'
              }
            }}
          >
            <NotificationsIcon 
              sx={{ 
                color: unreadCount > 0 ? '#FFD700' : 'rgba(255, 215, 0, 0.8)',
                fontSize: '1.6rem',
                transition: 'all 0.3s ease'
              }} 
            />
          </Badge>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default TeacherNotificationBadge;