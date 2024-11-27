import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Addbook from './components/Addbook';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../AuthContext'; // Import AuthContext
import dayjs from 'dayjs';

const StudentLibraryHours = () => {
  const { user } = useContext(AuthContext); // Get user details from AuthContext
  const [open, setOpen] = useState(false);
  const [registeredBooks, setRegisteredBooks] = useState([]);
  const [libraryHours, setLibraryHours] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.idNumber) {
      toast.error('Unauthorized access. Please log in.');
      return;
    }

    const fetchLibraryHours = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Unauthorized access. Please log in.');
          return;
        }

        const response = await axios.get(`http://localhost:8080/api/library-hours/user/${user.idNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLibraryHours(response.data);
      } catch (error) {
        console.error('Error fetching library hours:', error);
        toast.error('Failed to fetch library hours.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryHours();
  }, [user]);

  useEffect(() => {
    const fetchRegisteredBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Unauthorized access. Please log in.');
          return;
        }

        const response = await axios.get('http://localhost:8080/api/books/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRegisteredBooks(response.data);
      } catch (error) {
        console.error('Error fetching registered books:', error);
        toast.error('Failed to fetch registered books.');
      }
    };

    fetchRegisteredBooks();
  }, []);

  const handleClickOpen = (student) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = (bookDetails) => {
    if (selectedStudent) {
      const updatedLibraryHours = libraryHours.map((entry) =>
        entry.id === selectedStudent.id
          ? { ...entry, bookTitle: bookDetails.title }
          : entry
      );
      setLibraryHours(updatedLibraryHours);
      toast.success(`Book "${bookDetails.title}" added to the student record!`);
      handleClose();
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', paddingTop: 5 }}>
              Library Hours
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              opacity: 0.9,
              borderRadius: '15px',
              maxHeight: 'calc(100vh - 300px)',
              overflow: 'auto',
            }}
          >
            <Table stickyHeader aria-label="library hours table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#D9D9D9', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ backgroundColor: '#D9D9D9', fontWeight: 'bold' }}>Time In</TableCell>
                  <TableCell sx={{ backgroundColor: '#D9D9D9', fontWeight: 'bold' }}>Book Title</TableCell>
                  <TableCell sx={{ backgroundColor: '#D9D9D9', fontWeight: 'bold' }}>Time Out</TableCell>
                  <TableCell sx={{ backgroundColor: '#D9D9D9', fontWeight: 'bold' }}>Minutes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {libraryHours.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{dayjs(entry.date).format('MM/DD/YYYY')}</TableCell>
                    <TableCell>{dayjs(entry.timeIn).format('hh:mm A')}</TableCell>
                    <TableCell>
                      {entry.bookTitle ? (
                        entry.bookTitle
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleClickOpen(entry)}
                          sx={{
                            backgroundColor: '#FFD700',
                            color: '#000',
                            borderRadius: '15px',
                            '&:hover': { backgroundColor: '#FFC107' },
                          }}
                        >
                          Insert Book
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{entry.timeOut ? dayjs(entry.timeOut).format('hh:mm A') : '--'}</TableCell>
                    <TableCell>{entry.minutes || '--'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <Addbook
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        registeredBooks={registeredBooks}
      />
    </>
  );
};

export default StudentLibraryHours;
