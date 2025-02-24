import React, { useState, useEffect } from 'react';
import {
 Box,
 TextField,
 Button,
 Typography,
 IconButton,
 Snackbar,
 Alert,
 Grid,
 Dialog,
 DialogTitle,
 DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const CreateTeacherForm = ({ open, onClose }) => {
 const [formData, setFormData] = useState({
   firstName: '',
   lastName: '',
   email: '',
   password: '',
   role: 'Teacher',
   subject: '',
   grade: '',
   section: '',
   idNumber: '',
 });
 
 const [loading, setLoading] = useState(false);
 const [gradeOptions, setGradeOptions] = useState([]);
 const [sectionOptions, setSectionOptions] = useState([]);
 const [snackbar, setSnackbar] = useState({
   open: false,
   message: '',
   severity: '',
 });

 useEffect(() => {
   const fetchGradeOptions = async () => {
     try {
       const gradesResponse = await axios.get('http://localhost:8080/api/grade-sections/all');
       const uniqueGrades = [...new Set(gradesResponse.data.map(item => item.gradeLevel))];
       setGradeOptions(uniqueGrades);
     } catch (error) {
       console.error('Error fetching grades:', error);
       setSnackbar({
         open: true,
         message: 'Failed to fetch grade options',
         severity: 'error',
       });
     }
   };

   fetchGradeOptions();
 }, []);

 useEffect(() => {
   const fetchSectionOptions = async () => {
     if (formData.grade) {
       try {
         const sectionsResponse = await axios.get(`http://localhost:8080/api/grade-sections/grade/${formData.grade}`);
         const sections = sectionsResponse.data.map(section => section.sectionName);
         setSectionOptions(sections);
       } catch (error) {
         console.error('Error fetching sections:', error);
         setSnackbar({
           open: true,
           message: 'Failed to fetch section options',
           severity: 'error',
         });
       }
     }
   };

   fetchSectionOptions();
 }, [formData.grade]);

 const handleInputChange = (e) => {
   const { name, value } = e.target;
   
   if (name === 'grade') {
     setFormData(prevData => ({
       ...prevData,
       [name]: value,
       section: ''
     }));
   } else {
     setFormData(prevData => ({
       ...prevData,
       [name]: value
     }));
   }
 };

 const resetForm = () => {
   setFormData({
     firstName: '',
     lastName: '',
     email: '',
     password: '',
     role: 'Teacher',
     subject: '',
     grade: '',
     section: '',
     idNumber: '',
   });
 };

 const handleSubmit = async () => {
   if (
     !formData.firstName ||
     !formData.lastName ||
     !formData.email ||
     !formData.password ||
     !formData.role ||
     !formData.grade ||
     !formData.section ||
     !formData.subject ||
     !formData.idNumber
   ) {
     setSnackbar({ open: true, message: 'All fields are required!', severity: 'warning' });
     return;
   }

   try {
     setLoading(true);
     const response = await axios.post('http://localhost:8080/api/teachers/register', formData);
     if (response.status === 200) {
       setSnackbar({ open: true, message: 'Teacher created successfully!', severity: 'success' });
       resetForm();
       setTimeout(() => {
         onClose();
       }, 1500);
     }
   } catch (error) {
     console.error('Error creating teacher:', error.response?.data);
     setSnackbar({
       open: true,
       message: error.response?.data?.error || 'Failed to create teacher. Please try again.',
       severity: 'error',
     });
   } finally {
     setLoading(false);
   }
 };

 return (
   <Dialog 
     open={open} 
     onClose={onClose}
     maxWidth="xs"
     fullWidth
   >
     <DialogTitle sx={{ 
       display: 'flex', 
       justifyContent: 'space-between', 
       alignItems: 'center',
       p: 2,
       backgroundColor: '#FFF',
     }}>
       <Typography variant="h6">Create Teacher</Typography>
       <IconButton onClick={onClose}>
         <CloseIcon />
       </IconButton>
     </DialogTitle>

     <DialogContent sx={{ p: 2 }}>
       <Grid container spacing={2}>
         <Grid item xs={6}>
           <TextField
             label="First Name"
             name="firstName"
             value={formData.firstName}
             onChange={handleInputChange}
             variant="outlined"
             fullWidth
             required
           />
         </Grid>
         <Grid item xs={6}>
           <TextField
             label="Last Name"
             name="lastName"
             value={formData.lastName}
             onChange={handleInputChange}
             variant="outlined"
             fullWidth
             required
           />
         </Grid>
       </Grid>

       <TextField
         label="Email"
         name="email"
         type="email"
         value={formData.email}
         onChange={handleInputChange}
         variant="outlined"
         fullWidth
         required
         sx={{ mt: 2 }}
       />

       <TextField
         label="Password"
         name="password"
         type="password"
         value={formData.password}
         onChange={handleInputChange}
         variant="outlined"
         fullWidth
         required
         sx={{ mt: 2 }}
       />

       <TextField
         label="Role"
         name="role"
         value={formData.role}
         variant="outlined"
         fullWidth
         disabled
         sx={{ mt: 2 }}
       />

       <TextField
         label="ID Number"
         name="idNumber"
         value={formData.idNumber}
         onChange={handleInputChange}
         variant="outlined"
         fullWidth
         required
         sx={{ mt: 2 }}
       />

       <TextField
         label="Subject"
         name="subject"
         value={formData.subject}
         onChange={handleInputChange}
         variant="outlined"
         fullWidth
         required
         sx={{ mt: 2 }}
       />

       <Grid container spacing={2} sx={{ mt: 0 }}>
         <Grid item xs={6}>
           <TextField
             name="grade"
             label="Grade Level"
             select
             value={formData.grade}
             onChange={handleInputChange}
             fullWidth
             required
             variant="outlined"
             SelectProps={{
               native: true,
             }}
             InputLabelProps={{ 
               shrink: true, 
               style: { 
                 position: 'absolute', 
                 top: -10, 
                 left: -10, 
                 backgroundColor: 'white', 
                 padding: '0 5px', 
                 zIndex: 1 
               } 
             }}
           >
             <option value="">Select Grade</option>
             {gradeOptions.map((grade) => (
               <option key={grade} value={grade}>
                 {grade}
               </option>
             ))}
           </TextField>
         </Grid>
         <Grid item xs={6}>
           <TextField
             name="section"
             label="Section"
             select
             value={formData.section}
             onChange={handleInputChange}
             fullWidth
             required
             variant="outlined"
             disabled={!formData.grade}
             SelectProps={{
               native: true,
             }}
             InputLabelProps={{ 
               shrink: true, 
               style: { 
                 position: 'absolute', 
                 top: -10, 
                 left: -10, 
                 backgroundColor: 'white', 
                 padding: '0 5px', 
                 zIndex: 1 
               } 
             }}
           >
             <option value="">Select Section</option>
             {sectionOptions.map((section) => (
               <option key={section} value={section}>
                 {section}
               </option>
             ))}
           </TextField>
         </Grid>
       </Grid>

       <Button
         variant="contained"
         onClick={handleSubmit}
         disabled={loading}
         fullWidth
         sx={{
           mt: 2,
           backgroundColor: '#FFD700',
           color: '#000',
           '&:hover': { backgroundColor: '#FFC107' },
         }}
       >
         {loading ? 'Creating...' : 'Create'}
       </Button>
     </DialogContent>

     <Snackbar
       open={snackbar.open}
       autoHideDuration={6000}
       onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
     >
       <Alert
         onClose={() => setSnackbar({ open: false, message: '', severity: '' })}
         severity={snackbar.severity}
         sx={{ width: '100%' }}
       >
         {snackbar.message}
       </Alert>
     </Snackbar>
   </Dialog>
 );
};

export default CreateTeacherForm;