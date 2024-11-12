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
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 3, flexGrow: 1, backgroundImage: 'url("/studentbackground.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <Box component={Paper} sx={{ backgroundColor: 'rgba(139, 61, 61, 0.8)', padding: 4, borderRadius: 2, maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 2 }}>Personal Information</Typography>
            <Avatar
              alt={userInfo.name}
              src={userInfo.image}
              sx={{ width: 150, height: 150, borderRadius: '10px', margin: 'auto', marginBottom: 2 }}
            />
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" sx={{ color: '#000', marginBottom: 1, textAlign: 'left', marginLeft: 5}}>
                Name:
              </Typography>
              <Box component="div" sx={{ backgroundColor: '#fff', borderRadius: '5px', padding: 1, textAlign: 'center', marginX: 'auto', width: '300px', height: '25px' }}>
                {userInfo.name}
              </Box>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" sx={{ color: '#000', marginBottom: 1, textAlign: 'left', marginLeft: 5 }}>
                ID Number:
              </Typography>
              <Box component="div" sx={{ backgroundColor: '#fff', borderRadius: '5px', padding: 1, textAlign: 'center', marginX: 'auto', width: '300px', height: '25px' }}>
                {userInfo.idNumber}
              </Box>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ color: '#000', marginBottom: 1, textAlign: 'left', marginLeft: 5 }}>
                Grade Level:
              </Typography>
              <Box component="div" sx={{ backgroundColor: '#fff', borderRadius: '5px', padding: 1, textAlign: 'center', marginX: 'auto', width: '300px', height: '25px' }}>
                {userInfo.gradeLevel}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PersonalInformation;
