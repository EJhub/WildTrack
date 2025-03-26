import React, { useState } from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import BooksAndMinutesView from './components/BooksAndMinutesView';
import MostReadBooksView from './components/MostReadBooksView';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const StudentAnalyticsAndReports = () => {
  const [currentView, setCurrentView] = useState('books-minutes');

  return (
    <>
      <NavBar />
      <Box
  sx={{
    display: 'flex', 
    height: '100vh',
    overflow: 'hidden' // Add this to prevent outer scroll
  }}
>
        <SideBar />
        <Box
  sx={{
    flexGrow: 1,
    padding: 3,
    backgroundImage: 'url("/studentbackground.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'auto', // Keep this to allow scrolling of content
    textAlign: 'left',
    height: '100%' // Add this to ensure proper height
  }}
>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              marginTop: 5,
              fontSize: '40px',
              marginBottom: 3,
              color: '#FFD700',
            }}
          >
            Analytics
          </Typography>

          {/* View Selection Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              marginTop: "-60px",
              marginBottom: "10px"
            }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: currentView === 'books-minutes' ? '#FFFF00' : '#FFD700',
                color: 'black',
                fontWeight: 'bold',
                ':hover': { backgroundColor: '#FFFF00' },
              }}
              onClick={() => setCurrentView('books-minutes')}
            >
              Books Read & Total Minutes Spent
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: currentView === 'most-read' ? '#FFFF00' : '#FFD700',
                color: 'black',
                fontWeight: 'bold',
                ':hover': { backgroundColor: '#FFFF00' },
              }}
              onClick={() => setCurrentView('most-read')}
            >
              Most Read Book & Book with High Ratings
            </Button>
          </Box>

          {/* Conditional Rendering of Views */}
          {currentView === 'books-minutes' ? (
            <BooksAndMinutesView />
          ) : (
            <MostReadBooksView />
          )}
        </Box>
      </Box>
    </>
  );
};

export default StudentAnalyticsAndReports;