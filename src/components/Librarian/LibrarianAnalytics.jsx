import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const Analytics = () => {
  const [chartType, setChartType] = useState('bar');
  const [timeframe, setTimeframe] = useState('weekly');
  const [gradeLevel, setGradeLevel] = useState('All Grades');
  const [section, setSection] = useState('All Sections');
  const [selectedGraph, setSelectedGraph] = useState('participants');
  const [libraryHoursData, setLibraryHoursData] = useState([]);
  const [accessionFrequencyData, setAccessionFrequencyData] = useState({});
  const [error, setError] = useState('');

  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyLabels = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch data for "Active Library Hours Participants"
  useEffect(() => {
    const fetchLibraryHoursData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/library-hours/all');
        setLibraryHoursData(response.data || []);
      } catch (error) {
        console.error('Error fetching library hours data:', error);
        setError('Failed to fetch library hours data.');
      }
    };

    fetchLibraryHoursData();
  }, []);

  // Fetch data for "Accession Usage Frequency"
  useEffect(() => {
    const fetchAccessionFrequencyData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/library-hours/analytics/accession-usage', {
          params: { timeframe, grade: gradeLevel },
        });
        setAccessionFrequencyData(response.data || {});
      } catch (error) {
        console.error('Error fetching accession frequency data:', error);
        setError('Failed to fetch accession usage data.');
      }
    };

    fetchAccessionFrequencyData();
  }, [timeframe, gradeLevel]);

  const handleSectionChange = (event) => {
    setSection(event.target.value);
  };

  // Filtering and grouping logic for "Active Library Hours Participants"
  const filteredLibraryHoursData = libraryHoursData.filter((record) => {
    const recordDate = new Date(record.timeIn);
    const isWithinWeek =
      timeframe === 'weekly' &&
      new Date().setDate(new Date().getDate() - new Date().getDay()) <= recordDate &&
      recordDate <= new Date();
    const isWithinMonth =
      timeframe === 'monthly' &&
      recordDate.getFullYear() === new Date().getFullYear();
    const matchesGrade = gradeLevel === 'All Grades' || record.grade === gradeLevel;
    const matchesSection = section === 'All Sections' || record.section === section;

    return (isWithinWeek || isWithinMonth) && matchesGrade && matchesSection;
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

  const participantsLabels = averageLibraryHoursData.map((item) => item.label);
  const participantsData = averageLibraryHoursData.map((item) => item.average);

  // Data for "Accession Usage Frequency"
  const frequencyLabels = Object.keys(accessionFrequencyData);
  const frequencyData = Object.values(accessionFrequencyData);

  const dayColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FF8633', '#33FFF5', '#A833FF'
  ];

  const monthColors = [
    '#FF5733', '#FF8D33', '#FFC133', '#E8FF33', '#A8FF33', '#33FF57', '#33FF8D',
    '#33FFC1', '#33E8FF', '#33A8FF', '#3357FF', '#8D33FF'
  ];

  const graphData = {
    participants: {
      labels: participantsLabels,
      datasets: [
        {
          label: 'Average Minutes',
          data: participantsData,
          backgroundColor: timeframe === 'weekly'
            ? weeklyLabels.map((_, index) => dayColors[index % dayColors.length])
            : monthlyLabels.map((_, index) => monthColors[index % monthColors.length]),
          borderColor: timeframe === 'weekly'
            ? weeklyLabels.map((_, index) => dayColors[index % dayColors.length])
            : monthlyLabels.map((_, index) => monthColors[index % monthColors.length]),
          borderWidth: 1,
        },
      ],
    },
    frequency: {
      labels: frequencyLabels,
      datasets: [
        {
          label: 'Usage Count',
          data: frequencyData,
          backgroundColor: timeframe === 'weekly'
            ? weeklyLabels.map((_, index) => dayColors[index % dayColors.length])
            : monthlyLabels.map((_, index) => monthColors[index % monthColors.length]),
          borderColor: timeframe === 'weekly'
            ? weeklyLabels.map((_, index) => dayColors[index % dayColors.length])
            : monthlyLabels.map((_, index) => monthColors[index % monthColors.length]),
          borderWidth: 1,
        },
      ],
    },
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
            const colors = timeframe === 'weekly' ? dayColors : monthColors;

            return labels.map((label, index) => ({
              text: label,
              fillStyle: colors[index % colors.length],
              strokeStyle: colors[index % colors.length],
              lineWidth: 1,
            }));
          },
        },
      },
      title: {
        display: true,
        text:
          selectedGraph === 'participants'
            ? 'Active Library Hours Participants'
            : 'Accession Usage Frequency',
      },
    },
    scales: chartType !== 'pie' ? { y: { beginAtZero: true } } : {},
  };

  const noDataMessage = selectedGraph === 'participants'
    ? 'No data available for Active Library Hours Participants.'
    : 'No data available for Accession Usage Frequency.';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <SideBar />
        <Box sx={{ flexGrow: 1, padding: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              marginBottom: 3,
              textAlign: 'left',
            }}
          >
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
            <Button
              variant={selectedGraph === 'completionRate' ? 'contained' : 'outlined'}
              onClick={() => setSelectedGraph('completionRate')}
            >
              LIBRARY HOURS COMPLETION RATE
            </Button>
          </Box>

          {/* Filters for selecting chart options */}
          <Box sx={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
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
{/* Export Buttons: Positioned above the graph, aligned right */}
<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 3 }}>
            <Button
              variant="outlined"
              onClick={() => alert('Export PDF functionality coming soon!')}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              onClick={() => alert('Export Excel functionality coming soon!')}
            >
              Export Excel
            </Button>
          </Box>
          {/* Chart display */}
          <Paper sx={{ padding: 4 }}>
            {participantsData.every((value) => value === 0) && frequencyData.length === 0 ? (
              <Typography variant="h6" align="center">
                {noDataMessage}
              </Typography>
            ) : (
              <>
                {chartType === 'bar' && <Bar data={graphData[selectedGraph]} options={options} />}
                {chartType === 'line' && <Line data={graphData[selectedGraph]} options={options} />}
                {chartType === 'pie' && <Pie data={graphData[selectedGraph]} options={options} />}
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Analytics;
