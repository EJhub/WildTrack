import React, { useState, useEffect, useContext, useRef } from "react";
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
  Snackbar,
  Alert,
  IconButton,
  Collapse,
  Tooltip,
  Button
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import ContributingSessionsModal from "./components/ContributingSessionsModal"; // Import the new modal
import { AuthContext } from "../AuthContext";
import DoneIcon from "@mui/icons-material/Done";
import WarningIcon from "@mui/icons-material/Warning";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from "@mui/icons-material/Info"; // Added for session details button
import api from "../../utils/api"; // Import the API utility instead of axios

const LibraryRequirementsProgress = () => {
  const [requirements, setRequirements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCompletedItem, setLastCompletedItem] = useState(null);
  const [lastRequirementHash, setLastRequirementHash] = useState("");
  const [expandedIds, setExpandedIds] = useState({}); // Track expanded state for mobile cards
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pollingIntervalRef = useRef(null);

  // Store previously completed requirements to detect new completions
  const [previouslyCompleted, setPreviouslyCompleted] = useState([]);
  
  // New state variables for the contributing sessions modal
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState(null);

  // Utility function to create a simple hash of requirements array
  // This helps us detect changes efficiently
  const createRequirementsHash = (reqs) => {
    if (!reqs || reqs.length === 0) return "";
    return reqs.map(r => `${r.id}-${r.subject}-${r.isCompleted}`).join('|');
  };

  // Function to toggle expanded state for a requirement
  const toggleExpanded = (id) => {
    setExpandedIds(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  // Functions to handle the contributing sessions modal
  const handleOpenSessionsModal = (requirementId) => {
    setSelectedRequirementId(requirementId);
    setSessionModalOpen(true);
  };

  const handleCloseSessionsModal = () => {
    setSessionModalOpen(false);
  };

  // Function to check for requirement updates
  const checkForUpdates = async () => {
    try {
      const token = localStorage.getItem("token");
      const idNumber = user?.idNumber || localStorage.getItem("idNumber");

      if (!token || !idNumber) {
        return;
      }

      // Set token in API utility headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Initialize requirements if empty - this will call the refresh endpoint
      if (requirements.length === 0) {
        await initializeRequirements(idNumber, token);
        return;
      }

      // Use the active-progress endpoint to get real-time status including active "In Progress"
      const progressResponse = await api.get(
        `/library-progress/active-progress/${idNumber}`
      );

      const newRequirements = progressResponse.data;
      
      // Create a hash to check if there are actual changes
      const newRequirementsHash = JSON.stringify(newRequirements);
      
      // Only update if there's an actual change
      if (newRequirementsHash !== lastRequirementHash) {
        // Get completed requirements for celebration checks
        const currentCompleted = newRequirements
          .filter(req => req.isCompleted)
          .map(req => req.requirementId);
        
        // Check for newly completed requirements
        if (previouslyCompleted.length > 0) {
          const newlyCompleted = currentCompleted.filter(
            id => !previouslyCompleted.includes(id)
          );
          
          if (newlyCompleted.length > 0) {
            // Find details of newly completed requirements
            const newCompletionDetails = newRequirements.filter(
              req => newlyCompleted.includes(req.requirementId)
            );
            
            if (newCompletionDetails.length > 0) {
              setShowCelebration(true);
              setLastCompletedItem(newCompletionDetails[0]);
            }
          }
        }
        
        // Check for newly added requirements
        if (newRequirements.length > requirements.length) {
          // Get the difference by comparing lengths - assuming only additions, not removals
          const difference = newRequirements.length - requirements.length;
          
          if (difference > 0) {
            // Notify for new requirements
            toast.info(`${difference} new requirement${difference > 1 ? 's' : ''} have been added`, {
              position: "bottom-right",
              autoClose: 3000
            });
          }
        }
        
        // Update the state with new data
        setPreviouslyCompleted(currentCompleted);
        setRequirements(newRequirements);
        setLastRequirementHash(newRequirementsHash);
        
        // Get summary data
        const summaryResponse = await api.get(
          `/library-progress/summary-with-init/${idNumber}`
        );
        
        setSummary(summaryResponse.data);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      // Don't show toast errors for background checks
    }
  };

  // Function to initialize requirements if none exist
  const initializeRequirements = async (idNumber, token) => {
    try {
      // Set token in API utility headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Get requirements with active status
      const requirementsResponse = await api.get(
        `/library-progress/active-progress/${idNumber}`
      );
      
      // If we got requirements back, use them
      if (requirementsResponse.data && requirementsResponse.data.length > 0) {
        setRequirements(requirementsResponse.data);
        setLastRequirementHash(JSON.stringify(requirementsResponse.data));
      } else {
        // Otherwise call the refresh endpoint to force initialization
        const response = await api.post(
          `/library-progress/refresh/${idNumber}`,
          {}
        );
  
        if (response.data.requirements) {
          // After refresh, get the data with active status
          const refreshedData = await api.get(
            `/library-progress/active-progress/${idNumber}`
          );
          
          setRequirements(refreshedData.data);
          setLastRequirementHash(JSON.stringify(refreshedData.data));
        }
      }
      
      // Get summary data
      const summaryResponse = await api.get(
        `/library-progress/summary-with-init/${idNumber}`
      );
      
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error initializing requirements:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await checkForUpdates();
      setLoading(false);
    };
    
    loadInitialData();
    
    // Set up polling interval - check every 5 seconds for changes
    pollingIntervalRef.current = setInterval(() => {
      checkForUpdates();
    }, 5000);
    
    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user]);
  
  // Effect to update polling when user reference changes
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      checkForUpdates();
    }, 5000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user]);

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  // Status chip component with updated styling for all statuses including "Not Started"
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
      case "In Progress":
        return (
          <Chip
            icon={<PlayCircleOutlineIcon />}
            label="In Progress"
            color="primary"
            size="small"
          />
        );
      case "Not Started":
        return (
          <Chip
            icon={<ScheduleIcon />}
            label="Not Started"
            color="default"
            size="small"
          />
        );
      case "Paused":
        return (
          <Chip
            icon={<PauseCircleOutlineIcon />}
            label="Paused"
            color="secondary"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<ScheduleIcon />}
            label={status}
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
      case "In Progress":
        return "#2196f3"; // blue
      case "Paused":
        return "#9c27b0"; // purple
      case "Not Started":
        return "#9e9e9e"; // grey
      default:
        return "#9e9e9e"; // grey for unknown status
    }
  };

  // UPDATED LOADING STATE
  if (loading) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: "flex", height: "100vh" }}>
          <SideBar />
          <Box
            sx={{
              padding: 4,
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff", // White background
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading library requirements...</Typography>
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
          overflow: "hidden"
        }}
      >
        <SideBar />
        <Box
          sx={{
            padding: "32px 32px 200px 32px",
            flexGrow: 1,
            backgroundImage: "url('/studentbackground.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            '&::-webkit-scrollbar': {
              width: '8px',
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: "#FFD700",
                fontWeight: "bold",
              }}
            >
              Library Hours Requirements
            </Typography>
            
            {/* Small indicator that updates are automatic */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: "rgba(255, 215, 0, 0.8)",
                display: "block",
                mt: 0.5
              }}
            >
              Updates automatically as you time in/out and as new requirements are added
            </Typography>
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
                  ? "When requirements are assigned to your grade level, they will automatically appear here." 
                  : "No grade level assigned. Please contact your administrator."}
              </Typography>
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
                    border: requirement.isCompleted ? "2px solid #4caf50" : 
                           requirement.status === "In Progress" ? "2px solid #2196f3" : 
                           requirement.status === "Not Started" ? "2px solid #9e9e9e" : "none"
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
                    
                    {/* Created By (Teacher) */}
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: '#8C383E' }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Created By:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {requirement.creatorName || "Unknown Teacher"}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Task Description with toggle */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AssignmentIcon fontSize="small" sx={{ mr: 1, color: '#8C383E' }} />
                          <Typography variant="body2" color="textSecondary">
                            Task:
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleExpanded(requirement.id)}
                          sx={{ p: 0 }}
                        >
                          {expandedIds[requirement.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedIds[requirement.id] || false}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mt: 1, 
                            p: 1, 
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                            borderRadius: 1,
                            whiteSpace: 'pre-wrap' // Preserve line breaks in task descriptions
                          }}
                        >
                          {requirement.task || "No task description provided."}
                        </Typography>
                      </Collapse>
                    </Box>
                    
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

                    {/* Added button for viewing contributing sessions on mobile */}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<InfoIcon />}
                      onClick={() => handleOpenSessionsModal(requirement.id)}
                      sx={{
                        mt: 2,
                        borderColor: "#8C383E",
                        color: "#8C383E",
                        "&:hover": {
                          backgroundColor: "rgba(140, 56, 62, 0.05)",
                          borderColor: "#8C383E",
                        },
                      }}
                    >
                      View Sessions
                      {requirement.contributingSessionsCount > 0 && ` (${requirement.contributingSessionsCount})`}
                    </Button>
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
                overflow: "visible",
                marginBottom: 4,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#8C383E" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Subject</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Quarter</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Created By</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Task</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Required Minutes</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Minutes Rendered</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Deadline</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Progress</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requirements.map((requirement) => (
                    <TableRow 
                      key={requirement.id}
                      sx={{
                        backgroundColor: requirement.isCompleted ? "rgba(76, 175, 80, 0.1)" :
                                        requirement.status === "In Progress" ? "rgba(33, 150, 243, 0.1)" : 
                                        requirement.status === "Not Started" ? "rgba(158, 158, 158, 0.05)" : "transparent"
                      }}
                    >
                      <TableCell>{requirement.subject}</TableCell>
                      <TableCell>{requirement.quarter}</TableCell>
                      <TableCell>{requirement.creatorName || "Unknown Teacher"}</TableCell>
                      <TableCell>
                        <Tooltip 
                          title={requirement.task || "No task description provided."}
                          placement="top-start"
                          arrow
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          <Typography
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {requirement.task || "No task description."}
                          </Typography>
                        </Tooltip>
                      </TableCell>
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
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<InfoIcon />}
                          onClick={() => handleOpenSessionsModal(requirement.id)}
                          sx={{
                            borderColor: "#8C383E",
                            color: "#8C383E",
                            "&:hover": {
                              backgroundColor: "rgba(140, 56, 62, 0.05)",
                              borderColor: "#8C383E",
                            },
                          }}
                        >
                          Sessions
                          {requirement.contributingSessionsCount > 0 && ` (${requirement.contributingSessionsCount})`}
                        </Button>
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

        {/* Overall Completed Requirements */}
{summary && (
  <Card sx={{ 
    mt: 4, 
    mb: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: '15px', 
    boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.15)',
    position: 'relative', 
    zIndex: 1,
    minHeight: 160,
    border: '2px solid #FFC107',
  }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
        Overall Completed Requirements
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        mt: 3,
      }}>
        <Box sx={{ 
          flexGrow: 1, 
          mr: 2,
          height: 20,
          bgcolor: 'rgba(0,0,0,0.05)',
          borderRadius: 5,
        }}>
          <LinearProgress 
            variant="determinate" 
            value={summary.totalRequirements > 0 ? (summary.completedRequirements / summary.totalRequirements) * 100 : 0}
            sx={{
              height: 20,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FFD700',
              }
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>
          {summary.totalRequirements > 0 ? Math.round((summary.completedRequirements / summary.totalRequirements) * 100) : 0}%
        </Typography>
      </Box>
      <Typography variant="body1" align="center" sx={{ mt: 2, fontWeight: 'medium' }}>
        {summary.completedRequirements} requirements completed out of {summary.totalRequirements} total requirements
      </Typography>
    </CardContent>
  </Card>
)}
          
          {/* Extra spacer to ensure scrollability to the very bottom */}
          <Box sx={{ height: 100, width: '100%' }} />
        </Box>
      </Box>
      
      {/* Contributing Sessions Modal */}
      <ContributingSessionsModal
        open={sessionModalOpen}
        handleClose={handleCloseSessionsModal}
        requirementId={selectedRequirementId}
        token={localStorage.getItem("token")}
      />
      
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