import React, { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AccessionUsageFrequency = () => {
  const [libraryHours, setLibraryHours] = useState([]);

  useEffect(() => {
    const fetchLibraryHours = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/library-hours/all');
        if (!response.ok) throw new Error('Failed to fetch library hours');
        const data = await response.json();
        setLibraryHours(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLibraryHours();
  }, []);

  const accessionFrequency = libraryHours.reduce((acc, record) => {
    if (record.accessionNumber) {
      acc[record.accessionNumber] = (acc[record.accessionNumber] || 0) + 1;
    }
    return acc;
  }, {});

  const labels = Object.keys(accessionFrequency);
  const data = Object.values(accessionFrequency);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Usage Count',
        data,
        backgroundColor: '#61CD86',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Accession Usage Frequency',
      },
    },
  };

  return (
    <Box>
      <Paper sx={{ padding: 4 }}>
        <Bar data={chartData} options={options} />
      </Paper>
    </Box>
  );
};

export default AccessionUsageFrequency;
