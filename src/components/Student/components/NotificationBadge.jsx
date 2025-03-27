import React, { useState, useEffect, useContext } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import api from '../../../utils/api'; // Import the API utility instead of axios

const StudentNotificationBadge = () => {
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
      const idNumber = user?.idNumber || localStorage.getItem('idNumber');
      if (!idNumber) return;
      
      const token = localStorage.getItem('token');
      
      // Set the token in the api headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Use the API utility to make the request
      const response = await api.get(`/notifications/unread-count/${idNumber}`);
      
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  const navigateToNotifications = () => {
    const idNumber = user?.idNumber || localStorage.getItem('idNumber');
    if (idNumber) {
      navigate(`/Studentnotifications`);
    } else {
      console.error('No ID Number found for navigation');
    }
  };
  
  return (
    <IconButton 
      onClick={navigateToNotifications}
      sx={{ minWidth: 0 }}
    >
      <Badge 
        badgeContent={unreadCount} 
        color="error"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: '#FF4B4B',
            color: '#fff',
          }
        }}
      >
        <NotificationsIcon sx={{ color: '#FFD700' }} />
      </Badge>
    </IconButton>
  );
};

export default StudentNotificationBadge;