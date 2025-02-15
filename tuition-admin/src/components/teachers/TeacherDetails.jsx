import React, { useState } from 'react';
import { Button, Card, Typography, Box, Chip, Dialog } from '@mui/material';
import { Person, Email, Phone, School, AttachMoney, Description } from '@mui/icons-material';

const TeacherDetails = ({ teacher, onStatusUpdate }) => {
    const [open, setOpen] = useState(false);

    const handleApprove = async () => {
        try {
            await onStatusUpdate(teacher._id, 'approved');
            setOpen(false);
        } catch (error) {
            console.error('Error approving teacher:', error);
            alert('Failed to approve teacher');
        }
    };

    const handleReject = async () => {
        try {
            await onStatusUpdate(teacher._id, 'rejected');
            setOpen(false);
        } catch (error) {
            console.error('Error rejecting teacher:', error);
            alert('Failed to reject teacher');
        }
    };

    return (
        <>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                View Details
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Teacher Application Details
                    </Typography>

                    <Card sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Person sx={{ mr: 1 }} />
                            <Typography variant="h6">{teacher.fullName}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Email sx={{ mr: 1 }} />
                            <Typography>{teacher.email}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Phone sx={{ mr: 1 }} />
                            <Typography>{teacher.phone}</Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <School sx={{ mr: 1 }} />
                                <Typography>Subjects:</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {teacher.subjects.map((subject, index) => (
                                    <Chip key={index} label={subject} />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AttachMoney sx={{ mr: 1 }} />
                            <Typography>Fees: Rs. {teacher.fees}</Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Description sx={{ mr: 1 }} />
                                <Typography>Documents:</Typography>
                            </Box>
                            <Button 
                                variant="outlined" 
                                href={teacher.cv} 
                                target="_blank"
                                sx={{ mr: 1 }}
                            >
                                View CV
                            </Button>
                            {teacher.certificates?.map((cert, index) => (
                                <Button 
                                    key={index}
                                    variant="outlined" 
                                    href={cert} 
                                    target="_blank"
                                    sx={{ mr: 1 }}
                                >
                                    Certificate {index + 1}
                                </Button>
                            ))}
                        </Box>

                    
                    {showActions && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                onClick={handleReject}
                            >
                                Reject
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleApprove}
                            >
                                Approve
                            </Button>
                        </Box>
                    )}
                    </Card>
                </Box>
            </Dialog>
        </>
    );
};

export default TeacherDetails;