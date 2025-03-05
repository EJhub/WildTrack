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

const MostReadBooksView = () => {
  const [mostReadData, setMostReadData] = useState({ labels: [], datasets: [] });
  const [highestRatedData, setHighestRatedData] = useState({ labels: [], datasets: [] });
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
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch academic years
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      try {
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/all', config);
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);
      } catch (error) {
        console.error('Error fetching academic years:', error);
        // Don't show error toast for this - non-critical
      }
      
      // Fetch user data if available
      if (user && user.idNumber) {
        await fetchUserSpecificData(user.idNumber);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSpecificData = async (idNumber) => {
    try {
      setLoading(true);
      
      // Configure axios with auth token
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Call the user-specific endpoints
      const mostReadResponse = await axios.get(`http://localhost:8080/api/analytics/most-read-books/${idNumber}`, config);
      const highestRatedResponse = await axios.get(`http://localhost:8080/api/analytics/highest-rated-books/${idNumber}`, config);

      // Process most read books data
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

      // Process highest rated books data
      setHighestRatedData({
        labels: highestRatedResponse.data.map((book) => book.bookTitle),
        datasets: [
          {
            label: 'Your Rating',
            data: highestRatedResponse.data.map((book) => book.averageRating),
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching user book data:', error);
      toast.error('Failed to load your book data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    if (!user || !user.idNumber) return;
    
    try {
      setLoading(true);
      
      // Build the query parameters
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      
      // Get token
      const token = localStorage.getItem('token');
      
      // Fetch filtered data
      const mostReadResponse = await axios.get(
        `http://localhost:8080/api/analytics/most-read-books/${user.idNumber}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const highestRatedResponse = await axios.get(
        `http://localhost:8080/api/analytics/highest-rated-books/${user.idNumber}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update chart data
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
            label: 'Your Rating',
            data: highestRatedResponse.data.map((book) => book.averageRating),
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1,
          },
        ],
      });
      
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
    if (user && user.idNumber) {
      fetchUserSpecificData(user.idNumber);
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
              ':hover': { backgroundColor: '#FFFF00' },
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
          <CircularProgress />
        </Box>
      ) : (
        <>
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
              Your Most Read Books
            </Typography>
            
            {mostReadData.labels.length === 0 ? (
              <Box sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="body1">
                  You haven't read any books yet. Start reading to see your statistics!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: '400px' }}>
                <Bar data={mostReadData} options={chartOptions} />
              </Box>
            )}
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
              Your Highest Rated Books
            </Typography>
            
            {highestRatedData.labels.length === 0 ? (
              <Box sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="body1">
                  You haven't rated any books yet. Rate books to see your preferences!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: '400px' }}>
                <Bar data={highestRatedData} options={chartOptions} />
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default MostReadBooksView;