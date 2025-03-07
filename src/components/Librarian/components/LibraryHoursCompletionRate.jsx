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

const LibraryHoursCompletionRate = ({ timeframe = 'weekly', gradeLevel = 'All Grades', section = '', academicYear = '' }) => {
  const [completionRateData, setCompletionRateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define labels for days and months - include all 7 days of the week
  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyLabels = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchCompletionRateData = async () => {
      try {
        setLoading(true);
        
        // Build query parameters based on filters
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

        // Fetch data with query parameters
        const url = `http://localhost:8080/api/statistics/completion-rate${params.toString() ? `?${params.toString()}` : ''}`;
        console.log("Fetching data from:", url);
        
        const response = await axios.get(url);
        
        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        console.log("API Response:", response.data);
        setCompletionRateData(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching completion rate data:', err);
        setError('Failed to fetch library hours completion rate data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionRateData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchCompletionRateData, 300000);
    return () => clearInterval(interval);
  }, [timeframe, gradeLevel, section, academicYear]);

  // Format and normalize data for the chart
  const formatChartData = () => {
    if (!completionRateData || completionRateData.length === 0) {
      return [];
    }

    // Check if we have day-based data (weekly) or month-based data
    const isWeeklyData = completionRateData[0].hasOwnProperty('day');
    
    // Map month abbreviations to full names if needed
    const monthMap = {
      'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
      'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
      'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
    };
    
    if (isWeeklyData) {
      // For weekly data, ensure we have all days of the week with proper ordering
      const dayData = {};
      
      // Initialize all days with zero values
      weeklyLabels.forEach(day => {
        dayData[day] = 0;
      });
      
      // Fill in actual data where available
      completionRateData.forEach(item => {
        if (item.day && dayData.hasOwnProperty(item.day)) {
          dayData[item.day] = item.rate;
        }
      });
      
      // Convert to array format for the chart
      return weeklyLabels.map(day => ({
        name: day,
        rate: dayData[day]
      }));
    } else {
      // For monthly data
      return completionRateData.map(item => {
        // Convert 3-letter month to full name if needed
        const monthKey = item.month.toUpperCase();
        const fullMonthName = monthMap[monthKey] || monthKey;
        
        return {
          name: fullMonthName,
          rate: item.rate
        };
      });
    }
  };

  const chartData = formatChartData();

  // Generate dynamic colors for the bars based on completion rate
  const getBarColor = (entry) => {
    const rate = entry.rate;
    if (rate >= 90) return '#4CAF50'; // Green for excellent
    if (rate >= 75) return '#8BC34A'; // Light green for good
    if (rate >= 60) return '#CDDC39'; // Lime for moderate
    if (rate >= 40) return '#FFEB3B'; // Yellow for fair
    if (rate >= 20) return '#FFC107'; // Amber for poor
    return '#FF5722'; // Deep orange for very poor
  };

  // Color legend data for completion rate ranges
  const legendItems = [
    { label: 'Excellent (90-100%)', color: '#4CAF50' },
    { label: 'Good (75-89%)', color: '#8BC34A' },
    { label: 'Moderate (60-74%)', color: '#CDDC39' },
    { label: 'Fair (40-59%)', color: '#FFEB3B' },
    { label: 'Poor (20-39%)', color: '#FFC107' },
    { label: 'Very Poor (0-19%)', color: '#FF5722' }
  ];

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
      ) : chartData.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Typography>No completion rate data available</Typography>
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
            flexDirection: 'column',
            gap: 0.5,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: 1,
            borderRadius: 1,
            boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            maxWidth: 200
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Legend:
            </Typography>
            {legendItems.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: item.color, 
                  borderRadius: '2px' 
                }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={chartData}
              margin={{ top: 25, right: 30, left: 40, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#000000', fontSize: 12 }}
                axisLine={{ stroke: '#000000' }}
                tickLine={{ stroke: '#000000' }}
                label={{ 
                  value: timeframe === 'weekly' ? 'Days of the Week' : 'Month', 
                  position: 'insideBottom',
                  offset: -5,
                  fontSize: 14,
                  fill: '#000000'
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Completion Rate (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 0,
                  fontSize: 14,
                  fill: '#000000'
                }}
                domain={[0, 100]}
                tick={{ fill: '#000000', fontSize: 12 }}
                axisLine={{ stroke: '#000000' }}
                tickLine={{ stroke: '#000000' }}
              />
              <RechartsTooltip 
                formatter={(value) => [`${value}%`, 'Completion Rate']}
                labelFormatter={(label) => timeframe === 'weekly' ? `Day: ${label}` : `Month: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '10px'
                }}
              />
              <Bar 
                dataKey="rate" 
                name="Completion Rate"
                radius={[0, 0, 0, 0]}
                barSize={timeframe === 'weekly' ? 40 : 25}
                animationDuration={1000}
                animationEasing="ease-in-out"
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default LibraryHoursCompletionRate;