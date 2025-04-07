import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Paper,
  Box,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const SuccessDialog = ({ open, onClose, title, message, temporaryPassword }) => {
  const handleCopyPassword = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
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
        <Typography align="center" sx={{ whiteSpace: 'pre-line', mb: temporaryPassword ? 3 : 0 }}>
          {message}
        </Typography>

        {temporaryPassword && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Temporary Password:
            </Typography>
            <Paper 
              elevation={3}
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                backgroundColor: '#e8f4f8',
                border: '1px solid #b3e0ff'
              }}
            >
              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                {temporaryPassword}
              </Typography>
              <Tooltip title="Copy password">
                <IconButton 
                  onClick={handleCopyPassword}
                  color="primary"
                  size="small"
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Paper>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
              Please provide this password to the user. They will be required to change it upon first login.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
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
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessDialog;