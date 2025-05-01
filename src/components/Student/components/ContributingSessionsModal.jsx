import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  LinearProgress,
  CircularProgress,
  IconButton,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import api from "../../../utils/api";

const ContributingSessionsModal = ({ open, handleClose, requirementId, token }) => {
  const [loading, setLoading] = useState(true);
  const [requirementDetails, setRequirementDetails] = useState(null);
  const [error, setError] = useState(null);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState({ bookTitle: "", summary: "" });

  useEffect(() => {
    if (open && requirementId) {
      setLoading(true);
      setError(null);
      
      api.get(`/library-progress/requirement-details/${requirementId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          setRequirementDetails(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching requirement details:", err);
          setError("Failed to load requirement details. Please try again.");
          setLoading(false);
        });
    }
  }, [open, requirementId, token]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenSummaryDialog = (session) => {
    if (session.summary) {
      setSelectedSummary({
        bookTitle: session.bookTitle || "Unknown Book",
        summary: session.summary
      });
      setSummaryDialogOpen(true);
    }
  };

  const handleCloseSummaryDialog = () => {
    setSummaryDialogOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="contributing-sessions-title"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "15px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          id="contributing-sessions-title"
          sx={{
            backgroundColor: "#8C383E",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: 2,
          }}
        >
          <Typography variant="h6">
           Library Sessions
            {requirementDetails && ` - ${requirementDetails.subject} (${requirementDetails.quarter} Quarter)`}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : requirementDetails ? (
            <>
              {/* Requirement Summary */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: "rgba(140, 56, 62, 0.05)", borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Requirement Summary
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography variant="body2" color="textSecondary">
                      Status:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {requirementDetails.status}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography variant="body2" color="textSecondary">
                      Required Minutes:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {requirementDetails.requiredMinutes}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography variant="body2" color="textSecondary">
                      Minutes Rendered:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {requirementDetails.minutesRendered}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography variant="body2" color="textSecondary">
                      Remaining Minutes:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {requirementDetails.remainingMinutes}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography variant="body2" color="textSecondary">
                      Deadline:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatDate(requirementDetails.deadline)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Overall Progress: {Math.round(requirementDetails.progressPercentage)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={requirementDetails.progressPercentage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: requirementDetails.isCompleted ? "#4caf50" : "#2196f3"
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Contributing Sessions Table */}
              {requirementDetails.contributingSessions && requirementDetails.contributingSessions.length > 0 ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "rgba(140, 56, 62, 0.8)" }}>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Time In</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Time Out</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Book Title</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Minutes</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Contribution %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requirementDetails.contributingSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{formatDate(session.timeIn)}</TableCell>
                          <TableCell>{formatTime(session.timeIn)}</TableCell>
                          <TableCell>{formatTime(session.timeOut)}</TableCell>
                          <TableCell>
                            <Tooltip 
                              title={session.summary ? "Click to view summary" : "No summary available"}
                              placement="top"
                            >
                              <Typography
                                component="span" 
                                sx={{
                                  cursor: session.summary ? "pointer" : "default",
                                  textDecoration: session.summary ? "underline" : "none",
                                  fontWeight: session.summary ? "medium" : "normal",
                                  "&:hover": {
                                    color: session.summary ? "primary.main" : "inherit"
                                  }
                                }}
                                onClick={() => session.summary && handleOpenSummaryDialog(session)}
                              >
                                {session.bookTitle || "—"}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{session.minutes}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box sx={{ width: "100%", mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={session.contributionPercentage}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    width: 60,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: "#FFD700"
                                    }
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                {Math.round(session.contributionPercentage)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography align="center" sx={{ p: 2 }}>
                  No contributing sessions found for this requirement.
                </Typography>
              )}
            </>
          ) : (
            <Typography align="center" sx={{ p: 2 }}>
              No details available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "center" }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: "#8C383E",
              color: "#fff",
              "&:hover": { backgroundColor: "#9E484F" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Book Summary Dialog */}
      <Dialog
        open={summaryDialogOpen}
        onClose={handleCloseSummaryDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "15px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "25px",
            backgroundColor: "#FFDF16",
            color: "#000",
          }}
        >
          What I Learned: {selectedSummary.bookTitle}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "#FFDF16",
            padding: "30px",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              minHeight: "200px",
            }}
          >
            <Typography
              sx={{
                whiteSpace: "pre-wrap", // Preserve line breaks
                color: "#000",
              }}
            >
              {selectedSummary.summary}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            backgroundColor: "#FFDF16",
            padding: 2,
          }}
        >
          <Button
            onClick={handleCloseSummaryDialog}
            variant="contained"
            sx={{
              borderRadius: "10px",
              width: "120px",
              backgroundColor: "#A44444",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#BB5252",
              },
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContributingSessionsModal;