import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ConfirmUpdateDialog = ({ open, onClose, onConfirm, title = "Confirm Update", message }) => {
  const defaultMessage = "Are you sure you want to save the changes?\nThe new details will replace the current records.";
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          bgcolor: '#f5f5f5',
          boxShadow: 3,
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 2,
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: '#000' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: 3 }}>
        <Typography align="center" sx={{ whiteSpace: 'pre-line' }}>
          {message || defaultMessage}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#FFD700',
            color: '#000',
            '&:hover': { bgcolor: '#FFC107' },
            fontWeight: 'bold',
            minWidth: '100px',
            borderRadius: '4px'
          }}
        >
          No
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          sx={{
            bgcolor: '#FFD700',
            color: '#000',
            '&:hover': { bgcolor: '#FFC107' },
            fontWeight: 'bold',
            minWidth: '100px',
            borderRadius: '4px'
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmUpdateDialog;