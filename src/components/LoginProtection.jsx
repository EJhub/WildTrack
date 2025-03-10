import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const LoginProtection = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

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
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If user is already authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    // Redirect based on user role
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
        // Fallback for unknown roles
        return <Navigate to="/" replace />;
    }
  }

  // If user is not authenticated, allow access to the login page
  return children;
};

export default LoginProtection;