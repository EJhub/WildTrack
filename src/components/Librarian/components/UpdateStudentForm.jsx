import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const UpdateStudentForm = ({ open, onClose, user, onUpdate }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    idNumber: '',
    grade: '',
    section: '',
    role: 'Student',
    academicYear: '',
  });

  // State for dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  
  const roles = ['Student'];

  // Fetch dropdown options when component mounts
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch Grade Levels
        const gradesResponse = await axios.get('http://localhost:8080/api/grade-sections/all');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        setGradeOptions(uniqueGrades);

        // Fetch Academic Years
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/all');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);

      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Fetch sections when grade changes
  useEffect(() => {
    const fetchSectionsForGrade = async () => {
      if (userData.grade) {
        try {
          const response = await axios.get(`http://localhost:8080/api/grade-sections/grade/${userData.grade}`);
          const sections = response.data.map(section => section.sectionName);
          setSectionOptions(sections);
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      }
    };

    fetchSectionsForGrade();
  }, [userData.grade]);

  // Populate form data when user changes
  useEffect(() => {
    if (user && open) {
      const fetchSectionsAndPopulateForm = async () => {
        try {
          // Fetch sections for the user's grade
          if (user.grade) {
            const response = await axios.get(`http://localhost:8080/api/grade-sections/grade/${user.grade}`);
            const sections = response.data.map(section => section.sectionName);
            setSectionOptions(sections);
          }

          // Set user data
          setUserData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            middleName: user.middleName || '',
            email: user.email || '',
            idNumber: user.idNumber || '',
            grade: user.grade || '',
            section: user.section || '',
            role: user.role || 'Student',
            academicYear: user.academicYear || '',
          });
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      };

      fetchSectionsAndPopulateForm();
    }
  }, [user, open]);

  if (!open) return null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Special handling for grade change
    if (name === 'grade') {
      setUserData(prevData => ({
        ...prevData,
        [name]: value,
        section: '' // Reset section when grade changes
      }));
    } else {
      setUserData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:8080/api/students/${user.id}`, {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`,
        gradeSection: `${userData.grade} - ${userData.section}`,
        academicYear: userData.academicYear,
      });
      setLoading(false);
      onUpdate(response.data);
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
      onClose();
    } catch (error) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update user. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        bgcolor: '#F5F5F5',
        boxShadow: 24,
        p: 4,
        borderRadius: '8px',
        zIndex: 1500,
        border: '1px solid #CCC',
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Update Student
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="First Name"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Last Name"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Middle Name"
              name="middleName"
              value={userData.middleName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={userData.email}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />

        <TextField
          label="ID Number"
          name="idNumber"
          value={userData.idNumber}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
        />

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Grade"
              name="grade"
              select
              value={userData.grade}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: 1500 },
                },
              }}
            >
              {gradeOptions.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {grade}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Section"
              name="section"
              select
              value={userData.section}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              disabled={!userData.grade}
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: 1500 },
                },
              }}
            >
              {sectionOptions.map((section) => (
                <MenuItem key={section} value={section}>
                  {section}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="User Role"
              name="role"
              select
              value={userData.role}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: 1500 },
                },
              }}
            >
              {roles.map(role => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <TextField
          label="Academic Year"
          name="academicYear"
          select
          value={userData.academicYear}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          SelectProps={{
            MenuProps: {
              sx: { zIndex: 1500 },
            },
          }}
        >
          {academicYearOptions.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#FFC107' },
          }}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateStudentForm;