import React from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Bar } from 'react-chartjs-2';

const StudentAnalyticsAndReports = () => {
  // Static data for the charts
  const bookReadData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Number of Books Read',
        data: [3, 5, 6, 8, 7, 9],
        backgroundColor: 'rgba(220, 53, 69, 0.8)', // Matching the red bar in the image
      },
    ],
  };

  const minutesSpentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Minutes Spent',
        data: [120, 200, 150, 180, 210, 240],
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
      },
    ],
  };

  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideBar />
        <Box
          sx={{
            flexGrow: 1,
            padding: 3,
            backgroundImage: 'url("/studentbackground.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'auto',
            textAlign: 'left', // Ensure all text is aligned to the left
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
            Analytics and Reports
          </Typography>

          {/* Buttons and Filters Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              marginBottom: 4,
              flexWrap: 'wrap', // Allow wrapping on small screens
            }}
          >
            {/* Buttons at the top */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end', // Align buttons to the right
                gap: 2,
                marginTop: "-60px",
                marginBottom: "10px"
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: 'black',
                  fontWeight: 'bold',
                  ':hover': { backgroundColor: '#FFFF00' },
                  width: 'auto', // Button width is auto
                }}
                onClick={() => console.log('Books Read & Total Minutes Spent')}
              >
                Books Read & Total Minutes Spent
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: 'black',
                  fontWeight: 'bold',
                  ':hover': { backgroundColor: '#FFFF00' },
                  width: 'auto', // Button width is auto
                }}
                onClick={() => console.log('Most Read Book & Book with High Ratings')}
              >
                Most Read Book & Book with High Ratings
              </Button>
            </Box>

            {/* Filters below the buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap', // Allow wrapping on small screens
                alignItems: 'center',
              }}
            >
              <TextField
                label="Date From"
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  width: '250px',
                }}
              />
              <TextField
                label="Date To"
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  width: '250px',
                }}
              />
              <TextField
                label="Academic Year"
                select
                variant="outlined"
                size="small"
                defaultValue=""
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  width: '200px',
                }}
              >
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2022-2023">2022-2023</MenuItem>
              </TextField>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: 'black',
                  fontWeight: 'bold',
                  ':hover': { backgroundColor: '#FFFF00' },
                  width: '100px', // Consistent button width
                }}
              >
                Filter
              </Button>
            </Box>
          </Box>

          {/* Charts */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginTop: 4, // Adding some space above the charts
              alignItems: 'center', // Centering the charts horizontally
            }}
          >
            {/* Chart 1: Number of Books Read */}
            <Paper
              sx={{
                padding: 3,
                width: '80%', // Full width for the chart container
                maxWidth: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                position: 'relative', // Important for absolute positioning of the buttons
              }}
            >
              {/* Buttons Container */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => console.log('Export to PDF')}
                  sx={{
                    padding: '6px 12px', // Adjust the padding for the button
                  }}
                >
                  Export PDF
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => console.log('Export to Excel')}
                  sx={{
                    padding: '6px 12px', // Adjust the padding for the button
                  }}
                >
                  Export Excel
                </Button>
              </Box>

              <Typography
                variant="h6"
                sx={{ color: 'black', fontWeight: 'bold', marginBottom: 2 }}
              >
                Number of Books Read
              </Typography>
              <Bar data={bookReadData} options={{ maintainAspectRatio: true }} />
            </Paper>

            {/* Chart 2: Total Minutes Spent */}
            <Paper
              sx={{
                padding: 3,
                width: '80%', // Full width for the chart container
                maxWidth: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                position: 'relative', // Important for absolute positioning of the buttons
              }}
            >
              {/* Buttons Container */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => console.log('Export to PDF')}
                  sx={{
                    padding: '6px 12px', // Adjust the padding for the button
                  }}
                >
                  Export PDF
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => console.log('Export to Excel')}
                  sx={{
                    padding: '6px 12px', // Adjust the padding for the button
                  }}
                >
                  Export Excel
                </Button>
              </Box>

              <Typography
                variant="h6"
                sx={{ color: 'black', fontWeight: 'bold', marginBottom: 2 }}
              >
                Total Minutes Spent
              </Typography>
              <Bar data={minutesSpentData} options={{ maintainAspectRatio: true }} />
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default StudentAnalyticsAndReports;
