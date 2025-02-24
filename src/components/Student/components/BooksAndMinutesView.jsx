import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BooksAndMinutesView = () => {
  const [booksReadData, setBooksReadData] = useState([]);
  const [minutesSpentData, setMinutesSpentData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const idNumber = localStorage.getItem('idNumber'); // Get the logged-in user's ID number from local storage or any other suitable method

      const booksReadResponse = await axios.get(`http://localhost:8080/api/analytics/books-read/${idNumber}`);
      const minutesSpentResponse = await axios.get(`http://localhost:8080/api/analytics/minutes-spent/${idNumber}`);

      setBooksReadData(booksReadResponse.data);
      setMinutesSpentData(minutesSpentResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatChartData = (data, label) => ({
    labels: data.map((entry) => entry.month),
    datasets: [
      {
        label,
        data: data.map((entry) => entry[label === 'Number of Books Read' ? 'booksRead' : 'minutesSpent']),
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
      },
    ],
  });

  const handleFilter = async () => {
    // Implement the filter logic based on the selected date range and academic year
    // You can make API calls with the filter parameters and update the chart data accordingly
    // For simplicity, let's assume the filter functionality is not implemented yet
    console.log('Filter clicked');
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
          onClick={handleFilter}
        >
          Filter
        </Button>
      </Box>

      {/* Chart 1: Number of Books Read */}
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
          Number of Books Read
        </Typography>
        <Bar
          data={formatChartData(booksReadData, 'Number of Books Read')}
          options={{
            maintainAspectRatio: true,
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          }}
        />
      </Paper>

      {/* Chart 2: Total Minutes Spent */}
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
          Total Minutes Spent
        </Typography>
        <Bar
          data={formatChartData(minutesSpentData, 'Minutes Spent')}
          options={{
            maintainAspectRatio: true,
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default BooksAndMinutesView;