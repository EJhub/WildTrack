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
import SuccessDialog from './SuccessDialog'; // Import the success dialog component

const CreateTeacherForm = ({ open, onClose }) => {
 const [formData, setFormData] = useState({
   firstName: '',

   middleName: '',
   lastName: '',
   email: '',
   password: '',
   confirmPassword: '',

   role: 'Teacher',
   subject: '',
   grade: '',
   section: '',
   idNumber: '',
 });
 

 // Add state to store teacher name for success message
 const [teacherName, setTeacherName] = useState({ firstName: '', lastName: '' });
 const [loading, setLoading] = useState(false);
 const [gradeOptions, setGradeOptions] = useState([]);
 const [sectionOptions, setSectionOptions] = useState([]);
 const [successDialogOpen, setSuccessDialogOpen] = useState(false);

 const [snackbar, setSnackbar] = useState({
   open: false,
   message: '',
   severity: '',
 });


 // Ensure form state is always synchronized with parent open prop
 useEffect(() => {
   if (!open) {
     // Reset form state completely if parent says we're closed
     resetForm();
     setLoading(false);
   }
 }, [open]);

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

   if (open) {
     fetchGradeOptions();
   }
 }, [open]);

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
     middleName: '',
     lastName: '',
     email: '',
     password: '',
     confirmPassword: '',
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
     !formData.confirmPassword ||
     !formData.role ||
     !formData.grade ||
     !formData.section ||
     !formData.subject ||
     !formData.idNumber
   ) {
     setSnackbar({ open: true, message: 'All fields are required!', severity: 'warning' });
     return;
   }

   if (formData.password !== formData.confirmPassword) {
     setSnackbar({ open: true, message: 'Passwords do not match!', severity: 'error' });
     return;
   }

   try {
     setLoading(true);
     // Remove confirmPassword before sending to the server
     const dataToSubmit = { ...formData };
     delete dataToSubmit.confirmPassword;
     
     const response = await axios.post('http://localhost:8080/api/teachers/register', dataToSubmit);
     if (response.status === 200) {
       // Store the teacher name before resetting the form
       setTeacherName({
         firstName: formData.firstName,
         lastName: formData.lastName
       });
       
       // Explicitly close the form first - this is important
       onClose();
       
       // Then show the success dialog
       setTimeout(() => {
         setSuccessDialogOpen(true);
       }, 100);
     }
   } catch (error) {
     console.error('Error creating teacher:', error.response?.data);
     setSnackbar({
       open: true,
       message: error.response?.data?.error || 'Failed to create teacher. Please try again.',
       severity: 'error',
     });
     setLoading(false);
   }
 };

 // Handle success dialog close
 const handleSuccessDialogClose = () => {
   setSuccessDialogOpen(false);
   setLoading(false);
   // No need to call onClose() here as form is already closed
 };

 return (
   <>
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
         <Typography variant="h6">Add Teacher</Typography>
         <IconButton onClick={onClose}>
           <CloseIcon />
         </IconButton>
       </DialogTitle>

       <DialogContent sx={{ p: 2 }}>
         <Grid container spacing={2}>
           <Grid item xs={4}>
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
           <Grid item xs={4}>
             <TextField
               label="Middle Name"
               name="middleName"
               value={formData.middleName}
               onChange={handleInputChange}
               variant="outlined"
               fullWidth
             />
           </Grid>
           <Grid item xs={4}>
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

         <Grid container spacing={2} sx={{ mt: 0 }}>
           <Grid item xs={6}>
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
           </Grid>
           <Grid item xs={6}>
             <TextField
               label="Confirm Password"
               name="confirmPassword"
               type="password"
               value={formData.confirmPassword}
               onChange={handleInputChange}
               variant="outlined"
               fullWidth
               required
               sx={{ mt: 2 }}
             />
           </Grid>
         </Grid>

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

         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
           <Button
             variant="contained"
             onClick={handleSubmit}
             disabled={loading}
             sx={{
               backgroundColor: '#FFD700',
               color: '#000',
               '&:hover': { backgroundColor: '#FFC107' },
               width: '200px',
             }}
           >
             {loading ? 'Creating...' : 'Create'}
           </Button>
         </Box>
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

     {/* Success Dialog - completely separate from the form */}
     {successDialogOpen && (
       <SuccessDialog 
         open={successDialogOpen}
         onClose={handleSuccessDialogClose}
         title="Added Successfully"
         message={`Teacher ${teacherName.firstName} ${teacherName.lastName} added successfully. You can now manage their details.`}
       />
     )}
   </>

 );
};

export default CreateTeacherForm;