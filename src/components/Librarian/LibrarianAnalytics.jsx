import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Select, 
  MenuItem, 
  InputAdornment,
  TextField
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  const [chartType, setChartType] = useState('bar');
  const [timeframe, setTimeframe] = useState('weekly');
  const [gradeLevel, setGradeLevel] = useState('All Grades');
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedGraph, setSelectedGraph] = useState('participants');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState('analytics'); // 'analytics' or 'reports'

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

  // Section options
  const sections = ['Section A', 'Section B', 'Section C'];
  
  // Academic year options
  const academicYears = ['2023-2024', '2024-2025', '2025-2026'];

  // Toggle between analytics and reports view
  const toggleView = (view) => {
    setViewMode(view);
  };

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

              {/* Filter Row */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                marginBottom: 2, 
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                {/* Date From */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Date From:
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="MM/DD/YEAR"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    sx={{ 
                      width: '150px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                        height: '36px',
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Date To */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Date To:
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="MM/DD/YEAR"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    sx={{ 
                      width: '150px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                        height: '36px',
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Grade Level */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Grade Level:
                  </Typography>
                  <Select
                    size="small"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    displayEmpty
                    renderValue={(selected) => selected || "Choose here..."}
                    IconComponent={ExpandMoreIcon}
                    sx={{ 
                      width: '150px',
                      height: '36px',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <MenuItem value="All Grades">All Grades</MenuItem>
                    {[...Array(6)].map((_, i) => (
                      <MenuItem key={i} value={`Grade ${i + 1}`}>
                        Grade {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Section:
                  </Typography>
                  <Select
                    size="small"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    displayEmpty
                    renderValue={(selected) => selected || "Choose here..."}
                    IconComponent={ExpandMoreIcon}
                    sx={{ 
                      width: '150px',
                      height: '36px',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {sections.map((sectionOption) => (
                      <MenuItem key={sectionOption} value={sectionOption}>
                        {sectionOption}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Academic Year */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Academic Year:
                  </Typography>
                  <Select
                    size="small"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    IconComponent={ExpandMoreIcon}
                    displayEmpty
                    renderValue={(selected) => selected || "Select Academic Year"}
                    sx={{ 
                      width: '200px',
                      height: '36px',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <MenuItem value="">Current Academic Year</MenuItem>
                    {academicYears.map((yearOption) => (
                      <MenuItem key={yearOption} value={yearOption}>
                        {yearOption}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Data View */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Data View:
                  </Typography>
                  <Select
                    size="small"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    IconComponent={ExpandMoreIcon}
                    sx={{ 
                      width: '150px',
                      height: '36px',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </Box>

                {/* Filter Button */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', pb: 0 }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#d3d3d3',
                      color: '#000',
                      height: '36px',
                      borderRadius: '4px',
                      '&:hover': { backgroundColor: '#c0c0c0' },
                      textTransform: 'none',
                      mt: 3
                    }}
                  >
                    Filter
                  </Button>
                </Box>
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
                  height: '500px'
                }}>
                  {selectedGraph === 'participants' ? (
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          textAlign: 'center', 
                          fontWeight: 'bold',
                          mb: 2
                        }}
                      >
                        Active Library Hours Participants
                        <Typography 
                          component="span" 
                          display="block" 
                          variant="subtitle1"
                          sx={{ fontWeight: 'normal' }}
                        >
                          {timeframe === 'weekly' ? 'Weekly' : 
                          timeframe === 'monthly' ? 'Monthly' : 'Yearly'}
                        </Typography>
                      </Typography>
                      <LibraryHoursParticipants
                        timeframe={timeframe}
                        gradeLevel={gradeLevel}
                        chartType={chartType}
                        section={section}
                        academicYear={academicYear}
                      />
                    </Box>
                  ) : selectedGraph === 'frequency' ? (
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          textAlign: 'center', 
                          fontWeight: 'bold',
                          mb: 2
                        }}
                      >
                        Accession Usage Frequency
                        <Typography 
                          component="span" 
                          display="block" 
                          variant="subtitle1"
                          sx={{ fontWeight: 'normal' }}
                        >
                          {timeframe === 'weekly' ? 'Weekly' : 
                          timeframe === 'monthly' ? 'Monthly' : 'Yearly'}
                        </Typography>
                      </Typography>
                      <AccessionUsageFrequency 
                        timeframe={timeframe} 
                        gradeLevel={gradeLevel}
                        section={section}
                        academicYear={academicYear}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          textAlign: 'center', 
                          fontWeight: 'bold',
                          mb: 2
                        }}
                      >
                        Library Hours Completion Rate
                        <Typography 
                          component="span" 
                          display="block" 
                          variant="subtitle1"
                          sx={{ fontWeight: 'normal' }}
                        >
                          {timeframe === 'weekly' ? 'Weekly' : 
                          timeframe === 'monthly' ? 'Monthly' : 'Yearly'}
                        </Typography>
                      </Typography>
                      <LibraryHoursCompletionRate
                        timeframe={timeframe}
                        gradeLevel={gradeLevel}
                        section={section}
                        academicYear={academicYear}
                      />
                    </Box>
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