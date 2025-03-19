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
  ResponsiveContainer
} from 'recharts';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { exportToPDF, exportToExcel } from '../../../utils/export-utils';

const AccessionUsageFrequency = () => {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('All Grades');
  const [section, setSection] = useState('');
  const [dataView, setDataView] = useState('weekly');
  
  // Dynamic Options States
  const [gradeLevels, setGradeLevels] = useState([]);
  const [gradeLevelsLoading, setGradeLevelsLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(true);
  
  // Data states
  const [accessionFrequencyData, setAccessionFrequencyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processedData, setProcessedData] = useState([]);
  const [bookTitles, setBookTitles] = useState([]);
  
  // Section options
  const [availableSections, setAvailableSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  
  // Applied filters tracking
  const [appliedFilters, setAppliedFilters] = useState({
    section: '',
    academicYear: '',
    gradeLevel: 'All Grades',
    dateRange: { from: '', to: '' },
    dataView: 'weekly'
  });

  // Chart container ref for export functions
  const chartRef = useRef(null);

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
        const gradesResponse = await axios.get('http://localhost:8080/api/grade-sections/all', {
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
        const response = await axios.get('http://localhost:8080/api/academic-years/all', {
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
        
        const response = await axios.get(
          `http://localhost:8080/api/grade-sections/grade/${formattedGradeLevel}`, 
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
  const fetchAccessionData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      // Fetch all users
      const usersResponse = await axios.get('http://localhost:8080/api/users/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (usersResponse.status !== 200) {
        throw new Error('Failed to fetch users');
      }
      
      // Filter users based on gradeLevel
      const usersData = usersResponse.data;
      const filteredUsers =
        appliedFilters.gradeLevel === 'All Grades'
          ? usersData
          : usersData.filter((user) => 
              user.grade === appliedFilters.gradeLevel || 
              `Grade ${user.grade}` === appliedFilters.gradeLevel);
          
      // Further filter by section if provided
      const sectionFilteredUsers = appliedFilters.section
        ? filteredUsers.filter(user => user.section === appliedFilters.section)
        : filteredUsers;
          
      // Further filter by academic year if provided
      const academicYearFilteredUsers = appliedFilters.academicYear
        ? sectionFilteredUsers.filter(user => user.academicYear === appliedFilters.academicYear)
        : sectionFilteredUsers;

      // Fetch all library hours
      const hoursResponse = await axios.get('http://localhost:8080/api/library-hours/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (hoursResponse.status !== 200) {
        throw new Error('Failed to fetch library hours');
      }
      
      const hoursData = hoursResponse.data;

      // Set up date filters
      let startDate = null;
      let endDate = null;
      
      // Check if date filters are applied
      if (appliedFilters.dateRange.from) {
        startDate = new Date(appliedFilters.dateRange.from);
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (appliedFilters.dateRange.to) {
        endDate = new Date(appliedFilters.dateRange.to);
        endDate.setHours(23, 59, 59, 999);
      }
      
      // If no date filters, use default timeframe (current week/year)
      if (!startDate && !endDate) {
        const today = new Date();
        
        if (appliedFilters.dataView === 'weekly') {
          // Set to start of current week (Monday)
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay() + 1); // Start of the week (Monday)
          startDate.setHours(0, 0, 0, 0);
          
          endDate = today;
        } else if (appliedFilters.dataView === 'monthly') {
          // For monthly view, use current year
          startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
          endDate = new Date(today.getFullYear(), 11, 31); // December 31st of current year
          
          // If academic year is set, adjust date range to academic year
          if (appliedFilters.academicYear) {
            const years = appliedFilters.academicYear.split('-');
            if (years.length === 2) {
              const firstYear = parseInt(years[0]);
              const secondYear = parseInt(years[1]);
              
              startDate = new Date(firstYear, 6, 1); // July 1st of first year
              endDate = new Date(secondYear, 5, 30); // June 30th of second year
            }
          }
        }
      }

      // Filter library hours based on all criteria
      const filteredLibraryHours = hoursData.filter((record) => {
        const recordDate = new Date(record.timeIn);

        // Exclude records with null or invalid dates or no book title
        if (isNaN(recordDate) || !record.bookTitle) return false;

        // Apply date range filter
        const isWithinDateRange = 
          (!startDate || recordDate >= startDate) && 
          (!endDate || recordDate <= endDate);

        // Combine user filtering with date filtering
        return (
          academicYearFilteredUsers.some((user) => user.idNumber === record.idNumber) &&
          isWithinDateRange
        );
      });

      setAccessionFrequencyData(filteredLibraryHours);
      setError('');
      
      // Show success notification
      toast.success("Data loaded successfully");
    } catch (err) {
      console.error('Error fetching accession frequency data:', err);
      setError('Failed to fetch accession usage data.');
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters function
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
    setDataView('weekly');
    
    // Clear applied filters
    setAppliedFilters({
      section: '',
      academicYear: '',
      gradeLevel: 'All Grades',
      dateRange: { from: '', to: '' },
      dataView: 'weekly'
    });
    
    toast.info('Filters cleared');
  };

  // Initial data fetch on component mount or filter changes
  useEffect(() => {
    fetchAccessionData();
    // No interval needed as we'll rely on manual refresh via filter application
  }, [appliedFilters]);

  // Process the data for the chart
  useEffect(() => {
    if (!accessionFrequencyData || accessionFrequencyData.length === 0) {
      setProcessedData([]);
      setBookTitles([]);
      return;
    }

    try {
      // Get current labels based on timeframe
      const labels = appliedFilters.dataView === 'weekly' ? weeklyLabels : monthlyLabels;
      
      // Process filtered library hours to group by book titles and days/months
      const bookUsageByDay = {};
      
      // If academic year is selected, adjust month display for academic year
      let processedLabels = labels;
      
      if (appliedFilters.dataView === 'monthly' && appliedFilters.academicYear) {
        const years = appliedFilters.academicYear.split('-');
        if (years.length === 2) {
          const firstYear = years[0];
          const secondYear = years[1];
          
          // Reorder months for academic year (July-June)
          processedLabels = [
            `July ${firstYear}`, `August ${firstYear}`, `September ${firstYear}`,
            `October ${firstYear}`, `November ${firstYear}`, `December ${firstYear}`,
            `January ${secondYear}`, `February ${secondYear}`, `March ${secondYear}`,
            `April ${secondYear}`, `May ${secondYear}`, `June ${secondYear}`
          ];
        }
      }

      accessionFrequencyData.forEach((record) => {
        const recordDate = new Date(record.timeIn);
        
        let dayOrMonth;
        if (appliedFilters.dataView === 'weekly') {
          dayOrMonth = recordDate.toLocaleString('en-US', { weekday: 'long' });
        } else {
          // For monthly view
          const month = recordDate.toLocaleString('en-US', { month: 'long' });
          
          // Add year information if academic year is selected
          if (appliedFilters.academicYear) {
            const year = recordDate.getFullYear();
            dayOrMonth = `${month} ${year}`;
          } else {
            dayOrMonth = month;
          }
        }

        if (!bookUsageByDay[record.bookTitle]) {
          bookUsageByDay[record.bookTitle] = Array(processedLabels.length).fill(0);
        }

        const index = processedLabels.indexOf(dayOrMonth);
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
      const formattedData = processedLabels.map((label, index) => {
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
  }, [accessionFrequencyData, appliedFilters]);

  // PDF export function using the centralized utility
  const handleExportToPDF = async () => {
    try {
      const chartId = 'accession-usage-chart';
      const fileName = `accession-usage-${appliedFilters.gradeLevel}-${new Date().toISOString().split('T')[0]}`;
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
      // Format data for Excel export
      const chartData = {
        labels: processedData.map(item => item.name),
        datasets: bookTitles.map((book, index) => ({
          label: book,
          data: processedData.map(item => item[book] || 0)
        }))
      };
      
      const fileName = `accession-usage-${appliedFilters.gradeLevel}-${new Date().toISOString().split('T')[0]}`;
      const title = 'Accession Usage Frequency';
      
      const success = exportToExcel(chartData, fileName, title);
      
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
      return 'Timeline';
    }
  };

  // Build title for the chart
  const getChartTitle = () => {
    const parts = ['Accession Usage Frequency'];
    
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
            onChange={(e) => {
              setDateFrom(e.target.value);
              // Clear academic year if date is set
              if (e.target.value) setAcademicYear('');
            }}
            sx={{ 
              width: '150px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                height: '36px',
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
            onChange={(e) => {
              setDateTo(e.target.value);
              // Clear academic year if date is set
              if (e.target.value) setAcademicYear('');
            }}
            sx={{ 
              width: '150px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                height: '36px',
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
              onChange={(e) => {
                setGradeLevel(e.target.value);
                // Clear section when grade changes
                setSection('');
              }}
              displayEmpty
              IconComponent={ExpandMoreIcon}
              sx={{ 
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fff'
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
                backgroundColor: '#fff'
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
              onChange={(e) => {
                setAcademicYear(e.target.value);
                // Clear date range if academic year is set
                if (e.target.value) {
                  setDateFrom('');
                  setDateTo('');
                }
              }}
              displayEmpty
              IconComponent={ExpandMoreIcon}
              sx={{ 
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
              disabled={academicYearsLoading}
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
              sx={{ 
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fff'
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
        <Box sx={{ mt: 1, mb: 2, p: 1.5, bgcolor: 'rgba(168, 88, 88, 0.1)', borderRadius: 1 }}>
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
        ) : processedData.length === 0 || bookTitles.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Typography>No accession usage data available</Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', height: 400 }} id="accession-usage-chart" ref={chartRef}>
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

export default AccessionUsageFrequency;