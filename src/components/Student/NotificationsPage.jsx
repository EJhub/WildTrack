import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import { AuthContext } from '../AuthContext';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      const idNumber = user?.idNumber || localStorage.getItem('idNumber');
      if (!idNumber) {
        toast.error('User ID not found. Please log in again.');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/notifications/user/${idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/notifications/${notificationId}/mark-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const idNumber = user?.idNumber || localStorage.getItem('idNumber');
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/notifications/mark-all-read/${idNumber}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
      toast.success('All notifications marked as read');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <SideBar />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress />
          </Box>
        </Box>
      </>
    );
  }
  
  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundImage: "url('/studentbackground.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                onClick={markAllAsRead}
                startIcon={<DoneAllIcon />}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  '&:hover': { backgroundColor: '#FFC107' }
                }}
              >
                Mark All as Read
              </Button>
            )}
          </Box>
          
          {notifications.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <Typography variant="h6">No notifications</Typography>
            </Paper>
          ) : (
            <Paper sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '15px' }}>
              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        backgroundColor: notification.read ? 'transparent' : 'rgba(255, 215, 0, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography 
                              variant="h6" 
                              sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                            >
                              {notification.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                              {notification.message}
                            </Typography>
                            
                            {!notification.read && (
                              <Button
                                size="small"
                                onClick={() => markAsRead(notification.id)}
                                sx={{ mt: 1, color: '#781B1B' }}
                              >
                                Mark as read
                              </Button>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default NotificationsPage;