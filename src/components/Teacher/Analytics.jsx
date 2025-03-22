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
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh',
          overflow: 'hidden' // Prevent outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: '32px 32px 64px 32px', // Increased bottom padding
            flexGrow: 1,
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': { // Style scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          {/* Header with buttons for switching views */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 3,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2
          }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#8C383E',
                fontSize: '32px'
              }}
            >
              Analytics & Reports
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              width: { xs: '100%', md: 'auto' }
            }}>
              <Button
                variant="contained"
                onClick={() => setActiveView('completion')}
                sx={{
                  backgroundColor: activeView === 'completion' ? '#8C383E' : '#d7a6a6',
                  color: '#fff',
                  borderRadius: '15px',
                  '&:hover': {
                    backgroundColor: activeView === 'completion' ? '#6e2c30' : '#b58989',
                  },
                  flexGrow: { xs: 1, md: 0 }
                }}
              >
                Library Hours Completion Rate
              </Button>
              
              <Button
                variant="contained"
                onClick={() => setActiveView('participants')}
                sx={{
                  backgroundColor: activeView === 'participants' ? '#8C383E' : '#d7a6a6',
                  color: '#fff',
                  borderRadius: '15px',
                  '&:hover': {
                    backgroundColor: activeView === 'participants' ? '#6e2c30' : '#b58989',
                  },
                  flexGrow: { xs: 1, md: 0 }
                }}
              >
                Active Library Hours Participants
              </Button>
            </Box>
          </Box>
          
          {/* Wrapper for the active component that allows for proper scrolling */}
          <Box 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              // We don't need overflow: 'auto' here as parent box already has scrolling
            }}
          >
            {renderActiveComponent()}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Analytics;