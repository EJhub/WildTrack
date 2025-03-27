import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Button,
  FormControl,
  Chip
} from '@mui/material';
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { exportToPDF, exportToExcel } from '../../../utils/export-utils';
import api from '../../../utils/api'; // Import the API utility

const LibrarianLibraryHoursCompletionRate = () => {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('All Grades');
  const [section, setSection] = useState('');
  const [dataView, setDataView] = useState('monthly'); // Changed from 'weekly' to 'monthly'
  
  // Dynamic Options States
  const [gradeLevels, setGradeLevels] = useState([]);
  const [gradeLevelsLoading, setGradeLevelsLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(true);
  
  // Data states
  const [completionRateData, setCompletionRateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Section options
  const [availableSections, setAvailableSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  
  // Chart container ref for export functions
  const chartRef = useRef(null);
  
  // Applied filters tracking
  const [appliedFilters, setAppliedFilters] = useState({
    section: '',
    academicYear: '',
    gradeLevel: 'All Grades',
    dateRange: { from: '', to: '' },
    dataView: 'monthly' // Changed from 'weekly' to 'monthly'
  });

  // Define labels for days and months - include all 7 days of the week
  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyLabels = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December'
  ];
  
  // Function to sort grade levels in the correct order
  const sortGradeLevels = (grades) => {
    return [...grades].sort((a, b) => {
      // Extract grade numbers for comparison
      const numA = parseInt(a.replace("Grade ", ""));
      const numB = parseInt(b.replace("Grade ", ""));
      
      // Sort numerically
      return numA - numB;
    });
  };

  // Fetch available grade levels
  useEffect(() => {
    const fetchGradeLevels = async () => {
      try {
        setGradeLevelsLoading(true);
        
        // Fetch grade levels from the grade-sections API
        const token = localStorage.getItem("token");
        const gradesResponse = await api.get('/grade-sections/all', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (gradesResponse.data) {
          // Extract unique grade levels from the grade sections data
          const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
          
          // Format grade levels consistently if needed
          const formattedGrades = uniqueGrades.map(grade => 
            grade.includes('Grade') ? grade : `Grade ${grade}`
          );
          
          // Sort grade levels
          const sortedGrades = sortGradeLevels(formattedGrades);
          setGradeLevels(sortedGrades);
          
          console.log("Fetched grade levels:", sortedGrades);
        }
      } catch (err) {
        console.error("Error fetching grade levels:", err);
        toast.error("Failed to load grade levels");
        // Fallback to default grade levels
        setGradeLevels(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
      } finally {
        setGradeLevelsLoading(false);
      }
    };
    
    fetchGradeLevels();
  }, []);
  
  // Fetch academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setAcademicYearsLoading(true);
        
        const token = localStorage.getItem("token");
        const response = await api.get('/academic-years/all', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (response.data) {
          // Format academic years as needed
          const formattedYears = response.data.map(year => year.name || `${year.startYear}-${year.endYear}`);
          setAcademicYears(formattedYears);
          console.log("Fetched academic years:", formattedYears);
        }
      } catch (err) {
        console.error("Error fetching academic years:", err);
        toast.error("Failed to load academic years");
        // Fallback to default academic years
        setAcademicYears(['2022-2023', '2023-2024', '2024-2025']);
      } finally {
        setAcademicYearsLoading(false);
      }
    };
    
    fetchAcademicYears();
  }, []);

  // Fetch available sections based on grade level
  useEffect(() => {
    if (gradeLevel === 'All Grades') {
      setAvailableSections([]);
      return;
    }

    const fetchSections = async () => {
      try {
        setSectionsLoading(true);
        const token = localStorage.getItem('token');
        
        // Format grade level for API (if needed)
        let formattedGradeLevel = gradeLevel;
        if (!gradeLevel.includes('Grade') && gradeLevel !== 'All Grades') {
          formattedGradeLevel = `Grade ${gradeLevel}`;
        }
        
        const response = await api.get(
          `/grade-sections/grade/${formattedGradeLevel}`, 
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        
        if (response.data && response.data.length > 0) {
          setAvailableSections(response.data);
          console.log(`Fetched ${response.data.length} sections for ${gradeLevel}`);
        } else {
          // If no sections found via API, use default sections
          console.log(`No sections found for ${gradeLevel}, using defaults`);
          setAvailableSections([
            { id: 1, sectionName: 'Section A' },
            { id: 2, sectionName: 'Section B' },
            { id: 3, sectionName: 'Section C' }
          ]);
        }
      } catch (error) {
        console.error("Error fetching grade sections:", error);
        toast.error("Failed to fetch sections for the selected grade");
        // Use default sections on error
        setAvailableSections([
          { id: 1, sectionName: 'Section A' },
          { id: 2, sectionName: 'Section B' },
          { id: 3, sectionName: 'Section C' }
        ]);
      } finally {
        setSectionsLoading(false);
      }
    };
    
    fetchSections();
  }, [gradeLevel]);

  // Fetch data based on applied filters
  const fetchCompletionRateData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for filtering
      const params = new URLSearchParams();
      
      if (appliedFilters.gradeLevel !== 'All Grades') {
        params.append('gradeLevel', appliedFilters.gradeLevel);
      }
      
      if (appliedFilters.dataView) {
        params.append('timeframe', appliedFilters.dataView);
      }
      
      if (appliedFilters.section) {
        params.append('section', appliedFilters.section);
      }
      
      if (appliedFilters.academicYear) {
        params.append('academicYear', appliedFilters.academicYear);
      }
      
      if (appliedFilters.dateRange.from) {
        params.append('dateFrom', appliedFilters.dateRange.from);
      }
      
      if (appliedFilters.dateRange.to) {
        params.append('dateTo', appliedFilters.dateRange.to);
      }

      // Fetch data from the API with query parameters
      const token = localStorage.getItem('token');
      const url = `/statistics/completion-rate${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching completion rate data from:", url);
      
      const response = await api.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log("API Response:", response.data);
      setCompletionRateData(response.data);
      setError('');
      
      // Show success notification
      toast.success("Data loaded successfully");
    } catch (err) {
      console.error('Error fetching completion rate data:', err);
      setError('Failed to fetch library hours completion rate data.');
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Handler for Date From with mutual exclusivity
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

  // Handler for Date To with mutual exclusivity
  const handleDateToChange = (e) => {
    const value = e.target.value;
    
    // Clear academic year if date is set
    if (value) {
      setAcademicYear('');
    }
    
    setDateTo(value);
  };

  // Handler for Academic Year with mutual exclusivity
  const handleAcademicYearChange = (e) => {
    const value = e.target.value;
    
    // Clear date range if academic year is set
    if (value) {
      setDateFrom('');
      setDateTo('');
      // Force dataView to monthly when academic year is selected
      setDataView('monthly');
    }
    
    setAcademicYear(value);
  };

  // Handler for Grade Level change
  const handleGradeLevelChange = (e) => {
    setGradeLevel(e.target.value);
    // Clear section when grade changes
    setSection('');
  };

  // Apply filters function with validation
  const handleApplyFilters = () => {
    // Validate date range if both dates are provided
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Date From must be before or equal to Date To');
      return;
    }
    
    // Update applied filters state
    setAppliedFilters({
      section,
      academicYear,
      gradeLevel,
      dateRange: { from: dateFrom, to: dateTo },
      dataView
    });
    
    // Build notification message
    let filterMsg = [];
    if (gradeLevel !== 'All Grades') filterMsg.push(`Grade: ${gradeLevel}`);
    if (section) filterMsg.push(`Section: ${section}`);
    if (academicYear) filterMsg.push(`AY: ${academicYear}`);
    if (dateFrom && dateTo) filterMsg.push(`Date: ${dateFrom} to ${dateTo}`);
    else if (dateFrom) filterMsg.push(`From: ${dateFrom}`);
    else if (dateTo) filterMsg.push(`To: ${dateTo}`);
    
    if (filterMsg.length > 0) {
      toast.info(`Applied filters: ${filterMsg.join(', ')}`);
    }
  };

  // Clear filters function
  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setGradeLevel('All Grades');
    setSection('');
    setDataView('monthly'); // Changed from 'weekly' to 'monthly'
    
    // Clear applied filters
    setAppliedFilters({
      section: '',
      academicYear: '',
      gradeLevel: 'All Grades',
      dateRange: { from: '', to: '' },
      dataView: 'monthly' // Changed from 'weekly' to 'monthly'
    });
    
    toast.info('Filters cleared');
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchCompletionRateData();
    // No interval needed as we'll rely on manual refresh via filter application
  }, [appliedFilters]);

  // Format and normalize data for the chart
  const formatChartData = () => {
    if (!completionRateData || completionRateData.length === 0) {
      return [];
    }

    // Map to check if we have day-based data (weekly) or month-based data
    const isWeeklyData = completionRateData.some(item => item.hasOwnProperty('day'));
    
    // Map month abbreviations to full names
    const monthMap = {
      'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
      'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
      'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
    };
    
    if (isWeeklyData || appliedFilters.dataView === 'weekly') {
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
      if (appliedFilters.academicYear) {
        // Handle academic year format (July-June)
        // Extract years from academic year (e.g., "2024-2025")
        const years = appliedFilters.academicYear.split('-');
        const firstYear = years[0];
        const secondYear = years[1];
        
        // Create month data map
        const monthData = {};
        
        // Initialize all months with zero values
        const academicMonthOrder = [
          `July ${firstYear}`, `August ${firstYear}`, `September ${firstYear}`,
          `October ${firstYear}`, `November ${firstYear}`, `December ${firstYear}`,
          `January ${secondYear}`, `February ${secondYear}`, `March ${secondYear}`,
          `April ${secondYear}`, `May ${secondYear}`, `June ${secondYear}`
        ];
        
        academicMonthOrder.forEach(month => {
          monthData[month] = 0;
        });
        
        // Process API data into our month map
        completionRateData.forEach(item => {
          // Get month abbreviation and extract any year info
          const parts = item.month.split(' ');
          const monthAbbr = parts[0];
          const monthFullName = monthMap[monthAbbr] || monthAbbr;
          
          // Determine year based on academic year and month
          let yearToUse;
          if (['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].includes(monthAbbr)) {
            yearToUse = firstYear;
          } else {
            yearToUse = secondYear;
          }
          
          const key = `${monthFullName} ${yearToUse}`;
          monthData[key] = item.rate;
        });
        
        // Format data for chart in academic year order
        return academicMonthOrder.map(month => ({
          name: month,
          rate: monthData[month] || 0
        }));
      } else {
        // Regular calendar order processing
        return completionRateData.map(item => {
          // Convert 3-letter month to full name if needed
          const parts = item.month.split(' ');
          const monthAbbr = parts[0].toUpperCase();
          const monthFullName = monthMap[monthAbbr] || monthAbbr;
          const yearPart = parts.length > 1 ? ` ${parts[1]}` : '';
          
          return {
            name: `${monthFullName}${yearPart}`,
            rate: item.rate
          };
        });
      }
    }
  };

  const chartData = formatChartData();

  // PDF export function using the centralized utility
  const handleExportToPDF = async () => {
    try {
      const chartId = 'completion-rate-chart';
      const fileName = `completion-rate-${appliedFilters.gradeLevel}-${new Date().toISOString().split('T')[0]}`;
      const title = getChartTitle();
      
      const success = await exportToPDF(chartId, fileName, title);
      
      if (success) {
        toast.success(`Chart exported to PDF successfully`);
      } else {
        toast.error(`Failed to export chart to PDF`);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(`Error exporting to PDF: ${error.message}`);
    }
  };

  // Excel export function using the centralized utility
  const handleExportToExcel = () => {
    try {
      // Format data for Excel export in the expected format
      const formattedData = {
        labels: chartData.map(item => item.name),
        datasets: [{
          label: 'Completion Rate (%)',
          data: chartData.map(item => item.rate)
        }]
      };
      
      const fileName = `completion-rate-${appliedFilters.gradeLevel}-${new Date().toISOString().split('T')[0]}`;
      const title = 'Library Hours Completion Rate';
      
      const success = exportToExcel(formattedData, fileName, title);
      
      if (success) {
        toast.success(`Chart exported to Excel successfully`);
      } else {
        toast.error(`Failed to export chart to Excel`);
      }
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error(`Error exporting to Excel: ${error.message}`);
    }
  };

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

  // Get X-axis label based on data view
  const getXAxisLabel = () => {
    if (appliedFilters.dataView === 'weekly') {
      return 'Days of the Week';
    } else if (appliedFilters.dataView === 'monthly') {
      if (appliedFilters.academicYear) {
        return `Months of Academic Year (${appliedFilters.academicYear})`;
      }
      return 'Months of the Year';
    } else {
      return 'Years';
    }
  };

  // Build title for the chart
  const getChartTitle = () => {
    const parts = ['Library Hours Completion Rate'];
    
    if (appliedFilters.academicYear) {
      parts.push(`- AY ${appliedFilters.academicYear}`);
    }
    
    if (appliedFilters.gradeLevel !== 'All Grades') {
      parts.push(`- ${appliedFilters.gradeLevel}`);
    }
    
    if (appliedFilters.section) {
      parts.push(`- ${appliedFilters.section}`);
    }
    
    if (appliedFilters.dateRange.from && appliedFilters.dateRange.to) {
      parts.push(`(${appliedFilters.dateRange.from} to ${appliedFilters.dateRange.to})`);
    } else if (appliedFilters.dateRange.from) {
      parts.push(`(From: ${appliedFilters.dateRange.from})`);
    } else if (appliedFilters.dateRange.to) {
      parts.push(`(To: ${appliedFilters.dateRange.to})`);
    }
    
    return parts.join(' ');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ToastContainer />
      
      {/* Title */}
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: 'center', 
          fontWeight: 'bold',
          mb: 2
        }}
      >
        {getChartTitle()}
        <Typography 
          component="span" 
          display="block" 
          variant="subtitle1"
          sx={{ fontWeight: 'normal' }}
        >
          {appliedFilters.dataView === 'weekly' ? 'Weekly' : 
           appliedFilters.dataView === 'monthly' ? 'Monthly' : 'Yearly'} View
        </Typography>
      </Typography>
      
      {/* Filter controls */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        marginBottom: 2, 
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Date From */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Date From:
          </Typography>
          <TextField
            type="date"
            size="small"
            value={dateFrom}
            onChange={handleDateFromChange}
            disabled={!!academicYear} // Disable if academicYear has a value
            sx={{ 
              width: '150px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                height: '36px',
              },
              '& .Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                opacity: 0.7
              }
            }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                 <InputAdornment position="end" />
              ),
            }}
          />
        </Box>

        {/* Date To */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Date To:
          </Typography>
          <TextField
            type="date"
            size="small"
            value={dateTo}
            onChange={handleDateToChange}
            disabled={!!academicYear || !dateFrom} // Disable if academicYear has a value or dateFrom is empty
            inputProps={{
              min: dateFrom || undefined // Set minimum date to dateFrom
            }}
            sx={{ 
              width: '150px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                height: '36px',
              },
              '& .Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                opacity: 0.7
              }
            }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                 <InputAdornment position="end" />
              ),
            }}
          />
        </Box>

        {/* Grade Level */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Grade Level:
          </Typography>
          <FormControl sx={{ width: '150px' }}>
            <Select
              size="small"
              value={gradeLevel}
              onChange={handleGradeLevelChange}
              displayEmpty
              IconComponent={ExpandMoreIcon}
              sx={{ 
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fff',
                '& .Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  opacity: 0.7
                }
              }}
              disabled={gradeLevelsLoading}
            >
              <MenuItem value="All Grades">All Grades</MenuItem>
              {gradeLevelsLoading ? (
                <MenuItem disabled>Loading grade levels...</MenuItem>
              ) : (
                gradeLevels.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Section:
          </Typography>
          <FormControl sx={{ width: '150px' }}>
            <Select
              size="small"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              displayEmpty
              IconComponent={ExpandMoreIcon}
              sx={{ 
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fff',
                '& .Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  opacity: 0.7
                }
              }}
              disabled={gradeLevel === 'All Grades' || sectionsLoading}
            >
              <MenuItem value="">All Sections</MenuItem>
              {sectionsLoading ? (
                <MenuItem disabled>Loading sections...</MenuItem>
              ) : (
                availableSections.map((sectionItem) => (
                  <MenuItem key={sectionItem.id} value={sectionItem.sectionName}>
                    {sectionItem.sectionName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Academic Year */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Academic Year:
          </Typography>
          <FormControl sx={{ width: '150px' }}>
            <Select
              size="small"
              value={academicYear}
              onChange={handleAcademicYearChange}
              displayEmpty
              disabled={academicYearsLoading || !!dateFrom || !!dateTo} // Disable if loading or if either date has a value
              IconComponent={ExpandMoreIcon}
              sx={{ 
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fff',
                '& .Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  opacity: 0.7
                }
              }}
            >
              <MenuItem value="">Select Academic Year</MenuItem>
              {academicYearsLoading ? (
                <MenuItem disabled>Loading academic years...</MenuItem>
              ) : (
                academicYears.map((yearOption) => (
                  <MenuItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Data View */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Data View:
          </Typography>
          <FormControl sx={{ width: '150px' }}>
            <Select
              size="small"
              value={dataView}
              onChange={(e) => setDataView(e.target.value)}
              IconComponent={ExpandMoreIcon}
              disabled={!!academicYear} // Disable if academic year is selected
              sx={{ 
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fff',
                '& .Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  opacity: 0.7
                }
              }}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Filter Buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            sx={{
              height: '36px',
              borderRadius: '4px',
              borderColor: '#A85858',
              color: '#A85858',
              '&:hover': {
                backgroundColor: 'rgba(168, 88, 88, 0.1)',
                borderColor: '#A85858',
              },
            }}
            disabled={!appliedFilters.section && !appliedFilters.academicYear && 
                     appliedFilters.gradeLevel === 'All Grades' && 
                     !appliedFilters.dateRange.from && !appliedFilters.dateRange.to}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleApplyFilters}
            sx={{
              height: '36px',
              borderRadius: '4px',
              backgroundColor: '#A85858',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#8B3D3D',
              },
            }}
            disabled={gradeLevelsLoading || academicYearsLoading || (gradeLevel !== 'All Grades' && sectionsLoading)}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
      
      {/* Active Filters Display */}
      {(appliedFilters.section || appliedFilters.academicYear || 
        appliedFilters.gradeLevel !== 'All Grades' || 
        appliedFilters.dateRange.from || appliedFilters.dateRange.to) && (
        <Box sx={{ mt: 1, mb: 2, p: 1.5, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">Active Filters:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {appliedFilters.gradeLevel !== 'All Grades' && (
              <Chip 
                label={`Grade: ${appliedFilters.gradeLevel}`} 
                size="small" 
                color="primary" 
                variant="outlined"
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
            <Chip 
              label={`View: ${appliedFilters.dataView === 'weekly' ? 'Weekly' : 
                    appliedFilters.dataView === 'monthly' ? 'Monthly' : 'Yearly'}`} 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
          </Box>
        </Box>
      )}

      {/* Chart */}
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
          <Box sx={{ position: 'relative', height: 400 }} id="completion-rate-chart" ref={chartRef}>
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
                  angle={appliedFilters.dataView === 'monthly' ? -45 : 0}
                  textAnchor={appliedFilters.dataView === 'monthly' ? 'end' : 'middle'}
                  height={appliedFilters.dataView === 'monthly' ? 70 : 30}
                  label={{ 
                    value: getXAxisLabel(), 
                    position: 'insideBottom',
                    offset: appliedFilters.dataView === 'monthly' ? -20 : -5,
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
                  labelFormatter={(label) => appliedFilters.dataView === 'weekly' ? `Day: ${label}` : `Month: ${label}`}
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
                  barSize={appliedFilters.dataView === 'weekly' ? 40 : 25}
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
            
            {/* Export Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              marginTop: 3 
            }}>
              <Button 
                variant="contained"
                onClick={handleExportToPDF}
                sx={{
                  backgroundColor: '#CD6161',
                  color: '#fff',
                  borderRadius: '20px',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#B04747' },
                }}
              >
                Export PDF
              </Button>
              <Button 
                variant="contained"
                onClick={handleExportToExcel}
                sx={{
                  backgroundColor: '#CD6161',
                  color: '#fff',
                  borderRadius: '20px',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#B04747' },
                }}
              >
                Export Excel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LibrarianLibraryHoursCompletionRate;