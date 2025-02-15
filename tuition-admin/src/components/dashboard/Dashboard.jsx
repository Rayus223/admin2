import React from 'react';
import { Card, Row, Col, Statistic, Tabs } from 'antd';
import { UserOutlined, BookOutlined } from '@ant-design/icons';
import TeacherList from '../teachers/TeacherList';
import './styles.css';

const { TabPane } = Tabs;



const Dashboard = () => {
    return (
        <div className="dashboard">
            {/* Overview Section */}
            <div className="overview-section">
                <h2 className="section-title">Overview</h2>
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Total Students</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Total Parents</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Total Teachers</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Section */}
            <div className="applications-section">
                <h2 className="section-title">Teacher Applications</h2>
                <div className="stats-container">
                    <div className="stat-card status-pending">
                        <div className="stat-content">
                            <span className="stat-label">Pending Applications</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card status-approved">
                        <div className="stat-content">
                            <span className="stat-label">Approved Teachers</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card status-rejected">
                        <div className="stat-content">
                            <span className="stat-label">Rejected Applications</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                </div>
            </div>
            <TeacherList />
        </div>
    );
};

export default Dashboard;