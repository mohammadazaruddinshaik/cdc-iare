import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A wrapper component for protecting routes based on user authentication and role.
 *
 * @param {string} requiredRole - The role required to access the route ('student', 'faculty', or 'admin').
 * @param {React.ReactNode} children - The component to render if the user is authorized.
 */
const ProtectedRoute = ({ requiredRole, children }) => {
    // Check for user authentication and role in localStorage
    const userRole = sessionStorage.getItem('userRole');
    const userIdentifier = sessionStorage.getItem('userIdentifier');

    // 1. If user is not logged in, redirect to the login page
    if (!userIdentifier || !userRole) {
        return <Navigate to="/" replace />;
    }

    // 2. If user is logged in but doesn't have the required role, redirect to their dashboard
    if (userRole !== requiredRole) {
        // Redirect to the appropriate dashboard based on their actual role
        switch (userRole) {
            case 'admin':
                return <Navigate to="/admin/dashboard" replace />;
            case 'faculty':
                return <Navigate to="/faculty/dashboard" replace />;
            case 'student':
                return <Navigate to="/student/dashboard" replace />;
            default:
                // Fallback for an unknown role, redirect to login
                return <Navigate to="/" replace />;
        }
    }

    // 3. If the user is authenticated and has the correct role, render the child component
    return children ? children : <Outlet />;
};

export default ProtectedRoute;