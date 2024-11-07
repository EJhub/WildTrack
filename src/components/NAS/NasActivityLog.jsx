import React from 'react';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const CustomButton = styled(Button)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '80%',
  padding: '15px',
  margin: '10px 0',
  fontSize: '1.5rem',
  background: 'linear-gradient(90deg, #D76565 0%, #743838 100%)',
  color: '#000',
  borderRadius: '10px',
  '&:hover': {
    background: 'linear-gradient(90deg, #C25454 0%, #5F2929 100%)',
  },
});

const NasActivityLog = () => {
  return (
    <>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box sx={{ padding: 4, flexGrow: 1, backgroundColor: '#fff' }}>
          <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold', marginBottom: 3, textAlign:'left', marginLeft: 15 }}>Activity Log</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <CustomButton>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, height:'80px' }}>
                <PersonIcon sx={{ fontSize: '2rem' }} />
                Students Supervised
              </Box>
            </CustomButton>
            <CustomButton>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, height:'80px'}}>
                <MenuBookIcon sx={{ fontSize: '2rem' }} />
                Books Logged
              </Box>
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default NasActivityLog;
