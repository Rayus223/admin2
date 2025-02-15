import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, theme, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    BookOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './styles.css';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = theme.useToken();
    const { logout } = useAuth();

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
            label: 'Teachers',
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
        },
    ];

    return (
        <AntLayout>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                className="site-layout-sider"
            >
                <div className="logo">
                    {collapsed ? 'AD' : 'ADMIN PANEL'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <AntLayout>
                <Header className="site-layout-header">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="trigger-button"
                    />
                    <div className="header-right">
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </Header>
                <Content className="site-layout-content">
                    {children}
                </Content>
            </AntLayout>
        </AntLayout>
    );
};

export default Layout;