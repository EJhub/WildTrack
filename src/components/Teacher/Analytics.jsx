import React, { useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import { Box, Typography, Button, Paper, MenuItem, Select } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('Weekly');
  const [chartType, setChartType] = useState('Bar');

  const chartData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Weekly',
        data: [450, 300, 400, 150, 500, 600, 200],
        backgroundColor: ['#8B4513', '#DAA520', '#32CD32', '#FF6347', '#4B0082', '#8B0000', '#000000'],
        borderColor: '#000',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            padding: 3,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'hidden', // Prevents unnecessary overflow
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left', marginBottom: 3 }}
          >
            Analytics
          </Typography>

          {/* Timeframe Buttons */}
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
            {['Weekly', 'Monthly', 'Yearly'].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? 'contained' : 'outlined'}
                onClick={() => setTimeframe(period)}
                sx={{
                  backgroundColor: timeframe === period ? '#FFD700' : 'transparent',
                  color: '#000',
                  border: '1px solid #000',
                  borderRadius: '10px',
                  '&:hover': {
                    backgroundColor: '#FFD700',
                    color: '#000',
                  },
                }}
              >
                {period}
              </Button>
            ))}
          </Box>

          {/* Chart Container */}
          <Paper
            sx={{
              flexGrow: 1,
              position: 'relative',
              padding: 2,
              backgroundColor: 'rgba(215, 101, 101, 0.8)',
              borderRadius: '15px',
              overflow: 'auto',
            }}
          >
            {/* Dropdown positioned in the top-left corner */}
            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
              <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                sx={{ backgroundColor: '#FFD700', color: '#000', borderRadius: '10px', padding: '0 10px' }}
                variant="outlined"
              >
                <MenuItem value="Bar">Bar Chart</MenuItem>
                <MenuItem value="Line">Line Chart</MenuItem>
                {/* Add more chart types if necessary */}
              </Select>
            </Box>

            <Typography
              variant="h6"
              sx={{ color: '#000', textAlign: 'center', marginBottom: 2 }}
            >
              Students doing Library Hours
            </Typography>
            <Box sx={{ height: 'calc(100% - 50px)' }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default Analytics;
