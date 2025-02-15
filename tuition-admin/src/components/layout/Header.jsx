import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Badge, Dropdown, List, Typography, notification } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ws, setWs] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:5000');
    
    websocket.onopen = () => {
      console.log('Header WebSocket Connected');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleNewNotification(message);
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

  const handleNewNotification = (message) => {
    switch (message.type) {
      case 'NEW_APPLICATION':
        const newNotification = {
          id: Date.now(),
          title: 'New Teacher Application',
          message: `${message.data.teacher.fullName} applied for ${message.data.vacancy.title}`,
          timestamp: new Date(),
          read: false,
          type: 'application'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show popup notification
        notification.info({
          message: 'New Application',
          description: newNotification.message,
          placement: 'topRight'
        });
        break;
        
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const notificationItems = (
    <List
      className="notification-list"
      itemLayout="horizontal"
      dataSource={notifications}
      style={{ 
        width: 350, 
        maxHeight: 400, 
        overflow: 'auto',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
      header={
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>Notifications</Text>
            {unreadCount > 0 && (
              <Button type="link" size="small" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Space>
        </div>
      }
      renderItem={item => (
        <List.Item
          className={`notification-item ${!item.read ? 'unread' : ''}`}
          style={{ 
            padding: '12px 24px',
            cursor: 'pointer',
            backgroundColor: item.read ? 'white' : '#f0f7ff',
            transition: 'background-color 0.3s'
          }}
          onClick={() => markAsRead(item.id)}
        >
          <List.Item.Meta
            avatar={
              item.type === 'application' ? 
                <UserOutlined style={{ color: '#1890ff' }} /> : 
                <BellOutlined />
            }
            title={item.title}
            description={
              <Space direction="vertical" size={0}>
                <Text>{item.message}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <AntHeader style={{ padding: '0 24px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
        <Space size="large">
          <Dropdown 
            overlay={notificationItems} 
            trigger={['click']}
            placement="bottomRight"
          >
            <Badge count={unreadCount} offset={[-2, 2]}>
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: '20px' }} />}
                style={{ padding: '4px 8px' }}
              />
            </Badge>
          </Dropdown>
          <span>
            <UserOutlined /> Admin
          </span>
          <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;