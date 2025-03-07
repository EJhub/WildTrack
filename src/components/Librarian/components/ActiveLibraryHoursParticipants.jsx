import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import axios from 'axios';

const LibraryHoursParticipants = ({ timeframe = 'weekly', gradeLevel = 'All Grades', section = '', academicYear = '' }) => {
  const [participantsData, setParticipantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processedData, setProcessedData] = useState([]);

  // Define labels for days and months
  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyLabels = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchParticipantsData = async () => {
      try {
        setLoading(true);
        
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (gradeLevel !== 'All Grades') {
          params.append('gradeLevel', gradeLevel);
        }
        if (timeframe) {
          params.append('timeframe', timeframe);
        }
        if (section) {
          params.append('section', section);
        }
        if (academicYear) {
          params.append('academicYear', academicYear);
        }

        // Fetch data from the API with query parameters
        const url = `http://localhost:8080/api/statistics/active-participants${params.toString() ? `?${params.toString()}` : ''}`;
        console.log("Fetching participants data from:", url);
        
        const response = await axios.get(url);
        
        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        console.log("API Response:", response.data);
        setParticipantsData(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching participants data:', err);
        setError('Failed to fetch library hours participants data.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantsData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchParticipantsData, 300000);
    return () => clearInterval(interval);
  }, [timeframe, gradeLevel, section, academicYear]);

  // Process the data for the chart
  useEffect(() => {
    if (!participantsData || participantsData.length === 0) {
      setProcessedData([]);
      return;
    }

    try {
      if (timeframe === 'weekly') {
        // For weekly data
        if (participantsData[0] && participantsData[0].hasOwnProperty('day')) {
          // Direct use of daily data
          const dayData = {};
          
          // Initialize all days with zero values
          weeklyLabels.forEach(day => {
            dayData[day] = 0;
          });
          
          // Fill in actual data where available
          participantsData.forEach(item => {
            if (item.day && dayData.hasOwnProperty(item.day)) {
              dayData[item.day] = item.participants;
            }
          });
          
          // Format data for chart using real data from API
          setProcessedData(weeklyLabels.map(day => {
            return {
              name: day,
              value: dayData[day] || 0
            };
          }));
        } else {
          // If we only have monthly data, create a placeholder weekly distribution
          setProcessedData(weeklyLabels.map((day, index) => ({
            name: day,
            value: 0 // Set all to zero initially
          })));
          
          console.warn("Weekly data not available from API, showing empty chart");
        }
      } else {
        // For monthly data, the API returns month abbreviations
        // Map the abbreviations to full month names for better display
        const monthMap = {
          'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
          'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
          'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
        };
        
        // Format data for chart
        setProcessedData(participantsData.map(item => ({
          name: monthMap[item.month] || item.month,
          value: item.participants
        })));
      }
    } catch (err) {
      console.error('Error processing participants data:', err);
      setError('Failed to process library hours participants data.');
    }
  }, [participantsData, timeframe]);

  // Calculate the maximum value for y-axis based on real data
  const getYAxisDomain = () => {
    if (processedData.length === 0) return [0, 100];
    
    const maxValue = Math.max(...processedData.map(item => item.value));
    // Round up to nearest 100 for a cleaner chart
    return [0, Math.ceil(maxValue / 100) * 100 || 100];
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: 400
    }}>      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : processedData.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Typography>No participants data available</Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: 400 }}>
          {/* Legend at the top right */}
          <Box sx={{ 
            position: 'absolute', 
            right: 20, 
            top: 0, 
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Legend:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: '#E57373', 
                borderRadius: '2px' 
              }} />
              <Typography variant="body2">
                Students
              </Typography>
            </Box>
          </Box>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={processedData}
              margin={{ top: 25, right: 30, left: 40, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#000000', fontSize: 12 }}
                axisLine={{ stroke: '#000000' }}
                tickLine={{ stroke: '#000000' }}
                label={{ 
                  value: 'Days of the Week', 
                  position: 'insideBottom',
                  offset: -5,
                  fontSize: 14,
                  fill: '#000000'
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Students', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 0,
                  fontSize: 14,
                  fill: '#000000'
                }}
                domain={getYAxisDomain()}
                tick={{ fill: '#000000', fontSize: 12 }}
                axisLine={{ stroke: '#000000' }}
                tickLine={{ stroke: '#000000' }}
              />
              <RechartsTooltip 
                formatter={(value) => [`${value} students`, '']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '10px'
                }}
              />
              <Bar 
                dataKey="value" 
                name="Students"
                fill="#E57373"
                radius={[0, 0, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default LibraryHoursParticipants;