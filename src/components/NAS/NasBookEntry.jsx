import React, { useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import AddLog from './components/AddLog'; // Assuming this is your AddLog component
import { useNavigate } from 'react-router-dom';

const NasBookEntry = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [bookEntries, setBookEntries] = useState([
    {
      title: 'Little Red Riding Hood',
      author: 'Charles Perrault',
      accessionNumber: 'LB0001',
      dateRead: 'October 18, 2024',
      student: 'Tricia O. Araneta 2009-40034',
    },
    {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
      {
        title: 'Little Red Riding Hood',
        author: 'Charles Perrault',
        accessionNumber: 'LB0001',
        dateRead: 'October 18, 2024',
        student: 'Tricia O. Araneta 2009-40034',
      },
    // Add more initial entries as needed
  ]);

  const handleClickOpen = () => {
    navigate("/nasDashboard/BookEntry/AddLog");
    setOpen(true);
  };

  const handleClose = () => {
    navigate("/nasDashboard/BookEntry");
    setOpen(false);
  };

  const handleSubmit = (logDetails) => {
    setBookEntries([...bookEntries, { ...logDetails, dateRead: new Date().toLocaleDateString() }]);
    setOpen(false);
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginTop: 2 }}>Book Entry</Typography>
            <Button
              variant="contained"
              color="warning"
              sx={{ backgroundColor: '#FFD700', color: '#000', border: 'solid 1px', borderRadius: '15px' }}
              onClick={handleClickOpen}
            >
              Add Log
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 450, overflowY: 'auto', opacity: 0.95, marginTop: 3, borderRadius: '15px 15px 0 0' }}>
            <Table>
              <TableHead sx={{ background: 'linear-gradient(to bottom, #D76565 20%, #BE4747 79%)', color: '#fff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', borderRight: '1px solid #ffffff' }}>BOOK TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', borderRight: '1px solid #ffffff' }}>AUTHOR</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', borderRight: '1px solid #ffffff' }}>ACCESSION NUMBER</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff', borderRight: '1px solid #ffffff' }}>DATE READ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>STUDENT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookEntries.map((entry, index) => (
                  <TableRow key={index} sx={{ borderBottom: '1px solid #ffffff' }}>
                    <TableCell sx={{ background: '#A85858' }}>{entry.title}</TableCell>
                    <TableCell sx={{ background: '#A85858' }}>{entry.author}</TableCell>
                    <TableCell sx={{ background: '#A85858' }}>{entry.accessionNumber}</TableCell>
                    <TableCell sx={{ background: '#A85858' }}>{entry.dateRead}</TableCell>
                    <TableCell sx={{ background: '#A85858' }}>{entry.student}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Popup Form Component */}
      <AddLog open={open} handleClose={handleClose} handleSubmit={handleSubmit} />
    </>
  );
};

export default NasBookEntry;
