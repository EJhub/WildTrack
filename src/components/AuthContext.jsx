import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api'; // Import the API utility

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const idNumber = localStorage.getItem('idNumber');
      const resetRequired = localStorage.getItem('requirePasswordChange') === 'true';
      
      setPasswordResetRequired(resetRequired);
      
      if (token && role && idNumber) {
        try {
          // Set token in API utility headers
          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }

          // Verify token with backend
          await api.get('/verify-token');
          
          // Fetch complete user information including firstName and lastName
          const userResponse = await api.get(`/users/${idNumber}`);
          
          // If successful, set the user state with complete user data
          setUser({ 
            token, 
            role, 
            idNumber,
            id: userResponse.data.id,
            firstName: userResponse.data.firstName,
            lastName: userResponse.data.lastName,
            email: userResponse.data.email,
            profilePictureUrl: userResponse.data.profilePictureUrl,
            passwordResetRequired: resetRequired
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // Clear invalid auth data
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('idNumber');
          localStorage.removeItem('requirePasswordChange');
          localStorage.removeItem('userId');
          setPasswordResetRequired(false);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function to update context and localStorage
  const login = async (userData) => {
    try {
      // Check for password reset requirement
      const resetRequired = userData.requirePasswordChange || false;
      
      // Store basic auth data
      localStorage.setItem('token', userData.token);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('idNumber', userData.idNumber);
      
      // Store password reset status if true
      if (resetRequired) {
        localStorage.setItem('requirePasswordChange', 'true');
        if (userData.userId) {
          localStorage.setItem('userId', userData.userId);
        }
      }
      
      setPasswordResetRequired(resetRequired);
      
      // Set token in API utility headers
      if (userData.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      
      // Fetch complete user details
      const userResponse = await api.get(`/users/${userData.idNumber}`);
      
      // Create complete user object with all necessary data
      const completeUserData = {
        ...userData,
        id: userResponse.data.id || userData.userId,
        firstName: userResponse.data.firstName,
        lastName: userResponse.data.lastName,
        email: userResponse.data.email,
        profilePictureUrl: userResponse.data.profilePictureUrl,
        passwordResetRequired: resetRequired
      };
      
      // Update state with complete user data
      setUser(completeUserData);
      return completeUserData;
    } catch (error) {
      console.error('Error fetching complete user data:', error);
      // Still set basic user data even if detailed fetch fails
      setUser({
        ...userData,
        passwordResetRequired: userData.requirePasswordChange || false
      });
      
      setPasswordResetRequired(userData.requirePasswordChange || false);
      return userData;
    }
  };

  // Logout function to clear context and localStorage
  const logout = () => {
    setUser(null);
    setPasswordResetRequired(false);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('idNumber');
    localStorage.removeItem('requirePasswordChange');
    localStorage.removeItem('userId');
    // Clear authorization header
    api.defaults.headers.common['Authorization'] = '';
  };

  // Function to clear password reset requirement
  const clearPasswordResetRequired = () => {
    setPasswordResetRequired(false);
    localStorage.removeItem('requirePasswordChange');
    if (user) {
      setUser({
        ...user,
        passwordResetRequired: false
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user,
      role: user?.role || null,
      idNumber: user?.idNumber || null,
      passwordResetRequired,
      clearPasswordResetRequired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;