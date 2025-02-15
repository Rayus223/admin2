import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message, Modal } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import apiService from '../../services/api';  // Update the path according to your project structure

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/student-apply');
            const data = await response.json();
            setStudents(data.data);
        } catch (error) {
            message.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this student?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await apiService.deleteStudent(id);
                    message.success('Student deleted successfully');
                    fetchStudents();
                } catch (error) {
                    // Error handling is already managed by the API service
                }
            }
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => a.fullName.localeCompare(b.fullName)
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
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
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => {
                            setSelectedStudent(record);
                            setViewModalVisible(true);
                        }}
                    />
                    <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div className="student-list">
            <h2>Student Applications</h2>
            <Table 
                columns={columns} 
                dataSource={students}
                loading={loading}
                rowKey="_id"
            />

            <Modal
                title="Student Details"
                visible={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
            >
                {selectedStudent && (
                    <div>
                        <p><strong>Name:</strong> {selectedStudent.fullName}</p>
                        <p><strong>Date of Birth:</strong> {selectedStudent.dateOfBirth}</p>
                        <p><strong>Gender:</strong> {selectedStudent.gender}</p>
                        <p><strong>Email:</strong> {selectedStudent.email}</p>
                        <p><strong>Phone:</strong> {selectedStudent.phone}</p>
                        <p><strong>Address:</strong> {selectedStudent.address}</p>
                        <p><strong>Previous School:</strong> {selectedStudent.previousSchool}</p>
                        <p><strong>Grade:</strong> {selectedStudent.grade}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentList;