import React, { useEffect, useState, useContext } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import { AuthContext } from '../AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
// Import icons for sort indicators and filters
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
// Import API utility
import api from '../../utils/api';

const StudentRecords = () => {
  // Main data states
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Pending filter states (UI selection - not yet applied)
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingGradeLevel, setPendingGradeLevel] = useState('');
  const [pendingSection, setPendingSection] = useState('');
  const [pendingQuarter, setPendingQuarter] = useState('');
  const [pendingProgress, setPendingProgress] = useState(''); // New progress filter

  // Applied filter states (actually used in data fetching)
  const [search, setSearch] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [quarter, setQuarter] = useState('');
  const [progress, setProgress] = useState(''); // New progress filter state

  // UI states
  const [loading, setLoading] = useState(true);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [error, setError] = useState(null);
  const [teacherGradeLevel, setTeacherGradeLevel] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [assignedGradeOptions, setAssignedGradeOptions] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Sorting states
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  
  // Get current user from AuthContext
  const { user } = useContext(AuthContext);

  // Helper function to properly determine progress status
  const determineProgress = (student) => {
    // First check if the progress is explicitly provided by the backend
    if (student.progress) {
      // Backend already provided a status, use that
      return student.progress;
    }
    
    // Check if the student has an active timeIn session
    if (student.hasActiveSession) {
      return 'In-progress';
    }
    
    // Otherwise calculate based on the data
    if (student.isCompleted) {
      return 'Completed';
    } else if (student.minutesRendered && student.minutesRendered > 0) {
      return 'In-progress';
    } else {
      return 'Not started';
    }
  };

  // Function to fetch sections for a specific grade level
  const fetchSectionsForGrade = async (grade) => {
    if (!grade) {
      setAvailableSections([]);
      return;
    }
    
    try {
      setSectionsLoading(true);
      const token = localStorage.getItem('token');
      
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

  // First fetch teacher info to get assigned grade levels and subject
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (!user || user.role !== 'Teacher' || !user.idNumber) {
        setError('You must be logged in as a teacher to view student records');
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
              setPendingGradeLevel(gradesArray[0]); // Set first grade as default in pending state
            } else {
              // Single grade level
              const formattedGrade = assignedGrades.includes('Grade') 
                ? assignedGrades 
                : `Grade ${assignedGrades}`;
              
              setAssignedGradeOptions([formattedGrade]);
              setPendingGradeLevel(formattedGrade);
            }
          }
          
          // Set the teacher's subject
          if (response.data.subject) {
            setTeacherSubject(response.data.subject);
          } else {
            setError('No subject assigned to this teacher. Please contact an administrator.');
          }
        }
      } catch (err) {
        console.error('Error fetching teacher info:', err);
        setError('Failed to fetch teacher information');
      }
    };

    fetchTeacherInfo();
  }, [user]);

  // Initial data loading effect - only runs once after teacher info is loaded
  useEffect(() => {
    if (pendingGradeLevel && teacherSubject && !selectedGradeLevel) {
      // Set the initial grade level for display and fetch sections
      setTeacherGradeLevel(pendingGradeLevel);
      fetchSectionsForGrade(pendingGradeLevel);
      
      // Apply initial filter to load data (runs only once)
      setTimeout(() => {
        setSelectedGradeLevel(pendingGradeLevel);
        applyInitialFilters();
      }, 100);
    }
  }, [pendingGradeLevel, teacherSubject]);

  // Fetch available sections when grade level changes and default to "All Sections"
  useEffect(() => {
    if (pendingGradeLevel) {
      // Fetch sections and then check if we should apply "All Sections"
      const fetchAndApplySections = async () => {
        await fetchSectionsForGrade(pendingGradeLevel);
        
        // After sections are fetched, set to "All Sections" by default
        setPendingSection('');
      };
      
      fetchAndApplySections();
    }
  }, [pendingGradeLevel]);

  // Initial filter application - only for first load
  const applyInitialFilters = async () => {
    try {
      setLoading(true);
      
      if (!pendingGradeLevel || !teacherSubject) {
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Fetch students with just grade level and subject
      const response = await api.get(`/students`, {
        params: {
          role: 'Student',
          gradeLevel: pendingGradeLevel,
          subject: teacherSubject
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedStudents = response.data.map((student) => {
        // Split grade and section for separate display
        let grade = '';
        let section = '';
        
        if (student.grade && student.section) {
          grade = student.grade;
          section = student.section;
        } else if (student.gradeSection) {
          // Try to parse from combined gradeSection field (e.g., "Grade 4 HAPPY")
          const gradeSectionParts = student.gradeSection.split(/\s+/);
          if (gradeSectionParts.length >= 2) {
            // Check if first part contains "Grade"
            if (gradeSectionParts[0].toLowerCase() === 'grade') {
              grade = `${gradeSectionParts[0]} ${gradeSectionParts[1]}`;
              section = gradeSectionParts.slice(2).join(' ');
            } else {
              grade = gradeSectionParts[0];
              section = gradeSectionParts.slice(1).join(' ');
            }
          } else {
            grade = student.gradeSection;
            section = '';
          }
        }
        
        // Calculate the proper progress status
        const progressStatus = determineProgress(student);
        
        return {
          idNumber: student.idNumber,
          name: `${student.firstName} ${student.lastName}`,
          grade: grade,
          section: section,
          gradeSection: student.gradeSection || `${grade} ${section}` || 'N/A',
          subject: teacherSubject,
          quarter: student.quarter || '',
          progress: progressStatus,
          minutesRendered: student.minutesRendered || 0,
          requiredMinutes: student.requiredMinutes || 0,
          hasActiveSession: student.hasActiveSession || false,
          isCompleted: student.isCompleted || false
        };
      });

      setStudents(formattedStudents);
      
      // Apply default sorting
      const sortedData = getSortedData(formattedStudents);
      setFilteredStudents(sortedData);
      
    } catch (err) {
      console.error('Error fetching initial student data:', err);
      setError('Failed to fetch student records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle grade level change
  const handleGradeLevelChange = (e) => {
    const newGradeLevel = e.target.value;
    setPendingGradeLevel(newGradeLevel);
    
    // Immediately fetch sections for the new grade level
    if (newGradeLevel) {
      fetchSectionsForGrade(newGradeLevel);
      
      // Reset pending section when grade changes to "All Sections"
      setPendingSection('');
    } else {
      setAvailableSections([]);
    }
  };

  // Apply filters function
  const applyFilters = async () => {
    try {
      setLoading(true);
      setIsApplyingFilters(true); // Flag to prevent automatic refresh
      
      const token = localStorage.getItem('token');
      
      // Update all active filter states from pending states
      setSelectedGradeLevel(pendingGradeLevel);
      setTeacherGradeLevel(pendingGradeLevel); // Update display state
      setSelectedSection(pendingSection);
      setQuarter(pendingQuarter);
      setSearch(pendingSearch);
      setProgress(pendingProgress);
      
      // Build query parameters for API call - only include parameters supported by the API
      const params = {
        role: 'Student',
        gradeLevel: pendingGradeLevel,
        subject: teacherSubject
      };
      
      // Add quarter filter - API supports this
      if (pendingQuarter) params.quarter = pendingQuarter;
      
      // Make the API call with supported filters only
      const response = await api.get(`/students`, {
        params: params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the student data
      const formattedStudents = response.data.map((student) => {
        // Determine the proper progress status
        const progressStatus = determineProgress(student);
        
        return {
          idNumber: student.idNumber,
          name: `${student.firstName} ${student.lastName}`,
          grade: student.grade || '',
          section: student.section || '',
          gradeSection: student.gradeSection || `${student.grade} ${student.section}` || 'N/A',
          subject: student.subject || teacherSubject,
          quarter: student.quarter || '',
          progress: progressStatus,
          // Store raw values for reference
          minutesRendered: student.minutesRendered || 0,
          requiredMinutes: student.requiredMinutes || 0,
          hasActiveSession: student.hasActiveSession || false,
          isCompleted: student.isCompleted || false
        };
      });

      // Client-side filtering for section (since backend doesn't support section filter)
      let filteredResults = formattedStudents;
      if (pendingSection) {
        filteredResults = filteredResults.filter(
          (student) => student.section === pendingSection
        );
      }
      
      // Apply progress filter if present
      if (pendingProgress) {
        filteredResults = filteredResults.filter(
          (student) => student.progress === pendingProgress
        );
      }
      
      // Then apply search filter if present
      if (pendingSearch) {
        filteredResults = filteredResults.filter(
          (student) =>
            student.name.toLowerCase().includes(pendingSearch.toLowerCase()) || 
            student.idNumber.toLowerCase().includes(pendingSearch.toLowerCase())
        );
      }
      
      setStudents(formattedStudents);
      
      // Apply sorting to the filtered results
      const sortedData = getSortedData(filteredResults);
      setFilteredStudents(sortedData);
      
      setPage(0); // Reset to first page when filtering
      
      // Build filter description for display
      const filterDescriptions = [];
      if (pendingGradeLevel) filterDescriptions.push(`Grade: ${pendingGradeLevel}`);
      if (pendingSection) filterDescriptions.push(`Section: ${pendingSection}`);
      if (pendingQuarter) filterDescriptions.push(`Quarter: ${pendingQuarter}`);
      if (teacherSubject) filterDescriptions.push(`Subject: ${teacherSubject}`);
      if (pendingProgress) filterDescriptions.push(`Progress: ${pendingProgress}`);
      
      console.log(`Filters applied: ${filterDescriptions.length > 0 ? filterDescriptions.join(', ') : 'None'}`);
      
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to fetch student records. Please try again later.');
    } finally {
      setLoading(false);
      setIsApplyingFilters(false);
    }
  };

  // Clear filters function - now immediately applies changes
  const clearFilters = () => {
    // Keep the pending grade level but reset other pending filters
    setPendingSection('');
    setPendingQuarter('');
    setPendingProgress('');
    setPendingSearch('');
    
    // Set up a small delay to ensure state updates have processed
    setTimeout(() => {
      // Apply the cleared filters immediately
      applyFilters();
    }, 0);
  };

  // Function to handle sort requests
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    // Re-sort the current data
    const sortedData = getSortedData(filteredStudents, property, isAsc ? 'desc' : 'asc');
    setFilteredStudents(sortedData);
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

  // Sorting function
  const getSortedData = (data, sortOrderBy = orderBy, sortOrder = order) => {
    if (!sortOrderBy) return data;
    
    return [...data].sort((a, b) => {
      // Handle null values
      if (a[sortOrderBy] === null && b[sortOrderBy] === null) return 0;
      if (a[sortOrderBy] === null) return sortOrder === 'asc' ? -1 : 1;
      if (b[sortOrderBy] === null) return sortOrder === 'asc' ? 1 : -1;
      
      // For string values (most columns)
      if (['idNumber', 'name', 'grade', 'section', 'subject', 'quarter'].includes(sortOrderBy)) {
        const aValue = String(a[sortOrderBy]).toLowerCase();
        const bValue = String(b[sortOrderBy]).toLowerCase();
        
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Special handling for progress column
      if (sortOrderBy === 'progress') {
        // Define a priority order for progress statuses
        const progressPriority = {
          'Not started': 1,
          'In-progress': 2,
          'Completed': 3
        };
        
        const aValue = progressPriority[a.progress] || 0;
        const bValue = progressPriority[b.progress] || 0;
        
        return sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      // Default comparison for any other columns
      return sortOrder === 'asc'
        ? (a[sortOrderBy] < b[sortOrderBy] ? -1 : 1)
        : (b[sortOrderBy] < a[sortOrderBy] ? -1 : 1);
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get displayed rows based on pagination
  const displayedRows = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return selectedSection || quarter || progress || search;
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
          <Typography
            variant="h4"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              textAlign: 'left',
              fontSize: '40px',
              marginTop: '15px',
              marginBottom: 3
            }}
          >
            Student Records - {selectedGradeLevel} {selectedSection ? `- Section ${selectedSection}` : ''} - {teacherSubject || "Loading..."}
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 3,
            }}
          >
            <TextField
              placeholder="Search by name or ID..."
              variant="outlined"
              size="small"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
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

          {/* Filters and Buttons */}
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
                value={pendingGradeLevel}
                onChange={handleGradeLevelChange}
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
                value={pendingSection}
                onChange={(e) => setPendingSection(e.target.value)}
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

              {/* Quarter Filter */}
              <TextField
                name="quarter"
                label="Quarter"
                select
                variant="outlined"
                size="small"
                value={pendingQuarter}
                onChange={(e) => setPendingQuarter(e.target.value)}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  minWidth: '150px',
                }}
              >
                <MenuItem value="">All Quarters</MenuItem>
                <MenuItem value="First">First</MenuItem>
                <MenuItem value="Second">Second</MenuItem>
                <MenuItem value="Third">Third</MenuItem>
                <MenuItem value="Fourth">Fourth</MenuItem>
              </TextField>
              
              {/* Progress Filter - New */}
              <TextField
                name="progress"
                label="Progress"
                select
                variant="outlined"
                size="small"
                value={pendingProgress}
                onChange={(e) => setPendingProgress(e.target.value)}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  minWidth: '150px',
                }}
              >
                <MenuItem value="">All Progress</MenuItem>
                <MenuItem value="Not started">Not Started</MenuItem>
                <MenuItem value="In-progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
              
              <Button
                variant="contained"
                onClick={applyFilters}
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
                onClick={clearFilters}
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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading student records...</Typography>
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: '15px',
                boxShadow: 3,
                overflow: 'visible',
                marginTop: 3,
                marginBottom: 5,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Table sx={{ flexGrow: 1 }}>
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
                      onClick={() => handleRequestSort('progress')}
                      sx={sortableHeaderStyle}
                    >
                      <Tooltip title="Sort by progress">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          Progress <SortIndicator column="progress" />
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No student records found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedRows.map((student, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{student.idNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade || selectedGradeLevel}</TableCell>
                        <TableCell>{student.section || "HAPPY"}</TableCell>
                        <TableCell>{student.subject}</TableCell>
                        <TableCell>{student.quarter}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.progress}
                            size="small"
                            sx={{
                              backgroundColor: student.progress === 'Completed' ? '#1b8c3f' : 
                                              student.progress === 'In-progress' ? '#3f51b5' : '#e0e0e0',
                              color: student.progress === 'Not started' ? 'black' : 'white',
                              fontWeight: 'bold',
                              borderRadius: '16px',
                              padding: '0 10px',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStudents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  paddingTop: 2,
                  paddingBottom: 2,
                  backgroundColor: "transparent",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  position: "relative",
                }}
              />
            </TableContainer>
          )}
        </Box>
      </Box>
    </>
  );
};

export default StudentRecords;