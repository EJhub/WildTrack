import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
  TablePagination,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Chip,
} from '@mui/material';
import AddAcademicYear from './AddAcademicYear';
import ViewAcademicYear from './ViewAcademicYear';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
// Import API utility
import api from '../../../utils/api';

const AcademicYearTable = ({ searchTerm = '' }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
    const [academicYearData, setAcademicYearData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All'); // New state for status filter
    
    // Filter data based on search term and status filter
    const filteredData = academicYearData.filter((year) => {
      // First apply search term filter
      const matchesSearch = !searchTerm || 
        `${year.startYear}-${year.endYear}`.toLowerCase().includes(searchTerm.toLowerCase().trim()) || 
        (year.status && year.status.toLowerCase().includes(searchTerm.toLowerCase().trim()));
      
      // Then apply status filter
      const matchesStatus = statusFilter === 'All' || year.status === statusFilter;
      
      // Return true only if both conditions are met
      return matchesSearch && matchesStatus;
    });
  
    useEffect(() => {
      fetchAcademicYearData();
    }, []);
    
    useEffect(() => {
      // Reset to first page when search term or status filter changes
      setPage(0);
    }, [searchTerm, statusFilter]);
  
    const fetchAcademicYearData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/academic-years/all');
        // Ensure every academic year has a status property
        const processedData = response.data.map(year => ({
          ...year,
          status: year.status || 'Active' // Default to 'Active' if status is not set
        }));
        setAcademicYearData(processedData);
      } catch (error) {
        console.error('Error fetching academic year data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    const handleOpenAddModal = () => {
      setIsAddModalOpen(true);
    };
  
    const handleCloseAddModal = () => {
      setIsAddModalOpen(false);
      fetchAcademicYearData();
    };

    const handleOpenViewModal = (year) => {
      setSelectedAcademicYear(year);
      setIsViewModalOpen(true);
    };
  
    const handleCloseViewModal = () => {
      setIsViewModalOpen(false);
      setSelectedAcademicYear(null);
      fetchAcademicYearData();
    };

    const handleArchiveAcademicYear = async (id) => {
      try {
        // Use the archive endpoint which now implements toggle functionality
        await api.put(`/academic-years/${id}/archive`);
        fetchAcademicYearData();
      } catch (error) {
        console.error('Error toggling academic year archive status:', error);
      }
    };

    // Handler for status filter change
    const handleStatusFilterChange = (event) => {
      setStatusFilter(event.target.value);
    };

    const formatQuarterDates = (year) => {
      if (!year) return 'N/A';
      
      const firstQuarterStart = year.firstQuarter?.startDate || 'N/A';
      const fourthQuarterEnd = year.fourthQuarter?.endDate || 'N/A';
      
      return `${firstQuarterStart} - ${fourthQuarterEnd}`;
    };

    return (
      <Box sx={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
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
            {filteredData.length} {filteredData.length === 1 ? 'academic year' : 'academic years'} found
          </Typography>
          
          {/* Status filter component */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
              Filter by:
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
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
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
                backgroundColor: statusFilter === 'Active' ? '#E9F7EF' : '#FDEDEC',
                color: statusFilter === 'Active' ? '#196F3D' : '#943126',
                borderRadius: '100px',
                fontWeight: 'medium',
                '& .MuiChip-deleteIcon': {
                  color: statusFilter === 'Active' ? '#196F3D' : '#943126',
                  '&:hover': {
                    color: statusFilter === 'Active' ? '#0E4023' : '#631E18',
                  }
                }
              }}
            />
          </Box>
        )}
        
        {/* Table Section */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '15px',
            boxShadow: 3,
            overflow: 'auto',
            maxHeight: 'calc(100vh - 340px)',
            position: 'relative',
          }}
        >
          {/* Loading overlay */}
          {loading && (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1,
              }}
            >
              <CircularProgress size={60} thickness={4} sx={{ color: '#800000' }} />
            </Box>
          )}
          
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                  ACADEMIC YEAR
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                  NO. OF QUARTERS
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                  QUARTER DATES
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                  STATUS
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', backgroundColor: '#FFEB3B' }}>
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {searchTerm || statusFilter !== 'All' ? 'No academic years match your filter criteria.' : 'No academic years found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((year) => (
                    <TableRow
                      key={year.id}
                      hover
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#FFF8F8' },
                        '&:hover': { backgroundColor: '#FCEAEA' },
                      }}
                    >
                      <TableCell>{`${year.startYear}-${year.endYear}`}</TableCell>
                      <TableCell>4</TableCell>
                      <TableCell>{formatQuarterDates(year)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: year.status === 'Active' ? '#90EE90' : '#FFB6C1',
                            borderRadius: '16px',
                            px: 2,
                            py: 0.5,
                            display: 'inline-block',
                          }}
                        >
                          {year.status || 'Active'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenViewModal(year)}
                          sx={{
                            color: '#800000',
                            backgroundColor: '#F5B400',
                            border: '1px solid #FFEB3B',
                            marginRight: 1,
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#FFEB3B',
                              color: '#800000',
                            },
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleArchiveAcademicYear(year.id)}
                          sx={{
                            color: '#800000',
                            backgroundColor: year.status === 'Active' ? '#F5B400' : '#90EE90',
                            border: '1px solid #FFEB3B',
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: year.status === 'Active' ? '#FFEB3B' : '#32CD32',
                              color: '#800000',
                            },
                          }}
                        >
                          {year.status === 'Active' ? 'Archive' : 'Unarchive'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            paddingTop: 2,
            marginBottom: 5
          }}
        />

        {/* Add Academic Year Modal */}
        <AddAcademicYear 
          open={isAddModalOpen} 
          onClose={handleCloseAddModal} 
        />

        {/* View/Edit Academic Year Modal */}
        {selectedAcademicYear && (
          <ViewAcademicYear 
            open={isViewModalOpen}
            onClose={handleCloseViewModal}
            academicYear={selectedAcademicYear}
          />
        )}
      </Box>
    );
};

export default AcademicYearTable;