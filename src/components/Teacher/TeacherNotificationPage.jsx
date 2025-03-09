import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, Divider, 
  Button, CircularProgress, Chip, Container, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Tooltip, Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import TeacherSideBar from './components/SideBar';
import NavBar from './components/NavBar';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const TeacherNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // States for menu actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // States for dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // States for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    // Fetch notifications when component mounts
    const fetchNotifications = async () => {
      if (!user || !user.idNumber) {
        setError("User information not available");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/notifications/user/${user.idNumber}`);
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up polling for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/mark-read`);
      // Update the local state to reflect the change
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      showSnackbar("Notification marked as read", "success");
    } catch (err) {
      console.error('Error marking notification as read:', err);
      showSnackbar("Failed to mark notification as read", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !user.idNumber) return;
    
    try {
      await axios.put(`http://localhost:8080/api/notifications/mark-all-read/${user.idNumber}`);
      // Update all notifications in the local state to be marked as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      showSnackbar("All notifications marked as read", "success");
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      showSnackbar("Failed to mark all notifications as read", "error");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // API call to delete the notification
      await axios.delete(`http://localhost:8080/api/notifications/${notificationId}`);
      
      // Update the UI by removing the deleted notification
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
      
      showSnackbar("Notification deleted successfully", "success");
    } catch (err) {
      console.error('Error deleting notification:', err);
      showSnackbar("Failed to delete notification", "error");
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, notification) => {
    // Stop event propagation to prevent issues
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  // Dialog handlers
  const handleDeleteConfirmOpen = (notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirmClose = () => {
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (notificationToDelete) {
      handleDeleteNotification(notificationToDelete.id);
    }
    handleDeleteConfirmClose();
  };

  // Snackbar handlers
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper to determine the notification type styling
  const getNotificationStyling = (notification) => {
    // Define styling based on notification type and read status
    const baseColor = '#FFD700'; // Gold color like in StudentNotificationsPage
    
    switch (notification.type) {
      case 'LIBRARIAN_ALERT':
        return {
          backgroundColor: 'rgba(255, 235, 150, 0.2)',
          borderLeft: `4px solid ${baseColor}`
        };
      case 'TEACHER_ALERT':
        return {
          backgroundColor: 'rgba(255, 215, 0, 0.15)',
          borderLeft: `4px solid ${baseColor}`
        };
      case 'LIBRARY_HOURS_REJECTED':
        return {
          backgroundColor: 'rgba(255, 150, 150, 0.2)',
          borderLeft: '4px solid #FF6B6B'
        };
      case 'LIBRARY_HOURS_APPROVED':
        return {
          backgroundColor: 'rgba(150, 255, 150, 0.2)',
          borderLeft: '4px solid #4CAF50'
        };
      default:
        return {
          backgroundColor: notification.read ? 'transparent' : 'rgba(255, 215, 0, 0.1)',
          borderLeft: notification.read ? '4px solid #E0E0E0' : `4px solid ${baseColor}`
        };
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <TeacherSideBar />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <TeacherSideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: '#f5f5f5', // Replaced background image with solid color
            overflow: 'auto',
          }}
        >
          <Box sx={{ maxWidth: 1200, margin: '0 auto' }}> {/* Increased width from 800 to 1200 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                Notifications
              </Typography>
              <Button 
                onClick={handleMarkAllAsRead}
                disabled={loading || notifications.every(n => n.read)}
                startIcon={<DoneAllIcon />}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  '&:hover': { backgroundColor: '#FFC107' },
                  '&:disabled': {
                    backgroundColor: 'rgba(255, 215, 0, 0.3)',
                    color: 'rgba(0, 0, 0, 0.4)'
                  }
                }}
              >
                Mark All as Read
              </Button>
            </Box>

            {error ? (
              <Paper sx={{ 
                p: 3, 
                backgroundColor: 'rgba(255, 244, 229, 0.9)', 
                borderLeft: '4px solid #ff9800',
                borderRadius: '8px'
              }}>
                <Typography color="error">{error}</Typography>
              </Paper>
            ) : notifications.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '15px' }}>
                <Typography variant="h6">No notifications</Typography>
              </Paper>
            ) : (
              <Paper sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px' }}>
                <List>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          position: 'relative',
                          ...getNotificationStyling(notification),
                          '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                        }}
                      >
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8 
                        }}>
                          <Tooltip title="Options">
                            <IconButton 
                              size="small"
                              onClick={(e) => handleMenuOpen(e, notification)}
                              sx={{ 
                                color: '#781B1B',
                                '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.3)' }
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 4 }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                                >
                                  {notification.title}
                                </Typography>
                                {!notification.read && (
                                  <Chip 
                                    label="New" 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: '#FFD700', 
                                      color: '#000',
                                      height: 20
                                    }} 
                                  />
                                )}
                                {notification.type === 'LIBRARY_HOURS_REJECTED' && (
                                  <Chip 
                                    label="Rejected" 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: '#FF6B6B', 
                                      color: 'white',
                                      height: 20
                                    }} 
                                  />
                                )}
                                {notification.type === 'LIBRARY_HOURS_APPROVED' && (
                                  <Chip 
                                    label="Approved" 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: '#4CAF50', 
                                      color: 'white',
                                      height: 20
                                    }} 
                                  />
                                )}
                              </Box>
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
                                  onClick={() => handleMarkAsRead(notification.id)}
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
      </Box>

      {/* Notification Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ 
          sx: { 
            minWidth: '150px',
            mt: 0.5,
            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
            borderRadius: '8px'
          } 
        }}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => {
            handleMarkAsRead(selectedNotification.id);
            handleMenuClose();
          }}
          sx={{ py: 1.5 }}
          >
            <MarkEmailReadIcon fontSize="small" sx={{ mr: 1.5, color: '#781B1B' }} />
            <Typography variant="body2">Mark as Read</Typography>
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => handleDeleteConfirmOpen(selectedNotification)} 
          sx={{ color: '#f44336', py: 1.5 }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteConfirmClose}
        PaperProps={{
          sx: { borderRadius: 3, maxWidth: 400 }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, color: '#781B1B', fontWeight: 600 }}>Delete Notification</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText>
            Are you sure you want to delete this notification? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleDeleteConfirmClose} 
            sx={{ 
              color: '#757575',
              borderRadius: '6px',
              px: 2
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            sx={{ 
              backgroundColor: '#781B1B',
              color: 'white',
              '&:hover': { backgroundColor: '#9B2626' },
              borderRadius: '6px',
              px: 2
            }}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherNotificationPage;