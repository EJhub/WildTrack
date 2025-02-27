import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f5f5f5' 
        }}
      >
        <CircularProgress size={60} sx={{ color: '#781B1B' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#781B1B' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if the user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on the user's actual role
    switch (user.role) {
      case 'Student':
        return <Navigate to={`/studentDashboard/TimeRemaining?id=${user.idNumber}`} replace />;
      case 'Teacher':
        return <Navigate to="/TeacherDashboard/Home" replace />;
      case 'Librarian':
        return <Navigate to="/librarianDashboard" replace />;
      case 'NAS':
        return <Navigate to="/nasDashboard/Home" replace />;
      default:
        // If unknown role, send back to login
        return <Navigate to="/login" replace />;
    }
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;