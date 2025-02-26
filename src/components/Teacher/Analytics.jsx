import React, { useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('Weekly');
  const [chartType, setChartType] = useState('Bar');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');

  // Chart Data
  const getChartData = () => {
    switch (timeframe) {
      case 'Weekly':
        return {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          datasets: [
            {
              label: 'Students',
              data: [450, 300, 400, 150, 500, 600, 200],
              backgroundColor: '#F8C400',
              borderColor: '#000',
              borderWidth: 1,
            },
          ],
        };
      case 'Monthly':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Students',
              data: [1200, 1500, 1100, 1400],
              backgroundColor: '#8B4513',
              borderColor: '#000',
              borderWidth: 1,
            },
          ],
        };
      case 'Yearly':
        return {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [
            {
              label: 'Students',
              data: [500, 700, 800, 600, 900, 1000, 950, 800, 750, 870, 980, 1200],
              backgroundColor: '#FF6347',
              borderColor: '#000',
              borderWidth: 1,
            },
          ],
        };
      default:
        return {};
    }
  };

  const chartOptions = {
    aspectRatio: 1.75,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `Students doing Library Hours - ${timeframe}`,
        font: {
          size: 16,
        },
        padding: {
          top: 5,
          bottom: 10
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'No. of Students',
        },
        ticks: {
          maxTicksLimit: 8,
        }
      },
      x: {
        title: {
          display: true,
          text: timeframe === 'Weekly' ? 'Days of the Week' : timeframe === 'Monthly' ? 'Weeks of the Month' : 'Months of the Year',
        },
      },
    },
  };

  const ChartComponent = chartType === 'Bar' ? Bar : Line;

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
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          <br />
          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: '#000',
              marginBottom: 3,
              textAlign: 'left',
            }}
          >
            Analytics and Reports
          </Typography>

          {/* Timeframe Buttons */}
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 3, justifyContent: 'flex-end', marginTop: '-40px' }}>
            <Button
              variant="outlined"
              onClick={() => {}}
              sx={{
                backgroundColor: '#A85858',
                color: '#fff',
                border: '1px solid #A85858',
                borderRadius: '10px',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                  color: '#fff',
                },
              }}
            >
              Student Library Hours
            </Button>

            <Button
              variant="outlined"
              onClick={() => {}}
              sx={{
                backgroundColor: '#A85858',
                color: '#fff',
                border: '1px solid #A85858',
                borderRadius: '10px',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                  color: '#fff',
                },
              }}
            >
              Active Library Hours Participants
            </Button>
          </Box>

          {/* Filters Section */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 3 }}>
            <TextField
              label="Date From"
              type="date"
              variant="outlined"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Date To"
              type="date"
              variant="outlined"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Academic Year"
              select
              variant="outlined"
              size="small"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
            >
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderRadius: '5px',
                backgroundColor: '#A85858',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                },
              }}
            >
              Filter
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 3 }}>
            <TextField
              label="Grade Level"
              select
              variant="outlined"
              size="small"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
            >
              <MenuItem value="Grade 1">Grade 1</MenuItem>
              <MenuItem value="Grade 2">Grade 2</MenuItem>
              <MenuItem value="Grade 3">Grade 3</MenuItem>
            </TextField>
            <TextField
              label="Section"
              select
              variant="outlined"
              size="small"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '200px' }}
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
            </TextField>
          </Box>

          {/* Chart Section */}
          <Paper sx={{ 
            padding: 2, 
            borderRadius: '15px', 
            border: '1px solid #A85858', 
            marginBottom: 3,
            height: 'auto',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Export Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              marginBottom: 2 
            }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#FFC107',
                  },
                }}
              >
                Export PDF
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#A85858',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#8B3D3D',
                  },
                }}
              >
                Export Excel
              </Button>
            </Box>

            {/* Chart Container */}
            <Box sx={{ 
              flexGrow: 1,
              height: '300px',
              width: '100%',
              position: 'relative',
              marginTop: '-10px'
            }}>
              <ChartComponent 
                data={getChartData()} 
                options={chartOptions}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default Analytics;
