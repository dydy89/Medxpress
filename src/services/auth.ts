import { jwtDecode } from 'jwt-decode';
import React from 'react';

interface DecodedToken {
  id?: number;
  userId?: number;
  user_id?: number;
  role?: string;
  sub?: string; // email
  exp?: number;
  iat?: number;
}

interface AuthValidation {
  isValid: boolean;
  userId: number | null;
  tokenRole: string | null;
  email?: string | null;
}

export class AuthService {
  /**
   * Validates JWT token and extracts user information
   */
  static validateToken(): AuthValidation {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        return { isValid: false, userId: null, tokenRole: null };
      }

      const decoded: DecodedToken = jwtDecode(token);
      const tokenRole = decoded?.role?.toUpperCase() || null;
      const email = decoded?.sub || null;

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.warn('Token expired');
        this.logout();
        return { isValid: false, userId: null, tokenRole };
      }

      // Get user ID from localStorage (more reliable than token)
      const userIdStr = localStorage.getItem('id');
      if (!userIdStr || userIdStr === 'undefined' || userIdStr === 'null') {
        return { isValid: false, userId: null, tokenRole };
      }

      const userId = parseInt(userIdStr);
      if (isNaN(userId)) {
        return { isValid: false, userId: null, tokenRole };
      }

      return { 
        isValid: true, 
        userId, 
        tokenRole,
        email 
      };
    } catch (err) {
      console.error('Token validation error:', err);
      return { isValid: false, userId: null, tokenRole: null };
    }
  }

  /**
   * Validates that current user has the required role
   */
  static validateRole(requiredRole: string): AuthValidation {
    const validation = this.validateToken();
    
    if (!validation.isValid) {
      return validation;
    }

    if (validation.tokenRole !== requiredRole.toUpperCase()) {
      console.error(`Access denied. Expected ${requiredRole} role, got: ${validation.tokenRole}`);
      return { 
        ...validation, 
        isValid: false 
      };
    }

    return validation;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.validateToken().isValid;
  }

  /**
   * Get current user role
   */
  static getCurrentRole(): string | null {
    return this.validateToken().tokenRole;
  }

  /**
   * Get current user ID
   */
  static getCurrentUserId(): number | null {
    return this.validateToken().userId;
  }

  /**
   * Logout user and redirect to login
   */
  static logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('id');
    window.location.href = '/';
  }

  /**
   * Redirect to appropriate dashboard based on role
   */
  static redirectToDashboard(): void {
    const role = this.getCurrentRole();
    const userId = this.getCurrentUserId();
    
    if (!role || !userId) {
      this.logout();
      return;
    }

    switch (role) {
      case 'PATIENT':
        window.location.href = '/patient';
        break;
      case 'DOCTOR':
        window.location.href = '/doctor';
        break;
      case 'PHARMACIST':
        window.location.href = '/pharmacist';
        break;
      case 'DELIVERY_DRIVER':
        window.location.href = `/courier/${userId}`;
        break;
      case 'ADMIN':
        window.location.href = '/main';
        break;
      default:
        window.location.href = '/';
    }
  }
}

/**
 * Higher-order component for role-based access control
 */
export function withRoleGuard<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  requiredRole: string
): React.ComponentType<T> {
  return function GuardedComponent(props: T) {
    const validation = AuthService.validateRole(requiredRole);
    
    if (!validation.isValid) {
      // Auto-logout and redirect if authentication fails
      AuthService.logout();
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };
}

export default AuthService; 