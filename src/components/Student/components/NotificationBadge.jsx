import React, { useState, useEffect, useContext } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const NotificationBadge = () => {
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
      const response = await axios.get(
        `http://localhost:8080/api/notifications/unread-count/${idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  const navigateToNotifications = () => {
    const idNumber = user?.idNumber || localStorage.getItem('idNumber');
    if (idNumber) {
      navigate(`/notifications?id=${idNumber}`);
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

export default NotificationBadge;