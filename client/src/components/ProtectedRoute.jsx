import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Check if user has the correct role
  if (requiredRole && user.role !== requiredRole) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h1>
            <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;