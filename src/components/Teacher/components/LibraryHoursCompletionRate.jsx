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

const TeacherLibraryHoursCompletionRate = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');
  const [dataView, setDataView] = useState('Monthly');
  // Add temporary data view state that will only be applied when filters are applied
  const [tempDataView, setTempDataView] = useState('Monthly');
  // Store previous data view before academic year selection
  const [previousDataView, setPreviousDataView] = useState('Monthly');
  
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
    dateRange: { from: '', to: '' },
    dataView: 'Monthly' // Add default dataView to the state
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
  
  // Date From change handler with mutual exclusivity logic
  const handleDateFromChange = (e) => {
    const value = e.target.value;
    
    // If selecting a date, clear academic year
    // And ensure dateTo is not earlier than dateFrom
    if (value) {
      if (dateTo && new Date(value) > new Date(dateTo)) {
        // If dateFrom is later than dateTo, reset dateTo
        setDateTo('');
      }
      setAcademicYear('');
    }
    
    setDateFrom(value);
  };

  // Date To change handler with mutual exclusivity logic
  const handleDateToChange = (e) => {
    const value = e.target.value;
    
    // If selecting a date, clear academic year
    if (value) {
      setAcademicYear('');
    }
    
    setDateTo(value);
  };

  // Academic Year change handler with mutual exclusivity logic
  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    
    // If selecting academic year, clear date filters
    if (value) {
      setDateFrom('');
      setDateTo('');
      
      // Store the current tempDataView before forcing Monthly
      setPreviousDataView(tempDataView);
      
      // Only update temporary view, not the actual view
      setTempDataView('Monthly');
    } else if (previousDataView && !value) {
      // When clearing academic year, restore previous data view
      setTempDataView(previousDataView);
    }
    
    // Set the academic year value
    setAcademicYear(value);
  };
  
  // Effect to update tempDataView when dataView changes via Apply Filters
  // But don't update if academic year is set (to prevent unwanted changes)
  useEffect(() => {
    if (!academicYear) {
      setTempDataView(dataView);
    }
  }, [dataView, academicYear]);
  
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
  
  // Process data for the chart
  const processChartData = (data, forceAcademicYear = null, forceDataView = null) => {
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
    
    // Use forced data view if provided, otherwise fall back to component state
    const effectiveDataView = forceDataView || dataView;
    console.log('Processing chart data with view:', effectiveDataView);
    
    // Map to store month data from API response
    const dataMap = new Map();
    data.forEach(item => {
      // Handle both weekly and monthly data
      if (effectiveDataView === 'Weekly' && !forceAcademicYear) {
        dataMap.set(item.day, item.rate);
      } else {
        // Extract month and potentially year if present
        let key = item.month;
        dataMap.set(key, item.rate);
      }
    });
    
    let labels = [];
    let values = [];
    
    // Priority for academic year over data view
    const currentAcademicYear = forceAcademicYear || appliedFilters.academicYear || academicYear;
    const isAcademicYearFilter = currentAcademicYear && currentAcademicYear.length > 0;
    
    if (effectiveDataView === 'Weekly' && !isAcademicYearFilter) {
      // Process daily data - days of the week (Monday to Sunday)
      labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      values = labels.map(day => dataMap.has(day) ? dataMap.get(day) : 0);
      
      console.log('Using weekly data format with days:', labels);
    } else {
      // For Monthly view or when academic year is set
      if (isAcademicYearFilter) {
        // Extract years from academic year (e.g., "2024-2025")
        const years = currentAcademicYear.split('-');
        const firstYear = years[0];
        const secondYear = years[1];
        
        // Always create ordered month labels for academic year (July of first year to June of second year)
        const academicYearLabels = [
          `JUL ${firstYear}`, `AUG ${firstYear}`, `SEP ${firstYear}`, 
          `OCT ${firstYear}`, `NOV ${firstYear}`, `DEC ${firstYear}`,
          `JAN ${secondYear}`, `FEB ${secondYear}`, `MAR ${secondYear}`, 
          `APR ${secondYear}`, `MAY ${secondYear}`, `JUN ${secondYear}`
        ];
        
        console.log('Using academic year order:', academicYearLabels);
        
        // Use academic year ordered labels
        labels = academicYearLabels;
        // Map values from data to ordered labels (use 0 for missing months)
        values = academicYearLabels.map(month => {
          // Try to find the exact match first
          if (dataMap.has(month)) {
            return dataMap.get(month);
          }
          
          // If not found, look for a match without the year or with a different year format
          const monthAbbr = month.split(' ')[0];
          const matchingKey = Array.from(dataMap.keys()).find(key => 
            key.startsWith(monthAbbr) || key.includes(monthAbbr)
          );
          
          return matchingKey ? dataMap.get(matchingKey) : 0;
        });
      } else {
        // Regular calendar order (January to December)
        const monthOrder = {
          'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
          'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };
        
        // Extract and sort the keys from the data
        labels = Array.from(dataMap.keys()).sort((a, b) => {
          // Extract month abbreviation from the label (might include year)
          const monthA = a.split(' ')[0].substring(0, 3).toUpperCase();
          const monthB = b.split(' ')[0].substring(0, 3).toUpperCase();
          
          return monthOrder[monthA] - monthOrder[monthB];
        });
        
        // Get values in the correct order
        values = labels.map(label => dataMap.get(label));
      }
    }
    
    // Create dataset label with section and subject information
    const sectionInfo = appliedFilters.section ? ` - Section ${appliedFilters.section}` : '';
    const subjectInfo = teacherSubject ? ` (${teacherSubject})` : '';
    let dateRangeInfo = '';
    
    if (appliedFilters.dateRange.from && appliedFilters.dateRange.to) {
      dateRangeInfo = ` (${appliedFilters.dateRange.from} to ${appliedFilters.dateRange.to})`;
    } else if (currentAcademicYear) {
      dateRangeInfo = ` (AY: ${currentAcademicYear})`;
    }
    
    // Set the chart data with the processed values
    setChartData({
      labels,
      datasets: [{
        label: `Completion Rate${sectionInfo}${subjectInfo}${dateRangeInfo}`,
        data: values,
        backgroundColor: '#FFD700',
        borderColor: '#000',
        borderWidth: 1,
      }]
    });
  };
  
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
      
      // IMPORTANT: Always include teacher's subject
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
      
      // CRITICAL FIX: Prioritize parameters in the following order:
      // 1. If academic year is selected AND forceMonthlyView is true, force 'monthly'
      // 2. If specific dataView parameter passed, use that
      // 3. Fall back to component state
      if (params.academicYear) {
        queryParams.append('academicYear', params.academicYear);
        
        // Force monthly view only when explicitly told to (on filter apply)
        if (params.forceMonthlyView === true) {
          queryParams.append('timeframe', 'monthly');
          console.log('Forcing monthly view for academic year data');
        } else {
          // Otherwise use the specified or current data view
          queryParams.append('timeframe', params.dataView ? params.dataView.toLowerCase() : dataView.toLowerCase());
          console.log('Using passed data view with academic year:', params.dataView || dataView);
        }
      } else if (params.dataView) {
        // Use explicitly passed dataView (fixes the timing issue)
        queryParams.append('timeframe', params.dataView.toLowerCase());
        console.log('Using passed data view:', params.dataView.toLowerCase());
      } else {
        // Fallback to state if no explicit view is provided
        queryParams.append('timeframe', dataView.toLowerCase());
        console.log('Using current state data view:', dataView.toLowerCase());
      }
      
      // Add date range parameters
      if (params.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      
      if (params.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }
      
      console.log('Fetching completion rate with params:', queryParams.toString());
      
      // Make API call to fetch completion rate data
      const url = `http://localhost:8080/api/statistics/completion-rate?${queryParams.toString()}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the data for the chart - pass the effective dataView explicitly
      const effectiveView = (params.academicYear && params.forceMonthlyView) ? 'Monthly' : params.dataView || dataView;
      processChartData(response.data, params.academicYear, effectiveView);
      
      // Build notification message based on applied filters
      let filterMsg = [];
      if (params.section) filterMsg.push(`Section ${params.section}`);
      if (params.academicYear) filterMsg.push(`AY: ${params.academicYear}`);
      if (params.dateFrom && params.dateTo) filterMsg.push(`Date: ${params.dateFrom} to ${params.dateTo}`);
      else if (params.dateFrom) filterMsg.push(`From: ${params.dateFrom}`);
      else if (params.dateTo) filterMsg.push(`To: ${params.dateTo}`);
      if (params.dataView && !params.forceMonthlyView) filterMsg.push(`View: ${params.dataView}`);
      
      const grade = params.gradeLevel || teacherGradeLevel || gradeLevel;
      const subject = teacherSubject ? ` (${teacherSubject})` : '';
      
      if (filterMsg.length > 0) {
        toast.info(`Viewing completion rate for ${grade}${subject} - ${filterMsg.join(', ')}`);
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
  
  // Helper to get month index from abbreviation
  const getMonthIndexFromAbbr = (abbr) => {
    if (!abbr) return -1;
    
    // Handle month abbreviations that might include year (e.g., "JAN 2023")
    const monthPart = abbr.split(' ')[0].toUpperCase();
    
    const months = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    return months[monthPart] || -1;
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

  // Update chart title and scales when filters or dataView changes
  useEffect(() => {
    // Update chart options to reflect section filter and teacher subject
    const grade = gradeLevel || teacherGradeLevel || 'all grades';
    const subjectInfo = teacherSubject ? ` - ${teacherSubject}` : '';
    let dateInfo = '';
    
    if (appliedFilters.dateRange.from && appliedFilters.dateRange.to) {
      dateInfo = ` (${appliedFilters.dateRange.from} to ${appliedFilters.dateRange.to})`;
    } else if (appliedFilters.academicYear) {
      dateInfo = ` (AY: ${appliedFilters.academicYear})`;
    }
    
    // Determine X-axis label based on data view and filters
    let xAxisTitle = '';
    const currentAcademicYear = appliedFilters.academicYear;
    const hasAcademicYear = currentAcademicYear && currentAcademicYear.length > 0;
    
    if (appliedFilters.dataView === 'Weekly' && !hasAcademicYear) {
      xAxisTitle = 'Days of the Week (Monday to Sunday)';
    } else if (hasAcademicYear) {
      xAxisTitle = `Months of the Academic Year (${currentAcademicYear})`;
    } else {
      xAxisTitle = 'Months of the Year';
    }
    
    setChartOptions(prevOptions => ({
      ...prevOptions,
      plugins: {
        ...prevOptions.plugins,
        title: {
          ...prevOptions.plugins.title,
          text: appliedFilters.section 
            ? `Showing completion rate for ${grade} - Section ${appliedFilters.section}${subjectInfo}${dateInfo}` 
            : `Showing completion rate for ${grade} - All Sections${subjectInfo}${dateInfo}`
        }
      },
      scales: {
        ...prevOptions.scales,
        x: {
          ...prevOptions.scales.x,
          title: {
            ...prevOptions.scales.x.title,
            text: xAxisTitle,
          }
        }
      }
    }));
  }, [appliedFilters, gradeLevel, teacherGradeLevel, teacherSubject]);

  // Handle filter button click
  const handleFilterClick = () => {
    // Validate date range if both dates are provided
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Date From must be before or equal to Date To');
      return;
    }
    
    // Force monthly view if academic year is selected
    let viewToUse = tempDataView;
    if (academicYear) {
      viewToUse = 'Monthly';
      setDataView('Monthly');
    } else {
      setDataView(tempDataView);
    }
    
    // Update applied filters state first
    setAppliedFilters({
      section: section,
      academicYear: academicYear,
      dateRange: { from: dateFrom, to: dateTo },
      dataView: viewToUse // Add dataView to applied filters
    });
    
    // Apply the filters to the data with explicit dataView parameter
    fetchCompletionRateData({
      gradeLevel,
      section,
      academicYear,
      dateFrom,
      dateTo,
      dataView: viewToUse, // Pass the selected view directly to avoid timing issues
      forceMonthlyView: !!academicYear // Force monthly view only when applying filters with academic year
    });
  };
  
  // Clear filters
  const handleClearFilters = () => {
    // Restore previous view if we had academic year selected
    const viewToRestore = academicYear ? previousDataView : tempDataView;
    
    // Reset to teacher's section if assigned
    setSection(teacherSection || '');
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    
    // Restore previous data view
    setTempDataView(viewToRestore);
    setDataView(viewToRestore);
    
    // Update applied filters state
    setAppliedFilters({
      section: teacherSection || '',
      academicYear: '',
      dateRange: { from: '', to: '' },
      dataView: viewToRestore
    });
    
    // Refresh data with cleared filters and restored data view
    fetchCompletionRateData({
      gradeLevel,
      section: teacherSection || '',  // Keep teacher's section if assigned
      dataView: viewToRestore // Use the restored view
    });
    
    toast.info('Filters cleared');
  };

  return (
    <>
      <ToastContainer />
      {/* Filter Section */}
      <Box 
        sx={{ 
          width: '100%', 
          marginBottom: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: '15px',
          padding: 2,
          boxShadow: 1
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Date From:</Typography>
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={dateFrom}
              onChange={handleDateFromChange}
              disabled={!!academicYear} // Disable if academicYear has a value
              InputLabelProps={{ shrink: true }}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: '180px',
                "& .Mui-disabled": {
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Date To:</Typography>
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={dateTo}
              onChange={handleDateToChange}
              disabled={!!academicYear || !dateFrom} // Disable if academicYear has a value or dateFrom is empty
              inputProps={{
                min: dateFrom || undefined // Set minimum date to dateFrom
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: '180px',
                "& .Mui-disabled": {
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }}>Academic Year:</Typography>
            <FormControl sx={{ width: '180px' }}>
              <Select
                size="small"
                value={academicYear}
                onChange={handleAcademicYearChange}
                disabled={!!dateFrom || !!dateTo} // Disable if either date has a value
                sx={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '15px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
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
              onClick={handleClearFilters}
              sx={{
                borderColor: "#FFD700",
                color: "#000",
                "&:hover": { 
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                  borderColor: "#FFD700"
                },
                borderRadius: '15px',
              }}
              disabled={!appliedFilters.section && !appliedFilters.academicYear && !appliedFilters.dateRange.from && !appliedFilters.dateRange.to}
            >
              Clear
            </Button>
            
            <Button
              variant="contained"
              onClick={handleFilterClick}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                "&:hover": { backgroundColor: "#FFC107" },
                borderRadius: '15px',
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
                sx={{ backgroundColor: '#fff', borderRadius: '15px' }}
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
                sx={{ backgroundColor: '#fff', borderRadius: '15px' }}
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
          
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ marginRight: 1 }}>Data View:</Typography>
              <FormControl sx={{ width: '180px' }}>
                <Select
                  size="small"
                  value={tempDataView}
                  onChange={(e) => setTempDataView(e.target.value)}
                  sx={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '15px',
                    "& .Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  }}
                  displayEmpty
                  disabled={!!academicYear} // Disable if academic year is selected
                >
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Box>

          </Box>
        </Box>
      </Box>
      
      {/* Active Filters Display */}
      {(appliedFilters.section || appliedFilters.academicYear || appliedFilters.dateRange.from || appliedFilters.dateRange.to || teacherGradeLevel || teacherSubject) && (
        <Box sx={{ 
          mt: 1, 
          mb: 2, 
          p: 1.5, 
          bgcolor: 'rgba(255, 215, 0, 0.1)', 
          borderRadius: '15px',
          border: '1px solid rgba(255, 215, 0, 0.3)' 
        }}>
          <Typography variant="subtitle2" fontWeight="bold">Active Filters and Context:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {teacherGradeLevel && (
              <Chip 
                label={`Grade: ${teacherGradeLevel}`} 
                size="small" 
                color="secondary" 
                variant="filled"
                sx={{ backgroundColor: '#8C383E', color: 'white' }}
              />
            )}
            {teacherSubject && (
              <Chip 
                label={`Teacher Subject: ${teacherSubject}`} 
                size="small" 
                color="secondary" 
                variant="filled"
                sx={{ backgroundColor: '#8C383E', color: 'white' }}
              />
            )}
            {appliedFilters.section && (
              <Chip 
                label={`Section: ${appliedFilters.section}`} 
                size="small" 
                variant="outlined"
                sx={{ borderColor: '#FFD700', color: '#000' }}
              />
            )}
            {appliedFilters.academicYear && (
              <Chip 
                label={`Academic Year: ${appliedFilters.academicYear}`} 
                size="small" 
                variant="outlined"
                sx={{ borderColor: '#FFD700', color: '#000' }}
              />
            )}
            {appliedFilters.dateRange.from && (
              <Chip 
                label={`From: ${appliedFilters.dateRange.from}`} 
                size="small" 
                variant="outlined"
                sx={{ borderColor: '#FFD700', color: '#000' }}
              />
            )}
            {appliedFilters.dateRange.to && (
              <Chip 
                label={`To: ${appliedFilters.dateRange.to}`} 
                size="small" 
                variant="outlined"
                sx={{ borderColor: '#FFD700', color: '#000' }}
              />
            )}
            {appliedFilters.dataView && (
              <Chip 
                label={`View: ${appliedFilters.dataView}${appliedFilters.academicYear ? ' (fixed)' : ''}`}
                size="small" 
                variant="outlined"
                sx={{ 
                  borderColor: '#FFD700', 
                  color: '#000',
                  backgroundColor: appliedFilters.academicYear ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                }}
              />
            )}
          </Box>
        </Box>
      )}
      
      {/* Chart Section */}
      <Paper 
        sx={{ 
          padding: 3, 
          borderRadius: '15px', 
          boxShadow: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          marginBottom: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8C383E' }}>
            Library Hours Completion Rate {teacherSubject ? `(${teacherSubject})` : ''} - {appliedFilters.academicYear ? `AY ${appliedFilters.academicYear}` : 'All Time'}
            {appliedFilters.section ? ` - Section ${appliedFilters.section}` : ''}
            {!appliedFilters.academicYear && appliedFilters.dateRange.from && appliedFilters.dateRange.to ? 
              ` (${appliedFilters.dateRange.from} to ${appliedFilters.dateRange.to})` : 
              !appliedFilters.academicYear && appliedFilters.dateRange.from ? ` (From: ${appliedFilters.dateRange.from})` : 
              !appliedFilters.academicYear && appliedFilters.dateRange.to ? ` (To: ${appliedFilters.dateRange.to})` : ''}
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
          {appliedFilters.academicYear ? `Academic Year ${appliedFilters.academicYear} (July to June)` : 
           appliedFilters.dataView === 'Weekly' ? 'Weekly (Monday to Sunday)' : 
           'Monthly (January to December)'} View for {teacherGradeLevel || gradeLevel || 'All Grades'} {appliedFilters.section ? `- Section ${appliedFilters.section}` : ''}
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
              borderRadius: '15px',
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#8C383E',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#6e2c30',
              },
              borderRadius: '15px',
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default TeacherLibraryHoursCompletionRate;