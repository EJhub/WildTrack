import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const navigate = useNavigate(); // Hook to handle navigation
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupNavigation = () => {
    navigate('/register'); // Navigate to the Register page
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        email: credentials.username, // Use "email" as key instead of "username"
        password: credentials.password,
      });
  
      const { role } = response.data; // Extract the role from the response
      setError(null); // Clear any previous errors
  
      // Navigate based on role
      switch (role) {
        case 'Librarian':
          navigate('/librarianDashboard');
          break;
        case 'Student':
          navigate('/studentDashboard/TimeRemaining');
          break;
        case 'Teacher':
          navigate('/TeacherDashboard/Home');
          break;
        default:
          setError('Invalid role. Please contact support.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
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
                placeholder="Username or Email"
                style={styles.input}
                value={credentials.username}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                style={styles.input}
                value={credentials.password}
                onChange={handleInputChange}
              />
              <div style={styles.options}>
                <a href="#" style={styles.forgotPassword}>
                  Forgot password?
                </a>
              </div>
              <button type="submit" style={styles.signInButton}>Sign in</button>
            </form>
            <p style={styles.signupText}>
              Don't have an account?{' '}
              <span
                style={styles.signupLink}
                onClick={handleSignupNavigation}
              >
                Signup
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    '::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1,
    },
  },
  container: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
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
  options: {
    textAlign: 'right',
    marginBottom: '15px',
  },
  forgotPassword: {
    fontSize: '12px',
    color: '#007bff',
    textDecoration: 'none',
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
    marginTop: '-20px',
  },
  signupText: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#333',
  },
  signupLink: {
    color: '#007bff',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};

export default LoginPage;
