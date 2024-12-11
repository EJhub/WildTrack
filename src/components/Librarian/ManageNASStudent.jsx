import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddNASStudentPopup from "./components/CreateNASstudentForm";
import UpdateNASStudentPopup from "./components/UpdateNASstudentForm";
import DeleteConfirmation from './components/DeleteConfirmation';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  TextField,
  IconButton,
  Paper,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const ManageNASStudent = () => {
  const [currentView, setCurrentView] = useState("NAS Students");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [nasStudents, setNasStudents] = useState([]);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false); // For DeleteConfirmation
  const [selectedStudentId, setSelectedStudentId] = useState(null); // Store the selected student's ID


  // Fetch NAS students from the API
  const fetchNASStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/nas-students/all");
      setNasStudents(response.data); // Directly set the data from API
    } catch (error) {
      console.error("Failed to fetch NAS students:", error);
    }
  };

  // Delete a student by ID
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/nas-students/${selectedStudentId}`);
      setNasStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== selectedStudentId)
      );
     
    } catch (error) {
      console.error("Failed to delete NAS student:", error);
      alert("An error occurred while deleting the student. Please try again.");
    } finally {
      setIsDeletePopupOpen(false); // Close the popup
      setSelectedStudentId(null); // Clear the selected student's ID
    }
  };
  

  // Handle opening the update popup
  const handleUpdateClick = (student) => {
    setSelectedStudent(student);
    setIsUpdatePopupOpen(true);
  };

  // Handle closing the update popup
  const handleCloseUpdatePopup = () => {
    setIsUpdatePopupOpen(false);
    setSelectedStudent(null); // Clear the selected student
  };

  // Fetch the data when the component mounts
  useEffect(() => {
    fetchNASStudents();
  }, []);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleDeleteClick = (id) => {
    setSelectedStudentId(id); // Set the selected student's ID
    setIsDeletePopupOpen(true); // Open the delete confirmation popup
  };
  

  return (
    <>
      <NavBar />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: "#f5f5f5" }}>
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: "bold", color: "#333", textAlign: "left" }}
          >
            Manage NAS Activity
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <TextField
                placeholder="Type here..."
                variant="outlined"
                size="small"
                sx={{ backgroundColor: "#fff", marginRight: 1, flexGrow: 1 }}
              />
              <IconButton>
                <SearchIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={currentView === "Attendance Log" ? "contained" : "outlined"}
                onClick={() => setCurrentView("Attendance Log")}
                sx={{
                  backgroundColor: currentView === "Attendance Log" ? "#F4A261" : "inherit",
                }}
              >
                Attendance Log
              </Button>
              <Button
                variant={currentView === "NAS Students" ? "contained" : "outlined"}
                onClick={() => setCurrentView("NAS Students")}
                sx={{
                  backgroundColor: currentView === "NAS Students" ? "#F4A261" : "inherit",
                }}
              >
                NAS Students
              </Button>
            </Box>
          </Box>
          {currentView === "NAS Students" && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setIsAddPopupOpen(true)}
              >
                Add NAS Student
              </Button>
            </Box>
          )}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#FFD700", fontWeight: "bold", color: "#000" }}>
                    ID NUMBER
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#FFD700", fontWeight: "bold", color: "#000" }}>
                    NAME
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#FFD700", fontWeight: "bold", color: "#000" }}>
                    WORK PERIOD
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#FFD700", fontWeight: "bold", color: "#000" }}>
                    ASSIGNED TASK
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#FFD700", fontWeight: "bold", color: "#000" }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nasStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.idNumber}</TableCell>
                      <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                      <TableCell>{student.workPeriod}</TableCell>
                      <TableCell>{student.assignedTask}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ mr: 1, backgroundColor: "#F4A261" }}
                          onClick={() => handleUpdateClick(student)}
                        >
                          Update
                        </Button>
                        <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(student.id)} // Trigger the confirmation popup
                        >
                        Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ position: "relative", width: "100%" }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={nasStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 2,
                width: "100%",
              }}
            />
          </Box>
        </Box>
      </Box>
      <AddNASStudentPopup
        open={isAddPopupOpen}
        onClose={() => setIsAddPopupOpen(false)}
        onSuccess={fetchNASStudents}
      />
      <UpdateNASStudentPopup
        open={isUpdatePopupOpen}
        onClose={handleCloseUpdatePopup}
        onUpdate={fetchNASStudents}
        studentData={selectedStudent}
      />
      <DeleteConfirmation
  open={isDeletePopupOpen}
  onClose={() => setIsDeletePopupOpen(false)}
  onConfirm={handleConfirmDelete}
/>

    </>
  );
};

export default ManageNASStudent;
