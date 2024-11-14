import React from 'react';
import { Box, TextField, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Container, Paper, Grid } from '@mui/material';
import LoginNavBar from './component/AppBar';

function App() {
  return (
    <>
      <LoginNavBar />

      <Box 
        sx={{ 
          minHeight: '100vh', 
          backgroundImage: 'url(/Tapin%20Background.png)',
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          margin: -0.75, 
          padding: 0, 
          pt: { xs: 4, md: 8 }
        }}
      >
        <Container 
          maxWidth="md" 
          sx={{ 
            display: 'flex', 
            marginTop: -20,
            justifyContent: 'center', 
            alignItems: 'center', 
          }}
        >
          <Paper 
                elevation={3} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  width: '100%', 
                  maxWidth: 800, 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  padding: 3,
                  background: 'linear-gradient(180deg, rgba(215, 101, 101, 0.8) 0%, rgba(140, 56, 56, 0.8) 100%)', 
                  boxShadow: `
                    0px 0px 15px 5px rgba(136, 53, 63, 0.5), 
                    0px 0px 20px 5px rgba(130, 53, 63, 0.5), 
                    0px 0px 25px 10px rgba(130, 53, 63, 0.5)`, 
                  border: ' rgba(136, 53, 63, 0.50)', 
                }}
              >


         
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                mr: { md: 3 }, 
                mb: { xs: 3, md: 0 } 
              }}
            >
              <Avatar
                src="student-photo.png"
                alt="Student"
                sx={{ 
                  bgcolor: 'white',
                  width: { xs: 180, md: 220 },
                  height: { xs: 220, md: 280 },
                  border: '2px solid #333',
                  marginTop: -15,
                  borderRadius: 2,
                }}
              />
            </Box>


            <Box sx={{ flex: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                <Box sx={{ color: 'white', textAlign: 'left',  }}>
                      <TextField
                        variant="outlined"
                        placeholder="Input your ID Number"
                        fullWidth
                        sx={{ 
                          mb: 2, 
                          bgcolor: 'white', 
                          border: '1px solid black',
                          borderRadius: '10px' 
                        }}
                        InputProps={{
                          sx: {
                            height: 45, 
                          },
                        }}
                      />
                  

                       <Typography variant="body1"><strong>Name:</strong> John Doe</Typography>
                    <Typography variant="body1"><strong>ID Number:</strong> 24-1234-213</Typography>
                    <Typography variant="body1"><strong>Grade Level & Section:</strong> 6 - Hope</Typography>
                    <br /> <br />
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, mb: 0.5 }}>TIME IN</Typography>
                    <Typography variant="body2"><strong>Date:</strong> October 22, 2024</Typography>
                    <Typography variant="body2">8:23:08 AM</Typography>
                  </Box>
                </Grid>

    
                <Grid item xs={12} md={6}>
                  <Box>
                    <List>
                      {[
                        { id: '24-3214-432', name: 'Anya Forger', program: 'BSCE - 3' },
                        { id: '24-4231-132', name: 'Jinwoo Sung', program: 'BSHM - 2' },
                        { id: '24-5213-341', name: 'Ymir Fritz', program: 'BSTM - 4' },
                        { id: '24-7652-253', name: 'Eren Yeager', program: 'BSTM - 4' },
                      ].map((student, index) => (
                        <ListItem 
                          key={index} 
                          sx={{ 
                            padding: 1, 
                            border: '1px solid #333', 
                            borderRadius: 1, 
                            mb: 1, 
                            display: 'flex', 
                            backgroundColor: 'white',
                            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
                            alignItems: 'center'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#ccc' }} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight="bold">{student.id}</Typography>}
                            secondary={
                              <>
                                <Typography variant="body2">{student.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{student.program}</Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default App;
