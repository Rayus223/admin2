import React from 'react';
import { Result, Button } from 'antd';
import ErrorHandler from '../../../utils/handlers/errorHandler';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            errorInfo: errorInfo
        });

        // Log error to your error reporting service
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', error, errorInfo);
        }

        ErrorHandler.handle(error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Something went wrong"
                    subTitle="Sorry, an error occurred while loading this page."
                    extra={[
                        <Button 
                            type="primary" 
                            key="console"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>,
                        <Button 
                            key="home"
                            onClick={() => window.location.href = '/'}
                        >
                            Go Home
                        </Button>
                    ]}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;