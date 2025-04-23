import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FeedbackIcon from '@mui/icons-material/Feedback';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import LibraryHoursParticipants from './components/LibraryHoursParticipants';
import AccessionUsageFrequency from './components/AccessionUsageFrequency';
import LibraryHoursCompletionRate from './components/LibraryHoursCompletionRate';
import ReportsView from './components/ReportsView';

const Analytics = () => {
  const [selectedGraph, setSelectedGraph] = useState('participants');
  
  // Get URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get('view');
  
  // Set the view mode based on URL parameter or default to analytics
  const [viewMode, setViewMode] = useState(viewParam === 'reports' ? 'reports' : 'analytics');

  // Toggle between analytics and reports view
  const toggleView = (view) => {
    setViewMode(view);
    
    // Update URL to reflect the current view without full page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('view', view);
    window.history.pushState({}, '', newUrl);
  };

  // Effect to update view based on URL parameters
  useEffect(() => {
    if (viewParam === 'reports') {
      setViewMode('reports');
    }
  }, [viewParam]);

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
            padding: '32px 32px 160px 32px', // Increased bottom padding to 160px
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
          {/* Title with View Toggle Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 3, 
            borderBottom: '2px solid #000', 
            paddingBottom: 1,
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#000'
              }}
            >
              {viewMode === 'analytics' ? 'Analytics' : 'Reports'}
            </Typography>
            
            {/* View Toggle Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={() => toggleView('analytics')}
                sx={{
                  backgroundColor: viewMode === 'analytics' ? '#FFD700' : '#f0f0f0',
                  color: '#000',
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: viewMode === 'analytics' ? '#FFD700' : '#e0e0e0' },
                  textTransform: 'none',
                  fontWeight: viewMode === 'analytics' ? 'bold' : 'normal'
                }}
              >
                Analytics
              </Button>
              <Button
                variant="contained"
                startIcon={<FeedbackIcon />}
                onClick={() => toggleView('reports')}
                sx={{
                  backgroundColor: viewMode === 'reports' ? '#FFD700' : '#f0f0f0',
                  color: '#000',
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: viewMode === 'reports' ? '#FFD700' : '#e0e0e0' },
                  textTransform: 'none',
                  fontWeight: viewMode === 'reports' ? 'bold' : 'normal'
                }}
              >
                Reports
              </Button>
            </Box>
          </Box>

          {viewMode === 'analytics' ? (
            // ANALYTICS VIEW
            <>
              {/* Chart Type Buttons */}
              <Box sx={{ display: 'flex', gap: 1, marginBottom: 3, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: selectedGraph === 'participants' ? '#FFD700' : '#f0f0f0',
                    color: '#000',
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    '&:hover': { backgroundColor: '#FFD700', color: '#000' },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                  }}
                  onClick={() => setSelectedGraph('participants')}
                >
                  Library Hours Participants
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: selectedGraph === 'frequency' ? '#FFD700' : '#f0f0f0',
                    color: '#000',
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    '&:hover': { backgroundColor: '#FFD700', color: '#000' },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                  }}
                  onClick={() => setSelectedGraph('frequency')}
                >
                  Accession Usage Frequency
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: selectedGraph === 'completionRate' ? '#FFD700' : '#f0f0f0',
                    color: '#000',
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    '&:hover': { backgroundColor: '#FFD700', color: '#000' },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                  }}
                  onClick={() => setSelectedGraph('completionRate')}
                >
                  Library Hours Completion Rate
                </Button>
              </Box>

              {/* Chart Display */}
              <Paper 
                sx={{ 
                  padding: 2, 
                  borderRadius: 2, 
                  borderStyle: 'solid',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  boxShadow: 'none',
                  overflow: 'visible', // Allow content to expand beyond container
                  position: 'relative',
                  flexGrow: 1, // Allow paper to grow within the container
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '100px', // Add bottom margin to ensure export buttons are visible
                }}
              >
                <Box 
                  sx={{ 
                    width: '100%', 
                    position: 'relative',
                    minHeight: '500px',
                    flexGrow: 1, // Allow the box to grow
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {selectedGraph === 'participants' ? (
                    <LibraryHoursParticipants />
                  ) : selectedGraph === 'frequency' ? (
                    <AccessionUsageFrequency />
                  ) : (
                    <LibraryHoursCompletionRate />
                  )}
                </Box>
              </Paper>
            </>
          ) : (
            // REPORTS VIEW
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <ReportsView />
            </Box>
          )}
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 80, width: '100%' }} /> {/* Increased height to 80px */}
        </Box>
      </Box>
    </>
  );
};

export default Analytics;