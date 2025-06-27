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
      const userIdFromStorage = localStorage.getItem('id');
      
      console.log("🔍 AuthService - Validation du token:");
      console.log("  - Token présent:", !!token);
      console.log("  - ID en localStorage:", userIdFromStorage);
      
      if (!token) {
        console.error("❌ AuthService - Pas de token JWT");
        return { isValid: false, userId: null, tokenRole: null };
      }

      const decoded: DecodedToken = jwtDecode(token);
      let tokenRole = decoded?.role?.toUpperCase() || null;
      
      console.log("  - Rôle brut du token:", decoded?.role);
      console.log("  - Rôle après toUpperCase:", tokenRole);
      
      // Remove ROLE_ prefix if it exists
      if (tokenRole && tokenRole.startsWith('ROLE_')) {
        console.log("  - Suppression du préfixe ROLE_");
        tokenRole = tokenRole.substring(5); // Remove "ROLE_" prefix
      }
      
      console.log("  - Rôle final:", tokenRole);
      
      const email = decoded?.sub || null;

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.warn('❌ AuthService - Token expiré');
        this.logout();
        return { isValid: false, userId: null, tokenRole };
      }

      // Get user ID from localStorage (more reliable than token)
      const userIdStr = localStorage.getItem('id');
      if (!userIdStr || userIdStr === 'undefined' || userIdStr === 'null') {
        console.error("❌ AuthService - Pas d'ID utilisateur valide en localStorage");
        return { isValid: false, userId: null, tokenRole };
      }

      const userId = parseInt(userIdStr);
      if (isNaN(userId)) {
        console.error("❌ AuthService - ID utilisateur n'est pas un nombre valide");
        return { isValid: false, userId: null, tokenRole };
      }

      console.log("✅ AuthService - Validation réussie:", { userId, tokenRole, email });
      
      return { 
        isValid: true, 
        userId, 
        tokenRole,
        email 
      };
    } catch (err) {
      console.error('❌ AuthService - Erreur validation token:', err);
      return { isValid: false, userId: null, tokenRole: null };
    }
  }

  /**
   * Validates that current user has the required role
   */
  static validateRole(requiredRole: string): AuthValidation {
    const validation = this.validateToken();
    
    console.log("🔍 RouteGuard - Validation du rôle:");
    console.log("  - Rôle requis:", requiredRole.toUpperCase());
    console.log("  - Rôle du token:", validation.tokenRole);
    console.log("  - Validation token valide:", validation.isValid);
    console.log("  - ID utilisateur:", validation.userId);
    
    if (!validation.isValid) {
      console.error("❌ RouteGuard - Token invalide");
      return validation;
    }

    if (validation.tokenRole !== requiredRole.toUpperCase()) {
      console.error(`❌ RouteGuard - Accès refusé. Rôle attendu: ${requiredRole}, rôle obtenu: ${validation.tokenRole}`);
      return { 
        ...validation, 
        isValid: false 
      };
    }

    console.log("✅ RouteGuard - Validation réussie");
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