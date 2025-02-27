import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios interceptor for all requests
  useEffect(() => {
    // Add request interceptor to include authorization header
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle 401 errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear auth data if we get an unauthorized response
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('idNumber');
          setUser(null);
          
          // Optionally redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const idNumber = localStorage.getItem('idNumber');
      
      if (token && role && idNumber) {
        try {
          // Verify token with backend
          await axios.get('http://localhost:8080/api/verify-token', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Fetch complete user information including firstName and lastName
          const userResponse = await axios.get(`http://localhost:8080/api/users/${idNumber}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // If successful, set the user state with complete user data
          setUser({ 
            token, 
            role, 
            idNumber,
            id: userResponse.data.id,
            firstName: userResponse.data.firstName,
            lastName: userResponse.data.lastName,
            email: userResponse.data.email,
            profilePictureUrl: userResponse.data.profilePictureUrl
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // Clear invalid auth data
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('idNumber');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function to update context and localStorage
  const login = async (userData) => {
    try {
      // Store basic auth data
      localStorage.setItem('token', userData.token);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('idNumber', userData.idNumber);
      
      // Fetch complete user details
      const userResponse = await axios.get(`http://localhost:8080/api/users/${userData.idNumber}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      });
      
      // Create complete user object with all necessary data
      const completeUserData = {
        ...userData,
        id: userResponse.data.id,
        firstName: userResponse.data.firstName,
        lastName: userResponse.data.lastName,
        email: userResponse.data.email,
        profilePictureUrl: userResponse.data.profilePictureUrl
      };
      
      // Update state with complete user data
      setUser(completeUserData);
      return completeUserData;
    } catch (error) {
      console.error('Error fetching complete user data:', error);
      // Still set basic user data even if detailed fetch fails
      setUser(userData);
      return userData;
    }
  };

  // Logout function to clear context and localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('idNumber');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user,
      role: user?.role || null,
      idNumber: user?.idNumber || null
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;