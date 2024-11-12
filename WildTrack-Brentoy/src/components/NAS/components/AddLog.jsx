import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Typography, Box } from '@mui/material';

const AddLog = ({ open, handleClose, handleSubmit }) => {
  const [logDetails, setLogDetails] = useState({
    bookTitle: '',
    author: '',
    accessionNumber: '',
    studentIdNumber: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLogDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const onSubmit = () => {
    handleSubmit(logDetails);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '15px',
          overflow: 'hidden',
          border: '2px solid #8B3D3D',
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: '#8B3D3D',
          color: '#000',
        }}
      >
        Add Log
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: '#8B3D3D',
          padding: '30px',
        }}
      >
        {['Book Title', 'Author'].map((label, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, overflow: 'hidden' }}>
            <Typography sx={{ color: '#000', flex: 1 }}>{label}:</Typography>
            <TextField
              name={label.toLowerCase().replace(/\s+/g, '')}
              variant="outlined"
              value={logDetails[label.toLowerCase().replace(/\s+/g, '')]}
              onChange={handleInputChange}
              sx={{
                backgroundColor: '#fff',
                border: 'solid 2px #000',
                borderRadius: '10px',
                height: '40px',
                flex: 2,
              }}
            />
          </Box>
        ))}

        {/* Accession Number and Student ID Number with smaller input fields */}
        {['Accession Number', 'Student ID Number'].map((label, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, overflow: 'hidden' }}>
            <Typography sx={{ color: '#000', flex: 1 }}>{label}:</Typography>
            <TextField
              name={label.toLowerCase().replace(/\s+/g, '')}
              variant="outlined"
              value={logDetails[label.toLowerCase().replace(/\s+/g, '')]}
              onChange={handleInputChange}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                border: 'solid 2px #000',
                height: '40px',
                width: '185px', // Set a smaller width for these fields
              }}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
          backgroundColor: '#8B3D3D',
          padding: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            borderRadius: '10px',
            width: '120px',
            backgroundColor: '#BB5252',
            border: 'solid 2px #000',
            color: '#000',
            '&:hover': {
              backgroundColor: '#A44444',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          sx={{
            borderRadius: '10px',
            width: '120px',
            backgroundColor: '#FFD700',
            border: 'solid 2px #000',
            color: '#000',
            '&:hover': {
              backgroundColor: '#FFC107',
            },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLog;
