import React from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';

const PersonalInformation = () => {
  const userInfo = {
    name: 'Rickshel Brent B. Ilustrisimo',
    idNumber: '24-5321-243',
    gradeLevel: '6 - Hope',
    image: '/path/to/image.png', // Replace with the actual path to your image
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Paper
            sx={{
              backgroundColor: 'rgba(139, 61, 61, 0.8)',
              padding: 4,
              borderRadius: 2,
              maxWidth: 400,
              width: '90%', // Ensures responsiveness
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2 }}>
              Personal Information
            </Typography>
            <Avatar
              alt={userInfo.name}
              src={userInfo.image}
              sx={{
                width: 150,
                height: 150,
                borderRadius: '10px',
                margin: 'auto',
                marginBottom: 2,
               
              }}
            />
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" sx={{ color: '#000', marginBottom: 1, textAlign: 'left' }}>
                Name:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  padding: 1,
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                {userInfo.name}
              </Box>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" sx={{ color: '#000', marginBottom: 1, textAlign: 'left' }}>
                ID Number:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  padding: 1,
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                {userInfo.idNumber}
              </Box>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ color: '#000', marginBottom: 1, textAlign: 'left' }}>
                Grade Level:
              </Typography>
              <Box
                component="div"
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  padding: 1,
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                {userInfo.gradeLevel}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default PersonalInformation;
