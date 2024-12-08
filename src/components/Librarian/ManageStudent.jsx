import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  IconButton,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import CreateStudentForm from './components/CreateStudentForm'; // Import the CreateStudentForm component
import UpdateStudentForm from './components/UpdateStudentForm'; // Import the UpdateStudentForm component
import DeleteConfirmation from './components/DeleteConfirmation';

const ManageStudent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // State to control form visibility
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);  // State to control the visibility of the update form
const [studentToUpdate, setStudentToUpdate] = useState(null); // Store the student data that needs to be updated
const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false); // State to control the visibility of the delete confirmation
const [studentToDelete, setStudentToDelete] = useState(null); // Store the student data that needs to be deleted

  // Fetch students data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/students/all');
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError('An error occurred while fetching students.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Fetch students when the component mounts

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
  };

  // Handle search input change
  const filteredData = data.filter((student) => {
    // Add checks to ensure properties are not null or undefined
    return (
      (student.firstName && student.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.idNumber && student.idNumber.includes(searchTerm))
    );
  });

  // Open the form modal
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  // Close the form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleDeleteConfirmation = async () => {
    try {
      // Optionally, make an API call to delete the student from the server
      const response = await fetch(`http://localhost:8080/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
  
      // Remove the student from the local state after successful deletion
      setData((prevData) => prevData.filter((student) => student.id !== studentToDelete.id));
      setIsDeleteConfirmationOpen(false); // Close the delete confirmation modal
    } catch (error) {
      console.error('Error deleting student:', error);
      // Handle error (e.g., show an error message)
    }
  };

  // Error handling
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />

        <Box
          sx={{
            padding: 4,
            flexGrow: 1,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign: 'left' }}
          >
            Manage Students
          </Typography>

          {/* Add Student Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
            <Button
              variant="outlined"
              onClick={handleOpenForm}
              sx={{
                color: '#FFEB3B',
                backgroundColor: 'white',
                border: '1px solid #800000',
                borderRadius: '50px',
                paddingX: 3,
                paddingY: 1.5,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: '#800000',
                  color: '#FFEB3B',
                },
              }}
            >
              <AddIcon sx={{ marginRight: 1 }} />
              Add Student
            </Button>
          </Box>

          {/* Search Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
              gap: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search by name or ID..."
              size="small"
              value={searchTerm} // Updated state variable
              onChange={(event) => setSearchTerm(event.target.value)} // Update search term
              sx={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '400px' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Table Section */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '15px',
              boxShadow: 3,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 340px)',
              marginTop: 3,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    ID Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    GRADE & SECTION
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    LIBRARY HOUR ASSOCIATED SUBJECT
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#FFF8F8' : '#FFF',
                        '&:hover': { backgroundColor: '#FCEAEA' },
                      }}
                    >
                      <TableCell>{student.idNumber}</TableCell>
                      <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                      <TableCell>{`${student.grade} - ${student.section}`}</TableCell>
                      <TableCell>{student.subject}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          sx={{
                            color: '#800000',
                            backgroundColor: 'white',
                            border: '1px solid #FFEB3B',
                            marginRight: 1,
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#FFEB3B',
                              color: '#800000',
                            },
                          }}
                          onClick={() => {
                            setStudentToUpdate(student);  // Set the student data to be updated
                            setIsUpdateFormOpen(true); // Open the update form
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            color: '#800000',
                            backgroundColor: 'white',
                            border: '1px solid #FFEB3B',
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#FFEB3B',
                              color: '#800000',
                            },
                          }}
                          onClick={() => {
                            setStudentToDelete(student);  // Set the student data to be deleted
                            setIsDeleteConfirmationOpen(true); // Open the delete confirmation modal
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Section */}
          <Box sx={{ position: 'relative', width: '100%' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 2,
                width: '100%',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Create Student Form Modal */}
      <CreateStudentForm open={isFormOpen} onClose={handleCloseForm} />
      <UpdateStudentForm
        open={isUpdateFormOpen}
        onClose={() => setIsUpdateFormOpen(false)}
        user={studentToUpdate} // Pass the selected student data to the update form
        onUpdate={(updatedStudent) => {
          // Handle updating the student in the table
          const updatedData = data.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student
          );
          setData(updatedData);  // Update the state with the new data
          setIsUpdateFormOpen(false);  // Close the update form
        }}
      />
      <DeleteConfirmation
      open={isDeleteConfirmationOpen}
      onClose={() => setIsDeleteConfirmationOpen(false)}
      onConfirm={handleDeleteConfirmation}
    />

    </>
  );
};

export default ManageStudent;
