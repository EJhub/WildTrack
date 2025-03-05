import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { AuthContext } from '../../AuthContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const BooksAndMinutesView = () => {
  const [booksReadData, setBooksReadData] = useState([]);
  const [minutesSpentData, setMinutesSpentData] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    academicYear: ''
  });
  
  // Get the authenticated user information
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch academic years and user data
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Fetch Academic Years
      try {
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/all', config);
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);
      } catch (error) {
        console.error('Error fetching academic years:', error);
        // Don't show error toast for this - non-critical
      }
      
      // Get user ID and fetch user data
      const idNumber = user?.idNumber || localStorage.getItem('idNumber');
      if (idNumber) {
        await fetchUserData(idNumber, token);
      } else {
        toast.error('User information not available');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Error in initial data loading:', error);
      setLoading(false);
    }
  };

  const fetchUserData = async (idNumber, token) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Call the user-specific endpoints
      const booksReadResponse = await axios.get(
        `http://localhost:8080/api/analytics/books-read/${idNumber}`, 
        config
      );
      
      const minutesSpentResponse = await axios.get(
        `http://localhost:8080/api/analytics/minutes-spent/${idNumber}`,
        config
      );

      // Sort data by month for proper chronological display
      const sortedBooksData = sortDataByMonth(booksReadResponse.data);
      const sortedMinutesData = sortDataByMonth(minutesSpentResponse.data);

      setBooksReadData(sortedBooksData);
      setMinutesSpentData(sortedMinutesData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your reading analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to sort data by month chronologically
  const sortDataByMonth = (data) => {
    // Define month order for sorting
    const monthOrder = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    return [...data].sort((a, b) => {
      // Split month and year
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      // Compare years first
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      
      // If years are the same, compare months
      return monthOrder[aMonth] - monthOrder[bMonth];
    });
  };

  const formatChartData = (data, label) => ({
    labels: data.map((entry) => entry.month),
    datasets: [
      {
        label,
        data: data.map((entry) => entry[label === 'Number of Books Read' ? 'booksRead' : 'minutesSpent']),
        backgroundColor: label === 'Number of Books Read' 
          ? 'rgba(220, 53, 69, 0.8)' 
          : 'rgba(255, 193, 7, 0.8)',
        borderColor: label === 'Number of Books Read' 
          ? 'rgba(220, 53, 69, 1)' 
          : 'rgba(255, 193, 7, 1)',
        borderWidth: 1,
      },
    ],
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    const idNumber = user?.idNumber || localStorage.getItem('idNumber');
    
    if (!idNumber) {
      toast.error('User information not available');
      return;
    }
    
    try {
      setLoading(true);
      
      // Build the query parameters
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      
      // Get token
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch filtered data
      const booksReadResponse = await axios.get(
        `http://localhost:8080/api/analytics/books-read/${idNumber}?${params.toString()}`,
        config
      );
      
      const minutesSpentResponse = await axios.get(
        `http://localhost:8080/api/analytics/minutes-spent/${idNumber}?${params.toString()}`,
        config
      );
      
      // Sort and update chart data
      const sortedBooksData = sortDataByMonth(booksReadResponse.data);
      const sortedMinutesData = sortDataByMonth(minutesSpentResponse.data);
      
      setBooksReadData(sortedBooksData);
      setMinutesSpentData(sortedMinutesData);
      
      toast.success('Filters applied successfully');
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      academicYear: ''
    });
    
    // Re-fetch original data
    const idNumber = user?.idNumber || localStorage.getItem('idNumber');
    const token = localStorage.getItem('token');
    if (idNumber && token) {
      fetchUserData(idNumber, token);
    }
  };

  const exportToPDF = () => {
    // Implement PDF export functionality
    toast.info('PDF export functionality will be implemented soon');
  };

  const exportToExcel = () => {
    // Implement Excel export functionality
    toast.info('Excel export functionality will be implemented soon');
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

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          marginBottom: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginLeft: 2
        }}
      >
        <TextField
          label="Date From"
          type="date"
          variant="outlined"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '200px',
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Date To"
          type="date"
          variant="outlined"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '200px',
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Academic Year"
          select
          variant="outlined"
          name="academicYear"
          value={filters.academicYear}
          onChange={handleFilterChange}
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '150px',
          }}
        >
          <MenuItem value="">All Years</MenuItem>
          {academicYearOptions.map((year, index) => (
            <MenuItem key={index} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={applyFilters}
            sx={{
              backgroundColor: '#FFD700',
              color: 'black',
              fontWeight: 'bold',
              ':hover': { backgroundColor: '#FFC107' },
            }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            onClick={resetFilters}
            sx={{
              borderColor: '#FFD700',
              color: 'black',
              ':hover': { 
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderColor: '#FFD700'
              },
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 5 }}>
          <CircularProgress sx={{ color: '#781B1B' }} />
        </Box>
      ) : (
        <>
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
                onClick={exportToPDF}
                sx={{
                  padding: '6px 12px',
                }}
              >
                Export PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={exportToExcel}
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
            
            {booksReadData.length === 0 ? (
              <Box sx={{ padding: 4, textAlign: 'center', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1">
                  No book reading data available for the selected period.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: '400px' }}>
                <Bar 
                  data={formatChartData(booksReadData, 'Number of Books Read')} 
                  options={chartOptions} 
                />
              </Box>
            )}
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
              marginTop: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={exportToPDF}
                sx={{
                  padding: '6px 12px',
                }}
              >
                Export PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={exportToExcel}
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
            
            {minutesSpentData.length === 0 ? (
              <Box sx={{ padding: 4, textAlign: 'center', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1">
                  No library hours data available for the selected period.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: '400px' }}>
                <Bar 
                  data={formatChartData(minutesSpentData, 'Minutes Spent')} 
                  options={chartOptions} 
                />
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default BooksAndMinutesView;