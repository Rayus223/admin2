import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProtectedRoutes from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import TeacherList from './components/teachers/TeacherList'; // Add this import
import StudentList from './components/students/StudentList'; // Add this import
import ParentList from './components/parents/ParentList';   // Add this import
import LoadingHandler from './utils/handlers/loadingHandler'; // Add this import
import PendingTeachers from './components/teachers/PendingTeacher';
import ApprovedTeachers from './components/teachers/ApprovedTeacher';
import RejectedTeachers from './components/teachers/RejectedTeachers'; // Add this import






// Reset loading state when route changes

const handleRouteChange = () => {
    LoadingHandler.reset();
};  
function App() {
    return (
    <ErrorBoundary>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/teachers/pending" element={<PendingTeachers />} />
                                        <Route path="/teachers/approved" element={<ApprovedTeachers />} />
                                        <Route path="/teachers/rejected" element={<RejectedTeachers />} />
                                        
                                        <Route path="/teachers" element={<TeacherList />} />
                                        <Route path="/students" element={<StudentList />} />
                                        <Route path="/parents" element={<ParentList />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </ErrorBoundary>
    );
}

export default App;