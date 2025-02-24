import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MostReadBooksView = () => {
  const [mostReadData, setMostReadData] = useState({ labels: [], datasets: [] });
  const [highestRatedData, setHighestRatedData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const mostReadResponse = await axios.get('http://localhost:8080/api/analytics/most-read-books');
      const highestRatedResponse = await axios.get('http://localhost:8080/api/analytics/highest-rated-books');

      setMostReadData({
        labels: mostReadResponse.data.map((book) => book.bookTitle),
        datasets: [
          {
            label: 'Times Read',
            data: mostReadResponse.data.map((book) => book.timesRead),
            backgroundColor: 'rgba(255, 193, 7, 0.8)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1,
          },
        ],
      });

      setHighestRatedData({
        labels: highestRatedResponse.data.map((book) => book.bookTitle),
        datasets: [
          {
            label: 'Average Rating',
            data: highestRatedResponse.data.map((book) => book.averageRating),
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', paddingBottom: '2rem' }}>
      {/* Filters Section */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          marginBottom: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField
          label="Date From"
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '250px',
          }}
        />
        <TextField
          label="Date To"
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '250px',
          }}
        />
        <TextField
          label="Academic Year"
          select
          variant="outlined"
          size="small"
          defaultValue=""
          sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '200px',
          }}
        >
          <MenuItem value="2023-2024">2023-2024</MenuItem>
          <MenuItem value="2022-2023">2022-2023</MenuItem>
        </TextField>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#FFD700',
            color: 'black',
            fontWeight: 'bold',
            ':hover': { backgroundColor: '#FFFF00' },
            width: '100px',
          }}
        >
          Filter
        </Button>
      </Box>

      {/* Chart 1: Most Read Books */}
      <Paper
        sx={{
          padding: 3,
          width: '80%',
          maxWidth: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => console.log('Export to PDF')}
            sx={{
              padding: '6px 12px',
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => console.log('Export to Excel')}
            sx={{
              padding: '6px 12px',
            }}
          >
            Export Excel
          </Button>
        </Box>

        <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold', marginBottom: 2 }}>
          Most Read Books
        </Typography>
        <Box sx={{ height: '400px' }}>
          <Bar data={mostReadData} options={chartOptions} />
        </Box>
      </Paper>

      {/* Chart 2: Highest Rated Books */}
      <Paper
        sx={{
          padding: 3,
          width: '80%',
          maxWidth: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          margin: '0 auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => console.log('Export to PDF')}
            sx={{
              padding: '6px 12px',
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => console.log('Export to Excel')}
            sx={{
              padding: '6px 12px',
            }}
          >
            Export Excel
          </Button>
        </Box>

        <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold', marginBottom: 2 }}>
          Highest Rated Books
        </Typography>
        <Box sx={{ height: '400px' }}>
          <Bar data={highestRatedData} options={chartOptions} />
        </Box>
      </Paper>
    </Box>
  );
};

export default MostReadBooksView;