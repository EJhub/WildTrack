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
  Typography,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddGradeSection from './AddGradeSection';
import AddSectionModal from './AddSectionModal';
import ViewSectionModal from './ViewSectionModal';
import api from '../../../utils/api'; // Import the API utility

// GradeRow Component
const GradeRow = ({ 
  grade, 
  sections, 
  activeSections, 
  totalStudents, 
  status, 
  onArchiveGrade, 
  onArchiveSection,
  onAddSection,
  onUpdateSection,
  searchTerm = '',
  isGradeFiltered = true
}) => {
  const [open, setOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [viewSectionModalOpen, setViewSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // If there's a search term, automatically expand rows
  useEffect(() => {
    if (searchTerm && isGradeFiltered) {
      setOpen(true);
    }
  }, [searchTerm, isGradeFiltered]);

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

  const handleOpenViewModal = (section) => {
    setSelectedSection({
      ...section,
      gradeLevel: grade // Add the grade level to the section data
    });
    setViewSectionModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewSectionModalOpen(false);
    setSelectedSection(null);
  };

  // Filter sections based on search term
  const filteredSections = sections.filter(section => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase().trim();
    return (
      section.sectionName.toLowerCase().includes(term) ||
      (section.advisor && section.advisor.toLowerCase().includes(term)) ||
      (section.status && section.status.toLowerCase().includes(term))
    );
  });

  // Determine if this row matches search criteria
  const hasMatchingSections = filteredSections.length > 0;

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
                  {filteredSections.length > 0 ? (
                    filteredSections.map((section) => (
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
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              onClick={() => handleOpenViewModal(section)}
                              sx={{
                                backgroundColor: '#FFD700',
                                color: '#000',
                                '&:hover': { backgroundColor: '#1E90FF' },
                              }}
                            >
                              View
                            </Button>
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
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {searchTerm ? 'No sections match your search criteria.' : 'No sections available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* View/Edit Section Modal */}
      <ViewSectionModal
        open={viewSectionModalOpen}
        onClose={handleCloseViewModal}
        section={selectedSection}
        onUpdateSection={onUpdateSection}
      />
    </>
  );
};

// Main GradeSectionTable Component
const GradeSectionTable = ({ searchTerm = '' }) => {
  const [gradeSections, setGradeSections] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All'); // New state for status filter

  const fetchGradeSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grade-sections/all');
      const data = response.data;

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
          
          // Recalculate active sections count
          gradeGroup.activeSections = gradeGroup.sections.filter(s => s.status === 'active').length;
        } else {
          acc.push({
            grade: item.gradeLevel,
            activeSections: item.status === 'active' ? 1 : 0,
            totalStudents: item.numberOfStudents,
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

      // Determine grade status - a grade is archived only if ALL sections are archived
      groupedData.forEach(gradeGroup => {
        const allSectionsArchived = gradeGroup.sections.every(section => section.status === 'archived');
        gradeGroup.status = allSectionsArchived ? 'archived' : 'active';
      });

      setGradeSections(groupedData);
      applyFilters(groupedData, searchTerm, statusFilter);
    } catch (error) {
      console.error('Error fetching grade sections:', error);
      setError(error.message || 'Failed to fetch grade sections');
    } finally {
      setLoading(false);
    }
  };

  // Updated filtering function to consider both search term and status filter
  const applyFilters = (grades, term, status) => {
    let filtered = [...grades];
    
    // Apply search term filter
    if (term) {
      const lowercaseTerm = term.toLowerCase().trim();
      
      // Find grades that match directly
      const directlyMatchingGrades = grades.filter(grade => 
        grade.grade.toLowerCase().includes(lowercaseTerm) ||
        grade.status.toLowerCase().includes(lowercaseTerm)
      );
      
      // Find grades that have sections matching the search term
      const gradesWithMatchingSections = grades.filter(grade => 
        !directlyMatchingGrades.includes(grade) && // Skip already included grades
        grade.sections.some(section => 
          section.sectionName.toLowerCase().includes(lowercaseTerm) ||
          (section.advisor && section.advisor.toLowerCase().includes(lowercaseTerm)) ||
          section.status.toLowerCase().includes(lowercaseTerm)
        )
      );
      
      // Combine both types of matches
      filtered = [...directlyMatchingGrades, ...gradesWithMatchingSections];
    }
    
    // Apply status filter
    if (status !== 'All') {
      filtered = filtered.filter(grade => grade.status === status.toLowerCase());
    }
    
    setFilteredGrades(filtered);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
    applyFilters(gradeSections, searchTerm, newStatus);
  };

  useEffect(() => {
    fetchGradeSections();
  }, []);

  // Update filtered grades when search term or status filter changes
  useEffect(() => {
    applyFilters(gradeSections, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, gradeSections]);

  const handleArchiveGrade = async (gradeLevel) => {
    try {
      // Use the new endpoint for archiving/unarchiving an entire grade level
      const response = await api.put(`/grade-sections/grade/${gradeLevel}/toggle-archive`);
      
      // Refresh the data after successful update
      fetchGradeSections();
    } catch (error) {
      console.error('Error toggling grade archive status:', error);
    }
  };

  const handleArchiveSection = async (sectionId) => {
    try {
      await api.put(`/grade-sections/${sectionId}/toggle-archive`);
      fetchGradeSections();
    } catch (error) {
      console.error('Error toggling section archive status:', error);
    }
  };

  const handleAddSection = async (sectionData) => {
    try {
      await api.post('/grade-sections/add', sectionData);
      fetchGradeSections();
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleUpdateSection = async (sectionId, updateData) => {
    try {
      await api.put(`/grade-sections/${sectionId}`, updateData);
      fetchGradeSections();
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#800000' }} />
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
    <Box sx={{ width: '100%', mb: 10 }}>
      {/* Top section with search result count and status filter */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="body2" color="text.secondary">
          {filteredGrades.length} {filteredGrades.length === 1 ? 'grade level' : 'grade levels'} found
        </Typography>
        
        {/* Status filter component */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
            Filter by status:
          </Typography>
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: '100px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }
            }}
          >
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              displayEmpty
              sx={{ height: 40 }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                },
              }}
              startAdornment={
                <FilterListIcon fontSize="small" sx={{ mr: 1, color: '#666' }} />
              }
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Active filters display */}
      {statusFilter !== 'All' && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Active filters:
          </Typography>
          <Chip 
            label={`Status: ${statusFilter}`}
            onDelete={() => setStatusFilter('All')}
            size="small"
            sx={{
              backgroundColor: statusFilter === 'active' ? '#E9F7EF' : '#FDEDEC',
              color: statusFilter === 'active' ? '#196F3D' : '#943126',
              borderRadius: '100px',
              fontWeight: 'medium',
              '& .MuiChip-deleteIcon': {
                color: statusFilter === 'active' ? '#196F3D' : '#943126',
                '&:hover': {
                  color: statusFilter === 'active' ? '#0E4023' : '#631E18',
                }
              }
            }}
          />
        </Box>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: '15px', boxShadow: 3 }}>
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
            {filteredGrades.length > 0 ? (
              filteredGrades.map((grade) => (
                <GradeRow 
                  key={grade.grade}
                  {...grade}
                  onArchiveGrade={handleArchiveGrade}
                  onArchiveSection={handleArchiveSection}
                  onAddSection={handleAddSection}
                  onUpdateSection={handleUpdateSection}
                  searchTerm={searchTerm}
                  isGradeFiltered={grade.grade.toLowerCase().includes(searchTerm.toLowerCase())}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {searchTerm || statusFilter !== 'All' ? 'No grade levels match your filter criteria.' : 'No grade levels found.'}
                </TableCell>
              </TableRow>
            )}
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