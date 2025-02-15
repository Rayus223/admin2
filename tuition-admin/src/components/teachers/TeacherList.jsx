import React, { useState, useEffect } from 'react';
import { 
    Table, Tag, Button, Space, Modal, message, Tooltip, Tabs, Card, 
    Form, Input, Select, Row, Col, Statistic, Checkbox, Switch 
} from 'antd';
import { 
    EyeOutlined, FilePdfOutlined, CheckOutlined, CloseOutlined,
    PlusOutlined, BookOutlined, UserOutlined, DeleteOutlined,
    EditOutlined, StarFilled, StarOutlined, WhatsAppOutlined 
} from '@ant-design/icons';
import { DownloadOutlined } from '@ant-design/icons'; 
import apiService from '../../services/api';
import './styles.css';
import { useRef } from 'react';  




const { TabPane } = Tabs;

const TeacherList = () => {
    // State declarations
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [activeTab, setActiveTab] = useState('applications');
    const [modalState, setModalState] = useState({
        addVacancy: false,
        editVacancy: false,
        viewTeacher: false,
        selectedTeacher: null,
        selectedVacancy: null,
    });
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
    const [selectedVacancyApplicants, setSelectedVacancyApplicants] = useState([]);
    const [selectedVacancy, setSelectedVacancy] = useState(null);

    const [form] = Form.useForm();

    const [cvModalVisible, setCvModalVisible] = useState(false);
    const [selectedCvUrl, setSelectedCvUrl] = useState(null);

    const [pollingInterval, setPollingInterval] = useState(null); // for websocket polling
    const [ws, setWs] = useState(null);

    const [searchText, setSearchText] = useState('');
    const [highlightedRow, setHighlightedRow] = useState(null);
    const tableRef = useRef(null);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
  


  
    useEffect(() => {
        fetchData(); // Initial fetch
        
        // Start polling every 10 seconds
        const interval = setInterval(() => {
          fetchData(false); // Pass false to indicate this is a background refresh
        }, 10000);
        setPollingInterval(interval);
    
    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const action = params.get('action');

    // Set active tab if specified
    if (tab === 'vacancies') {
        setActiveTab('vacancies');
    }

    // Check for pre-filled vacancy data
    const savedData = localStorage.getItem('newVacancyData');
    if (savedData && action === 'create') {
        const vacancyData = JSON.parse(savedData);
        form.setFieldsValue(vacancyData);
        setModalState(prev => ({
            ...prev,
            addVacancy: true
        }));
        localStorage.removeItem('newVacancyData');
    }
}, [form]);

const fetchData = async (showLoadingState = true) => {
    if (showLoadingState) {
        setLoading(true);
    }
    
    try {
        // Get all vacancies
        const vacanciesData = await apiService.getAllVacancies();
        
        // Update vacancies without duplication
        setVacancies(prevVacancies => {
            // Create a map of existing status updates
            const statusUpdates = {};
            prevVacancies?.forEach(vacancy => {
                vacancy.applications?.forEach(app => {
                    if (app.status === 'approved') {
                        statusUpdates[app.teacher._id] = app.status;
                    }
                });
            });

            // Update new data with preserved status
            return vacanciesData.map(vacancy => ({
                ...vacancy,
                applications: vacancy.applications?.map(app => ({
                    ...app,
                    status: statusUpdates[app.teacher._id] || app.status
                }))
            }));
        });

        // Get teachers data
        const teachersData = await apiService.getAllTeachers();
        setTeachers(prevTeachers => {
            const statusUpdates = {};
            prevTeachers?.forEach(teacher => {
                if (teacher.status === 'approved') {
                    statusUpdates[teacher._id] = teacher.status;
                }
            });

            return teachersData.map(teacher => ({
                ...teacher,
                status: statusUpdates[teacher._id] || teacher.status
            }));
        });
        
    } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to fetch data');
    } finally {
        if (showLoadingState) {
            setLoading(false);
        }
    }
};

    // Data fetching
    useEffect(() => {
        console.log('Component mounted, fetching data...');
        fetchData();
    }, []);
    
    useEffect(() => {
        console.log('Vacancies state updated:', vacancies);
    }, [vacancies]);
   
    

 


       // Setup WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:5000');
    
    websocket.onopen = () => {
      console.log('WebSocket Connected');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setWs(null);
      }, 5000);
    };
    
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);


  // Handle WebSocket messages
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'NEW_APPLICATION':
        // Update teachers and vacancies state
        setTeachers(prev => {
          const newTeachers = [...prev];
          const teacherIndex = newTeachers.findIndex(t => t._id === message.data.teacher._id);
          if (teacherIndex === -1) {
            newTeachers.push(message.data.teacher);
          }
          return newTeachers;
        });
        
        setVacancies(prev => {
          const newVacancies = [...prev];
          const vacancyIndex = newVacancies.findIndex(v => v._id === message.data.vacancy._id);
          if (vacancyIndex !== -1) {
            newVacancies[vacancyIndex] = {
              ...newVacancies[vacancyIndex],
              applications: [...newVacancies[vacancyIndex].applications, message.data]
            };
          }
          return newVacancies;
        });
        break;
        
      case 'STATUS_UPDATE':
        // Handle status updates
        updateApplicationStatus(message.data);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const updateApplicationStatus = (data) => {
    setTeachers(prev => prev.map(teacher => 
      teacher._id === data.teacherId 
        ? { ...teacher, status: data.status }
        : teacher
    ));
    
    setVacancies(prev => prev.map(vacancy => ({
      ...vacancy,
      applications: vacancy.applications.map(app => 
        app.teacher._id === data.teacherId
          ? { ...app, status: data.status }
          : app
      )
    })));
  };




      
      // Update the status update handler
      const handleStatusUpdate = async (teacherId, status) => {
        try {
            setLoading(true);
            console.log('Starting status update for application:', { teacherId, status });

            const response = await apiService.updateTeacherStatus(teacherId, status);
            
            if (response.success) {
                message.success(`Application ${status} successfully`);
                
                // Update teachers state
                setTeachers(prevTeachers => 
                    prevTeachers.map(teacher => 
                        teacher._id === teacherId 
                            ? { ...teacher, status: status }
                            : teacher
                    )
                );
                
                // Update vacancies state
                setVacancies(prevVacancies => 
                    prevVacancies.map(vacancy => ({
                        ...vacancy,
                        applications: vacancy.applications?.map(app => 
                            app.teacher._id === teacherId
                                ? { ...app, status: status }
                                : app
                        )
                    }))
                );

                // Store the update in localStorage to persist it
                const updates = JSON.parse(localStorage.getItem('statusUpdates') || '{}');
                updates[teacherId] = status;
                localStorage.setItem('statusUpdates', JSON.stringify(updates));
                
            } else {
                throw new Error(response.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            message.error(error.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };
      
      // Update the view applicants handler
      const handleViewApplicants = async (vacancyId) => {
        try {
          setLoading(true);
          const applicants = await apiService.getVacancyApplicants(vacancyId);
          const vacancy = vacancies.find(v => v._id === vacancyId);
          
          setSelectedVacancy(vacancy);
          setSelectedVacancyApplicants(applicants);
          setApplicantsModalVisible(true);
        } catch (error) {
          console.error('Error fetching applicants:', error);
          message.error('Failed to fetch applicants');
        } finally {
          setLoading(false);
        }
      };

      const handleFeaturedToggle = async (vacancyId, featured) => {
        try {
          setLoading(true);
          await apiService.updateVacancy(vacancyId, { featured });
          
          // Update local state immediately
          setVacancies(prevVacancies => 
            prevVacancies.map(vacancy => 
              vacancy._id === vacancyId 
                ? { ...vacancy, featured } 
                : vacancy
            )
          );
          
          message.success(`Vacancy ${featured ? 'added to' : 'removed from'} featured list`);
          
          // Refresh data to ensure sync
          await fetchData(false); // Pass false to not show loading state again
        } catch (error) {
          console.error('Error updating featured status:', error);
          message.error('Failed to update featured status');
        } finally {
          setLoading(false);
        }
      };



    // Modal handlers
    const toggleModal = (modalType, data = null) => {
        setModalState(prev => ({
            ...prev,
            [modalType]: !prev[modalType],
            selectedTeacher: modalType === 'viewTeacher' ? data : prev.selectedTeacher,
            selectedVacancy: modalType === 'editVacancy' ? data : prev.selectedVacancy,
        }));
        if (!data) form.resetFields();
    };

    // Vacancy handlers
    const handleVacancySubmit = async (values) => {
        try {
            const vacancyData = {
                ...values,
                featured: values.featured || false // Set default to false if not checked
            };

            if (modalState.selectedVacancy) {
                await apiService.updateVacancy(modalState.selectedVacancy._id, vacancyData);
                message.success('Vacancy updated successfully');
            } else {
                await apiService.createVacancy(vacancyData);
                message.success('Vacancy added successfully');
            }
            
            toggleModal(modalState.selectedVacancy ? 'editVacancy' : 'addVacancy');
            console.log('About to fetch data after vacancy submission');
            await fetchData(); // Make sure this is being called
            console.log('Finished fetching data after vacancy submission');
        } catch (error) {
            console.error('Vacancy operation failed:', error);
            message.error('Operation failed: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDeleteVacancy = async (id) => {
        try {
            await apiService.deleteVacancy(id);
            message.success('Vacancy deleted successfully');
            fetchData();
        } catch (error) {
            message.error('Failed to delete vacancy');
        }
    };



    const handleViewTeacher = (teacher) => {
        setSelectedTeacher(teacher);
        setViewModalVisible(true);
    };

    // Helper function
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'orange';
            case 'approved':
                return 'green';
            case 'rejected':
                return 'red';
            default:
                return 'gray';
        }
    };

 
    

    const getFileType = (url) => {
        if (url.endsWith('.pdf')) return 'pdf';
        if (url.endsWith('.doc') || url.endsWith('.docx')) return 'doc';
        return 'unknown';
    };
    
    // Update handleViewCV function
    const handleViewCV = (cvUrl) => {
        if (cvUrl) {
            const fileType = getFileType(cvUrl);
            if (fileType === 'pdf') {
                // For PDFs - show in preview
                const previewUrl = cvUrl.replace('/raw/upload/', '/upload/');
                setSelectedCvUrl(previewUrl);
                setCvModalVisible(true);
            } else if (fileType === 'doc') {
                // For DOC/DOCX - use Google Docs Viewer
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

     const handleSearch = (value) => {
    setSearchText(value);
    
    if (value) {
      // Find all matching vacancies
      const matchedVacancyIndex = vacancies.findIndex(vacancy => 
        vacancy.title?.toLowerCase().includes(value.toLowerCase()) ||
        vacancy.subject?.toLowerCase().includes(value.toLowerCase()) ||
        vacancy.salary?.toString().includes(value)
      );

      if (matchedVacancyIndex !== -1) {
        setHighlightedRow(matchedVacancyIndex);
        
        // Calculate the page number based on the current pagination
        const pageSize = 1000; // Updated to 1000 items per page
        const pageNumber = Math.floor(matchedVacancyIndex / pageSize) + 1;
        
        // Scroll to the matched row
        setTimeout(() => {
          const rowElement = document.querySelector(`tr[data-row-key="${vacancies[matchedVacancyIndex]._id}"]`);
          if (rowElement) {
            rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        setHighlightedRow(null);
      }
    } else {
      setHighlightedRow(null);
    }
  };


  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Pagination:', pagination); // For debugging
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleVacancyStatusToggle = async (vacancyId, currentStatus) => {
    try {
        setLoading(true);
        
        // Ensure status is correct format
        const newStatus = currentStatus?.toLowerCase() === 'open' ? 'closed' : 'open';
        console.log('Attempting status update:', { vacancyId, currentStatus, newStatus });

        const response = await apiService.updateVacancyStatus(vacancyId, newStatus);
        
        if (response.success) {
            message.success(`Vacancy status updated to ${newStatus}`);
            
            // Update local state
            setVacancies(prev => 
                prev.map(v => 
                    v._id === vacancyId 
                        ? { ...v, status: newStatus }
                        : v
                )
            );
        }
    } catch (error) {
        console.error('Failed to update vacancy status:', error);
        message.error('Failed to update vacancy status');
    } finally {
        setLoading(false);
    }
};


const handleApplicationStatus = async (applicationId, status) => {
    try {
        setLoading(true);
        
        // Find the vacancy that contains this application
        const vacancy = vacancies.find(v => 
            v.applications?.some(app => app._id === applicationId)
        );

        if (!vacancy) {
            throw new Error('Vacancy not found for this application');
        }

        const response = await apiService.updateApplicationStatus(
            vacancy._id,  // vacancy ID
            applicationId, // application ID
            status
        );
        
        if (response.success) {
            message.success(`Application ${status} successfully`);
            
            // Update local states
            setSelectedVacancyApplicants(prevApplicants => 
                prevApplicants.map(app => ({
                    ...app,
                    status: app._id === applicationId ? status : app.status
                }))
            );

            // Update vacancies state to reflect the change
            setVacancies(prevVacancies => 
                prevVacancies.map(v => ({
                    ...v,
                    applications: v.applications?.map(app => ({
                        ...app,
                        status: app._id === applicationId ? status : app.status
                    }))
                }))
            );

            // If application is accepted, update the vacancy status to closed
            if (status === 'accepted') {
                const vacancyWithApplication = vacancies.find(v => 
                    v.applications?.some(app => app._id === applicationId)
                );
                
                if (vacancyWithApplication) {
                    await apiService.updateVacancyStatus(vacancyWithApplication._id, 'closed');
                }
            }

            // Refresh data
            await fetchData(false);
        }
    } catch (error) {
        console.error('Failed to update status:', error);
        if (error.response?.status === 401) {
            message.error('Session expired. Please login again.');
            // Optionally redirect to login page
            // window.location.href = '/login';
        } else {
            message.error(error.message || 'Failed to update status');
        }
    } finally {
        setLoading(false);
    }
};    



    const teacherColumns = [
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
            key: 'phone',
            render: (phone) => {
                const whatsappLink = `https://wa.me/${phone.replace(/\D/g, '')}`;  // Remove non-digits
                return (
                    <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            color: '#25D366',  // WhatsApp green color
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <WhatsAppOutlined />  {/* Add WhatsApp icon */}
                        {phone}
                    </a>
                );
            }
        },
        {
            title: 'Subjects',
            dataIndex: 'subjects',
            key: 'subjects',
            render: (subjects) => (
                <>
                    {subjects?.map(subject => (
                        <Tag key={subject} color="blue">
                            {subject}
                        </Tag>
                    )) || 'N/A'}
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {(status || 'PENDING').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                // Only show actions if status is pending
                if (record.status && record.status.toLowerCase() !== 'pending') {
                    return (
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
                            <Tag color={getStatusColor(record.status)}>
                                {record.status.toUpperCase()}
                            </Tag>
                        </Space>
                    );
                }

                return (
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
                        <Tooltip title="Approve">
                            <Button 
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => {
                                
                                    // Check if record and teacher exist before accessing _id
                                    const teacherId = record?.teacher?._id || record?._id;
                                    if (!teacherId) {
                                        message.error('Invalid teacher data');
                                        return;
                                    }
                                    handleStatusUpdate(teacherId, 'approved');
                                }}
                            />
                        </Tooltip>
                        <Tooltip title="Reject">
                            <Button 
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => {
                                    
                                    // Check if record and teacher exist before accessing _id
                                    const teacherId = record?.teacher?._id || record?._id;
                                    if (!teacherId) {
                                        message.error('Invalid teacher data');
                                        return;
                                    }
                                    handleStatusUpdate(teacherId, 'rejected');
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        }
    ];

    const vacancyColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
             render: (text, record, index) => {
        const isHighlighted = index === highlightedRow;
        return (
          <span style={{
            backgroundColor: isHighlighted ? '#ffd54f' : 'transparent',
            padding: isHighlighted ? '2px 4px' : '0',
            borderRadius: '4px'
          }}>
            {text}
          </span>
        );
      }
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (subject) => (
                <Tag color="blue">{subject.toUpperCase()}</Tag>
            )
        },
        {
            title: 'Salary',
            dataIndex: 'salary',
            key: 'salary',
        },
        {
            title: 'Applications',
            dataIndex: 'applications',
            key: 'applications',
            render: (applications, record) => (
                <Button 
                    type="link" 
                    onClick={() => handleViewApplicants(record._id)}
                    disabled={!applications?.length}
                >
                    {applications?.length || 0} teachers
                </Button>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Tag 
                    color={status === 'open' ? 'green' : 'red'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleVacancyStatusToggle(record._id, status)}
                >
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Featured',
            dataIndex: 'featured',
            key: 'featured',
            width: 100,
            render: (_, record) => (
                <Switch
                    checked={record.featured}
                    onChange={(checked) => handleFeaturedToggle(record._id, checked)}
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button 
                            icon={<EditOutlined />} 
                            onClick={() => toggleModal('editVacancy', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteVacancy(record._id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

// Update the applicantColumns definition
const applicantColumns = [
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
        render: (phone) => {
            const whatsappLink = `https://wa.me/${phone.replace(/\D/g, '')}`;  // Remove non-digits
            return (
                <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                        color: '#25D366',  // WhatsApp green color
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <WhatsAppOutlined />
                    {phone}
                </a>
            );
        }
    },
    {
        title: 'Location',
        key: 'location',
        render: (record) => {
            const address = record.address;
            if (!address) return 'N/A';
            
            const parts = address.split(',');
            const shortAddress = parts.slice(0, 2)
                .map(part => part.trim())
                .join(', ');
            
            return shortAddress;
        }
    },
   
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
            <Tag color={getStatusColor(status)}>
                {(status || 'PENDING').toUpperCase()}
            </Tag>
        )
    },
    {
        title: 'Subjects',
        dataIndex: 'subjects',
        key: 'subjects',
        render: (subjects) => subjects?.join(', ') || 'N/A',
    },
    
  // In the applicantColumns, replace the Actions column with this:
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => {
        // Get the application ID from the record
        const applicationId = record._id;
        
        // Don't show action buttons if already processed
        if (record.status && ['approved', 'accepted', 'rejected'].includes(record.status.toLowerCase())) {
            return (
                <Space size="middle">
                    <Tooltip title="View CV">
                        <Button 
                            icon={<FilePdfOutlined />}
                            onClick={() => handleViewCV(record.cv)}
                        />
                    </Tooltip>
                    <Tag color={['approved', 'accepted'].includes(record.status.toLowerCase()) ? 'green' : 'red'}>
                        {record.status.toUpperCase()}
                    </Tag>
                </Space>
            );
        }


        return (
            <Space size="middle">
                <Tooltip title="View CV">
                    <Button 
                        icon={<FilePdfOutlined />}
                        onClick={() => handleViewCV(record.cv)}
                    />
                </Tooltip>
                <Tooltip title="Accept">
                    <Button 
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleApplicationStatus(applicationId, 'accepted')}
                    />
                </Tooltip>
                <Tooltip title="Reject">
                    <Button 
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleApplicationStatus(applicationId, 'rejected')}
                    />
                </Tooltip>
            </Space>
        );
    }
}
];

    // Render methods

     const renderVacancyForm = () => (
        <Form
            form={form}
            onFinish={handleVacancySubmit}
            initialValues={modalState.selectedVacancy || { featured: false }}
            layout="vertical"
        >
            <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter title' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please select subject' }]}
            >
                <Select>
                    <Select.Option value="mathematics">Mathematics</Select.Option>
                    <Select.Option value="science">Science</Select.Option>
                    <Select.Option value="english">English</Select.Option>
                    <Select.Option value="physics">Physics</Select.Option>
                    <Select.Option value="chemistry">Chemistry</Select.Option>
                    <Select.Option value="computer">Computer</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
                name="requirements"
                label="Requirements"
                rules={[{ required: true, message: 'Please enter requirements' }]}
            >
                <Select mode="tags" placeholder="Add requirements">
                    <Select.Option value="degree">Bachelor's Degree</Select.Option>
                    <Select.Option value="experience">3+ Years Experience</Select.Option>
                    <Select.Option value="certification">Teaching Certification</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="salary"
                label="Salary"
                rules={[{ required: true, message: 'Please enter salary' }]}
            >
                <Input placeholder="e.g., Rs. 30,000 - 40,000" />
            </Form.Item>

            <Form.Item
                name="featured"
                valuePropName="checked"
            >
                <Checkbox>Show in Homepage</Checkbox>
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {modalState.selectedVacancy ? 'Update' : 'Add'} Vacancy
                    </Button>
                    <Button onClick={() => toggleModal(modalState.selectedVacancy ? 'editVacancy' : 'addVacancy')}>
                        Cancel
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );


    const items = [
        {
            key: 'applications',
            label: <span><UserOutlined />Applications</span>,
            children: (
                <>
                    <Card className="stats-card">
                        <Row gutter={[24, 24]} className="stats-row">
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Total Applications" 
                                    value={teachers.length} 
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Pending" 
                                    value={teachers.filter(t => t.status === 'pending').length}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Approved" 
                                    value={teachers.filter(t => t.status === 'approved').length}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Table 
                        columns={teacherColumns} 
                        dataSource={teachers}
                        loading={loading}
                        rowKey="_id"
                        className="main-table"
                        onChange={handleTableChange}
                        pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        position: ['bottomRight']
                        }}
                    />
                </>
            )
        },
        {
            key: 'vacancies',
            label: <span><BookOutlined />Vacancies</span>,
            children: (
                <div className="vacancy-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
     
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => toggleModal('addVacancy')}
                        className="action-button"
                        size="large"
                    >
                        Add Vacancy
                    </Button>
                    <Input.Search
          placeholder="Search vacancies..."
          allowClear
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          size="large"
        />
      </div>
                <Table 
                        ref={tableRef}
                        columns={vacancyColumns} 
                        dataSource={vacancies}
                        loading={loading}
                        rowKey="_id"
                        className="main-table"
                        rowClassName={(record, index) => index === highlightedRow ? 'highlighted-row' : ''}
                        onChange={handleTableChange}
                        pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        position: ['bottomRight']
                        }}
                    />
                    
                </div>
            )
        }
    ];

    


    return (
        <div className="teacher-list">
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={items}
            />
                <TabPane 
                    tab={<span><UserOutlined />Applications</span>} 
                    key="applications"
                >
                    <Card className="stats-card">
                        <Row gutter={[24, 24]} className="stats-row">
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Total Applications" 
                                    value={teachers.length} 
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Pending" 
                                    value={teachers.filter(t => t.status === 'pending').length}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Approved" 
                                    value={teachers.filter(t => t.status === 'approved').length}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                    
                    <Table 
                        columns={teacherColumns} 
                        dataSource={teachers}
                        loading={loading}
                        rowKey="_id"
                        className="main-table"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} items`
                        }}
                    />
                </TabPane>
                
                <TabPane 
                    tab={<span><BookOutlined />Vacancies</span>} 
                    key="vacancies"
                >
                    <div className="vacancy-section">
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => toggleModal('addVacancy')}
                            className="action-button"
                            size="large"
                        >
                            Add Vacancy
                        </Button>
                        <Input.Search
                            placeholder="Search vacancies..."
                            allowClear
                            onSearch={handleSearch}  // This will only trigger on search icon click or Enter
                            style={{ width: 300 }}
                            size="large"
                            enterButton  // This makes the search icon more prominent
                            />
                        
                                    
                        <Table 
                        ref={tableRef}
                        columns={vacancyColumns} 
                        dataSource={vacancies}
                        loading={loading}
                        rowKey="_id"
                        className="main-table"
                        rowClassName={(record, index) => index === highlightedRow ? 'highlighted-row' : ''}
                        onChange={handleTableChange}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            position: ['bottomRight']
                        }}
                        />

                    </div>
                </TabPane>
            

            

            {/* Modals */}
            <Modal
                title={modalState.selectedVacancy ? "Edit Vacancy" : "Add New Vacancy"}
                open={modalState.addVacancy || modalState.editVacancy}
                onCancel={() => toggleModal(modalState.selectedVacancy ? 'editVacancy' : 'addVacancy')}
                footer={null}
            >
                {renderVacancyForm()}
            </Modal>

            <Modal
                title="Vacancy Applicants"
                open={applicantsModalVisible}
                onCancel={() => {
                    setApplicantsModalVisible(false);
                    setSelectedVacancy(null);
                    setSelectedVacancyApplicants([]);
                }}
                footer={null}
                width={1200}
                style={{
                    top: 20
                }}
            >
                <Table
                    columns={applicantColumns}
                    dataSource={selectedVacancyApplicants}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                />
            </Modal>
                
  


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
                            <Tag color={getStatusColor(selectedTeacher.status)}>
                                {selectedTeacher.status.toUpperCase()}
                            </Tag>
                        </div>
                        <div className="detail-row">
                            <strong>Documents:</strong>
                            <Button 
                                icon={<FilePdfOutlined />}
                                onClick={() => window.open(selectedTeacher.cv, '_blank')}
                            >
                                View CV
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};



export default TeacherList;