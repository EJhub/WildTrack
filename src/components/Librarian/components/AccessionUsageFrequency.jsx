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
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const AccessionUsageFrequency = ({ timeframe = 'weekly', gradeLevel = 'All Grades', section = '', academicYear = '' }) => {
  const [accessionFrequencyData, setAccessionFrequencyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processedData, setProcessedData] = useState([]);
  const [bookTitles, setBookTitles] = useState([]);

  // Define labels for days and months
  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyLabels = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December'
  ];

  // Generate colors for books
  const generateBookColor = (index) => {
    const hue = (index * 40) % 360; // Spread the colors around the color wheel
    return `hsl(${hue}, 70%, 60%)`;
  };

  useEffect(() => {
    const fetchAccessionData = async () => {
      try {
        setLoading(true);
        
        // Fetch all users
        const usersResponse = await axios.get('http://localhost:8080/api/users/all');
        if (usersResponse.status !== 200) {
          throw new Error('Failed to fetch users');
        }
        
        // Filter users based on gradeLevel
        const usersData = usersResponse.data;
        const filteredUsers =
          gradeLevel === 'All Grades'
            ? usersData
            : usersData.filter((user) => user.grade === gradeLevel || `Grade ${user.grade}` === gradeLevel);
            
        // Further filter by section if provided
        const sectionFilteredUsers = section
          ? filteredUsers.filter(user => user.section === section)
          : filteredUsers;
            
        // Further filter by academic year if provided
        const finalFilteredUsers = academicYear
          ? sectionFilteredUsers.filter(user => user.academicYear === academicYear)
          : sectionFilteredUsers;

        // Fetch all library hours
        const hoursResponse = await axios.get('http://localhost:8080/api/library-hours/all');
        if (hoursResponse.status !== 200) {
          throw new Error('Failed to fetch library hours');
        }
        
        const hoursData = hoursResponse.data;

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start of the week (Monday)
        startOfWeek.setHours(0, 0, 0, 0);

        const filteredLibraryHours = hoursData.filter((record) => {
          const recordDate = new Date(record.timeIn);

          // Exclude records with null or invalid dates or no book title
          if (isNaN(recordDate) || !record.bookTitle) return false;

          // Filter weekly: restrict to current week
          const isWithinWeek =
            timeframe === 'weekly' && recordDate >= startOfWeek && recordDate <= today;

          // Filter monthly: restrict to current year
          const isWithinYear =
            timeframe === 'monthly' && recordDate.getFullYear() === today.getFullYear();

          // Combine user filtering with timeframe filtering
          return (
            finalFilteredUsers.some((user) => user.idNumber === record.idNumber) &&
            (isWithinWeek || isWithinYear)
          );
        });

        setAccessionFrequencyData(filteredLibraryHours);
        setError('');
      } catch (err) {
        console.error('Error fetching accession frequency data:', err);
        setError('Failed to fetch accession usage data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessionData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAccessionData, 300000);
    return () => clearInterval(interval);
  }, [timeframe, gradeLevel, section, academicYear]);

  // Process the data for the chart
  useEffect(() => {
    if (!accessionFrequencyData || accessionFrequencyData.length === 0) {
      setProcessedData([]);
      setBookTitles([]);
      return;
    }

    try {
      // Get current labels based on timeframe
      const labels = timeframe === 'weekly' ? weeklyLabels : monthlyLabels;
      
      // Process filtered library hours to group by book titles and days/months
      const bookUsageByDay = {};

      accessionFrequencyData.forEach((record) => {
        const dayOrMonth =
          timeframe === 'weekly'
            ? new Date(record.timeIn).toLocaleString('en-US', { weekday: 'long' })
            : new Date(record.timeIn).toLocaleString('en-US', { month: 'long' });

        if (!bookUsageByDay[record.bookTitle]) {
          bookUsageByDay[record.bookTitle] = Array(labels.length).fill(0);
        }

        const index = labels.indexOf(dayOrMonth);
        if (index !== -1) {
          bookUsageByDay[record.bookTitle][index] += 1;
        }
      });

      // Remove book titles with all zero values
      const filteredBookUsage = Object.entries(bookUsageByDay).filter(([_, data]) =>
        data.some((value) => value > 0)
      );

      // Extract book titles
      const titles = filteredBookUsage.map(([title]) => title);
      setBookTitles(titles);

      // Format data for recharts (needs to be restructured)
      const formattedData = labels.map((label, index) => {
        const dataPoint = { name: label };
        
        filteredBookUsage.forEach(([bookTitle, data]) => {
          dataPoint[bookTitle] = data[index];
        });
        
        return dataPoint;
      });
      
      setProcessedData(formattedData);
    } catch (err) {
      console.error('Error processing accession frequency data:', err);
      setError('Failed to process accession usage data.');
    }
  }, [accessionFrequencyData, timeframe]);

  // Calculate the maximum value for y-axis based on real data
  const getYAxisDomain = () => {
    if (processedData.length === 0 || bookTitles.length === 0) return [0, 10];
    
    // For stacked bar chart, we need to calculate the maximum stack total
    const maxStackTotal = Math.max(...processedData.map(dataPoint => {
      return bookTitles.reduce((sum, book) => sum + (dataPoint[book] || 0), 0);
    }));
    
    // Round up to nearest 5 for a cleaner chart
    return [0, Math.ceil(maxStackTotal / 5) * 5 || 10];
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
      ) : processedData.length === 0 || bookTitles.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Typography>No accession usage data available</Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: 400 }}>
          {/* Legend is automatically generated by recharts */}
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={processedData}
              margin={{ top: 25, right: 80, left: 40, bottom: 50 }}
              stackOffset="sign"
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
                  value: 'Number of Usages', 
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
                formatter={(value, name) => [`${value} uses`, name]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '10px'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{
                  paddingLeft: 20,
                  fontSize: 12,
                  maxHeight: 300,
                  overflowY: 'auto'
                }}
              />
              
              {/* Create a Bar for each book title */}
              {bookTitles.map((book, index) => (
                <Bar 
                  key={book}
                  dataKey={book} 
                  stackId="a"
                  fill={generateBookColor(index)}
                  stroke={generateBookColor(index)}
                  strokeWidth={1}
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default AccessionUsageFrequency;