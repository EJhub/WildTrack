import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import axios from "axios";

const AddNASStudentPopup = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    email: "",
    password: "",
    grade: "1st Year", // Default value for Year Level
    role: "NAS Student", // Fixed value for User Role
    startWorkPeriod: null, // Start Work Period
    endWorkPeriod: null, // End Work Period
    assignedTask: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.idNumber ||
      !formData.email ||
      !formData.password ||
      !formData.startWorkPeriod ||
      !formData.endWorkPeriod ||
      !formData.assignedTask
    ) {
      setError("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/nas-students/register",
        {
          ...formData,
          workPeriod: `${dayjs(formData.startWorkPeriod).format("YYYY-MM-DD")} - ${dayjs(
            formData.endWorkPeriod
          ).format("YYYY-MM-DD")}`, // Combine start and end work periods
        }
      );

      setSuccess(response.data.message);
      onSuccess(); // Refresh the parent table
      onClose(); // Close the dialog
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Add NAS Student
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                placeholder="Enter first name"
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
                required
                placeholder="Enter last name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                placeholder="Enter ID number"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                placeholder="Enter email"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                placeholder="Enter password"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Year Level"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                select
                required
              >
                <MenuItem value="1st Year">1st Year</MenuItem>
                <MenuItem value="2nd Year">2nd Year</MenuItem>
                <MenuItem value="3rd Year">3rd Year</MenuItem>
                <MenuItem value="4th Year">4th Year</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="User Role"
                name="role"
                value={formData.role}
                variant="outlined"
                fullWidth
                disabled
              />
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Work Period"
                  value={formData.startWorkPeriod}
                  onChange={(newValue) =>
                    setFormData({ ...formData, startWorkPeriod: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="End Work Period"
                  value={formData.endWorkPeriod}
                  onChange={(newValue) =>
                    setFormData({ ...formData, endWorkPeriod: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </Grid>
            </LocalizationProvider>
            <Grid item xs={12}>
              <TextField
                label="Assigned Task"
                name="assignedTask"
                value={formData.assignedTask}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                placeholder="Enter assigned task"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                  "&:hover": { backgroundColor: "#FFC107" },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddNASStudentPopup;
