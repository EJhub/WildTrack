import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const UpdateUserForm = ({ open, onClose, user, onUpdate }) => {
  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    idNumber: user?.idNumber || '',
    grade: user?.grade || '',
    section: user?.section || '',
    role: user?.role || ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const roles = ['Student', 'Teacher', 'Librarian'];

  if (!open) return null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:8080/api/users/${user.id}`, {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`,
        gradeSection: `${userData.grade} - ${userData.section}`
      });
      setLoading(false);
      onUpdate(response.data); // Update the user in the parent component's list
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update user. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        bgcolor: '#F5F5F5',
        boxShadow: 24,
        p: 4,
        borderRadius: '8px',
        zIndex: 1500,
        border: '1px solid #CCC',
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Update User
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <TextField
          label="First Name"
          name="firstName"
          value={userData.firstName}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={userData.lastName}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="ID Number"
          name="idNumber"
          value={userData.idNumber}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Grade"
          name="grade"
          value={userData.grade}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Section"
          name="section"
          value={userData.section}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="User Role"
          name="role"
          select
          value={userData.role}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          SelectProps={{
            MenuProps: {
              sx: { zIndex: 1500 }
            }
          }}
        >
          {roles.map(role => (
            <MenuItem key={role} value={role}>{role}</MenuItem>
          ))}
        </TextField>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#FFC107' },
          }}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateUserForm;
