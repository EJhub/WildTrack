import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
  useMediaQuery,
  Button,
  Snackbar,
  Alert
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { AuthContext } from "../AuthContext";
import DoneIcon from "@mui/icons-material/Done";
import WarningIcon from "@mui/icons-material/Warning";
import ScheduleIcon from "@mui/icons-material/Schedule";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const LibraryRequirementsProgress = () => {
  const [requirements, setRequirements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCompletedItem, setLastCompletedItem] = useState(null);
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Store previously completed requirements to detect new completions
  const [previouslyCompleted, setPreviouslyCompleted] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const idNumber = user?.idNumber || localStorage.getItem("idNumber");

      if (!token || !idNumber) {
        toast.error("Unauthorized access. Please log in.");
        return;
      }

      // Fetch requirements progress
      const progressResponse = await axios.get(
        `http://localhost:8080/api/library-progress/${idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch progress summary
      const summaryResponse = await axios.get(
        `http://localhost:8080/api/library-progress/summary/${idNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get completed requirements
      const currentCompleted = progressResponse.data
        .filter(req => req.isCompleted)
        .map(req => req.id);
      
      // Check for newly completed requirements
      if (previouslyCompleted.length > 0) {
        const newlyCompleted = currentCompleted.filter(
          id => !previouslyCompleted.includes(id)
        );
        
        if (newlyCompleted.length > 0) {
          // Find details of newly completed requirements
          const newCompletionDetails = progressResponse.data.filter(
            req => newlyCompleted.includes(req.id)
          );
          
          if (newCompletionDetails.length > 0) {
            setShowCelebration(true);
            setLastCompletedItem(newCompletionDetails[0]);
          }
        }
      }
      
      // Update previously completed list
      setPreviouslyCompleted(currentCompleted);
      setRequirements(progressResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error fetching requirements:", error);
      toast.error("Failed to fetch library requirements progress.");
    } finally {
      setLoading(false);
    }
  };

  // Function to force refresh requirements
  const refreshRequirements = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const idNumber = user?.idNumber || localStorage.getItem("idNumber");

      if (!token || !idNumber) {
        toast.error("Unauthorized access. Please log in.");
        return;
      }

      // Store the current count of requirements before refresh
      const previousRequirementCount = requirements.length;

      // Call the force refresh endpoint
      const response = await axios.post(
        `http://localhost:8080/api/library-progress/refresh/${idNumber}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set the refreshed requirements
      if (response.data.requirements) {
        setRequirements(response.data.requirements);
        
        // Also refresh the summary data
        const summaryResponse = await axios.get(
          `http://localhost:8080/api/library-progress/summary/${idNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setSummary(summaryResponse.data);
        
        // Show appropriate message based on whether new requirements were added
        if (response.data.requirements.length > previousRequirementCount) {
          const newCount = response.data.requirements.length - previousRequirementCount;
          toast.success(`${newCount} new requirement${newCount > 1 ? 's' : ''} added to your list.`);
        } else {
          if (previousRequirementCount === 0 && response.data.requirements.length === 0) {
            toast.info("No library requirements are currently set for your grade level.");
          } else {
            toast.info("No new requirements found for your grade level.");
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing requirements:", error);
      toast.error("Failed to refresh requirements.");
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load and refresh every 60 seconds
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh interval
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [user]);

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  // Updated to remove "Pending Approval" status
  const getStatusChip = (status) => {
    switch (status) {
      case "Completed":
        return (
          <Chip
            icon={<DoneIcon />}
            label="Completed"
            color="success"
            size="small"
          />
        );
      case "Overdue":
        return (
          <Chip
            icon={<WarningIcon />}
            label="Overdue"
            color="error"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<ScheduleIcon />}
            label="In Progress"
            color="primary"
            size="small"
          />
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateRemainingDays = (deadlineString) => {
    if (!deadlineString) return 0;
    
    const deadline = new Date(deadlineString);
    const today = new Date();
    
    // Set time to midnight for both dates to get accurate day difference
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get the color for progress bar based on status
  const getProgressBarColor = (status) => {
    switch (status) {
      case "Completed":
        return "#4caf50"; // green
      case "Overdue":
        return "#f44336"; // red
      default:
        return "#2196f3"; // blue (In Progress)
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: "flex", height: "100vh" }}>
          <SideBar />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <NavBar />
      <Box 
        sx={{ 
          display: "flex", 
          height: "100vh",
          overflow: "hidden" // Prevent outer document scrolling
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: "32px 32px 200px 32px", // Significantly increased bottom padding to 200px
            flexGrow: 1,
            backgroundImage: "url('/studentbackground.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "auto", // Enable scrolling for main content
            height: "100%", // Ensure content area fills available height
            display: "flex",
            flexDirection: "column",
            '&::-webkit-scrollbar': { // Show scrollbar
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: "#FFD700",
                fontWeight: "bold",
              }}
            >
              Library Hours Requirements
            </Typography>
            
            <Button 
              startIcon={<RefreshIcon />}
              onClick={refreshRequirements}
              variant="contained"
              disabled={refreshing}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                "&:hover": { backgroundColor: "#FFC107" },
              }}
            >
              {refreshing ? "Checking..." : requirements.length === 0 ? "Initialize Requirements" : "Check for New Requirements"}
            </Button>
          </Box>

          {requirements.length === 0 ? (
            <Card
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "15px",
                boxShadow: 3,
                p: 3,
              }}
            >
              <Typography variant="h6" align="center">
                No library hour requirements found.
              </Typography>
              <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                {user?.grade 
                  ? "Click the button below to initialize library requirements for your current grade level." 
                  : "No grade level assigned. Please contact your administrator."}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={refreshRequirements}
                  disabled={refreshing || !user?.grade}
                  sx={{
                    backgroundColor: "#FFD700",
                    color: "#000",
                    "&:hover": { backgroundColor: "#FFC107" },
                  }}
                >
                  {refreshing ? "Initializing..." : "Initialize Requirements"}
                </Button>
              </Box>
            </Card>
          ) : isMobile ? (
            // Mobile view
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {requirements.map((requirement) => (
                <Card
                  key={requirement.id}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "15px",
                    boxShadow: 3,
                    border: requirement.isCompleted ? "2px solid #4caf50" : "none"
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" color="primary">
                        {requirement.subject} - {requirement.quarter} Quarter
                      </Typography>
                      {getStatusChip(requirement.status)}
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Required Minutes:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {requirement.requiredMinutes} minutes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Minutes Rendered:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {requirement.minutesRendered} minutes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Remaining Minutes:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {requirement.remainingMinutes} minutes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Deadline:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatDate(requirement.deadline)}
                        {calculateRemainingDays(requirement.deadline) > 0 && 
                          ` (${calculateRemainingDays(requirement.deadline)} days remaining)`}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Progress: {Math.round(requirement.progressPercentage)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={requirement.progressPercentage}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getProgressBarColor(requirement.status)
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop view - Table format
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "15px",
                boxShadow: 3,
                overflow: "visible", // Change from hidden to visible
                marginBottom: 4, // Add bottom margin
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#8C383E" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Subject</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Quarter</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Required Minutes</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Minutes Rendered</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Deadline</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Progress</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requirements.map((requirement) => (
                    <TableRow 
                      key={requirement.id}
                      sx={{
                        backgroundColor: requirement.isCompleted ? "rgba(76, 175, 80, 0.1)" : "transparent"
                      }}
                    >
                      <TableCell>{requirement.subject}</TableCell>
                      <TableCell>{requirement.quarter}</TableCell>
                      <TableCell>{requirement.requiredMinutes} mins</TableCell>
                      <TableCell>
                        {requirement.minutesRendered} mins
                        {!requirement.isCompleted && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            ({requirement.remainingMinutes} mins remaining)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(requirement.deadline)}
                        {calculateRemainingDays(requirement.deadline) > 0 && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            ({calculateRemainingDays(requirement.deadline)} days left)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={requirement.progressPercentage}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getProgressBarColor(requirement.status)
                                }
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {Math.round(requirement.progressPercentage)}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(requirement.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Summary Cards */}
          {summary && (
            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.8)', 
                  color: 'white',
                  borderRadius: '15px',
                  boxShadow: 3 
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Completed Requirements
                    </Typography>
                    <Typography variant="h3" component="div">
                      {summary.completedRequirements}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      out of {summary.totalRequirements} total requirements
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  backgroundColor: 'rgba(33, 150, 243, 0.8)', 
                  color: 'white',
                  borderRadius: '15px',
                  boxShadow: 3 
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      In Progress
                    </Typography>
                    <Typography variant="h3" component="div">
                      {summary.inProgressRequirements}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      requirements currently in progress
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  backgroundColor: 'rgba(244, 67, 54, 0.8)', 
                  color: 'white',
                  borderRadius: '15px',
                  boxShadow: 3 
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overdue Requirements
                    </Typography>
                    <Typography variant="h3" component="div">
                      {summary.overdueRequirements}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      requirements past deadline
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Overall Progress */}
          {summary && (
            <Card sx={{ 
              mt: 4, 
              mb: 8, // Significant bottom margin
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '15px', 
              boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.15)', // Stronger shadow
              position: 'relative', 
              zIndex: 1,
              minHeight: 160, // Ensure minimum height
              border: '2px solid #FFC107', // Add border for visibility
            }}>
              <CardContent sx={{ p: 3 }}> {/* Increased padding */}
                <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                  Overall Reading Progress
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  mt: 3, // More space above progress bar
                }}>
                  <Box sx={{ 
                    flexGrow: 1, 
                    mr: 2,
                    height: 20, // Taller progress bar
                    bgcolor: 'rgba(0,0,0,0.05)', // Background for the progress track
                    borderRadius: 5,
                  }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={summary.overallPercentage}
                      sx={{
                        height: 20, // Taller height
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#FFD700',
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>
                    {Math.round(summary.overallPercentage)}%
                  </Typography>
                </Box>
                <Typography variant="body1" align="center" sx={{ mt: 2, fontWeight: 'medium' }}>
                  {summary.totalMinutesRendered} minutes read out of {summary.totalMinutesRequired} minutes required
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* Extra spacer to ensure scrollability to the very bottom */}
          <Box sx={{ height: 100, width: '100%' }} />
        </Box>
      </Box>
      
      {/* Completion Celebration Notification */}
      {lastCompletedItem && (
        <Snackbar
          open={showCelebration}
          autoHideDuration={8000}
          onClose={handleCelebrationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCelebrationClose} 
            severity="success"
            icon={<EmojiEventsIcon fontSize="inherit" />}
            sx={{ 
              width: '100%',
              backgroundColor: '#4caf50',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#FFD700'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Congratulations!
            </Typography>
            <Typography variant="body2">
              You've completed the {lastCompletedItem.subject} reading requirement for {lastCompletedItem.quarter} Quarter! 
              ({lastCompletedItem.requiredMinutes} minutes)
            </Typography>
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default LibraryRequirementsProgress;