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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import UpdateUserForm from './UpdateUserForm'; // Import UpdateUserForm
import axios from 'axios';

const UpdateUserList = ({ open, onClose }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users/all');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUpdateFormOpen(true);
  };

  const handleUpdateUser = (updatedUser) => {
    const updatedUsers = users.map(user => user.id === updatedUser.id ? updatedUser : user);
    setUsers(updatedUsers);
    setIsUpdateFormOpen(false);
  };

  const filteredUsers = searchTerm
  ? users.filter(user =>
      (user.firstName?.toLowerCase() + " " + user.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
      user.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : users;

  if (!open) return null;

  return (
    
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '600px',
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
            Update User
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          placeholder="Type here..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            marginBottom: 2,
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
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{`${user.grade} - ${user.section}`}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditUser(user)}>
                      <EditIcon sx={{ color: '#000' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {isUpdateFormOpen && (
          <UpdateUserForm
            open={isUpdateFormOpen}
            onClose={() => setIsUpdateFormOpen(false)}
            user={selectedUser}
            onUpdate={handleUpdateUser}
          />
        )}
      </Box>

  );
};

export default UpdateUserList;
