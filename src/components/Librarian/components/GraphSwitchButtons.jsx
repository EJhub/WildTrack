import React from 'react';
import { Box, Button } from '@mui/material';

const GraphSwitchButtons = ({ selectedGraph, onGraphChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
      <Button
        variant={selectedGraph === 'participants' ? 'contained' : 'outlined'}
        sx={{
          textTransform: 'none',
          backgroundColor: selectedGraph === 'participants' ? '#1976d2' : '#fff',
          color: selectedGraph === 'participants' ? '#fff' : '#1976d2',
          '&:hover': {
            backgroundColor: selectedGraph === 'participants' ? '#1565c0' : '#e3f2fd',
          },
        }}
        onClick={() => onGraphChange('participants')}
      >
        Active Library Hours Participants
      </Button>
      <Button
        variant={selectedGraph === 'frequency' ? 'contained' : 'outlined'}
        sx={{
          textTransform: 'none',
          backgroundColor: selectedGraph === 'frequency' ? '#1976d2' : '#fff',
          color: selectedGraph === 'frequency' ? '#fff' : '#1976d2',
          '&:hover': {
            backgroundColor: selectedGraph === 'frequency' ? '#1565c0' : '#e3f2fd',
          },
        }}
        onClick={() => onGraphChange('frequency')}
      >
        Accession Usage Frequency
      </Button>
    </Box>
  );
};

export default GraphSwitchButtons;
