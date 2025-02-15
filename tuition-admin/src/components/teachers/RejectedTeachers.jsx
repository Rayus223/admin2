import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Tooltip, message, Modal } from 'antd';
import { EyeOutlined, FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import apiService from '../../services/api';
import { useRef } from 'react';

const RejectedTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [cvModalVisible, setCvModalVisible] = useState(false);
  const [selectedCvUrl, setSelectedCvUrl] = useState(null);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchRejectedTeachers();
  }, []);

  const fetchRejectedTeachers = async () => {
    try {
      console.log('Fetching rejected teachers...');
      const response = await apiService.getTeachersByStatus('rejected');
      console.log('Response:', response);
      
      if (response && response.data) {
        console.log('Setting teachers:', response.data);
        setTeachers(response.data);
      } else {
        console.warn('No data in response:', response);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching rejected teachers:', error);
      message.error('Failed to fetch rejected teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setViewModalVisible(true);
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

  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Table change:', pagination);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: 'Name',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => (
        <Tag color="red">REJECTED</Tag>
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
              onClick={() => handleViewCV(record.cv)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="rejected-teachers">
      <h2>Rejected Teachers</h2>
      <Table 
        ref={tableRef}
        columns={columns}
        dataSource={teachers}
        loading={loading}
        rowKey="_id"
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          pageSizeOptions: ['10', '20', '50', '100', '1000'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          position: ['bottomRight']
        }}
      />

      {/* Teacher Details Modal */}
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
              <strong>Status:</strong>
              <Tag color="red">REJECTED</Tag>
            </div>
            <div className="detail-row">
              <strong>Documents:</strong>
              <Button 
                icon={<FilePdfOutlined />}
                onClick={() => handleViewCV(selectedTeacher.cv)}
              >
                View CV
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CV Preview Modal */}
      <Modal
        title="CV Preview"
        open={cvModalVisible}
        onCancel={() => {
          setCvModalVisible(false);
          setSelectedCvUrl(null);
        }}
        footer={null}
        width={800}
        className="cv-modal"
      >
        {selectedCvUrl && (
          <div style={{ height: '600px', width: '100%' }}>
            <div className="cv-modal-header">
              <Space>
                <Button 
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadCV(selectedCvUrl)}
                >
                  Download
                </Button>
                <Button 
                  onClick={() => {
                    setCvModalVisible(false);
                    setSelectedCvUrl(null);
                  }}
                >
                  Close
                </Button>
              </Space>
            </div>
            <iframe
              src={selectedCvUrl}
              style={{ 
                width: '100%', 
                height: 'calc(100% - 50px)', 
                border: 'none' 
              }}
              title="CV Preview"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RejectedTeachers;