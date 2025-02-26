import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Snackbar, Grid, Typography, IconButton, Alert, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import ConfirmUpdateDialog from './ConfirmUpdateDialog';

const UpdateTeacherForm = ({ teacherData, onClose, onUpdate }) => {
 const [formData, setFormData] = useState({
   firstName: '',
   middleName: '',
   lastName: '',
   idNumber: '',
   subject: '',
   grade: '',
   section: '',
   role: 'Teacher',
 });

 const [passwordData, setPasswordData] = useState({
   currentPassword: '',
   newPassword: '',
   confirmPassword: '',
 });

 const [changePassword, setChangePassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [gradeOptions, setGradeOptions] = useState([]);
 const [sectionOptions, setSectionOptions] = useState([]);
 const [formVisible, setFormVisible] = useState(true);
 const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

 const [snackbar, setSnackbar] = useState({
   open: false,
   message: '',
   severity: '',
 });

 useEffect(() => {
   if (teacherData) {

     setFormVisible(true);
     setFormData({
       firstName: teacherData.firstName || '',
       middleName: teacherData.middleName || '',

       lastName: teacherData.lastName || '',
       idNumber: teacherData.idNumber || '',
       subject: teacherData.subject || '',
       grade: teacherData.grade || '',
       section: teacherData.section || '',
       role: teacherData.role || 'Teacher',
     });
   }
 }, [teacherData]);

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
       section: '' // Reset section when grade changes
     }));
   } else {
     setFormData(prevData => ({
       ...prevData,
       [name]: value
     }));
   }
 };


 const handlePasswordChange = (e) => {
   const { name, value } = e.target;
   setPasswordData(prevData => ({
     ...prevData,
     [name]: value
   }));
 };

 // Initial submit handler that validates and opens the dialog
 const handleSubmit = () => {

   if (
     !formData.firstName ||
     !formData.lastName ||
     !formData.idNumber ||
     !formData.subject ||
     !formData.grade ||
     !formData.section ||
     !formData.role
   ) {

     setSnackbar({ open: true, message: 'All required fields must be filled!', severity: 'warning' });
     return;
   }

   // Validate password fields if password change is enabled
   if (changePassword) {
     if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
       setSnackbar({ open: true, message: 'All password fields are required!', severity: 'warning' });
       return;
     }
     
     if (passwordData.newPassword !== passwordData.confirmPassword) {
       setSnackbar({ open: true, message: 'New password and confirm password do not match!', severity: 'error' });
       return;
     }
   }

   // Hide form and show confirmation dialog
   setFormVisible(false);
   setConfirmDialogOpen(true);
 };

 // Cancel update - close dialog and reopen form
 const handleCancelUpdate = () => {
   setConfirmDialogOpen(false);
   setFormVisible(true);
 };

 // Actual submission after confirmation
 const handleConfirmSubmit = async () => {
   try {
     setLoading(true);
     
     // Update teacher information
     const payload = {
       firstName: formData.firstName,
       lastName: formData.lastName,
       middleName: formData.middleName,
       idNumber: formData.idNumber,
       subject: formData.subject,
       grade: formData.grade,
       section: formData.section,
       role: formData.role,
     };

     await axios.put(`http://localhost:8080/api/teachers/${teacherData.id}`, payload);
     
     // Handle password change if requested
     if (changePassword) {
       try {
         const passwordPayload = {
           id: teacherData.id,
           currentPassword: passwordData.currentPassword,
           newPassword: passwordData.newPassword
         };
         
         await axios.put('http://localhost:8080/api/users/change-password', passwordPayload);
         setSnackbar({ open: true, message: 'Teacher information and password updated successfully!', severity: 'success' });
       } catch (passwordError) {
         console.error('Error updating password:', passwordError);
         setSnackbar({ 
           open: true, 
           message: passwordError.response?.data?.error || 'Password update failed. Please check your current password.',
           severity: 'error'
         });
         setLoading(false);
         return;
       }
     } else {
       setSnackbar({ open: true, message: 'Teacher information updated successfully!', severity: 'success' });
     }
     
     onUpdate();
     setLoading(false);
     // Keep dialog and form closed after successful update
     setConfirmDialogOpen(false);
     // Close the entire form component

     onClose();
   } catch (error) {
     console.error('Error updating teacher:', error);
     setSnackbar({
       open: true,
       message: error.response?.data?.error || 'Failed to update teacher. Please try again.',
       severity: 'error',
     });

     setLoading(false);
     // Reopen form on error
     setFormVisible(true);

   }
 };

 return (
   <>
     {formVisible && (
       <Box
         sx={{
           position: 'fixed',
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           width: '450px',
           bgcolor: '#F5F5F5',
           boxShadow: 24,
           p: 4,
           borderRadius: '8px',
           zIndex: 1500,
           border: '1px solid #CCC',
           maxHeight: '90vh',
           overflowY: 'auto'
         }}
       >
         <Box
           sx={{
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             marginBottom: 3,
           }}
         >
           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
             Update Teacher
           </Typography>
           <IconButton onClick={onClose}>
             <CloseIcon />
           </IconButton>
         </Box>

         <Box
           component="form"
           sx={{
             display: 'flex',
             flexDirection: 'column',
             gap: 2,
           }}
         >
           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
             Personal Information
           </Typography>
           
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
             label="ID Number"
             name="idNumber"
             value={formData.idNumber}
             onChange={handleInputChange}
             variant="outlined"
             fullWidth
             required
           />

           <TextField
             label="Subject"
             name="subject"
             value={formData.subject}
             onChange={handleInputChange}
             variant="outlined"
             fullWidth
             required
           />

           <Grid container spacing={2}>
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

           <TextField
             label="Role"
             name="role"
             value={formData.role}
             onChange={handleInputChange}
             variant="outlined"
             fullWidth
             disabled
           />

           <Divider sx={{ my: 2 }} />
           
           <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
             <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
               Change Password
             </Typography>
             <Button 
               variant="text" 
               onClick={() => setChangePassword(!changePassword)}
               sx={{ ml: 2 }}
             >
               {changePassword ? 'Cancel' : 'Change'}
             </Button>
           </Box>

           {changePassword && (
             <>
               <TextField
                 label="Current Password"
                 name="currentPassword"
                 type="password"
                 value={passwordData.currentPassword}
                 onChange={handlePasswordChange}
                 variant="outlined"
                 fullWidth
                 required
               />
               <Grid container spacing={2}>
                 <Grid item xs={6}>
                   <TextField
                     label="New Password"
                     name="newPassword"
                     type="password"
                     value={passwordData.newPassword}
                     onChange={handlePasswordChange}
                     variant="outlined"
                     fullWidth
                     required
                   />
                 </Grid>
                 <Grid item xs={6}>
                   <TextField
                     label="Confirm Password"
                     name="confirmPassword"
                     type="password"
                     value={passwordData.confirmPassword}
                     onChange={handlePasswordChange}
                     variant="outlined"
                     fullWidth
                     required
                   />
                 </Grid>
               </Grid>
             </>
           )}

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
               {loading ? 'Updating...' : 'Update'}
             </Button>
           </Box>
         </Box>
       </Box>
     )}

     {/* Confirmation Dialog */}
     <ConfirmUpdateDialog
       open={confirmDialogOpen}
       onClose={handleCancelUpdate}
       onConfirm={handleConfirmSubmit}
       title="Confirm Update"
       message="Are you sure you want to save the changes? The new details will replace the current records."
     />

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

   </>

 );
};

export default UpdateTeacherForm;