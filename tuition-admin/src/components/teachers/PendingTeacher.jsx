import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Tooltip, message, Modal } from 'antd';
import { EyeOutlined, FilePdfOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import apiService from '../../services/api';
import { useRef } from 'react';

const PendingTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [cvModalVisible, setCvModalVisible] = useState(false);
  const [selectedCvUrl, setSelectedCvUrl] = useState(null);
  

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      const response = await apiService.getTeachersByStatus('pending');
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
      message.error('Failed to fetch pending teachers');
    } finally {
      setLoading(false);
    }
  };

  // Add this function
  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setViewModalVisible(true);
  };

  const handleStatusUpdate = async (teacherId, newStatus) => {
    try {
      await apiService.updateTeacherStatus(teacherId, newStatus);
      message.success(`Teacher ${newStatus} successfully`);
      
      // After updating status, teacher will automatically move to respective component
      // because each component fetches teachers based on their status
      fetchPendingTeachers();
      
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  const getFileType = (url) => {
    if (url.endsWith('.pdf')) return 'pdf';
    if (url.endsWith('.doc') || url.endsWith('.docx')) return 'doc';
    return 'unknown';
  };

  const handleViewCV = (cvUrl) => {
    if (cvUrl) {
      const fileType = getFileType(cvUrl);
      if (fileType === 'pdf') {
        const previewUrl = cvUrl.replace('/raw/upload/', '/upload/');
        setSelectedCvUrl(previewUrl);
        setCvModalVisible(true);
      } else if (fileType === 'doc') {
        const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(cvUrl)}&embedded=true`;
        setSelectedCvUrl(googleDocsUrl);
        setCvModalVisible(true);
      } else {
        message.warning('File type not supported for preview. Downloading instead...');
        handleDownloadCV(cvUrl);
      }
    } else {
      message.error('CV not available');
    }
  };

  const handleDownloadCV = (cvUrl) => {
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    } else {
      message.error('CV not available');
    }
  };

  

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Subjects',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects) => (
        <>
          {subjects.map(subject => (
            <Tag key={subject} color="blue">
              {subject}
            </Tag>
          ))}
        </>
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
              onClick={() => handleViewTeacher(record)}
            />
          </Tooltip>
          <Tooltip title="View CV">
            <Button 
              icon={<FilePdfOutlined />}
              onClick={() => window.open(record.cv, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button 
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'approved')}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button 
              danger
              icon={<CloseOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'rejected')}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="pending-teachers">
      <h2>Pending Teacher Registrations</h2>
      <Table 
        columns={columns}
        dataSource={teachers}
        loading={loading}
        rowKey="_id"
      />

      {/* View Teacher Details Modal */}
      <Modal
        title="Teacher Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTeacher && (
          <div className="teacher-details">
            <h2>{selectedTeacher.fullName}</h2>
            <div className="detail-row">
              <strong>Email:</strong> {selectedTeacher.email}
            </div>
            <div className="detail-row">
              <strong>Phone:</strong> {selectedTeacher.phone}
            </div>
            <div className="detail-row">
              <strong>Subjects:</strong>
              {selectedTeacher.subjects.map(subject => (
                <Tag key={subject} color="blue">{subject}</Tag>
              ))}
            </div>
            <div className="detail-row">
              <strong>Documents:</strong>
              <Space>
                <Button 
                  icon={<FilePdfOutlined />}
                  onClick={() => window.open(selectedTeacher.cv, '_blank')}
                >
                  View CV
                </Button>
                {selectedTeacher.certificates && selectedTeacher.certificates.map((cert, index) => (
                  <Button 
                    key={index}
                    icon={<FilePdfOutlined />}
                    onClick={() => window.open(cert, '_blank')}
                  >
                    Certificate {index + 1}
                  </Button>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingTeachers;