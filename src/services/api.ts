import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:8080';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt');
      localStorage.removeItem('id');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Type definitions based on the API documentation
export interface Doctor {
  id: number;
  name: string | null;
  firstName: string | null;
  email: string;
  rpps: string | null;
}

export interface Medication {
  id: number;
  name: string;
}

export interface PrescriptionResponse {
  id: number;
  status: string; // "ACTIVE"
  date: string; // "2025-06-25" format
  doctor: Doctor;
  medications: Medication[];
  hasOrder: boolean;
  orderId: number | null;
  orderStatus: string | null; // "Pending", "Delivered", etc.
}

// User interface based on the actual database structure
export interface User {
  id: number;
  email: string;
  firstName: string; // first_name in DB
  name: string; // name in DB (last name)
  role: 'PATIENT' | 'ADMIN' | 'DOCTOR' | 'PHARMACIST';
}

export interface CreateOrderRequest {
  prescriptionId: number;
  patientId: number; // Actually userId where role = "PATIENT"
}

export class ApiError extends Error {
  status: number;
  
  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// API Service Functions
export const prescriptionService = {
  // Fetch enhanced prescriptions for a patient
  // Note: patientId is actually userId where user.role = "PATIENT"
  getEnhancedPrescriptions: async (userId: number): Promise<PrescriptionResponse[]> => {
    try {
      const response: AxiosResponse<PrescriptionResponse[]> = await api.get(
        `/api/patient/prescriptions/enhanced?patientId=${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch prescriptions',
        status: error.response?.status || 500,
      });
    }
  },

  // Create an order for a prescription
  // Note: patientId is actually userId where user.role = "PATIENT"
  createOrder: async (prescriptionId: number, userId: number): Promise<any> => {
    try {
      const response = await api.post('/api/patient/orders', {
        prescriptionId,
        patientId: userId, // Backend expects patientId but we pass userId
      });
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to create order',
        status: error.response?.status || 500,
      });
    }
  },
};

// User service to get current user info from user table
export const userService = {
  getCurrentUser: async (userId: number): Promise<User> => {
    try {
      const response = await api.get(`/api/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch user info',
        status: error.response?.status || 500,
      });
    }
  },

  // Validate user has PATIENT role
  validatePatientRole: async (userId: number): Promise<boolean> => {
    try {
      const user = await userService.getCurrentUser(userId);
      return user.role === 'PATIENT';
    } catch (error: any) {
      return false;
    }
  },
};

export default api; 