import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import LibraryHoursCompletionRate from './components/LibraryHoursCompletionRate';
import ActiveLibraryHoursParticipants from './components/ActiveLibraryHoursParticipants';

const Analytics = () => {
  const [activeView, setActiveView] = useState('completion'); // 'completion' or 'participants'

  // Render the appropriate component based on activeView
  const renderActiveComponent = () => {
    switch (activeView) {
      case 'completion':
        return <LibraryHoursCompletionRate />;
      case 'participants':
        return <ActiveLibraryHoursParticipants />;
      default:
        return <LibraryHoursCompletionRate />;
    }
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              Analytics & Reports
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => setActiveView('completion')}
                sx={{
                  backgroundColor: activeView === 'completion' ? '#A85858' : '#d7a6a6',
                  color: '#fff',
                  borderRadius: '20px',
                  '&:hover': {
                    backgroundColor: '#8B3D3D',
                  },
                }}
              >
                Library Hours Completion Rate
              </Button>
              
              <Button
                variant="contained"
                onClick={() => setActiveView('participants')}
                sx={{
                  backgroundColor: activeView === 'participants' ? '#A85858' : '#d7a6a6',
                  color: '#fff',
                  borderRadius: '20px',
                  '&:hover': {
                    backgroundColor: '#8B3D3D',
                  },
                }}
              >
                Active Library Hours Participants
              </Button>
            </Box>
          </Box>
          
          {/* Render the active component */}
          {renderActiveComponent()}
        </Box>
      </Box>
    </>
  );
};

export default Analytics;