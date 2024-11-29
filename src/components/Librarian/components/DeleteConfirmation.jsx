import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DeleteConfirmation = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Delete User?
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Confirmation Message */}
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        Are you sure you want to delete this user?
      </Typography>

      {/* Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
            '&:hover': { backgroundColor: '#FFC107' },
          }}
        >
          No
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            backgroundColor: '#CD5C5C',
            color: '#FFF',
            '&:hover': { backgroundColor: '#B22222' },
          }}
        >
          Yes
        </Button>
      </Box>
    </Box>
  );
};

export default DeleteConfirmation;
