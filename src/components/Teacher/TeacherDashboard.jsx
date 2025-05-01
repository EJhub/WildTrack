import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import SetLibraryHours from './components/SetLibraryHours';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from '../AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import EditLibraryHours from './components/EditLibraryHours ';
import EditIcon from '@mui/icons-material/Edit';
// Import API utility
import api from '../../utils/api';

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [pendingGradeLevel, setPendingGradeLevel] = useState(''); // Track grade level before applying filter
  const [section, setSection] = useState('');
  const [deadlines, setDeadlines] = useState([]);
  const [assignedDeadlines, setAssignedDeadlines] = useState([]); // New state for assigned deadlines
  const [participantsData, setParticipantsData] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [assignedDeadlinesLoading, setAssignedDeadlinesLoading] = useState(true); // New loading state

  const [editOpen, setEditOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [statistics, setStatistics] = useState({
    studentsInsideLibrary: 0,
    totalRegisteredStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [quarter, setQuarter] = useState('');
  // New state for subject filter
  const [subject, setSubject] = useState('');
  const [teacherSubject, setTeacherSubject] = useState(''); // Store teacher's assigned subject
  const [teacherAssignments, setTeacherAssignments] = useState({
    assignedGrade: '',
    assignedSection: ''
  });
  // State to prevent automatic refreshing during filter application
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [filteredSection, setFilteredSection] = useState(''); // Track the actually applied section filter
  const [filteredQuarter, setFilteredQuarter] = useState(''); // Track the actually applied quarter filter
  const [filteredSubject, setFilteredSubject] = useState(''); // Track the actually applied subject filter
  const [filteredDateFrom, setFilteredDateFrom] = useState(''); // Track the applied date from filter
  const [filteredDateTo, setFilteredDateTo] = useState(''); // Track the applied date to filter
  const [filteredAcademicYear, setFilteredAcademicYear] = useState(''); // Track the applied academic year filter
  const [assignedGradeOptions, setAssignedGradeOptions] = useState([]); // Store the assigned grades as options
  const [sectionsLoading, setSectionsLoading] = useState(false); // Track sections loading state
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Function to fetch dashboard statistics with proper filtering
  const fetchDashboardStatistics = useCallback(async (filterParams = {}) => {
    try {
      setStatisticsLoading(true);
      const token = localStorage.getItem('token');
      
      // Create params for filtering
      const params = new URLSearchParams();
      
      // Always include the selected grade level if available
      if (gradeLevel) {
        params.append('gradeLevel', gradeLevel);
      }
      
      // Only add section filter if it's in the filterParams or use filtered value
      if (filterParams.section) {
        params.append('section', filterParams.section);
      } else if (filteredSection) {
        params.append('section', filteredSection);
      }
      
      // Always add teacher's subject filter if available
      if (teacherSubject) {
        params.append('subject', teacherSubject);
      }
      
      // Make API call with filters
      const url = `/statistics/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update statistics state with response data
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setStatisticsLoading(false);
    }
  }, [gradeLevel, teacherSubject, filteredSection]);

  // Function to fetch sections for a specific grade level
  const fetchSectionsForGrade = async (grade) => {
    if (!grade) {
      setAvailableSections([]);
      setSection('');
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
        const uniqueSections = [...new Map(response.data.map(item => 
          [item.sectionName, item])).values()];
          
        setAvailableSections(uniqueSections);
        
        // Log for debugging
        console.log(`Fetched ${uniqueSections.length} sections for grade ${grade}:`, 
          uniqueSections.map(s => s.sectionName).join(', '));
      } else {
        console.log(`No sections found for grade ${grade}`);
        setAvailableSections([]);
        setSection('');
      }
    } catch (error) {
      console.error('Error fetching sections for grade:', error);
      toast.error("Failed to load sections for the selected grade");
      setAvailableSections([]);
      setSection('');
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleEditClick = (requirement) => {
    setSelectedRequirement(requirement);
    setEditOpen(true);
  };
  
  // Function to close edit modal
  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedRequirement(null);
  };
  
  // Function to handle updates after editing
  const handleRequirementUpdate = (updatedRequirement) => {
    // Refresh assigned deadlines
    fetchAssignedDeadlines();
    
    // Refresh filtered deadlines if filters are applied
    applyFilters();
  };

  // Function to fetch teacher assignments (grade, section, and subject)
  const fetchTeacherAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user || !user.idNumber) {
        return;
      }
      
      const response = await api.get(`/users/${user.idNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the teacher's information
      if (response.data) {
        // Get grade info (could be comma-separated string if multiple grades)
        let assignedGrades = response.data.grade || '';
        
        // Get teacher's assigned subject
        const assignedSubject = response.data.subject || '';
        
        setTeacherAssignments({
          assignedGrade: assignedGrades,
          assignedSection: response.data.section || ''
        });
        
        // Set the teacher's subject
        setTeacherSubject(assignedSubject);
        
        // Pre-populate the subject filter with teacher's subject
        setSubject(assignedSubject);
        setFilteredSubject(assignedSubject);
        
        // Set the grade options and default selection
        if (assignedGrades.includes(',')) {
          // For multiple grades, extract the first grade as default
          const gradesArray = assignedGrades.split(',').map(g => g.trim());
          setAssignedGradeOptions(gradesArray);
          setGradeLevel(gradesArray[0]); // Set first grade as default
        } else {
          // For single grade
          setAssignedGradeOptions([assignedGrades]);
          setGradeLevel(assignedGrades);
        }
        
        console.log(`Teacher subject set to: ${assignedSubject}`);
        console.log(`Teacher grades set to: ${assignedGrades}`);
      }
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      toast.error("Failed to load your assigned grade and section");
    }
  };

  // Fetch assigned deadlines (not affected by filters)
  const fetchAssignedDeadlines = async (overrideGradeLevel = null) => {
    try {
      setAssignedDeadlinesLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Only include selected grade (or override if provided)
      const currentGradeLevel = overrideGradeLevel || gradeLevel;
      if (currentGradeLevel) {
        params.append('gradeLevel', currentGradeLevel);
      }
      
      // Always use teacher's subject if available
      if (teacherSubject) {
        params.append('subject', teacherSubject);
      }
      
      // Fetch assigned deadlines
      const deadlinesResponse = await api.get(`/set-library-hours${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter deadlines by current grade and subject
      const filteredDeadlines = deadlinesResponse.data.filter(deadline => {
        const gradeMatch = deadline.gradeLevel === currentGradeLevel;
        
        if (teacherSubject) {
          return gradeMatch && deadline.subject === teacherSubject;
        }
        
        return gradeMatch;
      });
      
      setAssignedDeadlines(filteredDeadlines);
    } catch (error) {
      console.error('Error fetching assigned deadlines:', error);
      toast.error("Failed to fetch assigned deadlines: " + (error.response?.data?.message || error.message));
    } finally {
      setAssignedDeadlinesLoading(false);
    }
  };

  // Initial setup when component mounts
  useEffect(() => {
    // Check if user is authenticated and has Teacher role
    if (!user || user.role !== 'Teacher') {
      toast.error("Unauthorized access. Please log in as a teacher.");
      logout();
      navigate('/login');
      return;
    }
    
    // Fetch teacher's assigned grade, section, and subject
    fetchTeacherAssignments();
  }, [user, logout, navigate]);

  // Handle grade level change - immediately fetch sections for the selected grade
  const handleGradeLevelChange = (e) => {
    const newGradeLevel = e.target.value;
    setPendingGradeLevel(newGradeLevel);
    
    // Clear section selection when grade level changes
    setSection('');
    
    // Immediately fetch sections for the new grade level
    if (newGradeLevel) {
      setSectionsLoading(true);
      fetchSectionsForGrade(newGradeLevel);
    } else {
      setAvailableSections([]);
    }
  };

  // Helper function that only uses the applied (filtered) values
  const fetchParticipantsDataWithAppliedFilters = async () => {
    try {
      setParticipantsLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (gradeLevel) {
        params.append('gradeLevel', gradeLevel);
      }
      
      // Always use monthly view
      params.append('timeframe', 'monthly');
      
      // Always filter by teacher's subject
      if (teacherSubject) {
        params.append('subject', teacherSubject);
      }
      
      // Only use FILTERED values (those that have been applied via the Apply Filters button)
      if (filteredSection) {
        params.append('section', filteredSection);
      }
      
      if (filteredQuarter) {
        params.append('quarter', filteredQuarter);
      }
      
      if (filteredAcademicYear) {
        params.append('academicYear', filteredAcademicYear);
      }
      
      if (filteredDateFrom) {
        params.append('dateFrom', filteredDateFrom);
      }
      
      if (filteredDateTo) {
        params.append('dateTo', filteredDateTo);
      }
      
      // Debug log to verify filters
      console.log('Participants data fetch params (applied filters):', params.toString());
      
      // Fetch participants data
      const url = `/statistics/active-participants${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the data for chart display
      const formattedData = response.data.map(item => ({
        name: getFullMonthName(item.month),
        participants: item.participants
      }));
      
      setParticipantsData(formattedData);
    } catch (err) {
      console.error('Error fetching participants data:', err);
      toast.error("Failed to load participants data");
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Effect for data fetching when grade level or teacher subject changes
  useEffect(() => {
    if (!user) return;
    
    // Skip this effect if we're in the middle of applying filters
    if (isApplyingFilters) return;
    
    // On initial load or when dependencies change outside of filter application
    const initialLoad = async () => {
      if (!gradeLevel) return;
      
      // Make sure pending grade level matches actual grade level
      setPendingGradeLevel(gradeLevel);
      
      // Fetch dashboard statistics
      fetchDashboardStatistics();
      
      // Fetch assigned deadlines
      fetchAssignedDeadlines();
      
      // Function to fetch filtered deadlines
      const fetchDeadlines = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          
          // Build query parameters
          const params = new URLSearchParams();
          
          if (gradeLevel) {
            params.append('gradeLevel', gradeLevel);
          }
          
          if (teacherSubject) {
            params.append('subject', teacherSubject);
          }
          
          // Use filteredAcademicYear instead of academicYear to ensure it only updates when Apply is clicked
          if (filteredAcademicYear) {
            params.append('academicYear', filteredAcademicYear);
          }
          
          // Fetch deadlines with filters
          const deadlinesResponse = await api.get(`/set-library-hours${params.toString() ? `?${params.toString()}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Filter deadlines by current grade, subject, and academic year
          const filteredDeadlines = deadlinesResponse.data.filter(deadline => {
            const gradeMatch = deadline.gradeLevel === gradeLevel;
            const subjectMatch = teacherSubject ? deadline.subject === teacherSubject : true;
            const academicYearMatch = filteredAcademicYear ? deadline.academicYear === filteredAcademicYear : true;
            
            return gradeMatch && subjectMatch && academicYearMatch;
          });
          
          setDeadlines(filteredDeadlines);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error("Failed to fetch data: " + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      };
      
      // Fetch all required data
      fetchDeadlines();
      
      // Use a custom function that only passes the filtered (applied) values
      fetchParticipantsDataWithAppliedFilters();
      
      // For the initial grade level, fetch sections
      fetchSectionsForGrade(gradeLevel);
    };
    
    initialLoad();
    
    // Set up refresh intervals
    const participantsInterval = setInterval(fetchParticipantsDataWithAppliedFilters, 300000); // 5 minutes
    const statisticsInterval = setInterval(() => fetchDashboardStatistics(), 60000); // 1 minute
    const assignedDeadlinesInterval = setInterval(fetchAssignedDeadlines, 60000); // 1 minute
    
    // Cleanup intervals when component unmounts
    return () => {
      clearInterval(participantsInterval);
      clearInterval(statisticsInterval);
      clearInterval(assignedDeadlinesInterval);
    };
  }, [user, gradeLevel, teacherSubject, filteredAcademicYear, filteredSection, filteredQuarter, 
      filteredDateFrom, filteredDateTo, fetchDashboardStatistics, isApplyingFilters]);

  // Fetch participants data (only used with explicitly passed filterParams)
  const fetchParticipantsData = async (filterParams = {}) => {
    try {
      setParticipantsLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Only include basic filters by default
      if (gradeLevel) {
        params.append('gradeLevel', gradeLevel);
      }
      
      // Always use monthly view
      params.append('timeframe', 'monthly');
      
      // Always filter by teacher's subject
      if (teacherSubject) {
        params.append('subject', teacherSubject);
      }
      
      // IMPORTANT: Only use explicitly passed filters, NOT the form state
      // This prevents automatic filter application when form values change
      if (filterParams.section) params.append('section', filterParams.section);
      if (filterParams.quarter) params.append('quarter', filterParams.quarter);
      if (filterParams.academicYear) params.append('academicYear', filterParams.academicYear);
      if (filterParams.dateFrom) params.append('dateFrom', filterParams.dateFrom);
      if (filterParams.dateTo) params.append('dateTo', filterParams.dateTo);
      
      // OR if we're using the filtered (already applied) values
      if (filterParams.useFilteredValues) {
        if (filteredSection) params.append('section', filteredSection);
        if (filteredQuarter) params.append('quarter', filteredQuarter);
        if (filteredAcademicYear) params.append('academicYear', filteredAcademicYear);
        if (filteredDateFrom) params.append('dateFrom', filteredDateFrom);
        if (filteredDateTo) params.append('dateTo', filteredDateTo);
      }
      
      // Fetch participants data
      const url = `/statistics/active-participants${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the data for chart display
      const formattedData = response.data.map(item => ({
        name: getFullMonthName(item.month),
        participants: item.participants
      }));
      
      setParticipantsData(formattedData);
    } catch (err) {
      console.error('Error fetching participants data:', err);
      toast.error("Failed to load participants data");
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Helper function to convert month abbreviation to full name
  const getFullMonthName = (monthAbbr) => {
    const monthMap = {
      'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
      'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
      'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
    };
    return monthMap[monthAbbr] || monthAbbr;
  };

  // Modal handlers
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Add deadline handler
  const handleAddDeadline = async (data) => {
    try {
      // Add the current grade level if not specified
      if (!data.gradeLevel) {
        data.gradeLevel = gradeLevel;
      }
      
      // Always set the teacher's subject for new deadlines
      if (teacherSubject) {
        data.subject = teacherSubject;
      }
      
      const token = localStorage.getItem('token');
      const response = await api.post('/set-library-hours', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.data) throw new Error('Failed to add deadline');
      
      toast.success("Library hours requirement has been created successfully!");
      
      // Refresh both deadlines (filtered and assigned)
      fetchAssignedDeadlines();
      applyFilters();
      
      handleClose();
    } catch (error) {
      console.error('Error adding deadline:', error);
      toast.error("Failed to add deadline: " + (error.response?.data?.message || error.message));
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
    }
    
    setAcademicYear(value);
  };

  // Apply filters function
  const applyFilters = async () => {
    try {
      setLoading(true);
      setIsApplyingFilters(true); // Flag to prevent automatic refresh
      
      const token = localStorage.getItem('token');
      
      // Check if grade level is changing and update if needed
      const isGradeChanging = pendingGradeLevel !== gradeLevel;
      let currentGradeLevel = gradeLevel;
      
      if (isGradeChanging) {
        currentGradeLevel = pendingGradeLevel;
        
        // Update the grade level state immediately
        setGradeLevel(pendingGradeLevel);
        
        // Clear section selection when grade level changes
        if (section) setSection('');
      }
      
      // Store the currently applied filters in the filtered states
      // This is the key step - we only update these when Apply Filters is clicked
      setFilteredSection(section);
      setFilteredQuarter(quarter);
      setFilteredDateFrom(dateFrom);
      setFilteredDateTo(dateTo);
      setFilteredAcademicYear(academicYear);
      
      // Always use teacher's subject for filtering
      const subjectToFilter = teacherSubject || subject;
      setFilteredSubject(subjectToFilter);
      
      // ---------- PARALLEL API CALLS FOR FASTER UPDATES ----------
      
      // Create promises for all the data fetching operations
      const fetchPromises = [];
      
      // 1. Fetch deadlines with filters
      const deadlinesPromise = (async () => {
        const params = new URLSearchParams();
        // Use the actual form values here since we're applying filters now
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (academicYear) params.append('academicYear', academicYear);
        if (currentGradeLevel) params.append('gradeLevel', currentGradeLevel);
        if (section) params.append('section', section);
        if (quarter) params.append('quarter', quarter);
        if (subjectToFilter) params.append('subject', subjectToFilter);
        
        const response = await api.get(`/set-library-hours?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter deadlines and update state
        const filteredDeadlines = response.data.filter(deadline => {
          const gradeMatch = deadline.gradeLevel === currentGradeLevel;
          if (subjectToFilter) {
            return gradeMatch && deadline.subject === subjectToFilter;
          }
          return gradeMatch;
        });
        
        setDeadlines(filteredDeadlines);
      })();
      fetchPromises.push(deadlinesPromise);
      
      // 2. Fetch assigned deadlines if grade level changed
      if (isGradeChanging) {
        const assignedDeadlinesPromise = fetchAssignedDeadlines(currentGradeLevel);
        fetchPromises.push(assignedDeadlinesPromise);
      }
      
      // 3. Fetch participants data for chart with the newly applied filters
      const participantsPromise = (async () => {
        // Immediately set loading state for chart
        setParticipantsLoading(true);
        
        const params = new URLSearchParams();
        params.append('timeframe', 'monthly');
        
        // Use the actual form values here since we're applying filters now
        if (currentGradeLevel) params.append('gradeLevel', currentGradeLevel);
        if (section) params.append('section', section);
        if (quarter) params.append('quarter', quarter);
        if (academicYear) params.append('academicYear', academicYear);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (subjectToFilter) params.append('subject', subjectToFilter);
        
        // Log params for debugging
        console.log('Apply filters - participants fetch params:', params.toString());
        
        const url = `/statistics/active-participants${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Process and update chart data immediately
        const formattedData = response.data.map(item => ({
          name: getFullMonthName(item.month),
          participants: item.participants
        }));
        
        setParticipantsData(formattedData);
        setParticipantsLoading(false);
      })();
      fetchPromises.push(participantsPromise);
      
      // 4. Fetch statistics
      const statisticsPromise = (async () => {
        setStatisticsLoading(true);
        
        const params = new URLSearchParams();
        if (currentGradeLevel) params.append('gradeLevel', currentGradeLevel);
        if (section) params.append('section', section);
        if (subjectToFilter) params.append('subject', subjectToFilter);
        
        const url = `/statistics/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStatistics(response.data);
        setStatisticsLoading(false);
      })();
      fetchPromises.push(statisticsPromise);
      
      // Wait for all fetches to complete
      await Promise.all(fetchPromises);
      
      // Build filter description for toast
      const filterDescriptions = [];
      if (currentGradeLevel) filterDescriptions.push(`Grade: ${currentGradeLevel}`);
      if (section) filterDescriptions.push(`Section: ${section}`);
      if (quarter) filterDescriptions.push(`Quarter: ${quarter}`);
      if (subjectToFilter) filterDescriptions.push(`Subject: ${subjectToFilter}`);
      if (dateFrom) filterDescriptions.push(`From: ${dateFrom}`);
      if (dateTo) filterDescriptions.push(`To: ${dateTo}`);
      if (academicYear) filterDescriptions.push(`AY: ${academicYear}`);
      
      // Show toast after all data is fetched and states are updated
      toast.info(`Filters applied: ${filterDescriptions.length > 0 ? filterDescriptions.join(', ') : 'None'}`);
      
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error(`Failed to apply filters: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setIsApplyingFilters(false); // Reset flag once everything is complete
    }
  };

  // Clear filters but maintain teacher's subject filter and grade level
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setAcademicYear('');
    setSection('');
    setQuarter('');
    setFilteredSection('');
    setFilteredQuarter('');
    setFilteredDateFrom('');
    setFilteredDateTo('');
    setFilteredAcademicYear('');
    // Maintain teacher's subject filter
    setSubject(teacherSubject);
    setFilteredSubject(teacherSubject);
    
    // Reset pending grade level back to actual grade level
    setPendingGradeLevel(gradeLevel);
    
    // Apply cleared filters
    toast.info("Filters cleared (subject and grade level filters maintained)");
    applyFilters();
  };

  // Prepare displayed assigned deadlines for current page
  const displayedAssignedDeadlines = assignedDeadlines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get appropriate label for student count based on filtering
  const getStudentCountLabel = () => {
    const subjectText = teacherSubject ? ` (${teacherSubject})` : "";
    
    if (filteredSection) {
      return `TOTAL REGISTERED ${gradeLevel} SECTION ${filteredSection}${subjectText} STUDENTS`;
    } else {
      return `TOTAL REGISTERED ${gradeLevel}${subjectText} STUDENTS`;
    }
  };

  // Get chart title
  const getChartTitle = () => {
    const parts = [];
    parts.push("Active Library Hours Participants");
    
    if (gradeLevel) {
      parts.push(gradeLevel);
    }
    
    if (filteredSection) {
      parts.push(`Section ${filteredSection}`);
    }
    
    if (filteredQuarter) {
      parts.push(`${filteredQuarter} Quarter`);
    }
    
    // Always show teacher's subject in chart title
    if (teacherSubject) {
      parts.push(`${teacherSubject}`);
    }
    
    // Add academic year to chart title if specified
    if (filteredAcademicYear || academicYear) {
      parts.push(`AY ${filteredAcademicYear || academicYear}`);
    }
    
    // Add date range to chart title if specified
    if (filteredDateFrom && filteredDateTo) {
      parts.push(`${filteredDateFrom} to ${filteredDateTo}`);
    } else if (filteredDateFrom) {
      parts.push(`From ${filteredDateFrom}`);
    } else if (filteredDateTo) {
      parts.push(`Until ${filteredDateTo}`);
    }
    
    return parts.join(' - ');
  };

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return filteredSection || filteredQuarter || filteredDateFrom || 
           filteredDateTo || filteredAcademicYear;
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
            flexGrow: 1,
            padding: '32px 32px 120px 32px', // Increased bottom padding
            overflow: 'auto', // Enable scrolling for main content
            height: '100%', // Fill available height
            '&::-webkit-scrollbar': { // Show scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          {/* Top row with student stats and library hours button */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4
          }}>
            {/* Total Registered Students Box */}
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                border: '1px solid #000000',
                borderRadius: 2,
                width: '300px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ color: '#000000', fontSize: 40, mr: 2 }} />
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {statisticsLoading ? <CircularProgress size={24} /> : statistics.totalRegisteredStudents}
                </Typography>
              </Box>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000000',
                  '&:hover': { backgroundColor: '#FFD700' },
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  width: '100%',
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                }}
              >
                <CheckIcon sx={{ color: '#800000', mr: 1 }} />
                {getStudentCountLabel()}
              </Button>
            </Paper>

            {/* Set Library Hours Button */}
            <Button 
              variant="contained" 
              color="warning" 
              sx={{ 
                backgroundColor: '#FFD700', 
                color: '#000', 
                height: '50px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                px: 3,
                '&:hover': { backgroundColor: '#E6C300' }
              }} 
              onClick={handleClickOpen}
            >
              Set Library Hours
            </Button>
          </Box>

          {/* Filters Section */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Date From"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  disabled={!!academicYear} // Disable if academicYear has a value
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Date To"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={dateTo}
                  onChange={handleDateToChange}
                  disabled={!!academicYear || !dateFrom} // Disable if academicYear has a value or dateFrom is empty
                  inputProps={{
                    min: dateFrom || undefined // Set minimum date to dateFrom
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Academic Year"
                  select
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={academicYear}
                  onChange={handleAcademicYearChange}
                  disabled={!!dateFrom || !!dateTo} // Disable if either date has a value
                  sx={{
                    "& .Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  }}
                >
                  <MenuItem value="">Select Academic Year</MenuItem>
                  <MenuItem value="2025-2026">2025-2026</MenuItem>
                  <MenuItem value="2024-2025">2024-2025</MenuItem>
                  <MenuItem value="2023-2024">2023-2024</MenuItem>
                  <MenuItem value="2022-2023">2022-2023</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Grade Level"
                  select
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={pendingGradeLevel}
                  onChange={handleGradeLevelChange}
                  disabled={assignedGradeOptions.length === 1} // Disable if teacher has only one grade level
                  sx={{
                    "& .Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  }}
                >
                  <MenuItem value="">Choose here...</MenuItem>
                  {/* Show teacher's assigned grades as options */}
                  {assignedGradeOptions.map(grade => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Section"
                  select
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  disabled={sectionsLoading} // Disable while sections are loading
                >
                  <MenuItem value="">All Sections</MenuItem>
                  {sectionsLoading ? (
                    <MenuItem disabled>Loading sections...</MenuItem>
                  ) : availableSections.length === 0 ? (
                    <MenuItem disabled>No sections available</MenuItem>
                  ) : (
                    availableSections.map((sectionItem) => (
                      <MenuItem key={sectionItem.id} value={sectionItem.sectionName}>
                        {sectionItem.sectionName}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Quarter"
                  select
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                >
                  <MenuItem value="">All Quarters</MenuItem>
                  <MenuItem value="First">First</MenuItem>
                  <MenuItem value="Second">Second</MenuItem>
                  <MenuItem value="Third">Third</MenuItem>
                  <MenuItem value="Fourth">Fourth</MenuItem>
                </TextField>
              </Grid>
              
              {/* Subject Filter - Disabled and pre-filled with teacher's subject */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Subject"
                  select
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={teacherSubject || subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!!teacherSubject} // Disable if teacher has an assigned subject
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Filipino">Filipino</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                <Button 
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={!hasActiveFilters()}
                >
                  Clear Filters
                </Button>
                
                <Button 
                  variant="contained"
                  startIcon={<FilterAltIcon />}
                  sx={{ 
                    backgroundColor: "#FFD700", 
                    color: "#000", 
                    "&:hover": { backgroundColor: "#FFC107" } 
                  }} 
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(hasActiveFilters() || teacherSubject) && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 215, 0, 0.1)', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">Active Filters:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {/* Display currently selected grade */}
                  {gradeLevel && (
                    <Chip 
                      label={`Grade: ${gradeLevel}`} 
                      size="small" 
                      color="secondary" 
                      variant="filled"
                    />
                  )}
                  {filteredSection && (
                    <Chip 
                      label={`Section: ${filteredSection}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                  {filteredQuarter && (
                    <Chip 
                      label={`Quarter: ${filteredQuarter}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                  {teacherSubject && (
                    <Chip 
                      label={`Subject: ${teacherSubject}`} 
                      size="small" 
                      color="secondary" 
                      variant="filled"
                    />
                  )}
                  {filteredDateFrom && (
                    <Chip 
                      label={`From: ${filteredDateFrom}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                  {filteredDateTo && (
                    <Chip 
                      label={`To: ${filteredDateTo}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                  {filteredAcademicYear && (
                    <Chip 
                      label={`AY: ${filteredAcademicYear}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Chart */}
          <Paper sx={{ padding: '16px', backgroundColor: 'rgba(215, 101, 101, 0.8)', marginBottom: '24px', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: '#000', marginBottom: '16px' }}>
              {getChartTitle()}
            </Typography>
            <Box sx={{ height: '350px' }}>
              {participantsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : participantsData.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>No participants data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participantsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#000000"
                      label={{ 
                        value: 'Month', 
                        position: 'bottom',
                        offset: -5 
                      }}
                    />
                    <YAxis 
                      stroke="#000000"
                      label={{ 
                        value: 'Number of Participants', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -5
                      }}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`${value} participants`]}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #000000' 
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="participants" 
                      name={`Participants${filteredQuarter ? ` (${filteredQuarter} Quarter)` : ''}${teacherSubject ? ` (${teacherSubject})` : ''}`}
                      fill="#FFD700" 
                      stroke="#000000"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
            
            {/* Information about participant counting */}
            {(filteredQuarter || teacherSubject || filteredDateFrom || filteredDateTo || filteredAcademicYear) && (
              <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Each student is counted as 1 participant if they have any progress
                  {filteredQuarter && ` in ${filteredQuarter} Quarter`}
                  {teacherSubject && ` for ${teacherSubject}`}
                  {filteredAcademicYear && ` during ${filteredAcademicYear}`}
                  {(filteredDateFrom || filteredDateTo) && ` within the selected date range`}.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Assigned Deadlines Table */}
          <Typography variant="h6" sx={{ textAlign: 'left', marginBottom: 2 }}>
            Assigned Deadlines for {gradeLevel} {teacherSubject || ""}
          </Typography>

          <TableContainer sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
            <Table>
            <TableHead>
    <TableRow sx={{ backgroundColor: '#781B1B' }}>
      <TableCell sx={{ color: 'white', borderTopLeftRadius: '10px' }}>Grade Level</TableCell>
      <TableCell sx={{ color: 'white' }}>Subject</TableCell>
      <TableCell sx={{ color: 'white' }}>Quarter</TableCell>
      <TableCell sx={{ color: 'white' }}>Task</TableCell>
      <TableCell sx={{ color: 'white' }}>Minutes Required</TableCell>
      <TableCell sx={{ color: 'white' }}>Due Date</TableCell>
      <TableCell sx={{ color: 'white', borderTopRightRadius: '10px' }}>Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {assignedDeadlinesLoading ? (
      <TableRow>
        <TableCell colSpan={7} align="center">
          <CircularProgress size={24} sx={{ mr: 1 }} />
          Loading...
        </TableCell>
      </TableRow>
    ) : displayedAssignedDeadlines.length === 0 ? (
      <TableRow>
        <TableCell colSpan={7} align="center">
          {`No assigned deadlines found for ${gradeLevel} ${teacherSubject || ""}`}
        </TableCell>
      </TableRow>
    ) : (
      displayedAssignedDeadlines.map((row, index) => (
        <TableRow 
          key={index} 
          sx={{ 
            backgroundColor: 'white',
            color: 'black',
            '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' },
          }}
        >
          <TableCell sx={{ borderLeft: '1px solid rgb(2, 1, 1)', borderBottom: '1px solid rgb(4, 4, 4)' }}>
            {row.gradeLevel}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
            {row.subject}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
            {row.quarter}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
            <Tooltip title={row.task || "No task description"}>
              <Typography sx={{ 
                maxWidth: 200, 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {row.task || "No task description"}
              </Typography>
            </Tooltip>
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
            {row.minutes}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgb(4, 4, 4)' }}>
            {row.deadline ? new Date(row.deadline + 'T00:00:00').toLocaleDateString() : "No deadline"}
          </TableCell>
          <TableCell sx={{ borderRight: '1px solid rgb(4, 4, 4)', borderBottom: '1px solid rgb(4, 4, 4)' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => handleEditClick(row)}
              sx={{
                borderColor: '#781B1B',
                color: '#781B1B',
                '&:hover': {
                  backgroundColor: 'rgba(120, 27, 27, 0.04)',
                  borderColor: '#5D1515',
                }
              }}
            >
              Edit
            </Button>
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '40px' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15]}
              component="div"
              count={assignedDeadlines.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
          
          {/* Extra spacer to ensure scrollability */}
          <Box sx={{ height: 60, width: '100%' }} />
        </Box>
      </Box>
      <SetLibraryHours 
        open={open} 
        handleClose={handleClose} 
        handleSubmit={handleAddDeadline} 
        defaultGradeLevel={teacherAssignments.assignedGrade} // Pass all assigned grades as comma-separated string
        defaultSubject={teacherSubject} // Pass the teacher's subject as the default
      />

       {/* Add the EditLibraryHours component at the bottom of TeacherDashboard */}
  <EditLibraryHours 
    open={editOpen}
    handleClose={handleEditClose}
    requirement={selectedRequirement}
    handleUpdate={handleRequirementUpdate}
  />
    </>
  );
};

export default TeacherDashboard;