import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';

const LibraryHoursParticipants = ({ timeframe, gradeLevel, section }) => {
  const [libraryHoursData, setLibraryHoursData] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyLabels = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FF8633', '#33FFF5', '#A833FF'
  ];

  const monthColors = [
    '#FF5733', '#FF8D33', '#FFC133', '#E8FF33', '#A8FF33', '#33FF57', '#33FF8D',
    '#33FFC1', '#33E8FF', '#33A8FF', '#3357FF', '#8D33FF'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch('http://localhost:8080/api/users/all');
        const usersData = await usersResponse.json();

        // Filter users based on gradeLevel
        const filteredUsers =
          gradeLevel === 'All Grades'
            ? usersData
            : usersData.filter((user) => user.grade === gradeLevel || `Grade ${user.grade}` === gradeLevel);

        setUsers(filteredUsers);

        // Fetch all library hours
        const hoursResponse = await fetch('http://localhost:8080/api/library-hours/all');
        const hoursData = await hoursResponse.json();

        // Cross-match library hours with filtered users
        const filteredLibraryHours = hoursData.filter((record) =>
          filteredUsers.some((user) => user.idNumber === record.idNumber)
        );

        setLibraryHoursData(filteredLibraryHours);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch library hours data.');
      }
    };

    fetchData();
  }, [gradeLevel]);

  // Filter and group data for the chart
  const filteredLibraryHoursData = libraryHoursData.filter((record) => {
    const recordDate = new Date(record.timeIn);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday of this week
    startOfWeek.setHours(0, 0, 0, 0);

    const isWithinWeek =
      timeframe === 'weekly' &&
      recordDate >= startOfWeek &&
      recordDate <= new Date();

    const isWithinMonth =
      timeframe === 'monthly' &&
      recordDate.getFullYear() === new Date().getFullYear();

    return isWithinWeek || isWithinMonth;
  });

  const groupedLibraryHoursData = filteredLibraryHoursData.reduce((acc, record) => {
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

  const averageLibraryHoursData =
    timeframe === 'weekly'
      ? weeklyLabels.map((label) => ({
          label,
          average: groupedLibraryHoursData[label]
            ? groupedLibraryHoursData[label].reduce((sum, minutes) => sum + minutes, 0) / groupedLibraryHoursData[label].length
            : 0,
        }))
      : monthlyLabels.map((label) => ({
          label,
          average: groupedLibraryHoursData[label]
            ? groupedLibraryHoursData[label].reduce((sum, minutes) => sum + minutes, 0) / groupedLibraryHoursData[label].length
            : 0,
        }));

  // Apply dynamic colors based on the timeframe
  const colors = timeframe === 'weekly' ? dayColors : monthColors;

  const chartData = {
    labels: averageLibraryHoursData.map((item) => item.label),
    datasets: [
      {
        label: 'Average Minutes',
        data: averageLibraryHoursData.map((item) => item.average),
        backgroundColor: colors.slice(0, averageLibraryHoursData.length),
        borderColor: colors.slice(0, averageLibraryHoursData.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          generateLabels: (chart) => {
            const labels = timeframe === 'weekly' ? weeklyLabels : monthlyLabels;
            const colorSet = timeframe === 'weekly' ? dayColors : monthColors;

            return labels.map((label, index) => ({
              text: label,
              fillStyle: colorSet[index % colorSet.length],
              strokeStyle: colorSet[index % colorSet.length],
              lineWidth: 1,
            }));
          },
        },
      },
      title: {
        display: true,
        text: `Active Library Hours Participants (${timeframe === 'weekly' ? 'Weekly' : 'Monthly'})`,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <Box>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </Box>
  );
};

export default LibraryHoursParticipants;
