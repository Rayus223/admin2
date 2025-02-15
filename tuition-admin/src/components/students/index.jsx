import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import './styles.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await api.getAllStudents();
            setStudents(data);
        } catch (error) {
            message.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (studentId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this student?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.deleteStudent(studentId);
                    message.success('Student deleted successfully');
                    fetchStudents();
                } catch (error) {
                    message.error('Failed to delete student');
                }
            }
        });
    };

    const handleViewStudent = (student) => {
        setSelectedStudent(student);
        setViewModalVisible(true);
    };

    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => a.fullName.localeCompare(b.fullName)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (grade) => <Tag color="blue">{grade}</Tag>
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender) => (
                <Tag color={gender === 'male' ? 'blue' : 'pink'}>
                    {gender.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewStudent(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record._id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="student-list">
            <h1>Student Applications</h1>
            
            <Table 
                columns={columns} 
                dataSource={students}
                loading={loading}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Total ${total} students`
                }}
            />

            <Modal
                title="Student Details"
                visible={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedStudent && (
                    <div className="student-details">
                        <div className="detail-row">
                            <strong>Full Name:</strong> {selectedStudent.fullName}
                        </div>
                        <div className="detail-row">
                            <strong>Email:</strong> {selectedStudent.email}
                        </div>
                        <div className="detail-row">
                            <strong>Phone:</strong> {selectedStudent.phone}
                        </div>
                        <div className="detail-row">
                            <strong>Grade:</strong> {selectedStudent.grade}
                        </div>
                        <div className="detail-row">
                            <strong>Gender:</strong> {selectedStudent.gender}
                        </div>
                        <div className="detail-row">
                            <strong>Address:</strong> {selectedStudent.address}
                        </div>
                        <div className="detail-row">
                            <strong>Previous School:</strong> {selectedStudent.previousSchool}
                        </div>
                        <div className="detail-row">
                            <strong>Date of Birth:</strong> 
                            {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentList;