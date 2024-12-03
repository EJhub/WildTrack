import React, { useState, useEffect } from 'react';
import { Box, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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

const ActiveLibraryHoursParticipants = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [libraryHours, setLibraryHours] = useState([]);
  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyLabels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  useEffect(() => {
    const fetchLibraryHours = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/library-hours/average-minutes');
        if (!response.ok) throw new Error('Failed to fetch library hours');
        const data = await response.json();
        setLibraryHours(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLibraryHours();
  }, []);

  const groupedData = libraryHours.reduce((acc, record) => {
    const recordDate = new Date(record.timeIn);
    const key =
      timeframe === 'weekly'
        ? recordDate.toLocaleString('default', { weekday: 'long' })
        : recordDate.toLocaleString('default', { month: 'long' });

    const timeIn = new Date(record.timeIn);
    const timeOut = new Date(record.timeOut);
    const minutesSpent = timeOut > timeIn ? (timeOut - timeIn) / (1000 * 60) : 0;

    if (!acc[key]) acc[key] = [];
    acc[key].push(minutesSpent);
    return acc;
  }, {});

  const averageMinutesByTimeframe =
    timeframe === 'weekly'
      ? weeklyLabels.map((label) => ({
          label,
          average: groupedData[label]
            ? groupedData[label].reduce((sum, minutes) => sum + minutes, 0) / groupedData[label].length
            : 0,
        }))
      : monthlyLabels.map((label) => ({
          label,
          average: groupedData[label]
            ? groupedData[label].reduce((sum, minutes) => sum + minutes, 0) / groupedData[label].length
            : 0,
        }));

  const chartLabels = averageMinutesByTimeframe.map((item) => item.label);
  const chartData = averageMinutesByTimeframe.map((item) => item.average);

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Average Minutes',
        data: chartData,
        backgroundColor: '#CD6161',
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
        text: 'Active Library Hours Participants',
      },
    },
  };

  return (
    <Box>
      <Paper sx={{ padding: 4 }}>
        <Bar data={data} options={options} />
      </Paper>
    </Box>
  );
};

export default ActiveLibraryHoursParticipants;
