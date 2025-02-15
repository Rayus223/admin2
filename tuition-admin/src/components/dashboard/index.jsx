import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import './styles.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h1 className="dashboard-title">Dashboard Overview</h1>
            
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="Total Students"
                            value={stats?.students || 0}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="Total Parents"
                            value={stats?.parents || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="Total Teachers"
                            value={stats?.teachers.total || 0}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <h2 className="section-title">Teacher Applications</h2>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card className="stat-card status-pending">
                        <Statistic
                            title="Pending Applications"
                            value={stats?.teachers.pending || 0}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card status-approved">
                        <Statistic
                            title="Approved Teachers"
                            value={stats?.teachers.approved || 0}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card status-rejected">
                        <Statistic
                            title="Rejected Applications"
                            value={stats?.teachers.rejected || 0}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;