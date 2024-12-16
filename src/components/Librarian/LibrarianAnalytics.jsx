import React, { useState } from 'react';
import { Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import LibraryHoursParticipants from './components/ActiveLibraryHoursParticipants';
import AccessionUsageFrequency from './components/AccessionUsageFrequency';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Analytics = () => {
  const [chartType, setChartType] = useState('bar');
  const [timeframe, setTimeframe] = useState('weekly');
  const [gradeLevel, setGradeLevel] = useState('All Grades');
  const [selectedGraph, setSelectedGraph] = useState('participants');

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <SideBar />
        <Box sx={{ flexGrow: 1, padding: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
            Analytics
          </Typography>

          {/* Buttons for selecting graphs */}
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
            <Button
              variant={selectedGraph === 'participants' ? 'contained' : 'outlined'}
              onClick={() => setSelectedGraph('participants')}
            >
              Active Library Hours Participants
            </Button>
            <Button
              variant={selectedGraph === 'frequency' ? 'contained' : 'outlined'}
              onClick={() => setSelectedGraph('frequency')}
            >
              Accession Usage Frequency
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <MenuItem value="bar">Bar Chart</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Grade Level</InputLabel>
              <Select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
                <MenuItem value="All Grades">All Grades</MenuItem>
                {[...Array(6)].map((_, i) => (
                  <MenuItem key={i} value={`Grade ${i + 1}`}>
                    Grade {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Export Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
            <Button variant="outlined" onClick={exportToPDF}>
              Export PDF
            </Button>
            <Button variant="outlined" onClick={exportToExcel}>
              Export Excel
            </Button>
          </Box>

          {/* Chart Display */}
          <Paper sx={{ padding: 4 }}>
            <Box id="chart-container">
              {selectedGraph === 'participants' ? (
                <LibraryHoursParticipants
                  timeframe={timeframe}
                  gradeLevel={gradeLevel}
                  chartType={chartType}
                />
              ) : (
                <AccessionUsageFrequency timeframe={timeframe} gradeLevel={gradeLevel} />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Analytics;
