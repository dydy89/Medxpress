import React from 'react';
import AuthService from '../services/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole: string;
  redirectMessage?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredRole, 
  redirectMessage 
}) => {
  const validation = AuthService.validateRole(requiredRole);
  
  if (!validation.isValid) {
    // Show error message and redirect
    const message = redirectMessage || `Access denied. This page requires ${requiredRole} role.`;
    
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="p-8 max-w-md bg-white rounded-xl shadow-md text-center">
          <div className="mb-4 text-4xl">🚫</div>
          <h2 className="mb-4 text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mb-4 text-gray-700">{message}</p>
          {validation.tokenRole && (
            <p className="mb-4 text-sm text-gray-500">
              Your current role: <strong>{validation.tokenRole}</strong>
            </p>
          )}
          <button
            onClick={() => AuthService.logout()}
            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard; 