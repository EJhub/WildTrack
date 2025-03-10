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
import LibraryHoursParticipants from './components/ActiveLibraryHoursParticipants';
import AccessionUsageFrequency from './components/AccessionUsageFrequency';
import LibraryHoursCompletionRate from './components/LibraryHoursCompletionRate';
import ReportsView from './components/ReportsView';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Analytics = () => {
  const [selectedGraph, setSelectedGraph] = useState('participants');
  
  // Get URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get('view');
  
  // Set the view mode based on URL parameter or default to analytics
  const [viewMode, setViewMode] = useState(viewParam === 'reports' ? 'reports' : 'analytics');

  // Export PDF function
  const exportToPDF = () => {
    const input = document.getElementById('chart-container');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 120);
      pdf.save('chart.pdf');
    });
  };

  // Export Excel function
  const exportToExcel = () => {
    const input = document.getElementById('chart-container');
    html2canvas(input).then(() => {
      const worksheet = XLSX.utils.json_to_sheet([{ Label: 'Example Export', Value: 100 }]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, 'chart.xlsx');
    });
  };

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <NavBar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <SideBar />
        <Box sx={{ flexGrow: 1, padding: 3 }}>
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
              <Box sx={{ display: 'flex', gap: 1, marginBottom: 3, justifyContent: 'flex-start' }}>
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
                  Active Library Hours Participants
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
              <Paper sx={{ 
                padding: 2, 
                borderRadius: 2, 
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: '#ddd',
                boxShadow: 'none',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Box id="chart-container" sx={{ 
                  width: '100%', 
                  position: 'relative',
                  minHeight: '500px'
                }}>
                  {selectedGraph === 'participants' ? (
                    <LibraryHoursParticipants />
                  ) : selectedGraph === 'frequency' ? (
                    <AccessionUsageFrequency />
                  ) : (
                    <LibraryHoursCompletionRate />
                  )}
                </Box>
                
                {/* Export Buttons at the bottom-center */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 2, 
                  marginTop: 3 
                }}>
                  <Button 
                    variant="contained"
                    onClick={exportToPDF}
                    sx={{
                      backgroundColor: '#CD6161',
                      color: '#fff',
                      borderRadius: '20px',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#B04747' },
                    }}
                  >
                    Export PDF
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={exportToExcel}
                    sx={{
                      backgroundColor: '#CD6161',
                      color: '#fff',
                      borderRadius: '20px',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#B04747' },
                    }}
                  >
                    Export Excel
                  </Button>
                </Box>
              </Paper>
            </>
          ) : (
            // REPORTS VIEW
            <ReportsView />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Analytics;