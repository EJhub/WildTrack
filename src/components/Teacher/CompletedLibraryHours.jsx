import React, { useState, useContext, useEffect } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import { AuthContext } from '../AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Tooltip from '@mui/material/Tooltip';
// Import icons for sort indicators
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
// Import API utility
import api from '../../utils/api';

const CompletedLibraryHours = () => {
  // Filters state - using a unified approach like in BookLog
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    academicYear: '',
    quarter: '',
    gradeLevel: '',
    section: '',
    search: ''
  });

  // Applied filter states (tracking what's currently being used)
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    academicYear: '',
    quarter: '',
    gradeLevel: '',
    section: '',
    search: ''
  });

  // Table and data states
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [error, setError] = useState(null);
  
  // Teacher information states
  const [teacherGradeLevel, setTeacherGradeLevel] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [assignedGradeOptions, setAssignedGradeOptions] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  
  // Sort states
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  
  // Academic Year options
  const academicYearOptions = ['2025-2026','2024-2025', '2023-2024', '2022-2023'];
  
  // Get user context
  const { user } = useContext(AuthContext);

  // Function to fetch sections for a specific grade level
  const fetchSectionsForGrade = async (grade) => {
    if (!grade) {
      setAvailableSections([]);
      return;
    }
    
    try {
      setSectionsLoading(true);
      const token = localStorage.getItem('token');
      
      // Use the exact grade format without any conversion
      const response = await api.get(`/grade-sections/grade/${grade}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.length > 0) {
        // Store unique sections for dropdown (remove duplicates by section name)
        setAvailableSections([...new Map(response.data.map(item => 
          [item.sectionName, item])).values()]);
      } else {
        setAvailableSections([]);
      }
    } catch (error) {
      console.error('Error fetching sections for grade:', error);
      setAvailableSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  // First fetch teacher info to get assigned grade level and subject
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (!user || user.role !== 'Teacher' || !user.idNumber) {
        setError('You must be logged in as a teacher to view completed library hours');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/users/${user.idNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          // Handle multiple grade levels
          if (response.data.grade) {
            let assignedGrades = response.data.grade;
            
            // Check if multiple grades are assigned (comma-separated)
            if (assignedGrades.includes(',')) {
              // Split and format grade levels
              const gradesArray = assignedGrades.split(',').map(g => {
                const trimmedGrade = g.trim();
                return trimmedGrade.includes('Grade') ? trimmedGrade : `Grade ${trimmedGrade}`;
              });
              
              setAssignedGradeOptions(gradesArray);
              setFilters(prev => ({...prev, gradeLevel: gradesArray[0]})); // Set first grade as default
              setTeacherGradeLevel(gradesArray[0]);
            } else {
              // Single grade level
              const formattedGrade = assignedGrades.includes('Grade') 
                ? assignedGrades 
                : `Grade ${assignedGrades}`;
              
              setAssignedGradeOptions([formattedGrade]);
              setFilters(prev => ({...prev, gradeLevel: formattedGrade}));
              setTeacherGradeLevel(formattedGrade);
            }
          } else {
            setError('No grade level assigned to this teacher');
          }
          
          // Get teacher's subject
          if (response.data.subject) {
            setTeacherSubject(response.data.subject);
          } else {
            setError('No subject assigned to this teacher');
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

  // Effect to load initial data and fetch sections when teacher info is available
  useEffect(() => {
    if (teacherGradeLevel && teacherSubject) {
      // Set the initial grade level for display and fetch sections
      fetchSectionsForGrade(teacherGradeLevel);
      
      // Apply initial filter to load data (runs only once)
      setTimeout(() => {
        setAppliedFilters(prev => ({...prev, gradeLevel: teacherGradeLevel}));
        applyInitialFilters();
      }, 100);
    }
  }, [teacherGradeLevel, teacherSubject]);

  // Fetch available sections when grade level changes and default to "All Sections"
  useEffect(() => {
    if (filters.gradeLevel) {
      fetchSectionsForGrade(filters.gradeLevel);
      setFilters(prev => ({...prev, section: ''}));
    }
  }, [filters.gradeLevel]);

  // Initial filter application - only for first load
  const applyInitialFilters = async () => {
    try {
      setLoading(true);
      
      if (!teacherGradeLevel || !teacherSubject) {
        setLoading(false);
        return;
      }
      
      // Fetch completed library hours with just grade level and subject
      await fetchCompletedLibraryHours({
        gradeLevel: teacherGradeLevel,
        subject: teacherSubject
      });
      
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to fetch library hours data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to apply sorting when order or orderBy changes
  useEffect(() => {
    if (completedRecords.length > 0) {
      applyFiltersAndSort();
    }
  }, [order, orderBy, appliedFilters.search, completedRecords]);

  // Filter and sort data based on current state
  const applyFiltersAndSort = () => {
    let filtered = [...completedRecords];
    
    // Apply search filtering
    if (appliedFilters.search) {
      const searchLower = appliedFilters.search.toLowerCase();
      filtered = filtered.filter(record => 
        record.name?.toLowerCase().includes(searchLower) ||
        record.idNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filtered = getSortedData(filtered);
    
    setFilteredRecords(filtered);
  };

  // SortIndicator component for visual feedback
  const SortIndicator = ({ column }) => {
    if (orderBy !== column) {
      return <UnfoldMoreIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5, opacity: 0.5 }} />;
    }
    return order === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
      : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />;
  };

  // Function to handle sort requests
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Function to sort data
  const getSortedData = (data) => {
    if (!orderBy || !data.length) return data;
    
    return [...data].sort((a, b) => {
      // Handle null values
      if (a[orderBy] === null && b[orderBy] === null) return 0;
      if (a[orderBy] === null) return order === 'asc' ? -1 : 1;
      if (b[orderBy] === null) return order === 'asc' ? 1 : -1;
      
      // Special case for date sorting
      if (orderBy === 'dateCompleted') {
        const aDate = new Date(a[orderBy]);
        const bDate = new Date(b[orderBy]);
        return order === 'asc' 
          ? aDate - bDate 
          : bDate - aDate;
      }
      
      // For string values (most other columns)
      const aValue = String(a[orderBy]).toLowerCase();
      const bValue = String(b[orderBy]).toLowerCase();
      
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  // Function to fetch completed library hours data with improved data processing
  const fetchCompletedLibraryHours = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      
      // Add all filter parameters
      for (const [key, value] of Object.entries(params)) {
        if (value) {
          queryParams.append(key, value);
        }
      }
      
      // Make API call to fetch completed library hours
      const response = await api.get(
        `/library-hours/completed?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Process the data to extract grade and section info
      let processedData = response.data.map(record => {
        // Default grade to the selected grade level
        let grade = appliedFilters.gradeLevel || teacherGradeLevel || '';
        let section = appliedFilters.section || '';
        
        // Try to extract from record data
        if (record.gradeLevel) {
          grade = record.gradeLevel.includes('Grade') ? record.gradeLevel : `Grade ${record.gradeLevel}`;
        }
        
        if (record.section) {
          section = record.section;
        }
        // If record has a combined gradeSection field
        else if (record.gradeSection) {
          const parts = record.gradeSection.split(/\s+/);
          
          // Format: "Grade 4 HAPPY"
          if (parts.length >= 3 && parts[0].toLowerCase() === 'grade') {
            grade = `${parts[0]} ${parts[1]}`;
            section = parts.slice(2).join(' ');
          }
          // Format: "4 HAPPY" 
          else if (parts.length >= 2) {
            grade = parts[0].includes('Grade') ? parts[0] : `Grade ${parts[0]}`;
            section = parts.slice(1).join(' ');
          }
        }
        
        // Use "HAPPY" as default section for Grade 4 if nothing else is available
        if (!section && grade.includes('4')) {
          section = "HAPPY";
        }
        
        return {
          ...record,
          grade: grade,
          section: section,
          // Format date if needed
          dateCompleted: record.dateCompleted ? new Date(record.dateCompleted).toLocaleDateString() : ''
        };
      });
      
      // Additional client-side filtering for academic years if needed
      if (params.academicYear && processedData.length > 0) {
        const [startYear, endYear] = params.academicYear.split('-').map(year => parseInt(year));
        
        processedData = processedData.filter(record => {
            if (!record.dateCompleted) return false;
            
            // Parse the date
            const date = new Date(record.dateCompleted);
            if (isNaN(date.getTime())) return false;
            
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 0-based to 1-based
            
            // Academic year pattern: Jul-Dec in first year, Jan-Jun in second year
            return (month >= 7 && month <= 12 && year === startYear) || 
                   (month >= 1 && month <= 6 && year === endYear);
        });
        
        console.log(`Filtered to ${processedData.length} records for academic year ${params.academicYear}`);
    }
      
      setCompletedRecords(processedData);
      setFilteredRecords(processedData);
    } catch (err) {
      console.error('Error fetching completed library hours:', err);
      setError('Failed to fetch completed library hours. Please try again later.');
      toast.error('Failed to fetch completed library hours');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Handle mutual exclusivity between date fields and academic year
    if (name === 'academicYear' && value) {
      setFilters(prev => ({
        ...prev,
        academicYear: value,
        dateFrom: '',
        dateTo: ''
      }));
    } else if (name === 'dateFrom' && value) {
      // If selecting a date, clear academic year
      const dateTo = filters.dateTo;
      if (dateTo && new Date(value) > new Date(dateTo)) {
        // If dateFrom is later than dateTo, reset dateTo
        setFilters(prev => ({
          ...prev,
          dateFrom: value,
          dateTo: '',
          academicYear: ''
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          dateFrom: value,
          academicYear: ''
        }));
      }
    } else if (name === 'dateTo' && value) {
      // If selecting a date, clear academic year
      setFilters(prev => ({
        ...prev,
        dateTo: value, 
        academicYear: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  // Apply filters - updates applied filter states and fetches data
  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    
    // Update applied filters
    setAppliedFilters({...filters});
    setTeacherGradeLevel(filters.gradeLevel);
    
    const filterParams = {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      academicYear: filters.academicYear,
      quarter: filters.quarter,
      gradeLevel: filters.gradeLevel,
      section: filters.section,
      subject: teacherSubject
    };
    
    // Remove empty parameters
    Object.keys(filterParams).forEach(key => {
      if (!filterParams[key]) delete filterParams[key];
    });
    
    fetchCompletedLibraryHours(filterParams)
      .finally(() => {
        setIsApplyingFilters(false);
        setPage(0); // Reset to first page
      });
    
    // Build filter description for toast
    const filterDescriptions = [];
    if (filters.gradeLevel) filterDescriptions.push(`Grade: ${filters.gradeLevel}`);
    if (filters.section) filterDescriptions.push(`Section: ${filters.section}`);
    if (filters.quarter) filterDescriptions.push(`Quarter: ${filters.quarter}`);
    if (teacherSubject) filterDescriptions.push(`Subject: ${teacherSubject}`);
    if (filters.dateFrom) filterDescriptions.push(`From: ${filters.dateFrom}`);
    if (filters.dateTo) filterDescriptions.push(`To: ${filters.dateTo}`);
    if (filters.academicYear) filterDescriptions.push(`AY: ${filters.academicYear}`);
    
    toast.info(`Filters applied: ${filterDescriptions.length > 0 ? filterDescriptions.join(', ') : 'None'}`);
  };

  // Reset filters - clears filter states and fetches data with default filters
  const handleResetFilters = () => {
    // Keep the grade level but reset other filters
    const currentGradeLevel = filters.gradeLevel;
    setFilters({
      dateFrom: '',
      dateTo: '',
      academicYear: '',
      quarter: '',
      gradeLevel: currentGradeLevel,
      section: '',
      search: ''
    });
    
    // Apply the cleared filters (will happen on next render)
    setTimeout(() => {
      handleApplyFilters();
    }, 0);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get current page records
  const displayedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return appliedFilters.dateFrom || 
           appliedFilters.dateTo || 
           appliedFilters.academicYear || 
           appliedFilters.quarter || 
           appliedFilters.search || 
           appliedFilters.section;
  };

  // Common style for sortable table headers
  const sortableHeaderStyle = {
    fontWeight: "bold", 
    backgroundColor: "#8C383E", 
    color: "#fff",
    cursor: "pointer",
    '&:hover': {
      backgroundColor: "#9C484E" // Lighter shade on hover
    }
  };

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box 
        sx={{ 
          display: 'flex', 
          height: '100vh',
          overflow: 'hidden' // Prevent outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: '32px 32px 64px 32px', // Increased bottom padding
            flexGrow: 1,
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': { // Style scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          {/* Title */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{ 
                fontWeight: 'bold', 
                color: '#000', 
                textAlign: 'left',
                fontSize: '32px'
              }}
            >
              Completed Library Hours - {appliedFilters.gradeLevel || teacherGradeLevel} - {teacherSubject}
              {appliedFilters.section && ` - ${appliedFilters.section}`}
            </Typography>
            <Typography 
              sx={{ 
                color: '#000', 
                fontWeight: 'bold', 
                textAlign: 'right',
              }}
            >
              Total no. of completed library hours: {filteredRecords.length}
              <br />
              Total no. of students: {new Set(filteredRecords.map(record => record.idNumber)).size}
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 3,
            }}
          >
            <TextField
              placeholder="Type here to search..."
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={handleSearchChange}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                width: { xs: '100%', sm: '360px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Filter Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* Grade Level Filter - Always visible but disabled when teacher has only one grade */}
              <TextField
                name="gradeLevel"
                label="Grade Level"
                select
                variant="outlined"
                size="small"
                value={filters.gradeLevel}
                onChange={handleFilterChange}
                disabled={assignedGradeOptions.length <= 1}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  minWidth: '150px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              >
                {assignedGradeOptions.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </TextField>

              {/* Section Filter */}
              <TextField
                name="section"
                label="Section"
                select
                variant="outlined"
                size="small"
                value={filters.section}
                onChange={handleFilterChange}
                disabled={sectionsLoading} // Disable while sections are loading
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  minWidth: '150px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              >
                <MenuItem value="">All Sections</MenuItem>
                {sectionsLoading ? (
                  <MenuItem disabled>Loading sections...</MenuItem>
                ) : availableSections.length === 0 ? (
                  <MenuItem disabled>No sections available</MenuItem>
                ) : (
                  availableSections.map((sectionItem) => (
                    <MenuItem key={sectionItem.id || sectionItem.sectionName} value={sectionItem.sectionName}>
                      {sectionItem.sectionName}
                    </MenuItem>
                  ))
                )}
              </TextField>
              
              <TextField
                name="dateFrom"
                label="Date From"
                type="date"
                variant="outlined"
                size="small"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                disabled={!!filters.academicYear} // Disable if academicYear has a value
                sx={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '15px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="dateTo"
                label="Date To"
                type="date"
                variant="outlined"
                size="small"
                value={filters.dateTo}
                onChange={handleFilterChange}
                disabled={!!filters.academicYear || !filters.dateFrom} // Disable if academicYear has a value or dateFrom is empty
                inputProps={{
                  min: filters.dateFrom || undefined // Set minimum date to dateFrom
                }}
                sx={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '15px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
              {/* Quarter filter */}
              <TextField
                name="quarter"
                label="Quarter"
                select
                variant="outlined"
                size="small"
                value={filters.quarter}
                onChange={handleFilterChange}
                sx={{ backgroundColor: '#fff', borderRadius: '15px', minWidth: '150px' }}
              >
                <MenuItem value="">All Quarters</MenuItem>
                <MenuItem value="First">First</MenuItem>
                <MenuItem value="Second">Second</MenuItem>
                <MenuItem value="Third">Third</MenuItem>
                <MenuItem value="Fourth">Fourth</MenuItem>
              </TextField>
              <TextField
                name="academicYear"
                label="Academic Year"
                select
                variant="outlined"
                size="small"
                value={filters.academicYear}
                onChange={handleFilterChange}
                disabled={!!filters.dateFrom || !!filters.dateTo} // Disable if either date has a value
                sx={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '15px', 
                  minWidth: '200px',
                  "& .Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }
                }}
              >
                <MenuItem value="">Select Academic Year</MenuItem>
                {academicYearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={isApplyingFilters}
                sx={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                  "&:hover": { backgroundColor: "#FFC107" },
                }}
              >
                {isApplyingFilters ? "Applying..." : "Apply Filters"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters() || isApplyingFilters}
                sx={{
                  borderColor: "#FFD700",
                  color: "#000",
                  "&:hover": { 
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    borderColor: "#FFD700"
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Table Container */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '15px',
              boxShadow: 3,
              overflow: 'visible', // Changed from 'auto' to 'visible'
              marginTop: 3,
              marginBottom: 5, // Added bottom margin
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Table sx={{ flexGrow: 1 }}> {/* Removed stickyHeader */}
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => handleRequestSort('idNumber')}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by ID number">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        ID Number <SortIndicator column="idNumber" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort('name')}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by name">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Name <SortIndicator column="name" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  {/* Added Grade Column */}
                  <TableCell 
                    onClick={() => handleRequestSort('grade')}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by grade">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Grade <SortIndicator column="grade" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  {/* Added Section Column */}
                  <TableCell 
                    onClick={() => handleRequestSort('section')}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by section">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Section <SortIndicator column="section" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort('subject')}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by subject">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Subject <SortIndicator column="subject" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort('quarter')}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by quarter">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Quarter <SortIndicator column="quarter" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleRequestSort('dateCompleted')}
                    sx={sortableHeaderStyle}
                  >
                    <Tooltip title="Sort by date completed">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Date Completed <SortIndicator column="dateCompleted" />
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={32} sx={{ mr: 2 }} />
                      Loading completed library hours...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'error.main' }}>
                      {error}
                    </TableCell>
                  </TableRow>
                ) : displayedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No completed library hours found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedRecords.map((record, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{record.idNumber}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.grade || appliedFilters.gradeLevel}</TableCell>
                      <TableCell>{record.section || (record.grade?.includes('4') ? 'HAPPY' : '')}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>{record.quarter}</TableCell>
                      <TableCell>{record.dateCompleted}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                paddingTop: 2,
                paddingBottom: 2, // Added bottom padding
                backgroundColor: "transparent",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                width: "100%",
                position: "relative", // Ensure visibility
              }}
            />
          </TableContainer>
        </Box>
      </Box>
    </>
  );
};

export default CompletedLibraryHours;