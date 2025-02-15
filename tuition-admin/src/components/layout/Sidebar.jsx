import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
   {
          key: 'teachers',
          label: 'Teachers',
          icon: <UserOutlined />,
          children: [
              {
                  key: 'pending-teachers',
                  label: 'Pending Applications',
                  path: '/admin/teachers/pending'
              },
              {
                  key: 'approved-teachers',
                  label: 'Approved Teachers',
                  path: '/admin/teachers/approved'
              },
              {
                  key: 'rejected-teachers',
                  label: 'Rejected Applications',
                  path: '/admin/teachers/rejected'
              }
          ]
            },
    {
      key: 'students',
      icon: <TeamOutlined />,
      label: <Link to="/students">Students</Link>,
    },
    {
      key: 'parents',
      icon: <UserOutlined />,
      label: <Link to="/parents">Parents</Link>,
    },
  ];

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{ minHeight: '100vh' }}
    >
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;