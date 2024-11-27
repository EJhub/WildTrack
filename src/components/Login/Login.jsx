import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext'; // Ensure you have an AuthContext setup

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Access AuthContext for user login

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:8080/api/login', {
        email: credentials.username, // Use "email" as key, backend expects this
        password: credentials.password,
      });

      // Extract data from response
      const { token, role, idNumber } = response.data;

      // Save the token in localStorage for persistence
      localStorage.setItem('token', token);

      // Call login from AuthContext to update user state
      login({ token, role, idNumber });

      // Navigate to StudentLibraryHours if the role is "Student"
      if (role === 'Student') {
        navigate(`/studentDashboard/TimeRemaining?id=${idNumber}`);
      } else if (role === 'Librarian') {
        navigate('/librarianDashboard');
      } else if (role === 'Teacher') {
        navigate('/TeacherDashboard/Home');
      } else {
        throw new Error('Invalid role returned from the server.');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.blurBorder}>
          <div style={styles.loginBox}>
            <h2 style={styles.title}>Sign in</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
              <input
                type="text"
                name="username"
                placeholder="Email"
                autoComplete="username"
                style={styles.input}
                value={credentials.username}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                style={styles.input}
                value={credentials.password}
                onChange={handleInputChange}
              />
              <button type="submit" style={styles.signInButton}>
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  background: {
    position: 'relative',
    backgroundImage: `url('CITU-GLE Building.png')`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    filter: 'brightness(0.8) contrast(1.5) saturate(1.1)',
  },
  container: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBorder: {
    width: '320px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '8px',
    boxShadow: `
      0px 0px 15px 5px rgba(255, 255, 255, 0.2), 
      0px 0px 20px 5px rgba(255, 255, 255, 0.2), 
      0px 0px 25px 10px rgba(255, 255, 255, 0.2)`,
    textAlign: 'center',
  },
  loginBox: {
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '25px',
  },
  input: {
    width: '90%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
  },
  signInButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Login;
