import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import AddBook from "./components/AddBook"; // AddBook component

const StudentLibraryHours = () => {
  const [libraryHours, setLibraryHours] = useState([]);
  const [registeredBooks, setRegisteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchLibraryHours = async () => {
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams(window.location.search);
        const idNumber = params.get("id");

        if (!token || !idNumber) {
          toast.error("Unauthorized access. Please log in.");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/library-hours/user/${idNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLibraryHours(response.data);
      } catch (error) {
        console.error("Error fetching library hours:", error);
        toast.error("Failed to fetch library hours.");
      } finally {
        setLoading(false);
      }
    };

    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/books/all"
        );
        setRegisteredBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Failed to fetch books.");
      }
    };

    fetchLibraryHours();
    fetchBooks();
  }, []);

  const handleClickOpen = (student) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (bookDetails) => {
  if (selectedStudent) {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/library-hours/${selectedStudent.id}/add-book`,
        { bookTitle: bookDetails.title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedLibraryHours = libraryHours.map((entry) =>
        entry.id === selectedStudent.id
          ? { ...entry, bookTitle: bookDetails.title }
          : entry
      );
      setLibraryHours(updatedLibraryHours);
      toast.success(`Book "${bookDetails.title}" added successfully!`);
      handleClose();
    } catch (error) {
      console.error("Error updating library record with book:", error);
      toast.error("Failed to add book to the library record.");
    }
  }
};


  const calculateMinutes = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "--";
    const inTime = new Date(timeIn);
    const outTime = new Date(timeOut);
    const diffMs = outTime - inTime;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    return diffMinutes > 0 ? `${diffMinutes} mins` : "--";
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            backgroundImage: "url('/studentbackground.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{ color: "#000", fontWeight: "bold", paddingTop: 5 }}
            >
              Library Hours
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              opacity: 0.9,
              borderRadius: "15px",
              overflow: "auto",
              maxHeight: 'calc(100vh - 300px)',
            }}
          >
            <Table stickyHeader aria-label="library hours table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#D9D9D9", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ backgroundColor: "#D9D9D9", fontWeight: "bold" }}>Time In</TableCell>
                  <TableCell sx={{ backgroundColor: "#D9D9D9", fontWeight: "bold" }}>Book Title</TableCell>
                  <TableCell sx={{ backgroundColor: "#D9D9D9", fontWeight: "bold" }}>Time Out</TableCell>
                  <TableCell sx={{ backgroundColor: "#D9D9D9", fontWeight: "bold" }}>Minutes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {libraryHours.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.timeIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(entry.timeIn).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      {entry.bookTitle ? (
                        entry.bookTitle
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleClickOpen(entry)}
                          sx={{
                            backgroundColor: "#FFD700",
                            color: "#000",
                            "&:hover": { backgroundColor: "#FFC107" },
                          }}
                        >
                          Insert Book
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.timeOut ? new Date(entry.timeOut).toLocaleTimeString() : "--"}
                    </TableCell>
                    <TableCell>
                      {calculateMinutes(entry.timeIn, entry.timeOut)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <AddBook
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        registeredBooks={registeredBooks}
      />
    </>
  );
};

export default StudentLibraryHours;
