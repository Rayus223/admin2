import { message } from 'antd';

class ErrorHandler {
    static handle(error) {
        if (error.response) {
            // Server responded with an error
            switch (error.response.status) {
                case 401:
                    this.handleUnauthorized();
                    break;
                case 403:
                    message.error('Access denied. You do not have permission.');
                    break;
                case 404:
                    message.error('Resource not found.');
                    break;
                case 422:
                    this.handleValidationError(error.response.data);
                    break;
                case 500:
                    message.error('Server error. Please try again later.');
                    break;
                default:
                    message.error(error.response.data.message || 'An error occurred');
            }
        } else if (error.request) {
            // Network error
            message.error('Network error. Please check your connection.');
        } else {
            // Other errors
            message.error('An unexpected error occurred.');
        }
        
        // Log error for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('Error details:', error);
        }

        return Promise.reject(error);
    }

    static handleUnauthorized() {
        localStorage.removeItem('adminToken');
        message.error('Session expired. Please login again.');
        window.location.href = '/login';
    }

    static handleValidationError(data) {
        if (data.errors) {
            Object.values(data.errors).forEach(error => {
                message.error(error);
            });
        } else {
            message.error(data.message || 'Validation failed');
        }
    }
}

export default ErrorHandler;