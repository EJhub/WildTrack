import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Collapse,
  CircularProgress,
  Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddGradeSection from './AddGradeSection';
import AddSectionModal from './AddSectionModal';

// GradeRow Component
const GradeRow = ({ 
  grade, 
  sections, 
  activeSections, 
  totalStudents, 
  status, 
  onArchiveGrade, 
  onArchiveSection,
  onAddSection 
}) => {
  const [open, setOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  const handleOpenAddSectionModal = () => {
    setIsAddSectionModalOpen(true);
  };

  const handleCloseAddSectionModal = () => {
    setIsAddSectionModalOpen(false);
  };

  const handleSubmitSection = (sectionData) => {
    onAddSection(sectionData);
    handleCloseAddSectionModal();
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          {grade}
        </TableCell>
        <TableCell>{activeSections}</TableCell>
        <TableCell>{totalStudents}</TableCell>
        <TableCell>
          <Box
            sx={{
              backgroundColor: status === 'active' ? '#90EE90' : '#FFB6C1',
              borderRadius: '16px',
              px: 2,
              py: 0.5,
              display: 'inline-block',
            }}
          >
            {status}
          </Box>
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            onClick={handleOpenAddSectionModal}
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              mr: 1,
              '&:hover': { backgroundColor: '#FFC107' },
            }}
          >
            Add Section
          </Button>
          <Button
            variant="contained"
            onClick={() => onArchiveGrade(grade)}
            sx={{
              backgroundColor: status === 'active' ? '#FFD700' : '#90EE90',
              color: '#000',
              '&:hover': { 
                backgroundColor: status === 'active' ? '#FFC107' : '#32CD32'
              },
            }}
          >
            {status === 'active' ? 'Archive' : 'Unarchive'}
          </Button>

          {/* Add Section Modal */}
          <AddSectionModal 
            open={isAddSectionModalOpen}
            onClose={handleCloseAddSectionModal}
            gradeLevel={grade}
            onAddSection={handleSubmitSection}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>SECTION</TableCell>
                    <TableCell>ADVISOR</TableCell>
                    <TableCell>STUDENTS</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sections && sections.length > 0 ? (
                    sections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell>{section.sectionName}</TableCell>
                        <TableCell>{section.advisor}</TableCell>
                        <TableCell>{section.numberOfStudents}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: section.status === 'active' ? '#90EE90' : '#FFB6C1',
                              borderRadius: '16px',
                              px: 2,
                              py: 0.5,
                              display: 'inline-block',
                            }}
                          >
                            {section.status}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            onClick={() => onArchiveSection(section.id)}
                            sx={{
                              backgroundColor: section.status === 'active' ? '#FFD700' : '#90EE90',
                              color: '#000',
                              '&:hover': { 
                                backgroundColor: section.status === 'active' ? '#FFC107' : '#32CD32'
                              },
                            }}
                          >
                            {section.status === 'active' ? 'Archive' : 'Unarchive'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No sections available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Main GradeSectionTable Component
const GradeSectionTable = () => {
  const [gradeSections, setGradeSections] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGradeSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/grade-sections/all');
      if (!response.ok) throw new Error('Failed to fetch grade sections');
      const data = await response.json();

      // Process the data to group by grade level
      const groupedData = data.reduce((acc, item) => {
        const gradeGroup = acc.find(g => g.grade === item.gradeLevel);
        
        if (gradeGroup) {
          gradeGroup.sections.push({
            id: item.id,
            sectionName: item.sectionName,
            advisor: item.advisor,
            numberOfStudents: item.numberOfStudents,
            status: item.status
          });
          gradeGroup.totalStudents += item.numberOfStudents;
          gradeGroup.activeSections = gradeGroup.sections.filter(s => s.status === 'active').length;
        } else {
          acc.push({
            grade: item.gradeLevel,
            activeSections: item.status === 'active' ? 1 : 0,
            totalStudents: item.numberOfStudents,
            status: 'active',
            sections: [{
              id: item.id,
              sectionName: item.sectionName,
              advisor: item.advisor,
              numberOfStudents: item.numberOfStudents,
              status: item.status
            }]
          });
        }
        return acc;
      }, []);

      setGradeSections(groupedData);
    } catch (error) {
      console.error('Error fetching grade sections:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeSections();
  }, []);

  const handleArchiveGrade = async (gradeLevel) => {
    try {
      const response = await fetch(`http://localhost:8080/api/grade-sections/${gradeLevel}/toggle-archive`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to toggle grade archive status');
      fetchGradeSections();
    } catch (error) {
      console.error('Error toggling grade archive status:', error);
    }
  };

  const handleArchiveSection = async (sectionId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/grade-sections/${sectionId}/toggle-archive`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to toggle section archive status');
      fetchGradeSections();
    } catch (error) {
      console.error('Error toggling section archive status:', error);
    }
  };

  const handleAddSection = async (sectionData) => {
    try {
      const response = await fetch('http://localhost:8080/api/grade-sections/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData)
      });
      
      if (!response.ok) throw new Error('Failed to add section');
      fetchGradeSections();
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#FFD700' }}>
              <TableCell>GRADE LEVEL</TableCell>
              <TableCell>ACTIVE SECTIONS</TableCell>
              <TableCell>TOTAL STUDENTS</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gradeSections.map((grade) => (
              <GradeRow 
                key={grade.grade}
                {...grade}
                onArchiveGrade={handleArchiveGrade}
                onArchiveSection={handleArchiveSection}
                onAddSection={handleAddSection}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddGradeSection 
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGradeSectionAdded={fetchGradeSections}
      />
    </Box>
  );
};

export default GradeSectionTable;