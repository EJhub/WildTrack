import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [focusedInput, setFocusedInput] = useState(null);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  const getInputStyle = (inputName) => ({
    width: '100%',
    maxWidth: '395px',
    padding: '12px',
    border: `2px solid ${focusedInput === inputName ? 'black' : '#ccc'}`,
    borderRadius: '5px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '10px',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setMessage('User registered successfully!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to register. Please try again.');
      }
    } catch (error) {
      setMessage('Email already exists.');
      console.error('Error:', error);
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.registerBox}>
          <h2 style={styles.title}>Sign up</h2>
          {message && <p style={{ color: 'red' }}>{message}</p>}
          <form onSubmit={handleSubmit}>
            <div style={styles.rowInputGroup}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                style={{ ...getInputStyle('firstName'), width: '48%' }}
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                style={{ ...getInputStyle('lastName'), width: '48%' }}
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                style={getInputStyle('email')}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                style={getInputStyle('password')}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={getInputStyle('confirmPassword')}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={handleBlur}
              />
            </div>
            <button type="submit" style={styles.registerButton}>
              Register
            </button>
          </form>
          <p style={styles.loginText}>
            Already have an account? <a href="#" style={styles.loginLink}>Login here</a>
          </p>
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
  },
  container: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    padding: '20px',
  },
  registerBox: {
    width: '90%',
    maxWidth: '400px',
    padding: '40px 30px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '8px',
    boxShadow: `
      0px 0px 15px 5px rgba(255, 255, 255, 0.2), 
      0px 0px 20px 5px rgba(255, 255, 255, 0.2), 
      0px 0px 25px 10px rgba(255, 255, 255, 0.2)`,
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '25px',
  },
  rowInputGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '10px',
  },
  registerButton: {
    width: '100%',
    padding: '10px',
    height: '45px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  loginText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#333',
  },
  loginLink: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default Register;
