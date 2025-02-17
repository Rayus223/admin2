import axios from 'axios';
import { message } from 'antd';
import ErrorHandler from '../utils/handlers/errorHandler';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.dearsirhometuition.com';

const api = axios.create({
  baseURL: API_BASE_URL, // Fixed typo here (removed quotes)
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response || error);
    if (error.response?.status === 401) {
      console.log('Current token:', localStorage.getItem('adminToken'));
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    try {
      const [students, parents, teachers] = await Promise.all([
        api.get('/api/student-apply/all'), // Added /api
        api.get('/api/parent-apply/all'), // Added /api
        api.get('/api/teacher-apply/all') // Added /api
      ]);

      return {
        students: students.data.length,
        parents: parents.data.length,
        teachers: {
          total: teachers.data.length,
          pending: teachers.data.filter(t => t.status === 'pending').length,
          approved: teachers.data.filter(t => t.status === 'approved').length,
          rejected: teachers.data.filter(t => t.status === 'rejected').length
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Teachers
  getAllTeachers: async () => {
    try {
      const directSignups = await api.get('/api/teacher-apply/all'); // Added /api

      const vacancies = await api.get('/api/vacancies'); // Added /api
      const applicants = new Map();

      if (Array.isArray(vacancies)) {
        vacancies.forEach(vacancy => {
          if (vacancy.applications) {
            vacancy.applications.forEach(app => {
              if (app.teacher && !applicants.has(app.teacher._id)) {
                applicants.set(app.teacher._id, {
                  _id: app.teacher._id,
                  fullName: app.teacher.fullName,
                  email: app.teacher.email,
                  phone: app.teacher.phone,
                  status: app.status,
                  cv: app.teacher.cv,
                  subjects: app.teacher.subjects || [],
                  fees: app.teacher.fees,
                  appliedAt: app.appliedAt,
                  isVacancyApplication: true
                });
              }
            });
          }
        });
      }

      const allTeachers = [
        ...(directSignups?.data || []).map(teacher => ({ ...teacher, isDirectSignup: true })),
        ...Array.from(applicants.values())
      ];

      console.log('All teachers:', allTeachers);
      return allTeachers;
    } catch (error) {
      console.error('Error fetching all teachers:', error);
      throw error;
    }
  },

  getTeacherCV: async (teacherId) => {
    const response = await api.get(`/api/teacher-apply/${teacherId}/cv`); // Added /api
    return response.data;
  },

  updateTeacherStatus: async (teacherId, status) => {
    try {
      console.log('Debug - API Service Input:', { teacherId, status });

      if (!teacherId) {
        throw new Error('Teacher ID is required');
      }

      const response = await api.put(`/api/teacher-apply/${teacherId}/status`, { status }); // Added /api
      return response;
    } catch (error) {
      console.error('Error in updateTeacherStatus:', error);
      throw error;
    }
  },

  // Students
  getAllStudents: async () => {
    try {
      const response = await api.get('/api/student-apply/all'); // Added /api
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/api/student-apply/delete/${id}`); // Added /api
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Parents
  getAllParents: async () => {
    const response = await api.get('/api/parent-apply/all'); // Added /api
    return response.data;
  },

  deleteParent: async (id) => {
    const response = await api.delete(`/api/parent-apply/delete/${id}`); // Added /api
    return response.data;
  },

  // Auth
  login: async (credentials) => {
    try {
      console.log('Login attempt with username:', credentials.username);

      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      const response = await api.post('/api/admin/login', credentials); // Added /api
      console.log('Login response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      if (!response.token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('adminToken', response.token);
      return {
        token: response.token,
        admin: response.admin
      };
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 400) {
        throw new Error('Please provide both username and password');
      } else {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Login failed. Please try again.'
        );
      }
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  },

  // Vacancies
  getAllVacancies: async () => {
    try {
      console.log('Fetching all vacancies...');
      const response = await api.get('/api/vacancies'); // Added /api
      console.log('All vacancies response:', response);
      return Array.isArray(response) ? response.map(vacancy => ({
        ...vacancy,
        featured: vacancy.featured || false
      })) : [];
    } catch (error) {
      console.error('Error fetching all vacancies:', error);
      throw error;
    }
  },

  createVacancy: async (data) => {
    try {
      const response = await api.post('/api/vacancies', { // Added /api
        title: data.title,
        subject: data.subject,
        description: data.description,
        requirements: data.requirements,
        salary: data.salary,
        status: 'open',
        featured: data.featured || false
      });
      return response;
    } catch (error) {
      console.error('Error creating vacancy:', error);
      throw error;
    }
  },

  updateVacancy: async (id, data) => {
    try {
      const response = await api.put(`/api/vacancies/${id}`, data); // Added /api
      return response;
    } catch (error) {
      console.error('Error updating vacancy:', error);
      throw error;
    }
  },

  deleteVacancy: async (id) => {
    try {
      const isConfirmed = window.confirm('Are you sure you want to delete this vacancy?');
      
      if (!isConfirmed) {
        return null;
      }
      
      const response = await api.delete(`/api/vacancies/${id}`); // Added /api
      return response;
    } catch (error) {
      console.error('Error deleting vacancy:', error);
      throw error;
    }
  },

  updateVacancyStatus: async (id, status) => {
    try {
      console.log('Sending status update:', { id, status });
      const response = await api.patch(`/api/vacancies/${id}/status`, { 
        status: status.toLowerCase() 
      }); // Added /api
      
      console.log('Status update response:', response);
      
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to update status');
      }
      
      return response;
    } catch (error) {
      console.error('Error updating vacancy status:', error);
      throw error;
    }
  },

  getVacancyApplicants: async (vacancyId) => {
    try {
      console.log('Fetching applicants for vacancy:', vacancyId);
      const response = await api.get(`/api/vacancies/${vacancyId}/applicants`); // Added /api
      console.log('Applicants response:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching vacancy applicants:', error);
      throw error;
    }
  },

  getTeachersByStatus: async (status) => {
    try {
      const response = await api.get(`/api/teacher-apply/status/${status}`); // Added /api
      console.log(`Teachers with ${status} status:`, response);
      return response;
    } catch (error) {
      console.error('Error fetching teachers by status:', error);
      throw error;
    }
  },

  updateVacancyFeatured: async (id, featured) => {
    try {
      console.log('Updating vacancy featured status:', { id, featured });
      const response = await api.put(`/api/vacancies/${id}`, { featured }); // Added /api
      return response;
    } catch (error) {
      console.error('Error updating vacancy featured status:', error);
      throw error;
    }
  },

  getFeaturedVacancies: async () => {
    try {
      console.log('Fetching featured vacancies...');
      const response = await api.get('/api/vacancies/featured'); // Added /api
      console.log('Featured vacancies response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching featured vacancies:', error);
      throw error;
    }
  },

  updateApplicationStatus: async (vacancyId, applicationId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(
        `/api/vacancies/${vacancyId}/applications/${applicationId}/status`, // Added /api
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;
