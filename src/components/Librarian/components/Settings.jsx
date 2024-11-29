import React, { useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreateUserForm from './CreateUserForm'; // Create User form component
import UpdateUserList from './UpdateUserList'; // Update User list component
import DeleteUserList from './DeleteUserList'; // Delete User list component

const Settings = ({ open, onClose }) => {
  const [activeSection, setActiveSection] = useState('Manage User');
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openUpdateUser, setOpenUpdateUser] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState(false);

  // Example user data
  const usersData = [
    { idNumber: '2009-40034', name: 'Tricia O. Araneta', gradeSection: '5 - Hope', role: 'Student' },
    { idNumber: '22-3451-124', name: 'Brent Ilustrisimo', gradeSection: '5 - Faith', role: 'Teacher' },
  ];

  // Define content for each section
  const sectionContent = {
    'Manage User': [
      { title: 'Create User', buttonLabel: 'Create New User', onClick: () => setOpenCreateUser(true) },
      { title: 'Update User', buttonLabel: 'Edit Users', onClick: () => setOpenUpdateUser(true) },
      { title: 'Delete User', buttonLabel: 'Delete Users', onClick: () => setOpenDeleteUser(true) },
    ],
    'Manage Records': [
      { title: 'Time and Book Log', buttonLabel: 'Manage', onClick: () => console.log('Manage Records') },
      { title: 'Revalidation of Library Hours', buttonLabel: 'Approve', onClick: () => console.log('Approve Records') },
    ],
    'Error Management': [
      { title: 'Reported Issues', buttonLabel: 'View Reports', onClick: () => console.log('View Reports') },
    ],
  };

  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '300px',
          bgcolor: '#F5F5F5',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px',
          zIndex: 1300,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Settings
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content Container */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '2rem',
            height: 'calc(100% - 40px)', // Adjust height to fit content
          }}
        >
          {/* Sidebar */}
          <List
            sx={{
              minWidth: '150px',
              bgcolor: '#FFF',
              border: '1px solid #CCC',
              borderRadius: '8px',
              padding: 0,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              overflowY: 'auto',
            }}
          >
            {Object.keys(sectionContent).map((section) => (
              <ListItem
                button
                key={section}
                onClick={() => setActiveSection(section)} // Update active section
                sx={{
                  padding: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: activeSection === section ? '#FFD700' : '#FFF',
                  '&:hover': {
                    backgroundColor: '#FFC107',
                  },
                }}
              >
                {section}
              </ListItem>
            ))}
          </List>

          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto', // Scroll if content exceeds
            }}
          >
            {sectionContent[activeSection].map((item, index) => (
              <React.Fragment key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={item.onClick} // Handle button actions
                    sx={{
                      backgroundColor: '#FFD700',
                      color: '#000',
                      '&:hover': { backgroundColor: '#FFC107' },
                    }}
                  >
                    {item.buttonLabel}
                  </Button>
                </Box>
                {index < sectionContent[activeSection].length - 1 && (
                  <Divider sx={{ marginY: 2 }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Modals */}
      <CreateUserForm
        open={openCreateUser}
        onClose={() => setOpenCreateUser(false)}
      />

      <UpdateUserList
        open={openUpdateUser}
        onClose={() => setOpenUpdateUser(false)}
        users={usersData}
        onUserUpdate={(updatedUser) => console.log('Updated User:', updatedUser)}
      />

      <DeleteUserList
        open={openDeleteUser}
        onClose={() => setOpenDeleteUser(false)}
        users={usersData}
        onDeleteUser={(deletedUser) => console.log('Deleted User:', deletedUser)}
      />
    </>
  );
};

export default Settings;
