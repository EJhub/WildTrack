import React, { useState, useEffect } from "react";
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

const UpdateNASStudentPopup = ({ open, onClose, onUpdate, studentData }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    email: "",
    grade: "1st Year",
    startWorkPeriod: null,
    endWorkPeriod: null,
    assignedTask: "",
    role: "NAS Student",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const grades = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  useEffect(() => {
    if (studentData && studentData.id) {
      setFormData({
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        idNumber: studentData.idNumber || "",
        email: studentData.email || "",
        grade: studentData.grade || "1st Year",
        startWorkPeriod: studentData.workPeriod
          ? dayjs(studentData.workPeriod.split(" - ")[0])
          : null,
        endWorkPeriod: studentData.workPeriod
          ? dayjs(studentData.workPeriod.split(" - ")[1])
          : null,
        assignedTask: studentData.assignedTask || "",
        role: studentData.role || "NAS Student",
      });
    }
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
      !formData.startWorkPeriod ||
      !formData.endWorkPeriod ||
      !formData.assignedTask ||
      !formData.grade
    ) {
      setError("All fields are required!");
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      idNumber: formData.idNumber,
      email: formData.email,
      grade: formData.grade,
      workPeriod: `${dayjs(formData.startWorkPeriod).format("YYYY-MM-DD")} - ${dayjs(
        formData.endWorkPeriod
      ).format("YYYY-MM-DD")}`,
      assignedTask: formData.assignedTask,
      role: formData.role,
    };

    try {
      await axios.put(
        `http://localhost:8080/api/nas-students/${studentData.id}`,
        payload
      );
      setSuccess("NAS Student updated successfully!");
      onUpdate(); // Refresh parent table
      onClose(); // Close the dialog
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Update NAS Student
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                variant="outlined"
                fullWidth
                disabled
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
                {grades.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </TextField>
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
                required
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

export default UpdateNASStudentPopup;
