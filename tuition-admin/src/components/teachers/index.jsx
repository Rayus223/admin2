import React, { useState, useEffect} from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import TeacherDetails from './TeacherDetails';
import { api } from '../../services/api';

import { 
    Chip, 
    IconButton
}from '@mui/material';
 
import { 
    Description as DescriptionIcon,
    FileCopy as FileCopyIcon 
 }
  from '@mui/icons-material';

const TeacherApplications = () => {

    const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

   

    const fetchApplications = async () => {
        try {        setLoading(true);
           console.log('Fetching applications for status:', activeTab);
           const response = await api.get(`/admin/teachers?status=${activeTab}`);
           console.log('API Response:', response);
           
           if (response?.data?.teachers) {
               console.log('Setting applications:', response.data.teachers);
               setApplications(response.data.teachers);
           } else {
               console.warn('Invalid response format:', response);
               setApplications([]);
           }
       } catch (error) {
           console.error('Error fetching applications:', error);
           if (error.response) {
               console.error('Error response:', {
                   data: error.response.data,
                   status: error.response.status,
                   headers: error.response.headers,
               });
           }
           setApplications([]);
       } finally {
           setLoading(false);
       }
    
    };

    const handleStatusUpdate = async (teacherId, status) => {
        try {
            await api.put(`/admin/teacher/${teacherId}/status`, { status });
            fetchApplications(); // Refresh the list
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    };
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    useEffect(() => {
        fetchApplications();
    }, [activeTab]);

   const renderApplications = () => (
       <TableContainer component={Paper}>
           <Table>
               <TableHead>
                   <TableRow>
                       <TableCell>Name</TableCell>
                       <TableCell>Email</TableCell>
                       <TableCell>Phone</TableCell>
                       <TableCell>Subjects</TableCell>
                       <TableCell>Fees</TableCell>
                       <TableCell>Status</TableCell>
                       <TableCell>CV</TableCell>
                       <TableCell>Certificates</TableCell>
                       <TableCell>Applied On</TableCell>
                       <TableCell>Actions</TableCell>
                   </TableRow>
               </TableHead>
                <TableBody>
                {applications.length > 0 ? (
                   applications.map((teacher) => (
                       <TableRow key={teacher._id}>
                           <TableCell>{teacher.fullName}</TableCell>
                           <TableCell>{teacher.email}</TableCell>
                           <TableCell>{teacher.phone}</TableCell>
                           <TableCell>
                               {teacher.subjects?.map((subject, index) => (
                                   <Chip 
                                       key={index} 
                                       label={subject} 
                                       size="small" 
                                       sx={{ m: 0.5 }} 
                                   />
                               ))}
                           </TableCell>
                           <TableCell>₹{teacher.fees}</TableCell>
                           <TableCell>
                           <Chip 
                                   label={teacher.status} 
                                   color={
                                       teacher.status === 'approved' ? 'success' : 
                                       teacher.status === 'rejected' ? 'error' : 
                                       'warning'
                                   }
                                   size="small"
                               />
                           </TableCell>
                           <TableCell>
                               <IconButton 
                                   href={teacher.cv} 
                                   target="_blank"
                                   size="small"
                                   color="primary"
                               >
                                   <DescriptionIcon />
                               </IconButton>
                           </TableCell>
                           <TableCell>
                           {teacher.certificates?.map((cert, index) => (
                                   <IconButton
                                       key={index}
                                       href={cert}
                                       target="_blank"
                                       size="small"
                                       color="primary"
                                       sx={{ mr: 1 }}
                                   >
                                       <FileCopyIcon />
                                   </IconButton>
                               ))}
                           </TableCell>
                           <TableCell>
                               {new Date(teacher.createdAt).toLocaleDateString()}
                           </TableCell>
                           <TableCell>
                               <TeacherDetails 
                                   teacher={teacher}
                                   onStatusUpdate={handleStatusUpdate}
                                   showActions={activeTab === 'pending'}
                               />
                           </TableCell>
                       </TableRow>
                        
                    ))
                 ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                No {activeTab} applications found
                            </TableCell>
                        </TableRow>
                    )}
                    
                </TableBody>
            </Table>
        </TableContainer>
    );

    const tabContent = {
        pending: {
            title: 'Pending Applications',
            description: 'Review new teacher applications'
        },
        approved: {
            title: 'Approved Applications',
            description: 'View approved teacher applications'
        },
        rejected: {
            title: 'Rejected Applications',
            description: 'View rejected teacher applications'
        }
    };

    return (
        <Box sx={{ p: 3 }}>
           <Tabs
               value={activeTab}
               onChange={handleTabChange}
               sx={{ mb: 3 }}
           >
               <Tab value="pending" label="Pending Applications" />
               <Tab value="approved" label="Approved Applications" />
               <Tab value="rejected" label="Rejected Applications" />
           </Tabs>
            <Typography variant="h5" gutterBottom>
               {tabContent[activeTab].title}
           </Typography>
           <Typography variant="body2" color="text.secondary" gutterBottom>
               {tabContent[activeTab].description}
           </Typography>
           
           {loading ? (
               <Typography>Loading...</Typography>
           ) : (
               renderApplications()
           )}
        </Box>
    );
};

export default TeacherApplications;