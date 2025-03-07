import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  Select,
  CircularProgress,
  Chip
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { AuthContext } from '../../AuthContext'; // Import AuthContext
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LibraryHoursCompletionRate = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');
  const [dataView, setDataView] = useState('Weekly');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Available sections based on selected grade
  const [availableSections, setAvailableSections] = useState([]);
  
  // Teacher information state
  const [teacherGradeLevel, setTeacherGradeLevel] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherSection, setTeacherSection] = useState('');
  
  // Error state
  const [error, setError] = useState(null);
  
  // Get user context
  const { user } = useContext(AuthContext);
  
  // Chart data state
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Completion Rate',
      data: [],
      backgroundColor: '#FFD700',
      borderColor: '#000',
      borderWidth: 1,
    }]
  });
  
  // Track applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    section: '',
    academicYear: '',
    dateRange: { from: '', to: '' }
  });
  
  // Chart options state
  const [chartOptions, setChartOptions] = useState({
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Showing completion rate for all sections',
        padding: {
          top: 10,
          bottom: 10
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Completion Rate (%)',
        },
        grid: {
          color: '#E0E0E0',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Timeline',
        },
        grid: {
          color: '#E0E0E0',
        },
      },
    },
  });
  
  // Fetch teacher info
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (!user || user.role !== 'Teacher' || !user.idNumber) {
        setError('You must be logged in as a teacher to view analytics');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/users/${user.idNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          // Format grade to match expected format (e.g., "2" to "Grade 2")
          if (response.data.grade) {
            const formattedGrade = response.data.grade.includes('Grade') 
              ? response.data.grade 
              : `Grade ${response.data.grade}`;
            
            setTeacherGradeLevel(formattedGrade);
            setGradeLevel(formattedGrade);
          }
          
          // Get teacher's subject
          if (response.data.subject) {
            setTeacherSubject(response.data.subject);
          }
          
          // Get teacher's section if assigned
          if (response.data.section) {
            setTeacherSection(response.data.section);
            setSection(response.data.section);
          }
        }
      } catch (err) {
        console.error('Error fetching teacher info:', err);
        setError('Failed to fetch teacher information');
        toast.error('Failed to fetch teacher information');
      }
    };

    fetchTeacherInfo();
  }, [user]);

  // Fetch available sections when grade level changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!gradeLevel) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8080/api/grade-sections/grade/${gradeLevel}`, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        if (response.data && response.data.length > 0) {
          setAvailableSections(response.data);
          console.log(`Fetched ${response.data.length} sections for ${gradeLevel}`);
        } else {
          setAvailableSections([]);
          console.log(`No sections found for ${gradeLevel}`);
        }
        
        // Reset section selection when grade level changes
        if (section && section !== '' && !teacherSection) {
          setSection('');
        }
      } catch (error) {
        console.error("Error fetching grade sections:", error);
        toast.error("Failed to fetch sections for the selected grade");
        setAvailableSections([]);
      }
    };
    
    fetchSections();
  }, [gradeLevel, teacherSection]);
  
  // Function to fetch completion rate data
  const fetchCompletionRateData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      
      // IMPORTANT: Always include teacher's subject - fixed from previous version
      if (teacherSubject) {
        queryParams.append('subject', teacherSubject);
      }
      
      // Add filter parameters
      if (params.gradeLevel || teacherGradeLevel) {
        queryParams.append('gradeLevel', params.gradeLevel || teacherGradeLevel);
      }
      
      if (params.section) {
        queryParams.append('section', params.section);
      }
      
      if (params.academicYear) {
        queryParams.append('academicYear', params.academicYear);
      }
      
      // Add the data view parameter
      queryParams.append('timeframe', dataView.toLowerCase());
      
      console.log('Fetching completion rate with params:', queryParams.toString());
      
      // Make API call to fetch completion rate data
      const url = `http://localhost:8080/api/statistics/completion-rate?${queryParams.toString()}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the data for the chart
      processChartData(response.data);
      
      // Display notification about applied filters
      if (params.section) {
        const grade = params.gradeLevel || teacherGradeLevel || gradeLevel;
        const subject = teacherSubject ? ` (${teacherSubject})` : '';
        toast.info(`Viewing completion rate for ${grade} - Section ${params.section}${subject}`);
      }
    } catch (err) {
      console.error('Error fetching completion rate data:', err);
      toast.error('Failed to fetch completion rate data');
      
      // Set empty chart data on error
      setChartData({
        labels: [],
        datasets: [{
          label: 'Completion Rate',
          data: [],
          backgroundColor: '#FFD700',
          borderColor: '#000',
          borderWidth: 1,
        }]
      });
    } finally {
      setLoading(false);
    }
  }, [dataView, gradeLevel, teacherGradeLevel, teacherSubject]);

  // Process data for the chart
  const processChartData = (data) => {
    if (!data || data.length === 0) {
      setChartData({
        labels: [],
        datasets: [{
          label: 'No Data Available',
          data: [],
          backgroundColor: '#FFD700',
          borderColor: '#000',
          borderWidth: 1,
        }]
      });
      return;
    }
    
    let labels = [];
    let values = [];
    
    if (dataView === 'Weekly') {
      // Process daily data
      // Weekly view - days of the week (Monday to Sunday)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      labels = days;
      
      // Map data to days
      const dayMap = {};
      data.forEach(item => {
        dayMap[item.day] = item.rate;
      });
      
      // Fill in values for all days
      values = days.map(day => dayMap[day] || 0);
    } else {
      // Process monthly data - months of the year (January to December)
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      // Map data to months (data comes with month abbreviations)
      const monthMap = {};
      data.forEach(item => {
        // Convert month abbreviation to month name
        const monthIndex = getMonthIndexFromAbbr(item.month);
        if (monthIndex >= 0) {
          monthMap[months[monthIndex]] = item.rate;
        }
      });
      
      labels = months;
      values = months.map(month => monthMap[month] || 0);
    }
    
    // Create dataset label with section and subject information
    const sectionInfo = appliedFilters.section ? ` - Section ${appliedFilters.section}` : '';
    const subjectInfo = teacherSubject ? ` (${teacherSubject})` : '';
    
    setChartData({
      labels,
      datasets: [{
        label: `Completion Rate${sectionInfo}${subjectInfo}`,
        data: values,
        backgroundColor: '#FFD700',
        borderColor: '#000',
        borderWidth: 1,
      }]
    });
  };
  
  // Helper to get month index from abbreviation
  const getMonthIndexFromAbbr = (abbr) => {
    const months = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    return months[abbr?.toUpperCase()] || -1;
  };

  // Fetch initial data when teacher info is available
  useEffect(() => {
    if (teacherGradeLevel) {
      fetchCompletionRateData({
        gradeLevel: teacherGradeLevel,
        section: teacherSection
      });
      
      // Set initial applied filters if teacher has assigned section
      if (teacherSection) {
        setAppliedFilters(prev => ({
          ...prev,
          section: teacherSection
        }));
      }
    }
  }, [teacherGradeLevel, teacherSection, teacherSubject, fetchCompletionRateData]);

  // Update chart title when filters change
  useEffect(() => {
    // Update chart options to reflect section filter and teacher subject
    const grade = gradeLevel || teacherGradeLevel || 'all grades';
    const subjectInfo = teacherSubject ? ` - ${teacherSubject}` : '';
    
    setChartOptions(prevOptions => ({
      ...prevOptions,
      plugins: {
        ...prevOptions.plugins,
        title: {
          ...prevOptions.plugins.title,
          text: appliedFilters.section 
            ? `Showing completion rate for ${grade} - Section ${appliedFilters.section}${subjectInfo}` 
            : `Showing completion rate for ${grade} - All Sections${subjectInfo}`
        }
      },
      scales: {
        ...prevOptions.scales,
        x: {
          ...prevOptions.scales.x,
          title: {
            ...prevOptions.scales.x.title,
            text: dataView === 'Weekly' 
              ? 'Days of the Week (Monday to Sunday)' 
              : 'Months of the Year (January to December)',
          }
        }
      }
    }));
  }, [appliedFilters.section, gradeLevel, teacherGradeLevel, teacherSubject, dataView]);

  // Handle filter button click
  const handleFilterClick = () => {
    // Update applied filters state
    setAppliedFilters({
      section: section,
      academicYear: academicYear,
      dateRange: { from: dateFrom, to: dateTo }
    });
    
    // Apply the filters to the data
    fetchCompletionRateData({
      gradeLevel,
      section,
      academicYear,
      dateFrom,
      dateTo
    });
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setSection('');
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setAppliedFilters({
      section: '',
      academicYear: '',
      dateRange: { from: '', to: '' }
    });
    
    // Refresh data with cleared filters
    fetchCompletionRateData({
      gradeLevel
    });
    
    toast.info('Filters cleared');
  };

  return (
    <>
      <ToastContainer />
      {/* Filter Section */}
      <Box sx={{ width: '100%', marginBottom: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Date From:</Typography>
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '180px' }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Date To:</Typography>
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px', width: '180px' }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Academic Year:</Typography>
            <FormControl sx={{ width: '180px' }}>
              <Select
                size="small"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
                displayEmpty
              >
                <MenuItem value="">Select Academic Year</MenuItem>
                <MenuItem value="2022-2023">2022-2023</MenuItem>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              sx={{
                borderRadius: '5px',
                borderColor: '#A85858',
                color: '#A85858',
                '&:hover': {
                  backgroundColor: 'rgba(168, 88, 88, 0.1)',
                },
              }}
              disabled={!appliedFilters.section && !appliedFilters.academicYear && !appliedFilters.dateRange.from && !appliedFilters.dateRange.to}
            >
              Clear
            </Button>
            
            <Button
              variant="contained"
              size="small"
              onClick={handleFilterClick}
              sx={{
                borderRadius: '5px',
                backgroundColor: '#A85858',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Grade Level:</Typography>
            <FormControl sx={{ width: '180px' }}>
              <Select
                size="small"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
                displayEmpty
                disabled={!!teacherGradeLevel} // Disable if teacher has assigned grade
              >
                <MenuItem value="">All Grades</MenuItem>
                <MenuItem value="Grade 1">Grade 1</MenuItem>
                <MenuItem value="Grade 2">Grade 2</MenuItem>
                <MenuItem value="Grade 3">Grade 3</MenuItem>
                <MenuItem value="Grade 4">Grade 4</MenuItem>
                <MenuItem value="Grade 5">Grade 5</MenuItem>
                <MenuItem value="Grade 6">Grade 6</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Section:</Typography>
            <FormControl sx={{ width: '180px' }}>
              <Select
                size="small"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
                displayEmpty
              >
                <MenuItem value="">All Sections</MenuItem>
                {availableSections.map((sectionItem) => (
                  <MenuItem key={sectionItem.id} value={sectionItem.sectionName}>
                    {sectionItem.sectionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Data View:</Typography>
            <FormControl sx={{ width: '180px' }}>
              <Select
                size="small"
                value={dataView}
                onChange={(e) => setDataView(e.target.value)}
                sx={{ backgroundColor: '#f1f1f1', borderRadius: '5px' }}
                displayEmpty
              >
                <MenuItem value="Weekly">Weekly (Monday to Sunday)</MenuItem>
                <MenuItem value="Monthly">Monthly (January to December)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
      
      {/* Active Filters Display */}
      {(appliedFilters.section || appliedFilters.academicYear || appliedFilters.dateRange.from || appliedFilters.dateRange.to || teacherGradeLevel || teacherSubject) && (
        <Box sx={{ mt: 1, mb: 2, p: 1.5, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">Active Filters and Context:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {teacherGradeLevel && (
              <Chip 
                label={`Grade: ${teacherGradeLevel}`} 
                size="small" 
                color="secondary" 
                variant="filled"
              />
            )}
            {teacherSubject && (
              <Chip 
                label={`Teacher Subject: ${teacherSubject}`} 
                size="small" 
                color="secondary" 
                variant="filled"
              />
            )}
            {appliedFilters.section && (
              <Chip 
                label={`Section: ${appliedFilters.section}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
            {appliedFilters.academicYear && (
              <Chip 
                label={`Academic Year: ${appliedFilters.academicYear}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
            {appliedFilters.dateRange.from && (
              <Chip 
                label={`From: ${appliedFilters.dateRange.from}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
            {appliedFilters.dateRange.to && (
              <Chip 
                label={`To: ${appliedFilters.dateRange.to}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}
      
      {/* Chart Section */}
      <Paper sx={{ padding: 3, borderRadius: '15px', border: '1px solid #ddd' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Library Hours Completion Rate
            {appliedFilters.section ? ` - Section ${appliedFilters.section}` : ''}
            {teacherSubject ? ` (${teacherSubject})` : ''}
          </Typography>
          <Box>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
              Legend:
              <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#FFD700', marginRight: 0.5 }}></Box>
                <Typography variant="body2">Completion Rate (%)</Typography>
              </Box>
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 2 }}>
          {dataView === 'Weekly' ? 'Weekly (Monday to Sunday)' : 'Monthly (January to December)'} View for {teacherGradeLevel} {appliedFilters.section ? `- Section ${appliedFilters.section}` : ''}
        </Typography>
        
        <Box sx={{ height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {loading ? (
            <CircularProgress />
          ) : chartData.labels.length === 0 ? (
            <Typography>No data available for the selected filters</Typography>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              '&:hover': {
                backgroundColor: '#FFC107',
              },
              borderRadius: '20px',
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#A85858',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#8B3D3D',
              },
              borderRadius: '20px',
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default LibraryHoursCompletionRate;