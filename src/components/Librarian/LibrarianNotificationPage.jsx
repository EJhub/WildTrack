import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, Divider, 
  Button, CircularProgress, Chip, Container, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Tooltip, Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Import the API utility instead of axios
import { AuthContext } from '../AuthContext';
import SideBar from './components/SideBar';
import NavBar from './components/NavBar';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AssignmentIcon from '@mui/icons-material/Assignment';
import KeyIcon from '@mui/icons-material/Key';

const LibrarianNotificationPage = () => {
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
        const response = await api.get(`/notifications/user/${user.idNumber}`);
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
      await api.put(`/notifications/${notificationId}/mark-read`);
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
      await api.put(`/notifications/mark-all-read/${user.idNumber}`);
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
      await api.delete(`/notifications/${notificationId}`);
      
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

  // Handle viewing report details - now redirects to Reports view
  const handleViewReport = (referenceId) => {
    if (!referenceId) {
      showSnackbar("No report associated with this notification", "warning");
      return;
    }

    // Navigate to the analytics page with reports tab selected and the specific report ID
    navigate(`/librarian/LibrarianAnalytics?view=reports&reportId=${referenceId}`);
  };

  // Extract user ID from password reset notification message
  const extractUserIdFromMessage = (message) => {
    // Sample message format: "User John Doe (ID: 12345) has requested a password reset..."
    const idMatch = message.match(/\(ID: ([^)]+)\)/);
    if (idMatch && idMatch[1]) {
      return idMatch[1]; // The user's ID number
    }
    return null;
  };

  // Handle reset password request
  const handleResetPassword = async (notification) => {
    const idNumber = extractUserIdFromMessage(notification.message);
    
    if (!idNumber) {
      showSnackbar("Could not identify the user from the notification", "error");
      return;
    }
    
    try {
      // First, get the user details to determine if they're a student or teacher
      const userResponse = await api.get(`/users/${idNumber}`);
      
      if (userResponse.data) {
        const userId = userResponse.data.id;
        const userRole = userResponse.data.role;
        
        // Mark notification as read
        await handleMarkAsRead(notification.id);
        
        // Navigate to the appropriate page with a query parameter
        if (userRole === 'Student') {
          navigate(`/librarian/LibrarianManageStudent?resetPasswordUserId=${userId}`);
        } else if (userRole === 'Teacher') {
          navigate(`/librarian/LibrarianManageTeacher?resetPasswordUserId=${userId}`);
        } else {
          // For other roles
          navigate(`/librarian/UserManagement?resetPasswordUserId=${userId}`);
        }
      } else {
        showSnackbar("User not found", "error");
      }
    } catch (err) {
      console.error('Error processing password reset:', err);
      showSnackbar("Failed to process password reset request", "error");
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, notification) => {
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

  // Check if notification is a password reset request
  const isPasswordResetRequest = (notification) => {
    return notification.title === "Password Reset Request";
  };

  // Helper to determine the notification type styling
  const getNotificationStyling = (notification) => {
    // Define styling based on notification type and read status
    const baseColor = '#FFD700'; // Gold color
    
    // Password reset requests should have a distinctive appearance
    if (isPasswordResetRequest(notification)) {
      return {
        backgroundColor: notification.read ? 'rgba(173, 216, 230, 0.1)' : 'rgba(173, 216, 230, 0.2)',
        borderLeft: notification.read ? '4px solid #E0E0E0' : '4px solid #1976d2'
      };
    }
    
    // Check if this is a report notification
    if (notification.notificationType === 'REPORT_SUBMISSION') {
      return {
        backgroundColor: notification.read ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 215, 0, 0.15)',
        borderLeft: notification.read ? '4px solid #E0E0E0' : `4px solid ${baseColor}`
      };
    }
    
    switch (notification.notificationType) {
      case 'REPORT_RESOLVED':
        return {
          backgroundColor: 'rgba(150, 255, 150, 0.2)',
          borderLeft: '4px solid #4CAF50'
        };
      case 'REPORT_URGENT':
        return {
          backgroundColor: 'rgba(255, 150, 150, 0.2)',
          borderLeft: '4px solid #FF6B6B'
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
          <SideBar />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh',
          overflow: 'hidden' // Prevent outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: '32px 32px 120px 32px', // Increased bottom padding
            flexGrow: 1,
            backgroundColor: '#f5f5f5',
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Ensure content area fills available height
            '&::-webkit-scrollbar': { // Custom scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ color: '#781B1B', fontWeight: 'bold' }}>
                Librarian Notifications
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
              <Paper sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: '15px',
                marginBottom: 4, // Added bottom margin
              }}>
                <List>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          position: 'relative',
                          ...getNotificationStyling(notification),
                          '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                          cursor: notification.referenceId ? 'pointer' : 'default'
                        }}
                        onClick={() => notification.referenceId && handleViewReport(notification.referenceId)}
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
                                {notification.notificationType === 'REPORT_SUBMISSION' && (
                                  <Chip 
                                    label="Report" 
                                    size="small" 
                                    icon={<AssignmentIcon sx={{ fontSize: '0.8rem !important' }} />}
                                    sx={{ 
                                      backgroundColor: '#781B1B', 
                                      color: 'white',
                                      height: 20,
                                      '& .MuiChip-icon': {
                                        color: 'white'
                                      }
                                    }} 
                                  />
                                )}
                                {isPasswordResetRequest(notification) && (
                                  <Chip 
                                    label="Password Reset" 
                                    size="small" 
                                    icon={<KeyIcon sx={{ fontSize: '0.8rem !important' }} />}
                                    sx={{ 
                                      backgroundColor: '#1976d2', 
                                      color: 'white',
                                      height: 20,
                                      '& .MuiChip-icon': {
                                        color: 'white'
                                      }
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
                              
                              {notification.referenceId && (
                                <Button
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewReport(notification.referenceId);
                                  }}
                                  sx={{ mt: 1, color: '#781B1B', mr: 2 }}
                                >
                                  View Report
                                </Button>
                              )}
                              
                              {/* Password Reset Request Button */}
                              {isPasswordResetRequest(notification) && (
                                <Button
                                  size="small"
                                  startIcon={<KeyIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetPassword(notification);
                                  }}
                                  sx={{
                                    mt: 1,
                                    mr: 2,
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: '#0d47a1',
                                    }
                                  }}
                                >
                                  Reset Password
                                </Button>
                              )}
                              
                              {!notification.read && (
                                <Button
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
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
            
            {/* Extra spacer to ensure scrollability */}
            <Box sx={{ height: 60, width: '100%' }} />
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
        
        {selectedNotification && isPasswordResetRequest(selectedNotification) && (
          <MenuItem onClick={() => {
            handleResetPassword(selectedNotification);
            handleMenuClose();
          }}
          sx={{ py: 1.5 }}
          >
            <KeyIcon fontSize="small" sx={{ mr: 1.5, color: '#1976d2' }} />
            <Typography variant="body2">Reset Password</Typography>
          </MenuItem>
        )}
        
        {selectedNotification && selectedNotification.referenceId && (
          <MenuItem onClick={() => {
            handleViewReport(selectedNotification.referenceId);
            handleMenuClose();
          }}
          sx={{ py: 1.5 }}
          >
            <AssignmentIcon fontSize="small" sx={{ mr: 1.5, color: '#781B1B' }} />
            <Typography variant="body2">View Report</Typography>
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
    </>
  );
};

export default LibrarianNotificationPage;