import React, { useState } from 'react';
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

const CreateUserForm = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Student",
    idNumber: "",
    grade: "",
    section: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const roles = ["Student", "Teacher", "Librarian"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Student",
      idNumber: "",
      grade: "",
      section: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      setSnackbar({ open: true, message: "All fields are required!", severity: "warning" });
      return;
    }

    const payload = {
      ...formData,
      idNumber: formData.role === "Student" ? formData.idNumber : null,
      grade: formData.role === "Student" ? formData.grade : null,
      section: formData.role === "Student" ? formData.section : null,
    };

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8080/api/users/register", payload);
      if (response.status === 200) {
        setSnackbar({ open: true, message: "User created successfully!", severity: "success" });
        resetForm(); // Reset the form fields after successful creation
      }
    } catch (error) {
      console.error("Error creating user:", error.response?.data);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to create user. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Box
    sx={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "#F5F5F5",
      boxShadow: 24,
      p: 4,
      borderRadius: "8px",
      zIndex: 1500,
      border: "1px solid #CCC",
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Create User
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
        gap: 2,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
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
        value={formData.email}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />
      <TextField
        label="User Role"
        name="role"
        select
        value={formData.role}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
        SelectProps={{
          MenuProps: {
            sx: { zIndex: 15000 } // Ensure dropdown is above other elements
          }
        }}
      >
        {roles.map((role) => (
          <MenuItem key={role} value={role}>
            {role}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="ID Number"
        name="idNumber"
        value={formData.idNumber}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Grade"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Section"
            name="section"
            value={formData.section}
            onChange={handleInputChange}
            variant="outlined"
            fullWidth
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        sx={{
          backgroundColor: "#FFD700",
          color: "#000",
          '&:hover': { backgroundColor: "#FFC107" },
        }}
      >
        {loading ? "Creating..." : "Create"}
      </Button>
    </Box>

    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar({ open: false, message: "", severity: "" })}
    >
      <Alert
        onClose={() => setSnackbar({ open: false, message: "", severity: "" })}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>
  );
};

export default CreateUserForm;
