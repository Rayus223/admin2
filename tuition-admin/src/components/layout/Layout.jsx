import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, theme, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    BookOutlined,
    LogoutOutlined,
    BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { admin, logout } = useAuth();

    const handleLogout = () => {
        logout();
        message.success('Logged out successfully');
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/teachers',
            icon: <BookOutlined />,
            label: 'Teachers Applications',
            children: [
                {
                    key: '/teachers/pending',
                    label: 'Pending Applications'
                },
                {
                    key: '/teachers/approved',
                    label: 'Approved Applications'
                },
                {
                    key: '/teachers/rejected',
                    label: 'Rejected Applications'
                }
            ]
        },
        {
            key: '/students',
            icon: <TeamOutlined />,
            label: 'Students',
        },
        {
            key: '/parents',
            icon: <UserOutlined />,
            label: 'Parents',
        }
    ];

    return (
        <AntLayout>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                className="site-layout-sider"
                breakpoint="lg"
                onBreakpoint={(broken) => {
                    if (broken) {
                        setCollapsed(true);
                    }
                }}
            >
                <div className="logo">
                    {collapsed ? 'TA' : 'Tuition Admin'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={['/teachers']}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <AntLayout>
                <Header className="site-layout-header"
                style={{ 
                    width: `calc(100% - ${collapsed ? '80px' : '200px'})` 
                }}
                >
                    <div className="header-left">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="trigger-button"
                        />
                    </div>
                    <div className="header-right">
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            className="notification-button"
                        />
                        <span className="admin-info">
                            <UserOutlined /> {admin?.email}
                        </span>
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </Header>
                <Content className="site-layout-content"
                style={{ 
                    marginLeft: collapsed ? '80px' : '200px'
                }}
                
                >
                    <div className="content-wrapper">
                        {children}
                    </div>
                </Content>
            </AntLayout>
        </AntLayout>
    );
};

export default Layout;