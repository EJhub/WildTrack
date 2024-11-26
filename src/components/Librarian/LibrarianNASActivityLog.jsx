import React from 'react';
import NavBar from './components/NavBar';
import { Box, Typography, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SideBar from './components/SideBar';

const LibrarianNASActivityLog = () => {
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
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* NAS Activity Log Title */}
          <Typography
            variant="h4"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              marginBottom: 4,
              textAlign: { xs: 'center', md: 'left' },
              width: '100%',
            }}
          >
            NAS Activity Log
          </Typography>

          {/* Buttons for Activity Logs */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Students Supervised Button */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#CD6161',
                color: '#000',
                width: { xs: '100%', sm: '90%', md: '45%' },
                height: { xs: '120px', md: '150px' },
                fontSize: { xs: '1.5rem', md: '2rem' },
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: { xs: '20px', md: '30px' },
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                },
                textTransform: 'none',
              }}
            >
              <PersonIcon sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, color: '#FFD700' }} />
              <Typography
                sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' }, fontWeight: 'bold', color: '#000' }}
              >
                Students Supervised
              </Typography>
            </Button>

            {/* Books Logged Button */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#CD6161',
                color: '#000',
                width: { xs: '100%', sm: '90%', md: '45%' },
                height: { xs: '120px', md: '150px' },
                fontSize: { xs: '1.5rem', md: '2rem' },
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: { xs: '20px', md: '30px' },
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#8B3D3D',
                },
                textTransform: 'none',
              }}
            >
              <MenuBookIcon sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, color: '#FFD700' }} />
              <Typography
                sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' }, fontWeight: 'bold', color: '#000' }}
              >
                Books Logged
              </Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LibrarianNASActivityLog;
