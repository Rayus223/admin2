import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import './styles.css';

const ParentList = () => {
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            const data = await api.getAllParents();
            setParents(data);
        } catch (error) {
            message.error('Failed to fetch parents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (parentId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this application?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.deleteParent(parentId);
                    message.success('Parent application deleted successfully');
                    fetchParents();
                } catch (error) {
                    message.error('Failed to delete parent application');
                }
            }
        });
    };

    const handleViewParent = (parent) => {
        setSelectedParent(parent);
        setViewModalVisible(true);
    };

    const columns = [
        {
            title: 'Parent Name',
            dataIndex: 'parentName',
            key: 'parentName',
            sorter: (a, b) => a.parentName.localeCompare(b.parentName)
        },
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName'
        },
        {
            title: 'Relationship',
            dataIndex: 'relationship',
            key: 'relationship',
            render: (relationship) => (
                <Tag color="blue">{relationship}</Tag>
            )
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
            title: 'Student Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (grade) => <Tag color="green">{grade}</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewParent(record)}
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
        <div className="parent-list">
            <h1>Parent Applications</h1>
            
            <Table 
                columns={columns} 
                dataSource={parents}
                loading={loading}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Total ${total} applications`
                }}
            />

            <Modal
                title="Parent Application Details"
                visible={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedParent && (
                    <div className="parent-details">
                        <div className="detail-row">
                            <strong>Parent Name:</strong> {selectedParent.parentName}
                        </div>
                        <div className="detail-row">
                            <strong>Student Name:</strong> {selectedParent.studentName}
                        </div>
                        <div className="detail-row">
                            <strong>Relationship:</strong> {selectedParent.relationship}
                        </div>
                        <div className="detail-row">
                            <strong>Email:</strong> {selectedParent.email}
                        </div>
                        <div className="detail-row">
                            <strong>Phone:</strong> {selectedParent.phone}
                        </div>
                        <div className="detail-row">
                            <strong>Address:</strong> {selectedParent.address}
                        </div>
                        <div className="detail-row">
                            <strong>Student Grade:</strong> {selectedParent.grade}
                        </div>
                        <div className="detail-row">
                            <strong>Submission Date:</strong> 
                            {new Date(selectedParent.submissionDate).toLocaleDateString()}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ParentList;