import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, passwordResetRequired } = useContext(AuthContext);
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
          background: 'linear-gradient(to bottom, #CD6161, #8B3D3D)',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#FFD700' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#FFD700', fontWeight: 'bold' }}>
          Verifying access...
        </Typography>
      </Box>
    );
  }

  // Check if password reset is required and enforce it
  if (user && passwordResetRequired && !location.pathname.includes('/change-password')) {
    return <Navigate to="/change-password" state={{ fromReset: true, userId: user.id }} replace />;
  }

  // If user is not authenticated, handle redirection
  if (!user) {
    // Special handling for librarian routes - redirect to librarian login
    if (location.pathname.startsWith('/librarian/') && location.pathname !== '/librarian/Login') {
      return <Navigate to="/librarian/Login" state={{ from: location.pathname }} replace />;
    }
    
    // For all other routes, redirect to main login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if the user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on the user's actual role
    switch (user.role) {
      case 'Student':
        return <Navigate to="/studentDashboard/TimeRemaining" replace />;
      case 'Teacher':
        return <Navigate to="/TeacherDashboard/Home" replace />;
      case 'Librarian':
        return <Navigate to="/librarian/Home" replace />;
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