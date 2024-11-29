import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import DeleteConfirmation from './DeleteConfirmation'; // Import Delete Confirmation
import axios from 'axios';

const DeleteUserList = ({ open, onClose }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${selectedUser.id}`);
      setSnackbar({ open: true, message: "User deleted successfully!", severity: "success" });
      fetchUsers(); // Refresh the list after deletion
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete user.", severity: "error" });
      console.error('Error deleting user:', error);
    }
    setShowDeleteConfirmation(false);
    setSelectedUser(null);
  };

  if (!open) return null;

  const filteredUsers = searchTerm
  ? users.filter(user =>
      (user.firstName?.toLowerCase() + " " + user.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
      user.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : users;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '600',
          bgcolor: '#F5F5F5',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px',
          zIndex: 1400,
          border: '1px solid #CCC',
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
            Delete User
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: 2,
            width: '100%',
           }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer sx={{ maxHeight: '500px', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#FFD700', fontWeight: 'bold' }}>ID Number</TableCell>
                <TableCell sx={{ backgroundColor: '#FFD700', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ backgroundColor: '#FFD700', fontWeight: 'bold' }}>Grade & Section</TableCell>
                <TableCell sx={{ backgroundColor: '#FFD700', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ backgroundColor: '#FFD700', fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.idNumber}</TableCell>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.grade ? `${user.grade} - ${user.section}` : ''}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleDeleteClick(user)}
                      sx={{
                        backgroundColor: '#CD5C5C',
                        color: '#FFF',
                        '&:hover': { backgroundColor: '#B22222' },
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {showDeleteConfirmation && (
        <DeleteConfirmation
          open={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleConfirmDelete}
          user={selectedUser}
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: "", severity: "" })}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: "", severity: "" })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteUserList;
