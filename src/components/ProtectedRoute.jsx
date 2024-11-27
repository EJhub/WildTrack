import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, login } = useContext(AuthContext);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/verify-token', {
          headers: { Authorization: `Bearer ${token}` },
        });
        login(response.data.user); // Update user context with the verified user data
      } catch {
        localStorage.removeItem('token');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [login]);

  if (isVerifying) {
    return <div>Loading...</div>; // Optional loading indicator
  }

  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
