import React, { useState } from 'react';

function Register() {
  const [focusedInput, setFocusedInput] = useState(null);

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

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.registerBox}>
          <h2 style={styles.title}>Sign up</h2>
          <form>
            <div style={styles.rowInputGroup}>
              <input
                type="text"
                placeholder="First Name"
                style={{ ...getInputStyle('firstName'), width: '48%' }}
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
              />
              <input
                type="text"
                placeholder="Last Name"
                style={{ ...getInputStyle('lastName'), width: '48%' }}
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                style={getInputStyle('email')}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                style={getInputStyle('password')}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
              />
            </div>
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Confirm Password"
                style={getInputStyle('confirmPassword')}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={handleBlur}
              />
            </div>
            <button style={styles.registerButton}>Register</button>
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
