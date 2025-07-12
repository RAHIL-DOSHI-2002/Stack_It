import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading while authentication is being checked
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Check authentication via context first
    if (!isAuthenticated) {
        // Also check localStorage as fallback
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
            // Redirect to login with the current location
            return <Navigate to="/login" state={{ from: location.pathname }} replace />;
        }
    }

    // If authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
