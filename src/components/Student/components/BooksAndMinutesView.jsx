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
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    academicYear: ''
  });
  
  // Get the authenticated user information
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.idNumber) {
      fetchUserData(user.idNumber);
    } else {
      const idNumber = localStorage.getItem('idNumber');
      if (idNumber) {
        fetchUserData(idNumber);
      } else {
        toast.error('User information not available');
        setLoading(false);
      }
    }
  }, [user]);

  const fetchUserData = async (idNumber) => {
    try {
      setLoading(true);
      
      // Configure axios with auth token
      const token = localStorage.getItem('token');
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

      setBooksReadData(booksReadResponse.data);
      setMinutesSpentData(minutesSpentResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your reading analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
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
      
      // Update chart data
      setBooksReadData(booksReadResponse.data);
      setMinutesSpentData(minutesSpentResponse.data);
      
      toast.success('Filters applied successfully');
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
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
          type="date"
          variant="outlined"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '250px',
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
            borderRadius: '8px',
            width: '250px',
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
            borderRadius: '8px',
            width: '200px',
          }}
        >
          <MenuItem value="">All Years</MenuItem>
          <MenuItem value="2023-2024">2023-2024</MenuItem>
          <MenuItem value="2022-2023">2022-2023</MenuItem>
        </TextField>
        <Button
          variant="contained"
          onClick={applyFilters}
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 5 }}>
          <CircularProgress />
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
              <Box sx={{ padding: 4, textAlign: 'center' }}>
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
              <Box sx={{ padding: 4, textAlign: 'center' }}>
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