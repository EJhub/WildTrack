import React, { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";

const LibraryAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch attendance data from the backend
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        console.log("Using token:", token);

        const response = await axios.get(
          "http://localhost:8080/api/library-hours/with-user-details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formattedData = response.data.map((entry) => ({
          profile: "/path/to/default/avatar.jpg", // Replace with actual profile image if available
          name: `${entry.firstName} ${entry.lastName}`,
          timeIn: entry.timeIn || "N/A",
          timeOut: entry.timeOut || "N/A",
          status: entry.timeOut ? "Completed" : "Incomplete",
        }));

        setAttendanceData(formattedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching attendance data:", err);

        if (err.response?.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError("Failed to fetch attendance data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <>
      <NavBar />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: 4,
            backgroundColor: "#fff",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#000",
              fontWeight: "bold",
              marginBottom: 3,
              textAlign: "left",
            }}
          >
            Library Attendance
          </Typography>
          {loading ? (
            <Typography>Loading attendance data...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                flexGrow: 1,
                maxHeight: "63vh", // Makes the table container responsive
                overflowY: "auto",
                opacity: 0.95,
                borderRadius: "15px 15px 0 0",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#000",
                        textAlign: "center",
                        background: "linear-gradient(to bottom, #D76565 20%, #BE4747 79%)",
                        borderRight: "1px solid #ffffff",
                      }}
                    >
                      Profile
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#000",
                        textAlign: "center",
                        background: "linear-gradient(to bottom, #D76565 20%, #BE4747 79%)",
                        borderRight: "1px solid #ffffff",
                      }}
                    >
                      Student Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#000",
                        textAlign: "center",
                        background: "linear-gradient(to bottom, #D76565 20%, #BE4747 79%)",
                        borderRight: "1px solid #ffffff",
                      }}
                    >
                      Time In
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#000",
                        textAlign: "center",
                        background: "linear-gradient(to bottom, #D76565 20%, #BE4747 79%)",
                        borderRight: "1px solid #ffffff",
                      }}
                    >
                      Time Out
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#000",
                        textAlign: "center",
                        background: "linear-gradient(to bottom, #D76565 20%, #BE4747 79%)",
                        borderRight: "1px solid #ffffff",
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          background: "#A85858",
                          borderRight: "1px solid #ffffff",
                        }}
                      >
                        <Avatar
                          alt={entry.name}
                          src={entry.profile}
                          sx={{ width: 80, height: 80, margin: "auto" }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          background: "#A85858",
                          borderRight: "1px solid #ffffff",
                        }}
                      >
                        {entry.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          background: "#A85858",
                          borderRight: "1px solid #ffffff",
                        }}
                      >
                        {entry.timeIn}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          background: "#A85858",
                          borderRight: "1px solid #ffffff",
                        }}
                      >
                        {entry.timeOut}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          background: "#A85858",
                          borderRight: "1px solid #ffffff",
                        }}
                      >
                        {entry.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </>
  );
};

export default LibraryAttendance;
