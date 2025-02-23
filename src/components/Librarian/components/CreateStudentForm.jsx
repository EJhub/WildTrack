import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const CreateStudentForm = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
    grade: "",
    section: "",
    academicYear: "",
    role: "Student"
  });

  const [gradeOptions, setGradeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch Grade Levels
        const gradesResponse = await axios.get('http://localhost:8080/api/grade-sections/all');
        const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
        setGradeOptions(uniqueGrades);

        // Fetch Sections for the current grade
        if (formData.grade) {
          const sectionsResponse = await axios.get(`http://localhost:8080/api/grade-sections/grade/${formData.grade}`);
          const sections = sectionsResponse.data.map(section => section.sectionName);
          setSectionOptions(sections);
        }

        // Fetch Academic Years
        const academicYearsResponse = await axios.get('http://localhost:8080/api/academic-years/all');
        const formattedAcademicYears = academicYearsResponse.data.map(year => `${year.startYear}-${year.endYear}`);
        setAcademicYearOptions(formattedAcademicYears);

      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };

    fetchDropdownOptions();
  }, [formData.grade]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for grade change
    if (name === 'grade') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        section: '' // Reset section when grade changes
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/students/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        idNumber: formData.idNumber,
        password: formData.password,
        grade: formData.grade,
        section: formData.section,
        academicYear: formData.academicYear,
        role: formData.role
      });

      alert("Student added successfully");
      onClose();
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student");
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2 
      }}>
        <Typography variant="h6">Add Student</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="middleName"
                label="Middle Name"
                value={formData.middleName}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>

          <TextField
            name="idNumber"
            label="ID Number"
            value={formData.idNumber}
            onChange={handleInputChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mt: 2 }}
          />

          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mt: 2 }}
          />

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <TextField
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0 }}>
  <Grid item xs={4}>
    <TextField
      name="grade"
      label="Grade"
      select
      value={formData.grade}
      onChange={handleInputChange}
      fullWidth
      required
      variant="outlined"
      SelectProps={{
        native: true,
      }}
      InputLabelProps={{ 
        shrink: true, 
        style: { 
          position: 'absolute', 
          top: -10, 
          left: -10, 
          backgroundColor: 'white', 
          padding: '0 5px', 
          zIndex: 1 
        } 
      }}
    >
      <option value="">Select Grade</option>
      {gradeOptions.map((grade) => (
        <option key={grade} value={grade}>
          {grade}
        </option>
      ))}
    </TextField>
  </Grid>
  <Grid item xs={4}>
    <TextField
      name="section"
      label="Section"
      select
      value={formData.section}
      onChange={handleInputChange}
      fullWidth
      required
      variant="outlined"
      disabled={!formData.grade}
      SelectProps={{
        native: true,
      }}
      InputLabelProps={{ 
        shrink: true, 
        style: { 
          position: 'absolute', 
          top: -10, 
          left: -10, 
          backgroundColor: 'white', 
          padding: '0 5px', 
          zIndex: 1 
        } 
      }}
    >
      <option value="">Select Section</option>
      {sectionOptions.map((section) => (
        <option key={section} value={section}>
          {section}
        </option>
      ))}
    </TextField>
  </Grid>
  <Grid item xs={4}>
    <TextField
      name="role"
      label="User Role"
      select
      value={formData.role}
      onChange={handleInputChange}
      fullWidth
      required
      variant="outlined"
      SelectProps={{
        native: true,
      }}
      InputLabelProps={{ 
        shrink: true, 
        style: { 
          position: 'absolute', 
          top: -10, 
          left: -10, 
          backgroundColor: 'white', 
          padding: '0 5px', 
          zIndex: 1 
        } 
      }}
    >
      <option value="Student">Student</option>
    </TextField>
  </Grid>
</Grid>

<TextField
  name="academicYear"
  label="Academic Year"
  select
  value={formData.academicYear}
  onChange={handleInputChange}
  fullWidth
  required
  variant="outlined"
  sx={{ mt: 2 }}
  SelectProps={{
    native: true,
  }}
  InputLabelProps={{ 
    shrink: true, 
    style: { 
      position: 'absolute', 
      top: -10, 
      left: -10, 
      backgroundColor: 'white', 
      padding: '0 5px', 
      zIndex: 1 
    } 
  }}
>
  <option value="">Select Academic Year</option>
  {academicYearOptions.map((year) => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
</TextField>

          <Button 
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: '#FFD700',
              color: '#000',
              '&:hover': { backgroundColor: '#FFC107' }
            }}
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentForm;