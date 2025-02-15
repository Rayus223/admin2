import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        try {
            const token = localStorage.getItem('adminToken');
            console.log('Checking auth - token:', token);
            
            if (token) {
                const adminData = localStorage.getItem('adminData');
                console.log('Admin data from storage:', adminData);
                
                if (adminData) {
                    const parsedData = JSON.parse(adminData);
                    console.log('Parsed admin data:', parsedData);
                    setAdmin(parsedData);
                }
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            console.log('Login attempt with:', credentials.username);
            const response = await api.login(credentials);
            console.log('Login response:', response);
            
            if (!response || !response.token) {
                throw new Error('Invalid response from server');
            }

            // Store auth data
            localStorage.setItem('adminToken', response.token);
            localStorage.setItem('adminData', JSON.stringify(response.admin));
            
            // Update state
            setAdmin(response.admin);
            
            console.log('Login successful - Token stored:', response.token);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            // Clear any partial data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            setAdmin(null);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setAdmin(null);
    };

    const value = {
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};